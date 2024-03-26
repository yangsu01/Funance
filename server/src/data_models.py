from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    user_creation_date = db.Column(db.DateTime(timezone=True), nullable=False)
    # one to one
    portfolio = db.relationship('Portfolio', back_populates='user', uselist=False, cascade='all, delete-orphan')
    
    # one to many
    created_games = db.relationship('Game', backref='user', lazy=True)


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    game_name = db.Column(db.String(100), nullable=False)
    game_password = db.Column(db.String(100), nullable=True)
    game_creation_date = db.Column(db.DateTime(timezone=True), nullable=False)
    game_start_date = db.Column(db.Date, nullable=False)
    game_end_date = db.Column(db.Date, nullable=False)
    game_status = db.Column(db.String(10), nullable=False, default='not_started') # not_started, in_progress, ended
    starting_cash = db.Column(db.Float, nullable=False)
    transaction_fee = db.Column(db.Float, nullable=False)

    # one to one
    game_summary = db.relationship('GameSummary', backref='game', uselist=False, cascade='all, delete-orphan')

    # one to many
    portfolios = db.relationship('Portfolio', backref='game', lazy=True,  cascade='all, delete-orphan')


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
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False, unique=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)

    available_cash = db.Column(db.Float, nullable=False)
    portfolio_creation_date = db.Column(db.DateTime(timezone=True), nullable=False)
    current_value = db.Column(db.Float, nullable=False)
    updated_time = db.Column(db.DateTime(timezone=True), nullable=False)
    last_close_value = db.Column(db.Float, nullable=False)

    # one to one
    user = db.relationship('User', back_populates='portfolio')

    # one to many
    holdings = db.relationship('Holding', backref='portfolio', lazy=True)
    transactions = db.relationship('Transaction', backref='portfolio', lazy=True)
    history = db.relationship('History', backref='portfolio', lazy=True)


class Stocks(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)

    company_name = db.Column(db.String(150), nullable=False)
    ticker = db.Column(db.String(10), nullable=False)
    industry = db.Column(db.String(150), nullable=False, default='N/A')
    sector = db.Column(db.String(150), nullable=False, default='N/A')
    currency = db.Column(db.String(5), nullable=False)
    previous_close = db.Column(db.Float, nullable=False)
    opening_price = db.Column(db.Float, nullable=False)
    updated_price = db.Column(db.Float, nullable=False)

    # one to many
    holdings = db.relationship('Holding', backref='stocks', lazy=True)
    transactions = db.relationship('Transaction', backref='stocks', lazy=True)


class Holding(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable=False)

    shares_owned = db.Column(db.Integer, nullable=False)
    average_price = db.Column(db.Float, nullable=False)


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    stock_id = db.Column(db.Integer, db.ForeignKey('stocks.id'), nullable=False)

    transaction_date = db.Column(db.DateTime(timezone=True), nullable=False)
    status = db.Column(db.String(10), nullable=False) # buy, sell
    number_of_shares = db.Column(db.Integer, nullable=False)
    price_per_share = db.Column(db.Float, nullable=False)
    total_value = db.Column(db.Float, nullable=False)
    profit_loss = db.Column(db.Float, nullable=True, default='N/A')


class History(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)

    recorded_time = db.Column(db.DateTime(timezone=True), nullable=False)
    portfolio_value = db.Column(db.Float, nullable=False)


class Blog(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    file_name = db.Column(db.String(255), nullable=False, unique=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    creation_date = db.Column(db.Date, nullable=False)
    updated_date = db.Column(db.Date, nullable=False)
