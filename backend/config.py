import os
from dotenv import load_dotenv
import redis

load_dotenv()
SECRET_KEY = os.environ.get('SECRET_KEY')
DEV_DB_URL = os.environ.get('DEV_DB_URL')
REDIS_DEV_URL = os.environ.get('REDIS_DEV_URL')

class ApplicationConfig:
    SECRET_KEY = os.environ.get('PROD_SECRET_KEY', SECRET_KEY)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('PROD_DB_URL', DEV_DB_URL)

    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True
    SESSION_REDIS = redis.from_url(os.environ.get('REDIS_URL', REDIS_DEV_URL))