from datetime import datetime, timezone
import pytz
import pandas as pd
import yfinance as yf

from ..data_models import db, Portfolio, Holding, Transaction, History, Game, Stock


# changing data in database

def add_game(creator_id: int, name: str, password: str, start_date: datetime, end_date: datetime, starting_cash: float, transaction_fee: float, fee_type: str) -> int:
    '''Creates a new portfolio simulation game and a portfolio for the owner
        args:
            name: str - name of the game
            password: str - password for the game
            creator_id: int - database id of the owner
            start_date: datetime - start date of the game
            end_date: datetime - end date of the game
            starting_cash: float - starting cash for the game
            transaction_fee: float - transaction fee for the game
            fee_type: str - type of transaction fee
        returns:
            int - database id of the game
    '''
    if datetime.today().date() > start_date:
        status = 'In Progress'
    else:
        status = 'Not Started'

    new_game = Game(
        name=name, 
        password=password, 
        participants=0,
        start_date=start_date, 
        end_date=end_date, 
        status=status,
        starting_cash=starting_cash, 
        transaction_fee=transaction_fee, 
        fee_type=fee_type, 
        creator_id=creator_id
    )

    db.session.add(new_game)
    db.session.commit()

    return new_game.id


def add_portfolio(game_id: int, user_id: int) -> int:
    '''Creates a new portfolio for a user in a game
        args:
            game_id: int - database id of the game
            user_id: int - database id of the user
        returns:
            int - database id of the portfolio
    '''
    starting_cash = Game.query.filter_by(id=game_id).first().starting_cash

    portfolio_exists = Portfolio.query.filter_by(user_id=user_id, game_id=game_id).first()

    if portfolio_exists:
        raise Exception('You already joined this game!')
    else:
        # create new portfolio
        portfolio = Portfolio(
            user_id=user_id, 
            game_id=game_id,
            available_cash=starting_cash,
            current_value=starting_cash, 
            last_updated=datetime.now(timezone.utc), 
            last_close_value=starting_cash
        )

        db.session.add(portfolio)
        db.session.commit()
    
        # update game number of participants
        game = Game.query.filter_by(id=game_id).first()
        game.participants += 1

        db.session.commit()

        # record portfolio history
        history = History(portfolio_id=portfolio.id,
                        portfolio_value=starting_cash)
        
        db.session.add(history)
        db.session.commit()

        return portfolio.id


def add_stock(ticker: str, price: float) -> int:
    '''Creates a new stock in the database
        If stock is already in database, returns existing stock id
        args:
            ticker: str - stock ticker
            price: float - current price of the stock
        returns:
            int - database id of the stock
    '''
    stock = Stock.query.filter_by(ticker=ticker).first()

    if stock is None:
        id = stock.id
        stock.current_price = price
        stock.last_updated = datetime.now(timezone.utc)

        db.session.commit()
    else:
        stock_info = get_stock_info(ticker)

        new_stock = Stock(
            ticker=ticker, 
            company_name=stock_info.get('company_name', 'n/a'),
            industry=stock_info.get('industry', 'n/a'),
            sector=stock_info.get('sector', 'n/a'),
            currency=stock_info.get('currency', 'n/a'),
            previous_close=stock_info.get('previous_close', price),
            opening_price=stock_info.get('open', price),
            current_price=price,
            last_updated=datetime.now(timezone.utc)
        )
        db.session.add(new_stock)
        db.session.commit()

        id = new_stock.id

    return id


def add_transaction(portfolio_id: int, stock_id: int, status: str, number_of_shares: int, price_per_share: float) -> None:
    '''Adds a transaction to the database
        args:
            portfolio_id: int - database id of the portfolio
            stock_id: int - database id of the stock
            status: str - type of transaction: buy, sell
            number_of_shares: int - number of shares bought/sold
            price_per_share: float - price per share
    '''
    # if sell transaction, calculate profit/loss
    if status == 'sell':
        holding = Holding.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()

        if holding is None:
            raise Exception('You do not own this stock.')
        
        profit_loss = (price_per_share - holding.average_price) * number_of_shares
    else:
        profit_loss = None

    transaction = Transaction(
        portfolio_id=portfolio_id, 
        stock_id=stock_id, 
        status=status, 
        number_of_shares=number_of_shares, 
        price_per_share=price_per_share, 
        total_value=number_of_shares * price_per_share,
        profit_loss=profit_loss
    )

    db.session.add(transaction)
    db.session.commit()


def update_holding(portfolio_id: int, stock_id: int, shares: int, price: float, transaction_type: str) -> None:
    '''Updates the holdings of a portfolio after a transaction
        args:
            portfolio_id: int - database id of the portfolio
            stock_id: int - database id of the stock
            shares: int - number of shares bought/sold
            price: float - price per share
            transaction_type: str - type of transaction: buy, sell
    '''
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
        if holding.shares_owned == shares:
            db.session.delete(holding)
        else:
            holding.shares_owned -= shares

    db.session.commit()


def update_portfolio_cash(portfolio_id: int, transaction_cost: float, transaction_type: str) -> None:
    '''Updates the available cash for a portfolio 
    (subtracts the transaction cost from the available cash)
        args:
            portfolio_id: int - database id of the portfolio
            transaction_cost: float - total value of the transaction
            transaction_type: str - type of transaction: buy, sell
    '''
    portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    if transaction_type == 'sell':
        transaction_cost *= -1
        
    portfolio.available_cash = round(portfolio.available_cash - transaction_cost, 2)

    db.session.commit()


# getting data from database
    
def check_game_exists(name: str) -> bool:
    '''Checks if a game exists
        args:
            name: str - name of the game
        returns:
            bool - True if game exists, False otherwise
    '''
    game = Game.query.filter_by(name=name).first()

    return game is not None


def get_games_list(user_id: int) -> list:
    '''Gets a list of all the games info and parses data into a json string
        returns:
            list: list of info for each game
    '''
    games = Game.query.all()
    game_list = []

    for game in games:
        joined_game = Portfolio.query.filter_by(game_id=game.id, user_id=user_id).first() is not None

        game_list.append({
            'joinedGame': joined_game,
            'name': game.name,
            'creator': game.game_creator.username,
            'status': game.status,
            'participants': game.participants
        })

    return game_list


def get_game_details(game_id: int, user_id: int) -> dict:
    '''Gets the details of a game
        args: 
            game_id: int - database id of the game
        returns:
            dict - dicitonary of details of the game
    '''
    game = Game.query.filter_by(id=game_id).first()

    if game is None:
        raise Exception('Game does not exist!')
    
    joined_game = Portfolio.query.filter_by(game_id=game.id, user_id=user_id).first() is not None
    end_date = game.end_date.strftime('%Y-%m-%d') if game.end_date is not None else 'n/a'

    return {
        'name': game.name,
        'creator': game.game_creator.username,
        'participants': game.participants,
        'startDate': game.start_date.strftime('%Y-%m-%d'),
        'endDate': end_date,
        'status': game.status,
        'startingCash': game.starting_cash,
        'transactionFee': game.transaction_fee,
        'feeType': game.fee_type,
        'joinedGame': joined_game
    }


def get_game_update_time(game_id: int) -> str:
    '''Gets the last time the portfolio values in a game was updated
        args:
            game_id: int - database id of the game
        returns:
            str - last update time
    '''
    last_updated = Game.query.filter_by(id=game_id).first().last_updated

    if last_updated is None:
        return 'n/a'
    else:
        return last_updated.strftime('%Y-%m-%d %H:%M')


def get_user_portfolios(user_id: int) -> list:
    '''Gets all the portfolios of a user
        args:
            user_id: int - database id of the user
        returns:
            list - list of all the portfolios of the user
    '''
    portfolios = Portfolio.query.filter_by(user_id=user_id).all()
    portfolio_list = []

    if portfolios is None:
        return portfolio_list

    for portfolio in portfolios:
        portfolio_list.append({
            'gameName': portfolio.parent_game.name,
            'portfolioId': portfolio.id,
        })

    return portfolio_list


def get_portfolio_details(portfolio_id: int, user_id: int) -> dict:
    '''Gets the details of a portfolio
        if -1 is passed as the portfolio_id, returns the details of the user's most recent portfolio
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of details of the portfolio
    '''
    if portfolio_id == -1:
        portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.id.desc()).first()
    else:
        portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()

    if portfolio is None:
        raise Exception('Portfolio does not exist!')
        
    starting_cash = portfolio.parent_game.starting_cash
    current_value = portfolio.current_value
    change = round((current_value/starting_cash - 1) * 100, 2)
    profit = round(current_value - starting_cash, 2)
    last_updated = utc_to_est(portfolio.last_updated).strftime('%a, %b %d. %Y %I:%M%p') + ' EST'

    return {
        'gameName': portfolio.parent_game.name,
        'availableCash': portfolio.available_cash,
        'currentValue': current_value,
        'change': change,
        'profit': profit,
        'lastUpdated': last_updated,
    }


# getting data for tables
    
def get_top_performers(game_id: int) -> list:
    '''Gets the top performing portfolios ordered
        args:
            game_id: int - database id of the game
        returns:
            list - list of all portfolios sorted by portfolio value
    '''
    game = Game.query.filter_by(id=game_id).first()

    if game is None:
        raise Exception('Game does not exist!')

    starting_cash = game.starting_cash
    portfolios = Portfolio.query.filter_by(game_id=game_id).order_by(Portfolio.current_value.desc()).all()

    top_performers = []
    count = 0
    prev = None

    for portfolio in portfolios:
        count += 1
        current_value = portfolio.current_value
        portfolio_change =  round((current_value/starting_cash - 1) * 100, 2)
        portfolio_age = (get_est_time() - utc_to_est(portfolio.creation_date)).days

        rank = count
        if current_value == prev:
            rank = '-'
        
        if portfolio_age == 0:
            daily_change = 'n/a'
        else:
            daily_change = round(portfolio_change/portfolio_age, 2)
        
        top_performers.append({
            'Rank': rank,
            'Username': portfolio.portfolio_owner.username,
            'Portfolio Value': portfolio.current_value,
            'Change (%)': portfolio_change,
            'Portfolio Age (days)': portfolio_age,
            'Daily Change (%)': daily_change
        })

        prev = current_value

    return top_performers


def get_top_daily_performers(game_id: int) -> list:
    '''Gets the top daily performers ordered
        args:
            game_id: int - database id of the game
        returns:
            list - list of all portfolios sorted by daily change %
    '''
    portfolios = Portfolio.query.filter_by(game_id=game_id).all()

    if not portfolios:
        raise Exception('No portfolios found!')

    ranked_portfolios = sorted(portfolios, key=lambda p: (p.current_value / p.last_close_value), reverse=True)

    top_performers = []
    count = 0
    prev = None

    for portfolio in ranked_portfolios:
        count += 1
        day_change =  round(portfolio.current_value - portfolio.last_close_value, 2)
        day_change_percent = round(day_change/portfolio.last_close_value*100, 2)

        rank = count
        if day_change_percent == prev:
            rank = '-'

        top_performers.append({
            'Rank': rank,
            'Username': portfolio.portfolio_owner.username,
            'Change (%)': day_change_percent,
            'Change ($)': day_change,
            'Total Value': portfolio.current_value
        })

        prev = day_change_percent

    return top_performers


def get_portfolio_transactions(portfolio_id: int, user_id: int) -> list:
    '''Gets the transactions of a portfolio
        if -1 is passed as the portfolio_id, returns the transactions of the user's most recent portfolio
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            list - list of all the transactions of the portfolio
    '''
    if portfolio_id == -1:
        portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.id.desc()).first()
    else:
        portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    if portfolio is None:
        raise Exception('Portfolio does not exist!')

    transactions = Transaction.query.filter_by(portfolio_id=portfolio.id).all()
    transaction_list = []

    if transactions is None:
        return transaction_list

    for transaction in transactions:
        transaction_list.append({
            'Ticker': transaction.stock.ticker,
            'Full Name': transaction.stock.company_name,
            'Type': transaction.transaction_type,
            'Shares': transaction.number_of_shares,
            'Price': transaction.price_per_share,
            'Total': transaction.total_price,
            'Currency': transaction.stock.currency,
            'Date (EST)': utc_to_est(transaction.transaction_time).strftime('%H:%M:%S %m-%d-%Y')
        })

    return transaction_list


def get_portfolio_holdings(portfolio_id: int, user_id: int) -> list:
    '''Gets the holdings of a portfolio
        if -1 is passed as the portfolio_id, returns the holdings of the user's most recent portfolio
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            list - list of all the holdings of the portfolio
    '''
    if portfolio_id == -1:
        portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.id.desc()).first()
    else:
        portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    if portfolio is None:
        raise Exception('Portfolio does not exist!')

    holdings = Holding.query.filter_by(portfolio_id=portfolio.id).all()
    holding_list = []

    if holdings is None:
        return holding_list

    for holding in holdings:
        day_change = round(holding.stock.current_price - holding.stock.opening_price, 2)
        day_change_percent = round(day_change/holding.stock.opening_price * 100, 2)
        change = round(holding.stock.current_price - holding.average_price, 2)
        change_percent = round(change/holding.average_price * 100, 2)
        total_change = round(change * holding.shares_owned, 2)
        market_value = round(holding.shares_owned * holding.stock.current_price, 2)

        holding_list.append({
            'Ticker': holding.stock.ticker,
            'Shares Owned': holding.shares_owned,
            'Average Price': holding.average_price,
            'Current Price': holding.stock.current_price,
            'Net Change': change,
            'Total Change': total_change,
            'Change (%)': change_percent,
            'Day Change': day_change,
            'Day Change (%)': day_change_percent,
            'Market Value': market_value,
            'Currency': holding.stock.currency
        })

    return holding_list


# getting data for plots

def get_leaderboard_history(game_id) -> list:
    '''Gets the performance history of all portfolios
        args:
            game_id: int - database id of the game
        returns:
            str - json string of the performance history of all portfolios
    '''
    portfolios = Portfolio.query.filter_by(game_id=game_id).all()

    if not portfolios:
        raise Exception('No portfolios found!')
    
    history = []

    for portfolio in portfolios:
        history.append({
            'x': [utc_to_est(h.update_time).strftime('%Y-%m-%d %H:%M') for h in portfolio.history],
            'y': [h.portfolio_value for h in portfolio.history],
            'name': portfolio.portfolio_owner.username
        })

    return history


def get_portfolio_history(portfolio_id: int, user_id: int) -> dict:
    '''Gets the history of a portfolio
        if -1 is passed as the portfolio_id, returns the history of the user's most recent portfolio
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of the history of the portfolio
    '''
    if portfolio_id == -1:
        portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.id.desc()).first()
    else:
        portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    if portfolio is None:
        raise Exception('Portfolio does not exist!')

    history = History.query.filter_by(portfolio_id=portfolio_id).all()

    return {
        'x': [utc_to_est(h.update_time).strftime('%Y-%m-%d %H:%M') for h in history],
        'y': [h.portfolio_value for h in history],
    }


def get_holdings_breakdown(portfolio_id: int, user_id: int) -> dict:
    '''Gets the values for each holding in a portfolio
        if -1 is passed as the portfolio_id, returns the breakdown of the user's most recent portfolio
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of the list of holdings and their values
    '''
    if portfolio_id == -1:
        portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.id.desc()).first()
    else:
        portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    if portfolio is None:
        raise Exception('Portfolio does not exist!')

    holding_breakdown = {}
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).all()

    if holdings is None:
        return holding_breakdown

    for holding in holdings:
        holding_breakdown.get("labels", []).append(holding.stock.ticker)
        holding_breakdown.get("values", []).append(holding.shares_owned * holding.stock.current_price)

    return holding_breakdown


def get_sector_breakdown(portfolio_id: int, user_id: int) -> dict:
    '''Gets the total values of each sector category in a portfolio
    if -1 is passed as the portfolio_id, returns the breakdown of the user's most recent portfolio
    args:
        portfolio_id: int - database id of the portfolio
    returns:
        dict - dictionary of the list of sector and their total values
    '''
    if portfolio_id == -1:
        portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.id.desc()).first()
    else:
        portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    if portfolio is None:
        raise Exception('Portfolio does not exist!')

    sector_breakdown = {}
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).all()

    if holdings is None:
        return sector_breakdown

    for holding in holdings:
        sector = holding.stock.sector
        sector_breakdown[sector] = sector_breakdown.get(sector, 0) + holding.stock.current_price * holding.number_of_shares

    return {
        'labels': list(sector_breakdown.keys()),
        'values': list(sector_breakdown.values())
    }


# stock data 

def get_stock_info(ticker: str) -> dict:
    '''Gets detailed stock information from yfinance
        args:
            ticker: str - stock ticker
        returns:
            dict - stock information
    '''
    stock_info = yf.Ticker(ticker).info
    
    if 'currentPrice' not in stock_info:
        raise Exception('cannot find ticker')
    else:
        return {
        'price': round(float(stock_info.get('currentPrice')), 2),
        'sector': stock_info.get('sector', 'n/a'),
        'industry': stock_info.get('industry', 'n/a'),
        'company_summary': stock_info.get('longBusinessSummary', 'n/a'),
        'currency': stock_info.get('currency', 'n/a'),
        'company_name': stock_info.get('longName', 'n/a'),
        'open': stock_info.get('open'),
        'previous_close': stock_info.get('previousClose'),
        'day_change': round(float(stock_info.get('currentPrice', 0))-float(stock_info.get('open', 1)), 2),
        '%_day_change': round((float(stock_info.get('currentPrice', 0))/float(stock_info.get('open', 1)) - 1)*100, 2),
        '52_week_returns': round(float(stock_info.get('52WeekChange', 0))*100, 2),
        '52_week_high': round(float(stock_info.get('fiftyTwoWeekHigh', 0)), 2),
        '52_week_low': round(float(stock_info.get('fiftyTwoWeekLow', 0)), 2)
    }
        

def get_stock_history(ticker: str, period='5y', detailed=False) -> dict:
    '''Gets the historical price of a stock
        args:
            ticker: str - stock ticker
            period: str - time period for the historical data
            detailed: bool - whether to included detailed data: open, high, low, close
        returns:
            dict - dictionary of the historical price of a stock
    '''
    stock = yf.Ticker(ticker).history(period=period).dropna()

    if detailed:
        history = {
            'date': [d.strftime('%Y-%m-%d') for d in stock.index],
            'close': [p for p in round(stock['Close'], 2)],
            'open': [p for p in round(stock['Open'], 2)],
            'high': [p for p in round(stock['High'], 2)],
            'low': [p for p in round(stock['Low'], 2)]
        }
    else:
        history = {
            'date': [d.strftime('%Y-%m-%d') for d in stock.index],
            'price': [p for p in round(stock['Close'], 2)]
        }

    return history


def get_stock_news(ticker: str) -> list:
    '''Gets the related news articles for a stock
        args:
            ticker: str - stock ticker
        returns:
            list - news articles for the stock
    '''
    news = yf.Ticker(ticker).news
    articles = []

    for n in news:
        articles.append({
            'name': n['title'],
            'url': n['link']
        })

    return articles


# other util functions

def get_est_time() -> datetime:
    '''Gets the current time in EST
        returns:
            datetime - current time in EST
    '''
    est = pytz.timezone('US/Eastern')

    return datetime.now(est)


def utc_to_est(utc_time: datetime) -> datetime:
    '''Converts a UTC datetime to EST
        args:
            utc_time: datetime - datetime in UTC
        returns:
            datetime - datetime in EST
    '''
    utc_time = utc_time.replace(tzinfo=pytz.utc)
    est = pytz.timezone('US/Eastern')

    return utc_time.astimezone(est)