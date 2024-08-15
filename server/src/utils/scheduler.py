import yfinance as yf

from ..data_models import db, Stock, DailyHistory, ClosingHistory, Portfolio, Game, Order
from .time import get_est_time
from .math_functions import round_number
from .order import check_order_expired, check_orders


# run periodically when markets are open
def update_stock_prices() -> None:
    '''Updates the current, open, previous close price of all stocks in the database
        meant to run periodically when markets are open
    '''
    stocks = Stock.query.all()

    tickers = [stock.ticker for stock in stocks]
    tickers_str = ' '.join(tickers)
    data = yf.Tickers(tickers_str)
    update_time = get_est_time()

    for stock in stocks:
        stock.current_price = data.tickers[stock.ticker].info.get('currentPrice', stock.current_price)
        stock.previous_close = data.tickers[stock.ticker].info.get('previousClose', stock.previous_close)
        stock.opening_price = data.tickers[stock.ticker].info.get('open', stock.opening_price)
        stock.last_updated = update_time

    db.session.commit()


def update_portfolios() -> None:
    '''Updates the total value and rankings of all portfolios in games that are 'In Progress'
    '''
    portfolios = Portfolio.query.join(Game).filter_by(status='In Progress').all()
    orders = portfolios.orders
    update_time = get_est_time()
    games = Game.query.filter(Game.status == 'In Progress').all()
    
    # check and fulfill orders
    check_orders(orders)
    
    for game in games:
        portfolios = game.portfolios
        game.last_updated = update_time
        
        # update portfolio values
        for portfolio in portfolios:
            holdings = portfolio.holdings
            portfolio_value = portfolio.available_cash
            
            for holding in holdings:
                portfolio_value += (holding.shares_owned * holding.stock.current_price)
                
            portfolio.current_value = round_number(portfolio_value)
            portfolio.day_change = round_number(portfolio.current_value-portfolio.last_close_value)
            portfolio.last_updated = update_time
            
        # update overall rankings
        prev_rank = 1
        prev = 0
        portfolios = sorted(portfolios, key=lambda x: x.current_value, reverse=True)
        for i, portfolio in enumerate(portfolios):
            if portfolio.current_value != prev:
                portfolio.overall_rank = i+1
                prev = portfolio.current_value
                prev_rank = i+1
            else:
                portfolio.overall_rank = prev_rank
                
        # update daily rankings
        prev_rank = 1
        prev = 0
        portfolios = sorted(portfolios, key=lambda x: x.day_change, reverse=True)
        for i, portfolio in enumerate(portfolios):
            if portfolio.day_change != prev:
                portfolio.daily_rank = i+1
                prev = portfolio.day_change
                prev_rank = i+1
            else:
                portfolio.daily_rank = prev_rank
            
    db.session.commit()


def save_daily_history() -> None:
    '''Saves value of all portfolios that are in a game that is 'In Progress'
        meant to run periodically when stock markets are open
    '''
    portfolios = Portfolio.query.join(Game).filter_by(status='In Progress').all()

    record_time = get_est_time()
    record_date = record_time.date()

    for portfolio in portfolios:
        history = DailyHistory(
            portfolio_id=portfolio.id, 
            date=record_date, 
            portfolio_value=portfolio.current_value, 
            update_time=record_time
        )

        db.session.add(history)

    db.session.commit()


# run at the end of the trading day
def save_closing_history() -> None:
    '''Saves the closing value of all portfolios that are in a game that is 'In Progress'
        meant to run at the end of the trading day
    '''
    portfolios = Portfolio.query.join(Game).filter_by(status='In Progress').all()

    record_date = get_est_time().date()

    for portfolio in portfolios:
        history = ClosingHistory(portfolio_id=portfolio.id, date=record_date, portfolio_value=portfolio.current_value)

        db.session.add(history)

    db.session.commit()
    

def update_completed_games() -> None:
    '''Updates the status of games to 'completed' if the end date has passed
    '''
    games = Game.query.filter_by(status='In Progress').all()

    current_date = get_est_time().date()

    for game in games:
        if game.end_date is not None and game.end_date < current_date:
            game.status = 'Completed'
    
    db.session.commit()


def close_expired_orders() -> None:
    '''Closes all orders that have expired
    '''
    orders = Order.query.filter_by(order_status='pending').all()
    check_order_expired(orders)


# run right before market opens
def update_last_close_value() -> None:
    '''Updates the last close value of all portfolios in games that are 'In Progress'
        meant to run at the start of the trading day
    '''
    portfolios = Portfolio.query.join(Game).filter_by(status='In Progress').all()

    for portfolio in portfolios:
        portfolio.last_close_value = portfolio.current_value

    db.session.commit()


def update_started_games() -> None:
    '''Updates the status of games to 'In Progress' if the start date has passed
    '''
    games = Game.query.filter_by(status='Not Started').all()

    current_date = get_est_time().date()

    for game in games:
        if game.start_date <= current_date:
            game.status = 'In Progress'

    db.session.commit()
    

def drop_prev_day_data() -> None:
    '''Deletes all daily history data before today
    '''
    date = get_est_time().date()
    DailyHistory.query.filter(DailyHistory.date < date).delete()

    db.session.commit()