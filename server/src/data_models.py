from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    creation_date = db.Column(db.DateTime(timezone=True), nullable=False)
    # one to many
    portfolios = db.relationship('Portfolio', backref='portfolio_owner', uselist=False, cascade='all, delete-orphan')
    created_games = db.relationship('Game', backref='game_creator', lazy=True)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    name = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=True)
    creation_date = db.Column(db.DateTime(timezone=True), nullable=False)
    participants = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Not Started') # Not Started, In Progress, Completed
    starting_cash = db.Column(db.Float, nullable=False)
    transaction_fee = db.Column(db.Float, nullable=False, default=0.0)
    fee_type = db.Column(db.String(50), nullable=True, default='Flat Fee') # Flat Fee, Percentage
    last_updated = db.Column(db.DateTime(timezone=True), nullable=True)
    # one to one
    game_summary = db.relationship('GameSummary', backref='game_details', uselist=False, cascade='all, delete-orphan')
    # one to many
    portfolios = db.relationship('Portfolio', backref='parent_game', lazy=True,  cascade='all, delete-orphan')


class GameSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)

    # best portfolio
    highest_value_portfolio = db.Column(db.Float, nullable=False)
    highest_value_portfolio_username = db.Column(db.String(100), nullable=False)
    # worst portfolio
    lowest_value_portfolio = db.Column(db.Float, nullable=False)
    lowest_value_portfolio_username = db.Column(db.String(100), nullable=False)
    # most popular stock
    most_popular_stock = db.Column(db.String(100), nullable=False)
    most_popular_stock_ticker = db.Column(db.String(10), nullable=False)
    most_popular_stock_volume = db.Column(db.Integer, nullable=False)
    # highest value transaction
    highest_value_transaction = db.Column(db.Float, nullable=False)
    highest_value_transaction_ticker = db.Column(db.String(10), nullable=False)
    highest_value_transaction_username = db.Column(db.String(100), nullable=False)
    # highest returns holding
    highest_growing_holding_average_price = db.Column(db.Float, nullable=False)
    highest_growing_holding_current_price = db.Column(db.Float, nullable=False)
    highest_growing_holding_ticker = db.Column(db.String(10), nullable=False)
    highest_growing_holding_username = db.Column(db.String(100), nullable=False)


class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)

    available_cash = db.Column(db.Float, nullable=False)
    creation_date = db.Column(db.DateTime(timezone=True), nullable=False)
    current_value = db.Column(db.Float, nullable=False)
    last_updated = db.Column(db.DateTime(timezone=True), nullable=False)
    last_close_value = db.Column(db.Float, nullable=False)
    day_change = db.Column(db.Float, nullable=True)
    overall_rank = db.Column(db.Integer, nullable=True)
    daily_rank = db.Column(db.Integer, nullable=True)

    # one to many
    holdings = db.relationship('Holding', backref='portfolio', lazy=True)
    transactions = db.relationship('Transaction', backref='portfolio', lazy=True)
    daily_history = db.relationship('DailyHistory', backref='portfolio', lazy=True)
    closing_history = db.relationship('ClosingHistory', backref='portfolio', lazy=True)
    orders = db.relationship('Order', backref='portfolio', lazy=True)


class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)

    company_name = db.Column(db.String(150), nullable=False)
    ticker = db.Column(db.String(10), nullable=False)
    industry = db.Column(db.String(150), nullable=False, default='N/A')
    sector = db.Column(db.String(150), nullable=False, default='N/A')
    currency = db.Column(db.String(5), nullable=False)
    previous_close = db.Column(db.Float, nullable=False)
    opening_price = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    last_updated = db.Column(db.DateTime(timezone=True), nullable=False)

    # one to many
    holdings = db.relationship('Holding', backref='stock', lazy=True)
    transactions = db.relationship('Transaction', backref='stock', lazy=True)
    orders = db.relationship('Order', backref='stock', lazy=True)


class Holding(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stock.id'), nullable=False)

    shares_owned = db.Column(db.Integer, nullable=False)
    average_price = db.Column(db.Float, nullable=False)


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stock.id'), nullable=False)

    transaction_date = db.Column(db.DateTime(timezone=True), nullable=False)
    transaction_type = db.Column(db.String(10), nullable=False) # buy, sell
    number_of_shares = db.Column(db.Integer, nullable=False)
    price_per_share = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False)
    profit_loss = db.Column(db.Float, nullable=True)


class ClosingHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)

    date = db.Column(db.Date, nullable=False)
    portfolio_value = db.Column(db.Float, nullable=False)


class DailyHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)

    date = db.Column(db.Date, nullable=False)
    update_time = db.Column(db.DateTime(timezone=True), nullable=False)
    portfolio_value = db.Column(db.Float, nullable=False)
    

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stock.id'), nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)

    # order types: limit buy/sell, stop-loss
    order_type = db.Column(db.String(100), nullable=False)
    shares = db.Column(db.Integer, nullable=False)
    target_price = db.Column(db.Float, nullable=True)
    order_date = db.Column(db.DateTime(timezone=True), nullable=False)
    # order status: pending, filled, cancelled, expired
    order_status = db.Column(db.String(10), nullable=False) 
    order_expiration = db.Column(db.Date, nullable=True)