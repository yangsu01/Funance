from src.data_models import Portfolio, Holding, Transaction, DailyHistory, ClosingHistory
from .time import get_est_time, get_market_date, utc_to_est
from .math_functions import round_number


# getting data
def get_latest_portfolio_id(user_id: int) -> int:
    """ Gets the latest portfolio for a user

    Args:
        user_id (int): id of the user

    Raises:
        Exception: no portfolios found

    Returns:
        int: database id of the portfolio
    """
    portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.creation_date.desc()).first()
    
    if portfolio is None:
        raise Exception('You do not have any portfolios!')
    
    return portfolio.id


def get_portfolio(user_id: int, portfolio_id: int) -> dict:
    """ Get the portfolio summary for a user

    Args:
        user_id (int): id of the user
        portfolio_id (int): id of the portfolio

    Returns:
        dict: dictionary of the portfolio details
    """
    portfolio_details = get_portfolio_details(portfolio_id, user_id) # portfolio and parent game info
    user_portfolios = get_user_portfolios(user_id) # list of all portfolios the user has
    portfolio_history = get_portfolio_history(portfolio_id) # for display in a time series plot
    holdings_breakdown = get_holdings_breakdown(portfolio_id) # for display in a pie chart
    sector_breakdown = get_sector_breakdown(portfolio_id) # for display in a pie chart
    portfolio_transactions = get_portfolio_transactions(portfolio_id) # for display in a table
    portfolio_holdings = get_portfolio_holdings(portfolio_id) # for display in a table

    return {
        'userPortfolios': user_portfolios,
        'portfolioDetails': portfolio_details,
        'closingHistory': portfolio_history.get('closingHistory'),
        'dailyHistory': portfolio_history.get('dailyHistory'),
        'dailyHistoryDate': portfolio_history.get('date'),
        'holdingsBreakdown': holdings_breakdown,
        'sectorBreakdown': sector_breakdown,
        'portfolioTransactions': portfolio_transactions,
        'portfolioHoldings': portfolio_holdings,
    }


def get_portfolio_details(portfolio_id: int, user_id: int) -> dict:
    """ Gets the details of a portfolio and its parent game

    Args:
        portfolio_id (int): id of the portfolio
        
    Raises:
        Exception: portfolio does not exist

    Returns:
        dict: dictionary of portfolio details
    """
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()
    
    if portfolio is None:
        raise Exception('Portfolio does not exist!')
    
    parent_game = portfolio.parent_game
    transaction_fee = f'${round_number(parent_game.transaction_fee)}' if parent_game.fee_type == 'Flat Fee' else f'{round_number(parent_game.transaction_fee * 100)}%'
    starting_cash = parent_game.starting_cash
    start_date = parent_game.start_date.strftime("%B %d, %Y")
    end_date = parent_game.end_date.strftime('%Y-%m-%d') if parent_game.end_date is not None else 'n/a',
    current_value = portfolio.current_value
    change = round_number((current_value/starting_cash - 1) * 100)
    profit = round_number(current_value - starting_cash)
    last_updated = utc_to_est(portfolio.last_updated).strftime('%a, %b %d. %Y %I:%M%p') + ' EST'
   

    return {
        'portfolioId': portfolio.id,
        'gameId': parent_game.id,
        'gameName': parent_game.name,
        'gameStatus': parent_game.status,
        'startingCash': starting_cash,
        'participants': parent_game.participants,
        'gameStartDate': start_date,
        'gameEndDate': end_date,
        'transactionFee': transaction_fee,
        'feeType': parent_game.fee_type,
        'availableCash': portfolio.available_cash,
        'portfolioValue': current_value,
        'change': change,
        'profit': profit,
        'lastUpdated': last_updated,
    }
        
    
def get_user_portfolios(user_id: int) -> list:
    """ Gets all the portfolios of a user

    Args:
        user_id (int): id of user

    Returns:
        list: list of all the portfolios of the user
    """
    portfolios = Portfolio.query.filter_by(user_id=user_id).all()
    
    portfolio_list = []

    if portfolios is not None:
        for portfolio in portfolios:
            portfolio_list.append({
                'gameName': portfolio.parent_game.name,
                'portfolioId': str(portfolio.id),
            })

    return portfolio_list


def get_portfolio_history(portfolio_id: int) -> dict:
    """ Gets the closing price history and todays history of a portfolio
        if market is closed, gets the history for the last day the market was open

    Args:
        portfolio_id (int): database id of the portfolio

    Returns:
        dict: dicionary of the closing price history and todays history
    """
    market_date = get_market_date(get_est_time()) # last date the market was open
        
    daily_history = DailyHistory.query.filter_by(portfolio_id=portfolio_id, date=market_date).order_by(DailyHistory.update_time.desc()).all()
    closing_history = ClosingHistory.query.filter_by(portfolio_id=portfolio_id).order_by(ClosingHistory.date.desc()).all()
    
    # closing history
    close = {'x': [], 'y': []}

    if closing_history is not None:
        for row in closing_history:
            close['x'].append(row.date.strftime('%Y-%m-%d'))
            close['y'].append(row.portfolio_value)

    # todays performance history
    day = {'x': [], 'y': []}

    if daily_history is not None:
        for row in daily_history:
            day['x'].append(utc_to_est(row.update_time).strftime('%Y-%m-%d %H:%M'))
            day['y'].append(row.portfolio_value)

    return {
        'closingHistory': close,
        'dailyHistory': day,
        'date': market_date.strftime('%Y-%m-%d')
    }
    
    
def get_holdings_breakdown(portfolio_id: int) -> dict:
    """ Gets the value of each holding in a portfolio

    Args:
        portfolio_id (int): id of the portfolio

    Returns:
        dict: dictionary of each holding and its value
    """
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).all()
    
    holding_breakdown = {}

    if holdings is not None:
        for holding in holdings:
            holding_breakdown.setdefault("labels", []).append(holding.stock.ticker)
            holding_breakdown.setdefault("values", []).append(holding.shares_owned * holding.stock.current_price)

    return holding_breakdown


def get_sector_breakdown(portfolio_id: int) -> dict:
    """ Gets the sector breakdown of the holdings in a portfolio

    Args:
        portfolio_id (int): id of the portfolio

    Returns:
        dict: dictionary of the sector and its value
    """
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).all()
    
    sector_breakdown = {}

    if holdings is not None:
        for holding in holdings:
            sector = holding.stock.sector
            sector_breakdown[sector] = sector_breakdown.get(sector, 0) + holding.stock.current_price * holding.shares_owned

    return {
        'labels': list(sector_breakdown.keys()),
        'values': list(sector_breakdown.values())
    }
    
    
def get_portfolio_transactions(portfolio_id: int) -> list:
    """ Gets the transactions of a portfolio

    Args:
        portfolio_id (int): id of the portfolio

    Returns:
        list: list of portfolio transactions
    """
    transactions = Transaction.query.filter_by(portfolio_id=portfolio_id).order_by(Transaction.transaction_date.desc()).all()
    
    transaction_list = []

    if transactions is not None:
        for transaction in transactions:
            total_value = round_number(transaction.total_value)
            profit_loss = round_number(transaction.profit_loss) if transaction.profit_loss is not None else 'n/a'
            date = utc_to_est(transaction.transaction_date).strftime('%H:%M %m-%d-%Y')
            
            transaction_list.append({
                'Ticker': transaction.stock.ticker,
                'Name': transaction.stock.company_name,
                'Type': transaction.transaction_type,
                'Shares': transaction.number_of_shares,
                'Share Price': transaction.price_per_share,
                'Total Value': total_value,
                'Currency': transaction.stock.currency,
                'Profit/Loss': profit_loss,
                'Date (EST)': date
            })

    return transaction_list


def get_portfolio_holdings(portfolio_id: int) -> list:
    '''Gets the holdings of a portfolio
        
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            list - list of all the holdings of the portfolio
    '''
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).all()
    holding_list = []

    if holdings is not None:
        for holding in holdings:
            day_change = round_number(holding.stock.current_price - holding.stock.opening_price)
            day_change_percent = round_number(day_change/holding.stock.opening_price * 100, 2)
            change = round_number(holding.stock.current_price - holding.average_price)
            change_percent = round_number(change/holding.average_price * 100, 2)
            total_change = round_number(change * holding.shares_owned)
            market_value = round_number(holding.shares_owned * holding.stock.current_price)

            holding_list.append({
                'Ticker': holding.stock.ticker,
                'Shares Owned': holding.shares_owned,
                'Average Price': holding.average_price,
                'Current Price': holding.stock.current_price,
                'Net Change': change,
                'Total Change': total_change,
                '% Change': change_percent,
                'Day Change': day_change,
                '% Day Change': day_change_percent,
                'Market Value': market_value,
                'Currency': holding.stock.currency
            })

    return sorted(holding_list, key=lambda h: h['Market Value'], reverse=True)