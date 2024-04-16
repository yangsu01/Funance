from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from .utils.portfolio_sim_functions import *

portfolio_sim = Blueprint('portfolio_sim', __name__)


@portfolio_sim.route('/create-game', methods=['POST'])
@jwt_required()
def create_game():
    '''Create a new game
        args:
            gameName (str): name of the game (unique)
            gamePassword (str): password for the game (optional)
            gameStartDate (str): start date of the game (format: mm-dd-yyyy)
            gameEndDate (str): end date of the game (format: mm-dd-yyyy) (optional)
            startingCash (float): starting cash for each player 
            transactionFee (float): transaction fee for each transaction (0 if no fee)
            feeType (str): type of transaction fee (Flat Fee or Percentage) (optional)
    '''
    name = request.json.get('gameName', None)
    password = request.json.get('gamePassword', None)
    start_date_str = request.json.get('gameStartDate', None)
    end_date_str = request.json.get('gameEndDate', None)
    starting_cash = request.json.get('startingCash', None)
    transaction_fee = request.json.get('transactionFee', None)
    fee_type = request.json.get('feeType', None)

    creator_id = current_user.id
    
    start_date = datetime.strptime(start_date_str, '%m-%d-%Y').date()
    end_date = datetime.strptime(end_date_str, '%m-%d-%Y').date() if end_date_str is not None else None

    if check_game_name_exists(name):
        return jsonify(msg='Game name already taken!'), 409
    
    try:
        game_id = add_game(
            creator_id,
            name,
            password,
            start_date,
            end_date,
            starting_cash,
            transaction_fee,
            fee_type
        )

        portfolio_id = add_portfolio(game_id, creator_id)

    except Exception as e:
        print (str(e))
        return jsonify(msg=str(e)), 400

    return jsonify(
        portfolio_id=portfolio_id, 
        msg='Game created successfully!'
    ), 200


@portfolio_sim.route('/join-game', methods=['POST'])
@jwt_required()
def join_game():
    '''Join an existing game
        args:
            gameName (str): name of the game
            gamePassword (str): password for the game (optional)
    '''
    name = request.json.get('gameName', None)
    password = request.json.get('gamePassword', None)

    game = check_game_password(name, password)

    if game == -1:
        return jsonify(msg='Incorrect Password!'), 404

    user_id = current_user.id
    game_id = game.id

    try:
        portfolio_id = add_portfolio(game_id, user_id)
    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        portfolio_id=portfolio_id, 
        msg='Game joined successfully!'
    ), 200


@portfolio_sim.route('/games-list', methods=['GET'])
@jwt_required()
def games_list():
    '''Get a summary list of all created games
    '''
    games = get_games_list(current_user.id)

    return jsonify(
        gamesInfo=games,
        msg="success"
    ), 200


@portfolio_sim.route('/game-leaderboard/<game_id>', methods=['GET'])
@jwt_required()
def game_leaderboard(game_id: str):
    '''Get the leaderboard summary for a game
        args:
            game_id (int): id of the game
    '''
    game_id = int(game_id)

    if not check_game_exists(game_id):
        return jsonify(msg='Game does not exist!'), 404

    try:
        game_details = get_game_details(game_id, current_user.id) # game info
        top_performers = get_top_performers(game_id) # for display in a table
        top_daily_performers = get_top_daily_performers(game_id) # for display in a table
        performance_history = get_game_history(game_id) # for display in a time series plot
        update_time = get_game_update_time(game_id) # last time the portfolio values were updated in the game

    except ValueError as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        gameDetails=game_details,
        topPerformers=top_performers,
        topDailyPerformers=top_daily_performers,
        performanceHistory=performance_history,
        lastUpdated=update_time,
        msg="success"
    ), 200


@portfolio_sim.route('/my-portfolio/<portfolio_id>', methods=['GET'])
@jwt_required()
def my_portfolio(portfolio_id: str):
    '''Get the portfolio summary for a user
        if portfolio_id is -1, return the latest portfolio that was created
        args:
            portfolio_id (int): id of the portfolio
    '''
    portfolio_id = int(portfolio_id)

    if portfolio_id == -1:
        portfolio_id = get_latest_portfolio_id(current_user.id)

        if portfolio_id is None:
            return jsonify(msg='You do not have any portfolios!'), 404
        
    elif not check_portfolio_exists(portfolio_id, current_user.id):
        return jsonify(msg='Portfolio does not exist!'), 404
        
    try:
        user_portfolios = get_user_portfolios(current_user.id) # list of all portfolios the user has
        portfolio_details = get_portfolio_details(portfolio_id) # portfolio and parent game info
        portfolio_history = get_portfolio_history(portfolio_id) # for display in a time series plot
        holdings_breakdown = get_holdings_breakdown(portfolio_id) # for display in a pie chart
        sector_breakdown = get_sector_breakdown(portfolio_id) # for display in a pie chart
        portfolio_transactions = get_portfolio_transactions(portfolio_id) # for display in a table
        portfolio_holdings = get_portfolio_holdings(portfolio_id) # for display in a table

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        user_portfolios=user_portfolios,
        portfolioDetails=portfolio_details,
        portfolioHistory=portfolio_history,
        holdingsBreakdown=holdings_breakdown,
        sectorBreakdown=sector_breakdown,
        portfolioTransactions=portfolio_transactions,
        portfolioHoldings=portfolio_holdings,
        msg="success"
    ), 200


@portfolio_sim.route('/stock-info/<ticker>', methods=['GET'])
@jwt_required()
def stock_info(ticker: str):
    '''Get the stock information for a ticker
        args:
            ticker (str): stock ticker (uppercase)
    '''
    try:
        stock_info = get_stock_info(ticker)
        news = get_stock_news(ticker)
        history = get_stock_history(ticker, '1y', True)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        stockInfo=stock_info,
        news=news,
        history=history,
        msg="success"
    ), 200


@portfolio_sim.route('/buy-stock', methods=['POST'])
@jwt_required()
def buy_stock():
    '''Buy a stock
        assumes transaction can be afforded (validation in frontend)
        args:
            portfolioId (int): id of the portfolio
            ticker (str): stock ticker
            shares (int): number of shares
            price (float): price per share
    '''
    portfolio_id = request.json.get('portfolioId', None)
    ticker = request.json.get('ticker', None)
    shares = int(request.json.get('shares', None))
    price = float(request.json.get('price', None))

    if not check_portfolio_exists(portfolio_id, current_user.id):
        return jsonify(msg='Portfolio does not exist!'), 404

    try:
        stock_id = add_stock(ticker, price)
        add_transaction(portfolio_id, stock_id, 'buy', shares, price)
        update_holding(portfolio_id, stock_id, shares, price, 'buy')
        update_portfolio_cash(portfolio_id, shares*price, 'buy')

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock bought successfully!'), 200


@portfolio_sim.route('/sell-stock', methods=['POST'])
@jwt_required()
def sell_stock():
    '''Sell a stock
        assumes transaction can be afforded (validation in frontend)
        args:
            portfolioId (int): id of the portfolio
            ticker (str): stock ticker (uppercase)
            shares (int): number of shares
            price (float): price per share
    '''
    portfolio_id = request.json.get('portfolioId', None)
    ticker = request.json.get('ticker', None)
    shares = int(request.json.get('shares', None))
    price = float(request.json.get('price', None))

    if not check_portfolio_exists(portfolio_id, current_user.id):
        return jsonify(msg='Portfolio does not exist!'), 404

    try:
        stock_id = get_stock_id(ticker)
        add_transaction(portfolio_id, stock_id, 'sell', shares, price)
        update_holding(portfolio_id, stock_id, shares, price, 'sell')
        update_portfolio_cash(portfolio_id, shares*price, 'sell')

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock sold successfully!'), 200