from src.data_models import db, Portfolio, OptionHolding, OptionContract, OptionTransaction
from .time import get_est_time
from .math_functions import round_number


def add_option(option_info: dict, symbol: str, stock_id: int) -> int:
    """Adds an option contract to the database.
        If the option already exists, update prices
    
    Args:
        option_info (dict): info about the option contract
        symbol (str): symbol of the option contract
        stock_id (int): database id of underlying stock

    Returns:
        int: id of the option contract
    """
    option = OptionContract.query.filter_by(symbol=symbol).first()
    
    bid = option_info.get('bid')
    ask = option_info.get('ask')
    change = option_info.get('change')
    percent_change = option_info.get('percentChange')
    in_the_money = option_info.get('inTheMoney')
    
    # if option already exists, update price
    if option is not None:
        id = option.id
        
        option.bid = bid
        option.ask = ask
        option.change = change
        option.percent_change = percent_change
        option.in_the_money = in_the_money
        
        db.session.commit()
    
    # if option does not exist, create new option
    else:
        new_option = OptionContract(
            symbol=symbol,
            stock_id=stock_id,
            option_type=option_info.get('optionType'),
            strike_price=option_info.get('strikePrice'),
            bid=bid,
            ask=ask,
            change=change,
            percent_change=percent_change,
            in_the_money=in_the_money,
            expiration_date=option_info.get('expirationDate'),
            status='active'
        )
        db.session.add(new_option)
        db.session.commit()
        
        id = new_option.id
    
    return id
        

def record_option_transaction(
    portfolio_id: int,
    user_id: int,
    option_id: int,
    type: str,
    quantity: int
) -> None:
    """Records an option transaction in the database and updates the portfolio

    Args:
        portfolio_id (int): id of portfolio
        user_id (int): id of user
        option_id (int): id of option contract
        type (str): type of transaction (buy or sell)
        quantity (int): quantity of option contracts

    Raises:
        Exception: portfolio does not exist
        Exception: option does not exist
        ValueError: insufficient funds
    """
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    option = OptionContract.query.filter_by(id=option_id).first()
    
    if portfolio is None:
        raise Exception('Portfolio does not exist')
    if option is None:
        raise Exception('Option does not exist')
    
    fee = portfolio.parent_game.transaction_fee
    fee_type = portfolio.parent_game.transaction_fee_type
    cash = portfolio.available_cash
    price = option.ask if type == 'buy' else option.bid
    transaction_value = price*quantity if type == 'buy' else -1*price*quantity
    
    # update with fees
    if fee_type == 'Flat Fee':
        transaction_value += fee
    elif fee_type == 'Percentage':
        transaction_value += abs(transaction_value) * fee
    
    if transaction_value > cash:
        raise ValueError('Insufficient funds. Prices may have changed. Please refresh the page.')
    
    # update database
    add_option_transaction(portfolio_id, option_id, type, quantity, price)
    update_option_holding(portfolio_id, option_id, quantity, price, type)
    
    # update available cash
    portfolio.available_cash = round_number(portfolio.available_cash - transaction_value, 2)
    db.session.commit()


def add_option_transaction(
    portfolio_id: int,
    option_id: int,
    transaction_type: str,
    quantity: int,
    price: float
) -> None:
    """Adds an option transaction to the database

    Args:
        portfolio_id (int): id of portfolio
        option_id (int): id of option contract
        transaction_type (str): type of transaction (buy or sell)
        quantity (int): number of contracts
        price (float): price per contract

    Raises:
        Exception: if selling an option that is not owned
    """
    # calculate profit/loss if selling
    if transaction_type == 'sell':
        holding = OptionHolding.query.filter_by(
            portfolio_id=portfolio_id, option_id=option_id
        ).first()
        
        if holding is None:
            raise Exception('You do not own this option.')
        profit_loss = (price - holding.average_price) * quantity
    else:
        profit_loss = None
        
    transaction = OptionTransaction(
        portfolio_id=portfolio_id,
        option_id=option_id,
        transaction_date=get_est_time(),
        transaction_type=transaction_type,
        number_of_contracts=quantity,
        price_per_contract=price,
        total_value=quantity * price,
        profit_loss=profit_loss
    )
    
    db.session.add(transaction)
    db.session.commit()

