import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, get_jwt, create_access_token, current_user

from config import AppConfig
from src.data_models import db, User

# import blueprints
from src.auth import auth

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


if __name__ == '__main__':
    load_dotenv()
    with api.app_context():
        db.create_all()

    api.run(debug=os.getenv('DEV_ENV', False), port=os.getenv('PORT', default=5000))