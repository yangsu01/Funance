from flask import Flask
from flask_cors import CORS
from flask_session import Session
import os
from dotenv import load_dotenv

from config import ApplicationConfig
from data_models import db

load_dotenv()
DEV_CLIENT_ORIGIN = os.getenv('DEV_CLIENT_ORIGIN')
PROD_CLIENT_ORIGIN = os.getenv('PROD_CLIENT_ORIGIN')

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
CORS(app, supports_credentials=True)

server_session = Session(app)

db.init_app(app)

from src.auth import auth

app.register_blueprint(auth, url_prefix='/api')

class Config:
    SCHEDULER_API_ENABLED = True


if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run(debug=True, port=os.getenv('PORT', default=5000))