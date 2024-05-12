from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user, get_jwt_identity
from datetime import datetime

from src.utils.game import add_game, add_portfolio, get_games_list, get_game_leaderboard
from src.utils.portfolio import get_latest_portfolio_id, get_portfolio
from src.utils.stock_data import get_stock_info, get_stock_news, get_stock_history
from src.utils.transaction import add_stock, record_transaction, get_buy_info, get_sell_info


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
    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str is not None else None
    
    try:
        transaction_fee = transaction_fee/100 if fee_type == 'Percentage' else transaction_fee
        transaction_fee = 0 if transaction_fee is None else transaction_fee
        
        fee_type = 'Flat Fee' if fee_type is None else fee_type
        fee_type = 'Flat Fee' if fee_type == '' else fee_type
        
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

        portfolio_id = add_portfolio(game_id, creator_id, password)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data=str(portfolio_id), 
        msg='Game created successfully!'
    ), 200


@portfolio_sim.route('/join-game', methods=['POST'])
@jwt_required()
def join_game():
    '''Join an existing game

        args:
            name (str): name of the game
            gamePassword (str): password for the game (optional)
    '''
    name = request.json.get('gameName', None)
    password = request.json.get('gamePassword', None)

    try:
        portfolio_id = add_portfolio(name, current_user.id, password)
    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data=str(portfolio_id), 
        msg='Game joined successfully!'
    ), 200


@portfolio_sim.route('/game-list', methods=['GET'])
@jwt_required(optional=True)
def game_list():
    '''Get a summary list of all created games
    '''
    try:
        if get_jwt_identity():
            user_id = get_jwt_identity()
            data = get_games_list(user_id)
        else:
            data = get_games_list()
        
    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data=data,
        msg="success"
    ), 200


@portfolio_sim.route('/game-leaderboard/<game_id>', methods=['GET'])
@jwt_required(optional=True)
def game_leaderboard(game_id: str):
    '''Get the leaderboard summary for a game

        args:
            game_id (int): id of the game
    '''
    game_id = int(game_id)

    try:
        if get_jwt_identity():
            user_id = get_jwt_identity()
            data = get_game_leaderboard(game_id, user_id)
        else:
            data = get_game_leaderboard(game_id)
            
        

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data=data,
        msg="success"
    ), 200


@portfolio_sim.route('/portfolio/<portfolio_id>', methods=['GET'])
@jwt_required()
def portfolio(portfolio_id: str):
    '''Get the portfolio summary for a user
        if portfolio_id is -1, return the latest portfolio that was created

        args:
            portfolio_id (int): id of the portfolio
    '''
    portfolio_id = int(portfolio_id)
    
    try:
        if portfolio_id == -1:
            portfolio_id = get_latest_portfolio_id(current_user.id)
            
        data = get_portfolio(current_user.id, portfolio_id)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data=data,
        msg="success"
    ), 200


@portfolio_sim.route('/stock-info/<ticker>', methods=['GET'])
@jwt_required()
def stock_info(ticker: str):
    '''Get the stock information for a ticker

        args:
            ticker (str): stock ticker (uppercase)
    '''
    ticker = ticker.upper()
    
    try:
        stock_info = get_stock_info(ticker)
        news = get_stock_news(ticker)
        history = get_stock_history(ticker, '1y')
        
        # add stock to database
        stock_id = add_stock(stock_info, ticker)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data={
            'tickerInfo': stock_info,
            'news': news,
            'history': history,
            'stockId': stock_id
        },
        msg="success"
    ), 200


@portfolio_sim.route('/buy-info/<portfolio_id>', methods=['GET'])
@jwt_required()
def buy_info(portfolio_id: str):
    '''Gets portfolio information for buying a stock

        args:
            portfolioId (int): id of the portfolio
    '''
    portfolio_id = int(portfolio_id)

    try:
        data = get_buy_info(portfolio_id, current_user.id)
    except Exception as e:
        return jsonify(msg=str(e)), 400
    
    return jsonify(
        data=data,
        msg="success"
    ), 200
        

@portfolio_sim.route('/sell-info/<portfolio_id>', methods=['GET'])
@jwt_required()
def sell_info(portfolio_id: str):
    '''Gets portfolio information for selling a stock

        args:
            portfolioId (int): id of the portfolio
    '''
    portfolio_id = int(portfolio_id)

    try:
        data = get_sell_info(portfolio_id, current_user.id)
    except Exception as e:
        return jsonify(msg=str(e)), 400
    
    return jsonify(
        data=data,
        msg="success"
    ), 200


@portfolio_sim.route('/buy-stock', methods=['POST'])
@jwt_required()
def buy_stock():
    '''Buy a stock
    
        args:
            portfolioId (int): id of the portfolio
            stockId (int): id of the stock
            shares (int): number of shares
    '''
    portfolio_id = request.json.get('portfolioId', None)
    stock_id = request.json.get('stockId', None)
    shares = request.json.get('shares', None)

    try:
        record_transaction(portfolio_id, current_user.id, stock_id, 'buy', shares)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock bought successfully!'), 200


@portfolio_sim.route('/sell-stock', methods=['POST'])
@jwt_required()
def sell_stock():
    '''Sell a stock
    
        args:
            portfolioId (int): id of the portfolio
            stockId (int): id of the stock
            shares (int): number of shares
    '''
    portfolio_id = request.json.get('portfolioId', None)
    stock_id = request.json.get('stockId', None)
    shares = request.json.get('shares', None)

    try:
        record_transaction(portfolio_id, current_user.id, stock_id, 'sell', shares)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock sold successfully!'), 200