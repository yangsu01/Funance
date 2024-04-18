import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt, create_access_token, current_user
from flask_apscheduler import APScheduler

from config import AppConfig
from src.data_models import db, User
from src.utils.scheduler_functions import (
    # run when markets open
    update_last_close_value, update_started_games,
    # run periodically when markets are open
    update_stock_prices, update_portfolio_value, save_game_update_time, save_daily_history,
    # run at end of trading day
    save_closing_history, update_completed_games,
)

# import blueprints
from src.auth import auth
from src.portfolio_sim import portfolio_sim

api = Flask(__name__)
api.config.from_object(AppConfig)

CORS(api, supports_credentials=True)


# server side authentication
jwt = JWTManager(api)

# automatic user loading
@jwt.user_identity_loader
def user_identity_lookup(user):
    return user.id

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    return User.query.filter_by(id=identity).first()

# automatic token refresh
@api.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=current_user)

            data = response.get_json()
            if type(data) is dict:
                data["accessToken"] = access_token 
                response.data = jsonify(data)

        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response
    

# initiate database
db.init_app(api)

#register blueprints
api.register_blueprint(auth, url_prefix='/api')
api.register_blueprint(portfolio_sim, url_prefix='/api')


# initiate scheduler
scheduler = APScheduler()
scheduler.init_app(api)

# define jobs
def run_periodically():
    with api.app_context():
        update_stock_prices()
        update_portfolio_value()
        save_game_update_time()
        save_daily_history()

def run_at_open():
    with api.app_context():
        update_last_close_value()
        update_started_games()

        run_periodically()
        
def run_at_close():
    with api.app_context():
        run_periodically()

        save_closing_history()
        update_completed_games()

# add jobs
scheduler.add_job(
    id='run_at_open', 
    func=run_at_open, 
    trigger='cron', 
    day_of_week='mon-fri',
    hour='9', 
    minute='30', 
    timezone='US/Eastern'
)

scheduler.add_job(
    id='run_periodically',
    func=run_periodically,
    trigger='cron',
    day_of_week='mon-fri', 
    hour='10-15', 
    minute='0, 30',
    second='10',
    timezone='US/Eastern'
)

scheduler.add_job(
    id='run_at_close',
    func=run_at_close,
    trigger='cron',
    day_of_week='mon-fri',
    hour='16',
    minute='0',
    timezone='US/Eastern'
)

scheduler.start()


if __name__ == '__main__':
    load_dotenv()
    with api.app_context():
        db.create_all()

    api.run(debug=os.getenv('DEV_ENV', False), port=os.getenv('PORT', default=5000))