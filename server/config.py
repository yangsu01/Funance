import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
DEV_DB_URL = os.getenv('DEV_DB_URL')

class AppConfig:
    SECRET_KEY = os.environ.get('PROD_SECRET_KEY', SECRET_KEY)

    # JWT
    JTW_SECRET_KEY = os.environ.get('PROD_SECRET_KEY', SECRET_KEY)
    
    # SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('PROD_DB_URL', DEV_DB_URL)

    # APScheduler
    SCHEDULER_API_ENABLED = True

    