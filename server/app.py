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
from src.utils.time import check_market_closed

# import blueprints
from src.routes.auth import auth
from src.routes.portfolio_sim import portfolio_sim
from src.routes.orders import orders

app = Flask(__name__)
app.config.from_object(AppConfig)

CORS(app, supports_credentials=True)

# database migrations
migrate = Migrate(app, db)

# server side authentication
jwt = JWTManager(app)

# automatic user loading
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id

@jwt.user_lookup_loader
def user_lookup_callback(_, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).first()
    

# initiate database
db.init_app(app)

#register blueprints
app.register_blueprint(auth, url_prefix='/api')
app.register_blueprint(portfolio_sim, url_prefix='/api')
app.register_blueprint(orders, url_prefix='/api')


# initiate scheduler
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# define jobs
def run_periodically():
    with app.app_context():
            update_stock_prices()
            update_portfolios()
            save_daily_history()

def run_at_open():
    with app.app_context():
            update_last_close_value()
            update_started_games()
            drop_prev_day_data()

            run_periodically()
        
def run_at_close():
    with app.app_context():
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
    with app.app_context():
        db.create_all()

    app.run(debug=False, port=5000)