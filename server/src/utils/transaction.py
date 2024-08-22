from src.data_models import (
    db, Portfolio, Holding, Transaction, Stock,
    OptionHolding, OptionContract, OptionTransaction
)
from .time import get_est_time
from .math_functions import round_number

# updating database
def add_stock(stock_info: dict, ticker: str) -> int:
    """ Adds a stock to the database

    Args:
        stock_info (dict): info about the stock
        ticker (str): ticker of the stock

    Returns:
        int: id of the stock
    """
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


def record_transaction(
    portfolio_id: int,
    user_id: int,
    asset_type: str,
    asset_id: int,
    transaction_type: str,
    quantity: int
) -> None:
    """Records a transaction in the database

    Args:
        portfolio_id (int): id of portfolio
        user_id (int): id of the user
        asset_type (str): type of asset (stock or option)
        asset_id (int): database id of the asset
        transaction_type (str): buy or sell
        quantity (int): number of shares or contracts

    Raises:
        Exception: if portfolio does not exist
        Exception: if stock does not exist
        Exception: if option does not exist
        ValueError: if insufficient funds
    """
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if portfolio is None:
        raise Exception('Portfolio does not exist')
    
    if asset_type == 'stock':
        stock = Stock.query.filter_by(id=asset_id).first()
        if stock is None:
            raise Exception('Stock does not exist')
        
        price = stock.current_price
    else:
        option = OptionContract.query.filter_by(id=asset_id).first()
        if option is None:
            raise Exception('Option does not exist')
        
        price = option.ask if type == 'buy' else option.bid

    fee = portfolio.parent_game.transaction_fee
    fee_type = portfolio.parent_game.fee_type
    cash = portfolio.available_cash
    transaction_value = price*quantity if type == 'buy' else -1*price*quantity

    # update value with fees
    if fee_type == 'Flat Fee':
        transaction_value += fee
    elif fee_type == 'Percentage':
        transaction_value += abs(transaction_value) * fee
        
    if transaction_value > cash:
        raise ValueError('Insufficient funds. Prices may have changed. Please refresh the page.')
    
    add_transaction(portfolio_id, asset_id, asset_type, transaction_type, quantity, price) # add transaction to database
    update_holding(portfolio_id, asset_id, asset_type, transaction_type, quantity, price) # update holding in database
    
    # update portfolio cash
    portfolio.available_cash = round_number(portfolio.available_cash - transaction_value, 2)
    db.session.commit()
    
    
def add_transaction(
    portfolio_id: int, 
    asset_id: int, 
    asset_type: str,
    transaction_type: str, 
    quantity: int, 
    price: float
) -> None:
    """Adds a transaction to the database

    Args:
        portfolio_id (int): id of portfolio
        asset_id (int): id of the asset
        asset_type (str): type of asset (stock or option)
        transaction_type (str): type of transaction (buy or sell)
        quantity (int): number of shares or contracts
        price (float): price per share or contract

    Raises:
        Exception: if stock does not exist
        Exception: if option does not exist
    """
    # if sell transaction, calculate profit/loss
    if transaction_type == 'sell' and asset_type == 'stock':
        holding = Holding.query.filter_by(
            portfolio_id=portfolio_id, stock_id=asset_id
        ).first()
        
        if holding is None:
            raise Exception('You do not own this stock.')
        profit_loss = (price - holding.average_price) * quantity
        
    elif transaction_type == 'sell' and asset_type == 'option':
        holding = OptionHolding.query.filter_by(
            portfolio_id=portfolio_id, option_id=asset_id
        ).first()
        
        if holding is None:
            raise Exception('You do not own this option.')
        profit_loss = (price - holding.average_price) * quantity
        
    else:
        profit_loss = None

    if asset_type == 'stock':
        transaction = Transaction(
            portfolio_id=portfolio_id,
            stock_id=asset_id,
            transaction_date=get_est_time(),
            transaction_type=transaction_type,
            number_of_shares=quantity,
            price_per_share=price,
            total_value=quantity * price,
            profit_loss=profit_loss
        )
    else:
        transaction = OptionTransaction(
            portfolio_id=portfolio_id,
            option_id=asset_id,
            transaction_date=get_est_time(),
            transaction_type=transaction_type,
            number_of_contracts=quantity,
            price_per_contract=price,
            total_value=quantity * price,
            profit_loss=profit_loss
        )

    db.session.add(transaction)
    db.session.commit()
    
    
def update_holding(
    portfolio_id: int,
    asset_id: int,
    asset_type: str,
    transaction_type: str,
    quantity: int,
    price: float
) -> None:
    """Updates the asset holding in the database

    Args:
        portfolio_id (int): id of portfolio
        asset_id (int): id of the asset
        asset_type (str): type of asset (stock or option)
        transaction_type (str): type of transaction (buy or sell)
        quantity (int): quantity of shares or contracts
        price (float): price per share or contract

    Raises:
        Exception: if user does not own the asset
        ValueError: if user does not own that quantity
    """
    if asset_type == 'stock':
        holding = Holding.query.filter_by(
            portfolio_id=portfolio_id, stock_id=asset_id
        ).first()
    else:
        holding = OptionHolding.query.filter_by(
            portfolio_id=portfolio_id, option_id=asset_id
        ).first()

    # if no holding, create new holding
    if holding is None:
        if transaction_type == 'buy' and asset_type == 'stock':
            new_holding = Holding(
                portfolio_id=portfolio_id, 
                stock_id=asset_id, 
                quantity=quantity, 
                average_price=price
            )
            db.session.add(new_holding)
        elif transaction_type == 'buy' and asset_type == 'option':
            new_holding = OptionHolding(
                portfolio_id=portfolio_id, 
                option_id=asset_id, 
                quantity=quantity, 
                average_price=price
            )
            db.session.add(new_holding)
        else:
            raise Exception('You do not own this stock.')
        
    # if buy transaction, update average price and shares owned
    elif transaction_type == 'buy':
        holding.average_price = round_number(
            (holding.average_price*holding.quantity+price*quantity) / (holding.quantity+quantity),
            2
        )
        holding.quantity += quantity

    # if sell transaction, update shares owned or delete holding if all shares sold
    else:
        if holding.quantity < quantity:
            raise ValueError('You do not own that quantity!')
        elif holding.quantity == quantity:
            db.session.delete(holding)
        else:
            holding.quantity -= quantity

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
        'startDate': portfolio.parent_game.start_date.strftime('%Y-%m-%d'),
        'gameStatus': portfolio.parent_game.status
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
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if portfolio is None:
        raise Exception('Portfolio does not exist')
    
    holdings = portfolio.holdings
    option_holdings = portfolio.option_holdings
    holdings_info = {}

    if holdings is not None:
        for holding in holdings:
            holdings_info[holding.stock.ticker] = {
                'quantity': holding.quantity,
                'averagePrice': holding.average_price
            }
    if option_holdings is not None:
        for holding in option_holdings:
            holdings_info[holding.option.symbol] = {
                'quantity': holding.quantity,
                'averagePrice': holding.average_price
            }
    
    holdings_list = list(holdings_info.keys())

    return {
        'gameName': portfolio.parent_game.name,
        'holdings': holdings_list,
        'holdingsInfo': holdings_info,
        'availableCash': portfolio.available_cash,
        'transactionFee': portfolio.parent_game.transaction_fee,
        'feeType': portfolio.parent_game.fee_type,
    }
