from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from datetime import datetime

from .utils.portfolio_sim_functions import (
    # validation
    check_game_exists, check_game_name_exists, check_game_password, check_portfolio_exists,
    # modifying database data
    add_game, add_portfolio, add_stock, record_transaction,
    # getting data from database
    get_games_list, get_game_leaderboard, get_latest_portfolio_id, get_portfolio, get_stock_id,
    get_buy_info, get_sell_info

)
from .utils.yf_functions import get_stock_info, get_stock_news, get_stock_history


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
            transaction_fee/100 if fee_type == 'Percentage' else transaction_fee,
            fee_type if fee_type != "" else 'Flat Fee'
        )

        portfolio_id = add_portfolio(game_id, creator_id)

    except Exception as e:
        print (str(e))
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
            gameName (str): name of the game
            gamePassword (str): password for the game (optional)
    '''
    name = request.json.get('gameName', None)
    password = request.json.get('gamePassword', None)

    game = check_game_password(name, password)

    if game == -1:
        return jsonify(msg='Incorrect Password!'), 401

    user_id = current_user.id
    game_id = game

    try:
        portfolio_id = add_portfolio(game_id, user_id)
    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data=str(portfolio_id), 
        msg='Game joined successfully!'
    ), 200


@portfolio_sim.route('/game-list', methods=['GET'])
@jwt_required()
def game_list():
    '''Get a summary list of all created games
    '''
    data = get_games_list(current_user.id)

    return jsonify(
        data=data,
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
        data=get_game_leaderboard(game_id, current_user.id)

    except ValueError as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data=data,
        msg="success"
    ), 200


@portfolio_sim.route('/portfolio/<portfolio_id>', methods=['GET'])
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
    try:
        stock_info = get_stock_info(ticker)
        news = get_stock_news(ticker)
        history = get_stock_history(ticker, '1y')

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(
        data={
            'stockInfo': stock_info,
            'news': news,
            'history': history,
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

    if check_portfolio_exists(portfolio_id, current_user.id):
        return jsonify(
            data=get_buy_info(portfolio_id),
            msg="success"
        ), 200
    else:
        return jsonify(msg='Portfolio does not exist!'), 404
        

@portfolio_sim.route('/sell-info/<portfolio_id>', methods=['GET'])
@jwt_required()
def sell_info(portfolio_id: str):
    '''Gets portfolio information for selling a stock

        args:
            portfolioId (int): id of the portfolio
    '''
    portfolio_id = int(portfolio_id)

    if check_portfolio_exists(portfolio_id, current_user.id):
        return jsonify(
            data=get_sell_info(portfolio_id),
            msg="success"
        ), 200
    else:
        return jsonify(msg='Portfolio does not exist!'), 404




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
        record_transaction(portfolio_id, stock_id, 'buy', shares, price)

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
        record_transaction(portfolio_id, stock_id, 'sell', shares, price)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock sold successfully!'), 200