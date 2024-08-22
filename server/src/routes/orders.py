from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from src.utils.transaction import record_transaction
from src.utils.order import add_order, mark_cancelled
from src.utils.time import check_market_closed

orders = Blueprint('orders', __name__)


@orders.route('/buy-stock', methods=['POST'])
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
    
    # if market is closed, return error
    if check_market_closed():
        return jsonify(msg='Market is closed! Please put in an order'), 400

    try:
        record_transaction(portfolio_id, current_user.id, 'stock', stock_id, 'buy', shares)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock bought successfully!'), 200


@orders.route('/sell-stock', methods=['POST'])
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
    
    # if market is closed, return error
    if check_market_closed():
        return jsonify(msg='Market is closed! Please put in an order'), 400

    try:
        record_transaction(portfolio_id, current_user.id, 'stock', stock_id, 'sell', shares)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg='Stock sold successfully!'), 200


@orders.route('/submit-order', methods=['POST'])
@jwt_required()
def submit_order():
    '''Submit an order
    
        args:
            portfolioId (int): id of the portfolio
            orderType (str): type of order
            stockId (int): id of the stock
            shares (int): number of shares
            expiration (str): expiration date of the order (optional)
            targetPrice (float): target price for the order (optional)
    '''
    portfolio_id = request.json.get('portfolioId', None)
    stock_id = request.json.get('stockId', None)
    order_type = request.json.get('orderType', None)
    shares = request.json.get('shares', None)
    expiration = request.json.get('expiration', None)
    target_price = request.json.get('targetPrice', None)
    
    try:
        add_order(
            portfolio_id, 
            current_user.id, 
            stock_id, 
            order_type, 
            shares, 
            expiration, 
            target_price
        )
    except Exception as e:
        return jsonify(msg=str(e)), 400
    
    return jsonify(msg=f'{order_type} order submitted!'), 200


@orders.route('/submit-options-order', methods=['POST'])
@jwt_required()
def submit_options_order():
    pass


@orders.route('/cancel-order', methods=['POST'])
@jwt_required()
def cancel_order():
    '''Cancel an order
    
        args:
            orderId (int): id of the order
    '''
    order_id = request.json.get('orderId', None)
    
    try:
        mark_cancelled(order_id)
    except Exception as e:
        return jsonify(msg=str(e)), 400
    
    return jsonify(msg='Order cancelled successfully!'), 200

