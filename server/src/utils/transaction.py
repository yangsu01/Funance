from src.data_models import db, Portfolio, Holding, Transaction, Stock
from .time import get_est_time


# updating database
def add_stock(stock_info: dict) -> int:
    """ Adds a stock to the database

    Args:
        stock_info (dict): info about the stock

    Returns:
        int: id of the stock
    """
    ticker = stock_info.get('ticker')
    price = stock_info.get('price')
    
    stock = Stock.query.filter_by(ticker=ticker).first()

    # if stock already exists, update price
    if stock is not None:
        id = stock.id
        stock.current_price = price
        stock.last_updated = get_est_time()

        db.session.commit()

    # if stock does not exist, create new stock
    else:
        new_stock = Stock(
            ticker=ticker, 
            company_name=stock_info.get('companyName', 'n/a'),
            industry=stock_info.get('industry', 'n/a'),
            sector=stock_info.get('sector', 'n/a'),
            currency=stock_info.get('currency', 'n/a'),
            previous_close=stock_info.get('prevClose', price),
            opening_price=stock_info.get('open', price),
            current_price=price,
            last_updated=get_est_time()
        )
        db.session.add(new_stock)
        db.session.commit()

        id = new_stock.id

    return id


def record_transaction(portfolio_id: int, stock_id: str, transaction_type: str, shares: int) -> None:
    """ Records a transaction in the database and updates the portfolio

    Args:
        portfolio_id (int): id of portfolio
        stock_id (str): id of stock
        transaction_type (str): type of transaction (buy or sell)
        shares (int): number of shares
        
    Raises:
        Exception: if portfolio does not exist
        Exception: if stock does not exist
        ValueError: if insufficient funds
    """
    portfolio = Portfolio.query.filter_by(id=portfolio_id).first()
    stock = Stock.query.filter_by(id=stock_id).first()

    if portfolio is None:
        raise Exception('Portfolio does not exist')
    if stock is None:
        raise Exception('Stock does not exist')
    
    price = stock.current_price
    fee = portfolio.parent_game.transaction_fee
    fee_type = portfolio.parent_game.fee_type
    cash = portfolio.available_cash
    transaction_value = price*shares if transaction_type == 'buy' else -1*price*shares
    
    # update available cash
    if fee_type == 'Flat Fee':
        transaction_value += fee
    elif fee_type == 'Percentage':
        transaction_value += abs(transaction_value) * fee
        
    if transaction_value > cash:
        raise ValueError('Insufficient funds')
    
    portfolio.available_cash = round(portfolio.available_cash - transaction_value, 2)
    db.session.commit()
    
    add_transaction(portfolio_id, stock_id, transaction_type, shares, price) # add transaction to database
    update_holding(portfolio_id, stock_id, shares, price, transaction_type) # update holding in database
    
    
def add_transaction(portfolio_id: int, stock_id: int, transaction_type: str, shares: int, price: float) -> None:
    """ Adds transaction to the database

    Args:
        portfolio_id (int): id of portfolio
        stock_id (int): id of stock
        transaction_type (str): type of transaction (buy or sell)
        shares (int): number of shares
        price (float): price per share

    Raises:
        Exception: if holding does not exist
    """
    # if sell transaction, calculate profit/loss
    if transaction_type == 'sell':
        holding = Holding.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()

        if holding is None:
            raise Exception('You do not own this stock.')
        
        profit_loss = (price - holding.average_price) * shares
    else:
        profit_loss = None

    transaction = Transaction(
        transaction_date=get_est_time(),
        portfolio_id=portfolio_id, 
        stock_id=stock_id, 
        transaction_type=transaction_type, 
        number_of_shares=shares, 
        price_per_share=price, 
        total_value=shares * price,
        profit_loss=profit_loss
    )

    db.session.add(transaction)
    db.session.commit()
    
    
def update_holding(portfolio_id: int, stock_id: int, shares: int, price: float, transaction_type: str) -> None:
    """_summary_

    Args:
        portfolio_id (int): id of portfolio
        stock_id (int): if of stock
        shares (int): number of shares
        price (float): price per share
        transaction_type (str): type of transaction (buy or sell)

    Raises:
        Exception: if holding does not exist
        ValueError: if insufficient shares
    """
    holding = Holding.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()

    # if no holding, create new holding
    if holding is None:
        if transaction_type == 'buy':
            new_holding = Holding(
                portfolio_id=portfolio_id, 
                stock_id=stock_id, 
                shares_owned=shares, 
                average_price=price
            )
            db.session.add(new_holding)
        else:
            raise Exception('You do not own this stock.')
        
    # if buy transaction, update average price and shares owned
    elif transaction_type == 'buy':
        holding.average_price = round((holding.average_price*holding.shares_owned + price*shares) / (holding.shares_owned + shares), 2)
        holding.shares_owned += shares

    # if sell transaction, update shares owned or delete holding if all shares sold
    else:
        if holding.shares_owned < shares:
            raise ValueError('You do not own that many shares!')
        elif holding.shares_owned == shares:
            db.session.delete(holding)
        else:
            holding.shares_owned -= shares

    db.session.commit()
    
    
# getting data
def get_buy_info(portfolio_id: int, user_id: int) -> dict:
    """ Gets information for buying a stock

    Args:
        portfolio_id (int): id of portfolio
        user_id (int): id of user
        
    Raises:
        Exception: if portfolio does not exist

    Returns:
        dict: dictionary of portfolio information
    """
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if portfolio is None:
        raise Exception('Portfolio does not exist')

    return {
        'gameName': portfolio.parent_game.name,
        'availableCash': portfolio.available_cash,
        'transactionFee': portfolio.parent_game.transaction_fee,
        'feeType': portfolio.parent_game.fee_type,
    }
    

def get_sell_info(portfolio_id: int, user_id: int) -> dict:
    """ Gets information for selling a stock

    Args:
        portfolio_id (int): id of portfolio
        user_id (int): id of user
        
    Raises:
        Exception: if portfolio does not exist

    Returns:
        dict: dictionary of portfolio information
    """
    portfolio = Portfolio.query.filter_by(id=portfolio_id).first()
    
    if portfolio is None:
        raise Exception('Portfolio does not exist')
    
    holdings = portfolio.holdings
    holdings_info = {}

    if holdings is not None:
        for holding in holdings:
            holdings_info[holding.stock.ticker] = {
                'sharesOwned': holding.shares_owned,
                'averagePrice': holding.average_price
            }

    return {
        'gameName': portfolio.parent_game.name,
        'holdings': [holding.stock.ticker for holding in holdings],
        'holdingsInfo': holdings_info,
        'availableCash': portfolio.available_cash,
        'transactionFee': portfolio.parent_game.transaction_fee,
        'feeType': portfolio.parent_game.fee_type,
    }
