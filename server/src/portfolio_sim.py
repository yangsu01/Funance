from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from .utils.portfolio_sim_functions import *

portfolio_sim = Blueprint('portfolio_sim', __name__)


@portfolio_sim.route('/create-game', methods=['POST'])
@jwt_required()
def create_game():
    name = request.json.get('gameName', None)
    password = request.json.get('gamePassword', None)
    start_date_str = request.json.get('gameStartDate', None)
    end_date_str = request.json.get('gameEndDate', None)
    starting_cash = float(request.json.get('startingCash', None))
    transaction_fee = float(request.json.get('transactionFee', None))
    fee_type = request.json.get('feeType', None)

    creator_id = current_user.id
    
    start_date = datetime.strptime(start_date_str, '%m-%d-%Y').date()
    end_date = datetime.strptime(end_date_str, '%m-%d-%Y').date() if end_date_str is not None else None

    if check_game_exists(name):
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
    name = request.json.get('gameName', None)
    password = request.json.get('gamePassword', None)

    game = Game.query.filter_by(name=name).first()

    if not game:
        return jsonify(msg='Game does not exist!'), 404

    if game.password != password and game.password is not None:
        return jsonify(msg='Incorrect password!'), 403

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
    games = get_games_list(current_user.id)

    return jsonify(
        gamesInfo=games,
        msg="success"
    ), 200


@portfolio_sim.route('/game-leaderboard/<game_id>', methods=['GET'])
@jwt_required()
def game_leaderboard(game_id: str):
    game_id = int(game_id)

    try:
        game_details = get_game_details(game_id, current_user.id) # game info
        top_performers = get_top_performers(game_id) # for display in a table
        top_daily_performers = get_top_daily_performers(game_id) # for display in a table
        performance_history = get_leaderboard_history(game_id) # for display in a time series plot
        update_time = get_game_update_time(game_id) # last time the portfolio values were updated in the game
    
    except Exception as e:
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
    portfolio_id = int(portfolio_id)

    try:
        user_portfolios = get_user_portfolios(current_user.id) # list of all portfolios the user has
        
        # check if user has any portfolios
        if len(user_portfolios) == 0:
            return jsonify(msg='You do not have any portfolios!'), 404
    
        portfolio_details = get_portfolio_details(portfolio_id, current_user.id) # portfolio info
        portfolio_history = get_portfolio_history(portfolio_id, current_user.id) # for display in a time series plot
        holdings_breakdown = get_holdings_breakdown(portfolio_id, current_user.id) # for display in a pie chart
        sector_breakdown = get_sector_breakdown(portfolio_id, current_user.id) # for display in a pie chart
        portfolio_transactions = get_portfolio_transactions(portfolio_id, current_user.id) # for display in a table
        portfolio_holdings = get_portfolio_holdings(portfolio_id, current_user.id) # for display in a table

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
    try:
        stock_info = get_stock_info(ticker)

        # add_stock()

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
    portfolio_id = request.json.get('portfolioId', None)
    ticker = request.json.get('ticker', None)
    shares = int(request.json.get('shares', None))
    price = float(request.json.get('price', None))

    try:
        stock_id = add_stock(ticker, price)
        add_transaction(portfolio_id, stock_id, 'buy', shares, price)
        update_holding(portfolio_id, stock_id, shares, price, 'buy')
        update_portfolio_cash(portfolio_id, shares*price, 'buy')

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock bought successfully!'), 200