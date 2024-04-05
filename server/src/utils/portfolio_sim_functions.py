from datetime import datetime, timezone
import pytz
import pandas as pd
import yfinance as yf

from ..data_models import db, Portfolio, Holding, Transaction, History, Game


# updating database

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
    starting_funds = Game.query.filter_by(id=game_id).first().starting_cash

    portfolio_exists = Portfolio.query.filter_by(user_id=user_id, game_id=game_id).first()

    if portfolio_exists:
        raise Exception('You already joined this game!')
    else:
        # create new portfolio
        portfolio = Portfolio(
            user_id=user_id, 
            game_id=game_id,
            available_cash=starting_funds,
            current_value=starting_funds, 
            last_updated=datetime.now(timezone.utc), 
            last_close_value=starting_funds
        )

        db.session.add(portfolio)
        db.session.commit()
    
        # update game number of participants
        game = Game.query.filter_by(id=game_id).first()
        game.participants += 1

        db.session.commit()

        # record portfolio history
        history = History(portfolio_id=portfolio.id,
                        portfolio_value=starting_funds)
        
        db.session.add(history)
        db.session.commit()

        return portfolio.id


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


def get_game_details(game_id: int, user_id: int) -> str:
    '''Gets the details of a game
        args: 
            game_id: int - database id of the game
        returns:
            str - json string of the game details
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

    starting_funds = game.starting_cash
    portfolios = Portfolio.query.filter_by(game_id=game_id).all()
    ranked_portfolios = sorted(portfolios, key=lambda p: p.current_value, reverse=True)

    top_performers = []
    count = 0
    prev = None

    for portfolio in ranked_portfolios:
        count += 1
        current_value = portfolio.current_value
        portfolio_change =  round((current_value/starting_funds - 1) * 100, 2)
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


def get_performance_history(game_id) -> list:
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


def get_update_time(game_id: int) -> str:
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