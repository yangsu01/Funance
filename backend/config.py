import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()
SECRET_KEY = os.environ.get('SECRET_KEY')
DEV_DB_URL = os.environ.get('DEV_DB_URL')
REDIS_DEV_URL = os.environ.get('REDIS_DEV_URL')

class AppConfig:
    SECRET_KEY = os.environ.get('PROD_SECRET_KEY', SECRET_KEY)
    # JWT_COOKIE_SECURE = True
    # JWT_TOKEN_LOCATION = ['cookies']
    JTW_SECRET_KEY = os.environ.get('PROD_SECRET_KEY', SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('PROD_DB_URL', DEV_DB_URL)

    