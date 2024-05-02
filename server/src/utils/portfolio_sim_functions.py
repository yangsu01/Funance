from datetime import datetime, timezone

from ..data_models import db, Portfolio, Holding, Transaction, DailyHistory, ClosingHistory, Game, Stock
from .time_functions import get_est_time, check_market_closed, get_market_date, utc_to_est
from .yf_functions import get_stock_info


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

        # record current portfolio value in daily history
        daily_history = DailyHistory(
            portfolio_id=portfolio.id,
            date=get_est_time().date(),
            portfolio_value=starting_cash
        )
        
        db.session.add(daily_history)

        # record portfolio value in closing history if market is closed
        if check_market_closed():
            closing_history = ClosingHistory(
                portfolio_id=portfolio.id,
                date=get_est_time().date(),
                portfolio_value=starting_cash
            )
            
            db.session.add(closing_history)

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

    # if stock already exists, update price
    if stock is not None:
        id = stock.id
        stock.current_price = price
        stock.last_updated = datetime.now(timezone.utc)

        db.session.commit()

    # if stock does not exist, create new stock
    else:
        stock_info = get_stock_info(ticker)

        new_stock = Stock(
            ticker=ticker, 
            company_name=stock_info.get('companyName', 'n/a'),
            industry=stock_info.get('industry', 'n/a'),
            sector=stock_info.get('sector', 'n/a'),
            currency=stock_info.get('currency', 'n/a'),
            previous_close=stock_info.get('prevClose', price),
            opening_price=stock_info.get('open', price),
            current_price=price,
            last_updated=datetime.now(timezone.utc)
        )
        db.session.add(new_stock)
        db.session.commit()

        id = new_stock.id

    return id


def add_transaction(portfolio_id: int, stock_id: int, transaction_type: str, number_of_shares: int, price_per_share: float) -> None:
    '''Adds a transaction to the database
        
        args:
            portfolio_id: int - database id of the portfolio
            stock_id: int - database id of the stock
            transaction_type: str - type of transaction: buy, sell
            number_of_shares: int - number of shares bought/sold
            price_per_share: float - price per share
    '''
    # if sell transaction, calculate profit/loss
    if transaction_type == 'sell':
        holding = Holding.query.filter_by(portfolio_id=portfolio_id, stock_id=stock_id).first()

        if holding is None:
            raise Exception('You do not own this stock.')
        
        profit_loss = (price_per_share - holding.average_price) * number_of_shares
    else:
        profit_loss = None

    transaction = Transaction(
        portfolio_id=portfolio_id, 
        stock_id=stock_id, 
        transaction_type=transaction_type, 
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
    transaction_fee = portfolio.parent_game.transaction_fee
    fee_type = portfolio.parent_game.fee_type

    if transaction_type == 'sell':
        transaction_cost *= -1

    if fee_type == 'Flat Fee':
        transaction_cost += transaction_fee
    elif fee_type == 'Percentage':
        transaction_cost += abs(transaction_cost) * transaction_fee

    portfolio.available_cash = round(portfolio.available_cash - transaction_cost, 2)

    db.session.commit()


# getting data from database 
def check_game_name_exists(name: str) -> bool:
    '''Checks if the name of a game is already taken
        
        args:
            name: str - name of the game
        returns:
            bool - True if game exists, False otherwise
    '''
    game = Game.query.filter_by(name=name).first()

    return game is not None


def check_game_exists(game_id: int) -> bool:
    '''Checks if a game exists
        
        args:
            game_id: int - database id of the game
        returns:
            bool - True if game exists, False otherwise
    '''
    game = Game.query.filter_by(id=game_id).first()

    return game is not None


def check_game_password(name: str, password: str) -> int:
    '''Checks if the password of a game is correct
        
        args:
            name: str - name of the game
            password: str - password for the game
        returns:
            int - database id of the game if password is correct or no password, -1 otherwise
    '''
    game = Game.query.filter_by(name=name).first()

    if game is None:
        return -1
    elif game.password is None or game.password == password:
        return game.id
    else:
        return -1


def check_portfolio_exists(portfolio_id: int, user_id: int) -> bool:
    '''Checks if a portfolio exists
        
        args:
            portfolio_id: int - database id of the portfolio
            user_id: int - database id of the user
        returns:
            bool - True if portfolio exists, False otherwise
    '''
    portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=user_id).first()

    return portfolio is not None


def get_games_list(user_id: int) -> list:
    '''Gets a list of all the games info and parses data into a json string

        args:
            user_id: int - database id of the user
        returns:
            list: list of info for each game
    '''
    games = Game.query.all()
    game_list = []

    for game in games:
        joined_game = Portfolio.query.filter_by(game_id=game.id, user_id=user_id).first() is not None

        transaction_fee = f'flat fee of ${round(game.transaction_fee)}' if game.fee_type == 'Flat Fee' else f'{round(game.transaction_fee * 100)}% fee'

        game_details = f'${round(game.starting_cash)} starting cash, with {transaction_fee} per transaction. {"Password required." if game.password is not None else "No password required."}'

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


def get_game_details(game_id: int, user_id: int) -> dict:
    '''Gets the details of a game
        
        args:
            game_id: int - database id of the game
            user_id: int - database id of the user
        returns:
            dict - dicitonary of details of the game
    '''
    game = Game.query.filter_by(id=game_id).first()
    
    portfolio = Portfolio.query.filter_by(game_id=game.id, user_id=user_id).first()
    joined_game = portfolio is not None
    portfolio_id = portfolio.id if portfolio is not None else None

    transaction_fee = f'${round(game.transaction_fee, 0)}' if game.fee_type == 'Flat Fee' else f'{round(game.transaction_fee * 100, 0)}%'

    return {
        'name': game.name,
        'creator': game.game_creator.username,
        'participants': game.participants,
        'startDate': game.start_date.strftime("%B %d, %Y"),
        'endDate': game.end_date.strftime("%B %d, %Y") if game.end_date is not None else 'n/a',
        'status': game.status,
        'startingCash': f'${game.starting_cash}',
        'transactionFee': transaction_fee,
        'feeType': game.fee_type,
        'joinedGame': joined_game,
        'portfolioId': portfolio_id,
        'passwordRequired': game.password is not None,
        'lastUpdated': game.last_updated.strftime('%a, %b %d. %Y %I:%M %p') + ' EST' if game.last_updated is not None else 'n/a',
        'gameDuration': f'{(game.end_date - game.start_date).days} days' if game.end_date is not None else 'Infinite'
    }


def get_latest_portfolio_id(user_id: int) -> int:
    '''Gets the database id of the most recent portfolio the user created
        
        args:
            user_id: int - database id of the user
        returns:
            int - database id of the portfolio
    '''
    portfolio = Portfolio.query.filter_by(user_id=user_id).order_by(Portfolio.creation_date.desc()).first()
    return portfolio.id if portfolio is not None else None


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
            'portfolioId': str(portfolio.id),
        })

    return portfolio_list


def get_portfolio_details(portfolio_id: int) -> dict:
    '''Gets the details of a portfolio and its parent game
        
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of details of the portfolio
    '''
    portfolio = Portfolio.query.filter_by(id=portfolio_id).first()
    
    parent_game = portfolio.parent_game
    starting_cash = parent_game.starting_cash
    current_value = portfolio.current_value
    change = round((current_value/starting_cash - 1) * 100, 2)
    profit = round(current_value - starting_cash, 2)
    last_updated = portfolio.last_updated.strftime('%a, %b %d. %Y %I:%M%p') + ' EST'
    transaction_fee = f'${round(parent_game.transaction_fee, 0)}' if parent_game.fee_type == 'Flat Fee' else f'{round(parent_game.transaction_fee * 100, 0)}%'

    return {
        'portfolioId': portfolio.id,
        'gameId': parent_game.id,
        'gameName': parent_game.name,
        'gameStatus': parent_game.status,
        'startingCash': starting_cash,
        'participants': parent_game.participants,
        'gameStartDate': parent_game.start_date.strftime("%B %d, %Y"),
        'gameEndDate': parent_game.end_date.strftime('%Y-%m-%d') if parent_game.end_date is not None else 'n/a',
        'transactionFee': transaction_fee,
        'feeType': parent_game.fee_type,
        'availableCash': portfolio.available_cash,
        'portfolioValue': current_value,
        'change': change,
        'profit': profit,
        'lastUpdated': last_updated,
    }


def get_stock_id(ticker: str) -> int:
    '''Gets the database id of a stock
        
        args:
            ticker: str - stock ticker
        returns:
            int - database id of the stock
    '''
    stock = Stock.query.filter_by(ticker=ticker).first()

    if stock is None:
        raise Exception('Stock does not exist!')
    else:
        return stock.id


def get_buy_info(portfolio_id: int) -> dict:
    '''Gets the information needed for a buy transaction
        
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of the buy transaction info
    '''
    portfolio = Portfolio.query.filter_by(id=portfolio_id).first()

    return {
        'gameName': portfolio.parent_game.name,
        'availableCash': portfolio.available_cash,
        'transactionFee': portfolio.parent_game.transaction_fee,
        'feeType': portfolio.parent_game.fee_type,
    }


def get_sell_info(portfolio_id: int) -> dict:
    '''Gets the information needed for a sell transaction
        
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of the sell transaction info
    '''
    portfolio = Portfolio.query.filter_by(id=portfolio_id).first()
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


# getting data for tables  
def get_top_performers(game_id: int) -> list:
    '''Gets the top performing portfolios ordered
        
        args:
            game_id: int - database id of the game
        returns:
            list - list of all portfolios sorted by portfolio value
    '''
    game = Game.query.filter_by(id=game_id).first()

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
            daily_change = f'{round(portfolio_change/portfolio_age, 2)}%'
        
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
    '''Gets the top daily performers ordered
        
        args:
            game_id: int - database id of the game
        returns:
            list - list of all portfolios sorted by daily change %
    '''
    portfolios = Portfolio.query.filter_by(game_id=game_id).all()

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
            '% Change': f'{day_change_percent}%',
            'Change': f'${day_change}',
            'Value': f'${portfolio.current_value}'
        })

        prev = day_change_percent

    return top_performers


def get_portfolio_transactions(portfolio_id: int) -> list:
    '''Gets the transactions of a portfolio
        
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            list - list of all the transactions of the portfolio
    '''
    transactions = Transaction.query.filter_by(portfolio_id=portfolio_id).order_by(Transaction.transaction_date.desc()).all()
    transaction_list = []

    if transactions is None:
        return transaction_list

    for transaction in transactions:
        transaction_list.append({
            'Ticker': transaction.stock.ticker,
            'Name': transaction.stock.company_name,
            'Type': transaction.transaction_type,
            'Shares': transaction.number_of_shares,
            'Share Price': transaction.price_per_share,
            'Total Value': round(transaction.total_value, 2),
            'Currency': transaction.stock.currency,
            'Profit/Loss': transaction.profit_loss if transaction.profit_loss is not None else 'n/a',
            'Date (EST)': utc_to_est(transaction.transaction_date).strftime('%H:%M %m-%d-%Y')
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
            '% Change': change_percent,
            'Day Change': day_change,
            '% Day Change': day_change_percent,
            'Market Value': market_value,
            'Currency': holding.stock.currency
        })

    return sorted(holding_list, key=lambda h: h['Market Value'], reverse=True)


# getting data for plots
def get_game_history(game_id) -> dict:
    '''Gets todays performance history and daily closing history of all portfolios in a game
        if market is closed, gets the history for the last day the market was open
        
        args:
            game_id: int - database id of the game
        returns:
            dict - dictionary of the day history and closing history of each portfolio
    '''
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
            data = day.setdefault(row.portfolio_id, {'x': [], 'y': [], 'name': row.portfolio.portfolio_owner.username})
            data['x'].append(row.update_time.strftime('%Y-%m-%d %H:%M'))
            data['y'].append(row.portfolio_value)
            day[row.portfolio_id] = data

    return {
        'closingHistory': list(close.values()),
        'dailyHistory': list(day.values()),
        'date': market_date.strftime('%b %d, %Y')
    }


def get_portfolio_history(portfolio_id: int) -> dict:
    '''Gets the closing price history and todays history of a portfolio
        if market is closed, gets the history for the last day the market was open
        
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of the history of the portfolio
    '''
    # closing history
    closing_history = ClosingHistory.query.filter_by(portfolio_id=portfolio_id).order_by(ClosingHistory.date.desc()).all()
    close = {'x': [], 'y': []}

    if closing_history is not None:
        for row in closing_history:
            close['x'].append(row.date.strftime('%Y-%m-%d'))
            close['y'].append(row.portfolio_value)

    # todays performance history
    market_date = get_market_date(get_est_time()) # last date the market was open

    daily_history = DailyHistory.query.filter_by(portfolio_id=portfolio_id, date=market_date).order_by(DailyHistory.update_time.desc()).all()
    day = {'x': [], 'y': []}

    if daily_history is not None:
        for row in daily_history:
            day['x'].append(row.update_time.strftime('%Y-%m-%d %H:%M'))
            day['y'].append(row.portfolio_value)

    return {
        'closingHistory': close,
        'dailyHistory': day,
        'date': market_date.strftime('%Y-%m-%d')
    }


def get_holdings_breakdown(portfolio_id: int) -> dict:
    '''Gets the values for each holding in a portfolio
        
        args:
            portfolio_id: int - database id of the portfolio
        returns:
            dict - dictionary of the list of holdings and their values
    '''
    holding_breakdown = {}
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).all()

    if holdings is None:
        return holding_breakdown

    for holding in holdings:
        holding_breakdown.setdefault("labels", []).append(holding.stock.ticker)
        holding_breakdown.setdefault("values", []).append(holding.shares_owned * holding.stock.current_price)

    return holding_breakdown


def get_sector_breakdown(portfolio_id: int) -> dict:
    '''Gets the total values of each sector category in a portfolio
    
    args:
        portfolio_id: int - database id of the portfolio
    returns:
        dict - dictionary of the list of sector and their total values
    '''
    sector_breakdown = {}
    holdings = Holding.query.filter_by(portfolio_id=portfolio_id).all()

    if holdings is None:
        return sector_breakdown

    for holding in holdings:
        sector = holding.stock.sector
        sector_breakdown[sector] = sector_breakdown.get(sector, 0) + holding.stock.current_price * holding.shares_owned

    return {
        'labels': list(sector_breakdown.keys()),
        'values': list(sector_breakdown.values())
    }


# main functions for portfolio simulation
def get_game_leaderboard(game_id: int, user_id: int) -> dict:
    '''Get the leaderboard summary for a game
        assumes game exists
        
        args:
            game_id: int - id of the game
            user_id: int - id of the user
        returns:
            dict - dictionary of the game leaderboard
    '''
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


def get_portfolio(user_id: int, portfolio_id: int) -> dict:
    '''Get the portfolio summary for a user
        
        args:
            user_id: int - id of the user
            portfolio_id: int - id of the portfolio
        returns:
            dict - dictionary of the portfolio summary
    '''  
    user_portfolios = get_user_portfolios(user_id) # list of all portfolios the user has
    portfolio_details = get_portfolio_details(portfolio_id) # portfolio and parent game info
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


def record_transaction(portfolio_id: int, stock_id: str, transaction_type: str, shares: int, price: float) -> None:
    '''Buy or Sell a stock
        
        args:
            portfolio_id: int - id of the portfolio
            stock_id: str - stock ticker
            transaction_type: str - buy or sell
            shares: int - number of shares
            price: float - price per share
    '''
    add_transaction(portfolio_id, stock_id, transaction_type, shares, price)
    update_holding(portfolio_id, stock_id, shares, price, transaction_type)
    update_portfolio_cash(portfolio_id, shares*price, transaction_type)