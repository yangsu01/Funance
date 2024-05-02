import yfinance as yf

from ..data_models import db, Stock, DailyHistory, ClosingHistory, Portfolio, Game
from .portfolio_sim_functions import get_est_time


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


def update_portfolio_value() -> None:
    '''Updates the total value of all portfolios in games that are 'In Progress'
    '''
    portfolios = Portfolio.query.join(Game).filter_by(status='In Progress').all()
    update_time = get_est_time()

    for portfolio in portfolios:
        holdings = portfolio.holdings
        portfolio_value = portfolio.available_cash

        for holding in holdings:
            portfolio_value += holding.shares_owned * holding.stock.current_price

        portfolio.current_value = round(portfolio_value, 2)
        portfolio.last_updated = update_time

    db.session.commit()


def save_game_update_time() -> None:
    '''Saves the last update time of all games that are 'In Progress'
    '''
    games = Game.query.filter_by(status='In Progress').all()

    update_time = get_est_time()

    for game in games:
        game.last_updated = update_time

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

            # create_game_summary(game.id)
    
    db.session.commit()


# def create_game_summary(game_id: int) -> None:
#     '''Generates a game summary after a game has ended

#         args:
#             game_id (int): id of the game
#     '''
#     portfolios = Portfolio.query.filter_by(game_id=game_id).all()
#     transactions = Transaction.query.join(Portfolio).filter_by(game_id=game_id).all()
#     holdings = Holding.query.join(Portfolio).filter_by(game_id=game_id).all()
    
#     most_valueable_portfolio = max(portfolios, key=lambda x: x.current_value)
#     least_valueable_portfolio = min(portfolios, key=lambda x: x.current_value)

    

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