from datetime import datetime

from src.data_models import db, Portfolio, Game
from .time import get_est_time, get_prev_market_date, utc_to_est
from .math_functions import round_number


# updating database
def add_game(
    creator_id: int, 
    name: str, 
    password: str, 
    start_date: datetime, 
    end_date: datetime, 
    starting_cash: float, 
    transaction_fee: float, 
    fee_type: str
) -> int:
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
def get_games_list(filter: str, offset: int, search: str, user_id=None) -> list:
    """ Gets a list of all games

    Args:
        user_id (int, optional): id of the user
        filter (str, optional): filter for the games

    Returns:
        list: list of dictionaries containing game details
    """
    # query data depending on filter
    if filter=='All':
        games = Game.query.filter(
            Game.name.ilike(f"%{search}%")
        ).order_by(
            Game.participants.desc()
        ).offset(offset).limit(10).all()
        
    elif filter=='In Progress' or filter=='Not Started' or filter=='Completed':
        games = Game.query.filter(
            Game.status==filter,
        ).filter(
            Game.name.ilike(f"%{search}%")
        ).order_by(
            Game.participants.desc()
        ).offset(offset).limit(10).all()
        
    elif filter=='Joined':
        games = Game.query.filter(
            Game.portfolios.any(Portfolio.user_id==user_id)
        ).filter(
            Game.name.ilike(f"%{search}%")
        ).order_by(
            Game.participants.desc()
        ).offset(offset).limit(10).all()
    
    elif filter=='Not Joined':
        games = Game.query.filter(
            ~Game.portfolios.any(Portfolio.user_id==user_id)
        ).filter(
            Game.name.ilike(f"%{search}%")
        ).order_by(
            Game.participants.desc()
        ).offset(offset).limit(10).all()
    
    game_list = []

    for game in games:
        if user_id is not None:
            joined_game = Portfolio.query.filter_by(
                game_id=game.id, user_id=user_id
            ).first() is not None
        else:
            joined_game = False

        transaction_fee = (
            f'flat fee of ${round_number(game.transaction_fee)}' 
            if game.fee_type == 'Flat Fee' 
            else f'{round_number(game.transaction_fee * 100)}% fee'
        )
        game_details = (
            f'${round_number(game.starting_cash)} starting cash, with {transaction_fee} per transaction. ' +
            ('No password required.' if game.password is None else 'Password required.')
        )

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


def get_game_leaderboard(game_id: int, user_id=None, top_filter=None, daily_filter=None) -> dict:
    """ Gets the leaderboard details of a game

    Args:
        game_id (int): id of the game
        user_id (int, optional): id of the user
        top_filter (str, optional): number of top performers to display
        daily_filter (str, optional): number of top daily performers to display

    Returns:
        dict: dictionary of the game leaderboard details
    """
    if top_filter is not None:
        closing_history = get_closing_history(game_id, top_filter)
        return {
            'closingHistory': closing_history
        }
        
    elif daily_filter is not None:
        daily_history = get_daily_history(game_id, daily_filter)
        return {
            'dailyHistory': daily_history.get('dailyHistory')
        }
        
    else:
        game_details = get_game_details(game_id, user_id) # game info
        top_performers = get_top_performers(game_id) # for display in a table
        top_daily_performers = get_top_daily_performers(game_id) # for display in a table
        closing_history = get_closing_history(game_id)
        daily_history = get_daily_history(game_id)

        return {
            'gameDetails': game_details,
            'topPortfolios': top_performers,
            'dailyPortfolios': top_daily_performers,
            'closingHistory': closing_history,
            'dailyHistory': daily_history.get('dailyHistory'),
            'dailyHistoryDate': daily_history.get('date')
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
    starting_cash = f'${round_number(game.starting_cash)}'
    joined_game = portfolio is not None
    portfolio_id = portfolio.id if portfolio is not None else None
    transaction_fee = (
        f'${round_number(game.transaction_fee)}' 
        if game.fee_type == 'Flat Fee' 
        else f'{round_number(game.transaction_fee * 100)}%'
    )
    password_required = game.password is not None
    last_updated = (
        utc_to_est(game.last_updated).strftime('%a, %b %d. %Y %I:%M %p') + 
        ' EST' if game.last_updated is not None 
        else 'n/a'
    )
    game_duration = (
        f'{(game.end_date - game.start_date).days} days' 
        if game.end_date is not None 
        else 'Infinite'
    )

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
    portfolios = Portfolio.query.filter_by(
        game_id=game_id
    ).order_by(
        Portfolio.overall_rank.asc()
    ).all()

    starting_cash = game.starting_cash
    top_performers = []
    prev_rank = None

    for portfolio in portfolios:
        current_value = portfolio.current_value
        rank = portfolio.overall_rank if prev_rank != portfolio.overall_rank else '-'
        prev_rank = portfolio.overall_rank
        
        portfolio_change =  round_number((current_value/starting_cash - 1) * 100, 2)
        portfolio_age = (get_est_time() - utc_to_est(portfolio.creation_date)).days
        daily_change = (
            f'{round_number(portfolio_change/portfolio_age)}%'
            if portfolio_age != 0 
            else 'n/a'
        )
        
        top_performers.append({
            'Rank': rank,
            'Username': portfolio.portfolio_owner.username,
            'Value': f'${portfolio.current_value}',
            'Change': f'{portfolio_change}%',
            'Age (days)': portfolio_age,
            'Daily Change': f'{daily_change}',
        })

        prev_rank = portfolio.overall_rank

    return top_performers


def get_top_daily_performers(game_id: int) -> list:
    """ Gets the top daily performers in a game sorted by daily change %

    Args:
        game_id (int): id of the game

    Returns:
        list: list of dictionaries containing each portfolios details
    """
    portfolios = Portfolio.query.filter(
        Portfolio.game_id==game_id
    ).order_by(
        Portfolio.daily_rank.asc()
    ).all()

    top_performers = []
    prev_rank = None

    for portfolio in portfolios: 
        day_change_percent = round_number(portfolio.day_change/portfolio.last_close_value*100, 2) if portfolio.day_change else 0
        rank = portfolio.daily_rank if portfolio.daily_rank != prev_rank else '-'

        top_performers.append({
            'Rank': rank,
            'Username': portfolio.portfolio_owner.username,
            '% Change': f'{day_change_percent}%',
            'Change': f'${portfolio.day_change}',
            'Value': f'${portfolio.current_value}'
        })

        prev_rank = portfolio.daily_rank

    return top_performers


def get_closing_history(game_id: int, filter='top5') -> list:
    """ Gets top performers for overall leaderboard filtered by overall change

    Args:
        game_id (int): id of the game
        filter (str, optional): amount of data to show. Defaults to 'top5'.

    Returns:
        list: list of dictionaries containing the closing history of portfolios
    """
    # query data depending on filter
    if filter=='top5':
        portfolios = Portfolio.query.filter(
            Portfolio.game_id==game_id
        ).order_by(
            Portfolio.overall_rank.asc()
        ).limit(5).all()
    elif filter=='bottom5':
        portfolios = Portfolio.query.filter(
            Portfolio.game_id==game_id
        ).order_by(
            Portfolio.overall_rank.desc()
        ).limit(5).all()
    else:
        portfolios = Portfolio.query.filter(
            Portfolio.game_id==game_id
        ).all()
    
    # parse data for plotting
    parsed_data = []
    
    for portfolio in portfolios:
        history = portfolio.closing_history
        history = sorted(history, key=lambda x: x.date)
        
        if history is not None:
            name = portfolio.portfolio_owner.username
            portfolio_history = {'name': name, 'x': [], 'y': []}
        
            for row in history:
                x = row.date.strftime('%Y-%m-%d')
                y = row.portfolio_value
                
                portfolio_history['x'].append(x)
                portfolio_history['y'].append(y)
                
            parsed_data.append(portfolio_history)
    
    return parsed_data
        

def get_daily_history(game_id: int, filter='top5') -> dict:
    """ Gets top performers for the daily leaderboard filtered by daily change %

    Args:
        game_id (int): id of the game
        filter (str, optional): amount of data to show. Defaults to 'top5'.

    Returns:
        dict: dictionary of the list of daily history of portfolios and the date
    """
    market_date = get_prev_market_date() # last date the market was open
    
    # query data depending on filter
    if filter=='top5':
        portfolios = Portfolio.query.filter(
            Portfolio.game_id==game_id
        ).order_by(
            Portfolio.daily_rank.asc()
        ).limit(5).all()
    elif filter=='bottom5':
        portfolios = Portfolio.query.filter(
            Portfolio.game_id==game_id
        ).order_by(
            Portfolio.daily_rank.desc()
        ).limit(5).all()
    else:
        portfolios = Portfolio.query.filter(
            Portfolio.game_id==game_id
        ).all()
    
    # parse data for plotting
    parsed_data = []
    
    for portfolio in portfolios:
        history = portfolio.daily_history
        history = sorted(history, key=lambda x: x.update_time)
    
        if history is not None:
            name = portfolio.portfolio_owner.username
            portfolio_history = {'name': name, 'x': [], 'y': []}
            
            for row in history:
                if row.date == market_date:
                    x = utc_to_est(row.update_time).strftime('%Y-%m-%d %H:%M')
                    y = (row.portfolio_value/portfolio.last_close_value-1)*100

                    portfolio_history['x'].append(x)
                    portfolio_history['y'].append(y)
                    
            parsed_data.append(portfolio_history)
    
    return {
        'dailyHistory': parsed_data,
        'date': market_date.strftime('%b %d, %Y')
    }


# validation
def validate_game(
    name: str, 
    password: str, 
    start_date: datetime, 
    end_date: datetime, 
    starting_cash: float, 
    transaction_fee: float, 
    fee_type: str
) -> None:
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