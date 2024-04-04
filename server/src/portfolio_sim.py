from flask import Blueprint, render_template, request, url_for, redirect, flash, jsonify
from flask_jwt_extended import jwt_required, current_user, verify_jwt_in_request
import yfinance as yf

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
    end_date = datetime.strptime(end_date_str, '%m-%d-%Y').date()

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

    game_details = get_game_details(game_id)
    top_performers = get_top_performers(game_id)
    top_daily_performers = get_top_daily_performers(game_id)
    performance_history = get_performance_history(game_id)
    update_time = get_update_time(game_id)

    return jsonify(
        gameDetails=game_details,
        topPerformers=top_performers,
        topDailyPerformers=top_daily_performers,
        performanceHistory=performance_history,
        lastUpdated=update_time,
        msg="success"
    ), 200