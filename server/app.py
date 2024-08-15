from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_apscheduler import APScheduler
from flask_migrate import Migrate

from config import AppConfig
from src.data_models import db, User
from src.utils.scheduler import (
    # run when markets open
    update_last_close_value, update_started_games, drop_prev_day_data,
    # run periodically when markets are open
    update_stock_prices, update_portfolios, save_daily_history,
    # run at end of trading day
    save_closing_history, update_completed_games, close_expired_orders
)

# import blueprints
from src.routes.auth import auth
from src.routes.portfolio_sim import portfolio_sim
from src.routes.orders import orders

api = Flask(__name__)
api.config.from_object(AppConfig)

CORS(api, supports_credentials=True)

# database migrations
migrate = Migrate(api, db)

# server side authentication
jwt = JWTManager(api)

# automatic user loading
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id

@jwt.user_lookup_loader
def user_lookup_callback(_, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).first()
    

# initiate database
db.init_app(api)

#register blueprints
api.register_blueprint(auth, url_prefix='/api')
api.register_blueprint(portfolio_sim, url_prefix='/api')
api.register_blueprint(orders, url_prefix='/api')


# initiate scheduler
scheduler = APScheduler()
scheduler.init_app(api)
scheduler.start()

# define jobs
def run_periodically():
    with api.app_context():
        update_stock_prices()
        update_portfolios()
        save_game_update_time()
        save_daily_history()

def run_at_open():
    with api.app_context():
        update_last_close_value()
        update_started_games()
        drop_prev_day_data()

        run_periodically()
        
def run_at_close():
    with api.app_context():
        run_periodically()

        save_closing_history()
        update_completed_games()
        close_expired_orders()

# add jobs
scheduler.add_job(
    id='run_at_open', 
    func=run_at_open, 
    trigger='cron', 
    day_of_week='mon-fri',
    hour='9', 
    minute='30', 
    timezone='US/Eastern',
    misfire_grace_time=None
)

scheduler.add_job(
    id='run_935-955',
    func=run_periodically,
    trigger='cron',
    day_of_week='mon-fri', 
    hour='9', 
    minute='35-55/5',
    timezone='US/Eastern',
    misfire_grace_time=300
)

scheduler.add_job(
    id='run_10-1359',
    func=run_periodically,
    trigger='cron',
    day_of_week='mon-fri', 
    hour='10-15', 
    minute='*/5',
    timezone='US/Eastern',
    misfire_grace_time=300
)

scheduler.add_job(
    id='run_at_close',
    func=run_at_close,
    trigger='cron',
    day_of_week='mon-fri',
    hour='16',
    minute='0',
    timezone='US/Eastern',
    misfire_grace_time=None
)


if __name__ == '__main__':
    with api.app_context():
        db.create_all()

    api.run(debug=False, port=5000)