from datetime import datetime

from src.data_models import db, Portfolio, DailyHistory, ClosingHistory, Game
from .time import get_est_time, get_market_date, utc_to_est


# updating database
def add_game(creator_id: int, name: str, password: str, start_date: datetime, end_date: datetime, starting_cash: float, transaction_fee: float, fee_type: str) -> int:
    """Creates a new game in the database

    Args:
        creator_id (int): user id of the creator
        name (str): unique name of the game
        password (str): optional password 
        start_date (datetime): starting date of the game
        end_date (datetime): optional ending date of the game
        starting_cash (float): starting cash for each player
        transaction_fee (float): transaction fee for each transaction
        fee_type (str): type of transaction fee (Flat Fee or Percentage)

    Returns:
        int: database id of the new game
    """
    
    validate_game(name, password, start_date, end_date, starting_cash, transaction_fee, fee_type)
    
    status = 'In Progress' if get_est_time().date() == start_date else 'Not Started'

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
        creator_id=creator_id,
        creation_date=get_est_time()
    )

    db.session.add(new_game)
    db.session.commit()

    return new_game.id


def add_portfolio(name: str, user_id: int, password: str) -> int:
    """ Creates a new portfolio for a user in a game. Raises an exception if the user has already joined the game.

    Args:
        name (str): name of the game
        user_id (int): id of the user
        password (str): optional password of the game

    Raises:
        Exception: game not found
        Exception: incorrect password
        Exception: user already joined game

    Returns:
        int: database id of the user's portfolio
    """
    game = Game.query.filter_by(name=name).first()
    
    if game is None:
        raise Exception('Game not found')
    
    portfolio_exists = Portfolio.query.filter_by(user_id=user_id, game_id=game.id).first()
    
    starting_cash = game.starting_cash
    game_password = game.password
    
    if game_password is not None and game_password != password:
        raise Exception('Incorrect password!')

    if portfolio_exists:
        raise Exception('You already joined this game!')
    else:
        # create new portfolio
        portfolio = Portfolio(
            user_id=user_id,
            game_id=game.id,
            available_cash=starting_cash,
            current_value=starting_cash,
            last_updated=get_est_time(),
            last_close_value=starting_cash,
            creation_date=get_est_time()
        )
        db.session.add(portfolio)
    
        # update game number of participants
        game.participants += 1

        db.session.commit()

        return portfolio.id


# getting data 
def get_games_list(user_id=None) -> list:
    """ Gets a list of all games

    Args:
        user_id (int, optional): id of the user

    Returns:
        list: list of dictionaries containing game details
    """
    games = Game.query.order_by(Game.participants.desc()).all()
    game_list = []

    for game in games:
        if user_id is not None:
            joined_game = Portfolio.query.filter_by(game_id=game.id, user_id=user_id).first() is not None
        else:
            joined_game = False

        transaction_fee = f'flat fee of ${round(game.transaction_fee)}' if game.fee_type == 'Flat Fee' else f'{round(game.transaction_fee * 100)}% fee'

        game_details = f'${round(game.starting_cash)} starting cash, with {transaction_fee} per transaction. {"No password required." if game.password is None else "Password required."}'

        game_list.append({
            'gameId': game.id,
            'joinedGame': joined_game,
            'name': game.name,
            'creator': game.game_creator.username,
            'status': game.status,
            'participants': game.participants,
            'startDate': game.start_date.strftime("%B %d, %Y"),
            'endDate': game.end_date.strftime("%B %d, %Y") if game.end_date is not None else 'n/a',
            'details': game_details,
            'passwordRequired': game.password is not None,
        })

    return game_list


def get_game_leaderboard(game_id: int, user_id=None) -> dict:
    """ Gets the leaderboard details of a game

    Args:
        game_id (int): id of the game
        user_id (int, optional): id of the user

    Returns:
        dict: dictionary of the game leaderboard details
    """
    game_details = get_game_details(game_id, user_id) # game info
    top_performers = get_top_performers(game_id) # for display in a table
    top_daily_performers = get_top_daily_performers(game_id) # for display in a table
    performance_history = get_game_history(game_id) # for display in a time series plot

    return {
        'gameDetails': game_details,
        'topPortfolios': top_performers,
        'dailyPortfolios': top_daily_performers,
        'closingHistory': performance_history.get('closingHistory'),
        'dailyHistory': performance_history.get('dailyHistory'),
        'dailyHistoryDate': performance_history.get('date')
    }
    
    
def get_game_details(game_id: int, user_id=None) -> dict:
    """ Gets the details of a game

    Args:
        game_id (int): id of the game
        user_id (int, optional): id of the user
        
    Raises:
        Exception: game not found

    Returns:
        dict: dictionary of game details
    """

    game = Game.query.filter_by(id=game_id).first()
    
    if user_id is not None:
        portfolio = Portfolio.query.filter_by(game_id=game.id, user_id=user_id).first()
    else:
        portfolio = None
    
    if game is None:
        raise Exception('Game not found')
    
    start_date = game.start_date.strftime("%B %d, %Y")
    end_date = game.end_date.strftime("%B %d, %Y") if game.end_date is not None else 'n/a'
    starting_cash = f'${round(game.starting_cash)}'
    joined_game = portfolio is not None
    portfolio_id = portfolio.id if portfolio is not None else None
    transaction_fee = f'${round(game.transaction_fee, 0)}' if game.fee_type == 'Flat Fee' else f'{round(game.transaction_fee * 100, 0)}%'
    password_required = game.password is not None
    last_updated = utc_to_est(game.last_updated).strftime('%a, %b %d. %Y %I:%M %p') + ' EST' if game.last_updated is not None else 'n/a'
    game_duration = f'{(game.end_date - game.start_date).days} days' if game.end_date is not None else 'Infinite'

    return {
        'name': game.name,
        'creator': game.game_creator.username,
        'participants': game.participants,
        'startDate': start_date,
        'endDate': end_date,
        'status': game.status,
        'startingCash': starting_cash,
        'transactionFee': transaction_fee,
        'feeType': game.fee_type,
        'joinedGame': joined_game,
        'portfolioId': portfolio_id,
        'passwordRequired': password_required,
        'lastUpdated': last_updated,
        'gameDuration': game_duration
    }
    

def get_top_performers(game_id: int) -> list:
    """ Gets the top performing portfolios in a game sorted by portfolio value

    Args:
        game_id (int): id of the game

    Returns:
        list: list of dictionaries containing each portfolios details
    """
    game = Game.query.filter_by(id=game_id).first()
    portfolios = Portfolio.query.filter_by(game_id=game_id).order_by(Portfolio.current_value.desc()).all()

    starting_cash = game.starting_cash
    top_performers = []
    count = 0
    prev = None

    for portfolio in portfolios:
        count += 1
        
        current_value = portfolio.current_value
        portfolio_change =  round((current_value/starting_cash - 1) * 100, 2)
        portfolio_age = (get_est_time() - utc_to_est(portfolio.creation_date)).days
        rank = count if current_value != prev else '-'
        daily_change = f'{round(portfolio_change/portfolio_age, 2)}%' if portfolio_age != 0 else 'n/a'
        
        top_performers.append({
            'Rank': rank,
            'Username': portfolio.portfolio_owner.username,
            'Value': f'${portfolio.current_value}',
            'Change': f'{portfolio_change}%',
            'Age (days)': portfolio_age,
            'Daily Change': f'{daily_change}',
        })

        prev = current_value

    return top_performers


def get_top_daily_performers(game_id: int) -> list:
    """ Gets the top daily performers in a game sorted by daily change %

    Args:
        game_id (int): id of the game

    Returns:
        list: list of dictionaries containing each portfolios details
    """
    portfolios = Portfolio.query.filter_by(game_id=game_id).all()

    ranked_portfolios = sorted(portfolios, key=lambda p: (p.current_value / p.last_close_value), reverse=True)

    top_performers = []
    count = 0
    prev = None

    for portfolio in ranked_portfolios:
        count += 1
        
        day_change =  round(portfolio.current_value - portfolio.last_close_value, 2)
        day_change_percent = round(day_change/portfolio.last_close_value*100, 2)
        rank = count if day_change_percent != prev else '-'

        top_performers.append({
            'Rank': rank,
            'Username': portfolio.portfolio_owner.username,
            '% Change': f'{day_change_percent}%',
            'Change': f'${day_change}',
            'Value': f'${portfolio.current_value}'
        })

        prev = day_change_percent

    return top_performers


def get_game_history(game_id: int) -> dict:
    """ Gets todays performance history and daily closing history of all portfolios in a game
        if market is closed, gets the history for the last day the market was open

    Args:
        game_id (int): id of the game

    Returns:
        dict: dictionary containing the closing history and daily performance history of all portfolios
    """
    # closing history
    closing_history = ClosingHistory.query.join(Portfolio).filter_by(game_id=game_id).order_by(ClosingHistory.date.desc()).all()
    close = {}

    if closing_history is not None:
        for row in closing_history:
            data = close.setdefault(row.portfolio_id, {'x': [], 'y': [], 'name': row.portfolio.portfolio_owner.username})
            data['x'].append(row.date.strftime('%Y-%m-%d'))
            data['y'].append(row.portfolio_value)
            close[row.portfolio_id] = data

    # todays performance history
    market_date = get_market_date(get_est_time()) # last date the market was open

    daily_history = DailyHistory.query.filter_by(date=market_date).join(Portfolio).filter_by(game_id=game_id).order_by(DailyHistory.update_time.desc()).all()
    day = {}

    if daily_history is not None:
        for row in daily_history:
            daily_growth = (row.portfolio_value/row.portfolio.last_close_value - 1) * 100
            data = day.setdefault(row.portfolio_id, {'x': [], 'y': [], 'name': row.portfolio.portfolio_owner.username})
            data['x'].append(utc_to_est(row.update_time).strftime('%Y-%m-%d %H:%M'))
            data['y'].append(daily_growth)
            day[row.portfolio_id] = data

    return {
        'closingHistory': list(close.values()),
        'dailyHistory': list(day.values()),
        'date': market_date.strftime('%b %d, %Y')
    }

# validation
def validate_game(name: str, password: str, start_date: datetime, end_date: datetime, starting_cash: float, transaction_fee: float, fee_type: str) -> None:
    """ Checks whether the game details are valid. Raises ValueError if not.

    Args:
        name (str): name of the game
        password (str): optional password for the game
        start_date (datetime): starting date of the game
        end_date (datetime): optional ending date of the game
        starting_cash (float): starting cash of each portfolio
        transaction_fee (float): transaction fee for each transaction
        fee_type (str): type of transaction fee (Flat Fee or Percentage)
        
    Raises:
        ValueError: name already taken
        ValueError: name over 100 characters
        ValueError: password over 100 characters
        ValueError: start date in the past
        ValueError: end date before start date
        ValueError: starting cash not positive
        ValueError: transaction fee negative
        ValueError: fee type not Flat Fee or Percentage
    """
    game = Game.query.filter_by(name=name).first()
    
    if game is not None:
        raise ValueError('Game name already taken')
    if len(name) > 100:
        raise ValueError('Game name too long')
    if password is not None and len(password) > 50:
        raise ValueError('Game password too long')
    if start_date < get_est_time().date():
        raise ValueError('Game start date cannot be in the past')
    if end_date is not None and end_date < start_date:
        raise ValueError('Game end date cannot be before start date')
    if starting_cash <= 0:
        raise ValueError('Starting cash must be positive')
    if transaction_fee < 0:
        raise ValueError('Transaction fee must be non-negative')
    if fee_type not in ['Flat Fee', 'Percentage']:
        raise ValueError('Invalid fee type')