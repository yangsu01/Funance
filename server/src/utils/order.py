from datetime import datetime
import math
from src.data_models import db, Portfolio, Holding, Stock, Order
from .time import get_est_time, utc_to_est
from .math_functions import round_number
from .transaction import add_transaction, update_holding

def add_order(
    portfolio_id: int,
    user_id: int,
    stock_id: str,
    order_type: str,
    shares: int,
    expiration_date: str,
    target_price: float
) -> None:
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    stock = Stock.query.filter_by(id=stock_id).first()
    
    if portfolio is None:
        raise Exception('Portfolio does not exist')
    if stock is None:
        raise Exception('Stock does not exist')
    
    try:
        validate_order(
            order_type,
            shares,
            target_price,
            portfolio.available_cash,
            portfolio.parent_game.transaction_fee,
            portfolio.parent_game.fee_type,
            expiration_date,
            portfolio_id,
            stock_id
        )
        
        expiration = datetime.strptime(expiration_date, '%Y-%m-%d') if expiration_date is not None else None
        
        order = Order(
            stock_id=stock_id,
            portfolio_id=portfolio_id,
            order_type=order_type,
            shares=shares,
            target_price=target_price,
            order_date=get_est_time(),
            order_status='pending',
            order_expiration=expiration
        )
        
        db.session.add(order)
        db.session.commit()
    except Exception as e:
        raise e


def validate_order(
    order_type: str,
    shares: float,
    target_price: float,
    available_cash: float,
    transaction_fee: float,
    fee_type: str,
    expiration_date: str,
    portfolio_id,
    stock_id
) -> None:
    """Checks if the order is valid

    Args:
        order_type (str): type of order (limit buy, limit sell, stop-loss)
        shares (float): number of shares
        target_price (float): targeted execution price
        available_cash (float): available cash in the portfolio
        transaction_fee (float): transaction fee set by the game
        fee_type (str): type of fee (Flat Fee or Percentage)
        expiration_date (str): date when the order expires (optional, defaults to end of day)
        portfolio_id (_type_): id of the portfolio
        stock_id (_type_): id of the stock

    Raises:
        Exception: invalid order type
        Exception: invalid number of shares
        Exception: invalid target price
        Exception: invalid expiration date
        Exception: expiration date must be in the future
        Exception: insufficient funds
        Exception: insufficient shares
    """
    # check if order type is valid
    valid_types = ['limit buy', 'limit sell', 'stop-loss', 'market buy', 'market sell']
    if order_type not in valid_types:
        raise Exception('Invalid order type')
    
    # check if shares are valid
    if shares <= 0:
        raise Exception('Invalid number of shares')
    
    # check if target price is valid
    if order_type not in ['market buy', 'market sell'] and target_price <= 0:
        raise Exception('Invalid target price')
    
    # check if expiration date is valid
    if expiration_date is not None:
        try:
            datetime.strptime(expiration_date, '%Y-%m-%d')
        except ValueError:
            raise Exception('Invalid expiration date')
        
        # check if expiration date is in the future
        if datetime.strptime(expiration_date, '%Y-%m-%d').date() < get_est_time().date():
            raise Exception('Expiration date must be in the future')
    
    # if limit buy, check if user has enough cash
    if order_type == 'limit buy':
        max_value = shares * target_price
        if fee_type == 'Flat Fee':
            max_value += transaction_fee
        elif fee_type == 'Percentage':
            max_value += max_value * transaction_fee
            
        if max_value > available_cash:
            raise Exception('Insufficient funds')
    
    # if limit sell or stop-loss, check if user has enough shares
    if order_type == 'limit sell' or order_type == 'stop-loss':
        holding = Holding.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()
        if holding is None or holding.shares_owned < shares:
            raise Exception('Insufficient shares')
        
    
def mark_cancelled(order_id: int) -> None:
    """Cancels pending orders

    Args:
        order_id (int): id of the order

    Raises:
        Exception: order does not exist
        Exception: order is already filled, cancelled, or expired
    """
    order = Order.query.filter_by(id=order_id).first()
    
    if order is None:
        raise Exception('Order does not exist')
    if order.order_status != 'pending':
        raise Exception(f'Order is already {order.order_status}')
    
    order.order_status = 'cancelled'
    db.session.commit()
    
    
# to be ran in the scheduler
def check_orders(orders: list) -> None:
    """Checks if order conditions are met

    Args:
        orders (list): list of Order objects that are pending
    """
    for order in orders:
        if order.order_status != 'pending':
            continue
        
        current_price = order.stock.current_price
        # check limit buy
        if order.order_type == 'limit buy':
            if current_price <= order.target_price:
                execute_order(order)
        # check limit sell
        elif order.order_type == 'limit sell':
            if current_price >= order.target_price:
                execute_order(order)
        # check stop-loss
        elif order.order_type == 'stop-loss':
            if current_price <= order.target_price:
                execute_order(order)
        elif order.order_type == 'market buy' or order.order_type == 'market sell':
            execute_order(order)


def execute_order(order: Order) -> None:
    """Executes the order

    Args:
        order (Order): Order object to be executed
    """
    price = order.stock.current_price
    fee = order.portfolio.parent_game.transaction_fee
    type = order.portfolio.parent_game.fee_type
    cash = order.portfolio.available_cash
    shares = order.shares
    full_shares = shares
    order_type = order.order_type
    
    def calculate_value(val: float, fee: float, type: str) -> float:
        if type == 'Flat Fee':
            return val + fee
        elif type == 'Percentage':
            return val + abs(val) * fee
    
    # execute buy
    if order_type == 'limit buy' or order_type == 'market buy':
        transaction_type = 'buy'
        value = calculate_value(shares*price, fee, type)
        
        # if user does not have enough cash, partially fill the order
        if value > order.portfolio.available_cash:
            if type == 'Flat Fee':
                shares = math.floor((cash - fee) / price)
            elif type == 'Percentage':
                shares = math.floor(cash / (price * (1 + fee)))
                
        value = calculate_value(shares*price, fee, type)
            
    # execute sell
    elif order_type == 'limit sell' or order_type == 'stop-loss' or order_type == 'market sell':
        holding = Holding.query.filter_by(
            portfolio_id=order.portfolio_id,
            stock_id=order.stock_id
        ).first()
        
        if holding is None:
            order.order_status = 'cancelled'
            db.session.commit()
            return
        else:
            shares_owned = holding.shares_owned
        
        # sell all shares if order shares exceed shares owned
        shares = min(shares_owned, order.shares)
        transaction_type = 'sell'
        value = calculate_value(-1*shares*price, fee, type)
        
    # record transaction and update holdings if shares are greater than 0
    if shares > 0:
        add_transaction(
            order.portfolio_id,
            order.stock_id,
            transaction_type,
            shares,
            price
        )
        update_holding(
            order.portfolio_id,
            order.stock_id,
            shares,
            price,
            transaction_type
        )
        
        # update portfolio cash
        order.portfolio.available_cash = round_number(
            order.portfolio.available_cash - value
        )
        if shares < full_shares:
            order.order_status = 'partially filled'
        else:
            order.order_status = 'filled'
        db.session.commit()
    else:
        order.order_status = 'cancelled'
        db.session.commit()


def check_order_expired(orders: list) -> None:
    """Checks if orders have expired and updates their status

    Args:
        orders (list): list of 'pending' Order objects
    """
    today = get_est_time().date()
    for order in orders:
        if order.order_status != 'pending':
            continue
        
        # cancel orders if game is completed
        elif order.portfolio.parent_game.status == 'Completed':
            order.order_status = 'expired'
            db.session.commit()
            
        # cancel orders if expiration date is reached
        elif order.order_expiration and order.order_expiration <= today:
            order.order_status = 'expired'
            db.session.commit()
            

# to be displayed the portfolio dashboard
def get_orders(portfolio_id: int) -> list:
    """Gets all orders for a given portfolio

    Args:
        portfolio_id (int): id of the portfolio

    Returns:
        list: list of pending order details
    """
    orders = Order.query.filter_by(
        portfolio_id=portfolio_id,
        order_status='pending'
    ).order_by(
        Order.order_date.desc()
    ).all()
    
    orders_list = []
    
    if orders is None:
        return orders_list
    
    for order in orders:
        date = utc_to_est(order.order_date).strftime('%H:%M %m-%d-%Y')
        expiration = order.order_expiration.strftime('%m-%d-%Y') if order.order_expiration is not None else 'n/a'
        
        orders_list.append({
            'id': order.id,
            'Order Type': order.order_type,
            'Stock Symbol': order.stock.ticker,
            'Shares': order.shares,
            'Target Price': order.target_price if order.target_price is not None else 'n/a',
            'Current Price': order.stock.current_price,
            'Expiration Date': expiration,
            'Order Date': date,
        })
    
    return orders_list
    