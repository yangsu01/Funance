from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user

from src.utils.order import add_order, mark_cancelled
from src.utils.stock_data import get_stock_info, get_stock_news, get_stock_history
from src.utils.transaction import add_stock, get_buy_info, get_sell_info, record_transaction
from src.utils.time import check_market_closed, get_next_market_date

orders = Blueprint('orders', __name__)


@orders.route('/stock-info/<ticker>', methods=['GET'])
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
            'stockId': stock_id,
            'marketClosed': check_market_closed(),
            'nextMarketDate': get_next_market_date()
        },
        msg="success"
    ), 200


@orders.route('/buy-info/<portfolio_id>', methods=['GET'])
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
        

@orders.route('/sell-info/<portfolio_id>', methods=['GET'])
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
    
    
@orders.route('/market-buy', methods=['POST'])
@jwt_required()
def market_buy():
    """Records a market buy/sell transaction
    
    Args:
        portfolioId (int): id of the portfolio
        assetType (str): type of asset (stock, option)
        asset_symbol (str): ticker of stock or symbol of option
        quantity (int): number of shares or contracts
        transactionType (str): buy or sell

    Returns:
        json: success or error message
    """
    portfolio_id = request.json.get('portfolioId', None)
    asset_type = request.json.get('assetType', None)
    asset_id = request.json.get('assetId', None)
    quantity = request.json.get('quantity', None)
    transaction_type = request.json.get('transactionType', None)
    
    # if market is closed, return error
    if check_market_closed():
        return jsonify(msg='Market is closed! Please put in an order'), 400

    try:
        record_transaction(portfolio_id, current_user.id, asset_type, asset_id, transaction_type, quantity)

    except Exception as e:
        return jsonify(msg=str(e)), 400

    return jsonify(msg=f'Market {transaction_type} complete!'), 200


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

