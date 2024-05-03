from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, unset_jwt_cookies

from .data_models import db, User
from .utils.time_functions import get_est_time


auth = Blueprint('auth', __name__)

@auth.route('/signup-user', methods=['POST'])
def signup_user():
    email = request.json.get('email', None).strip()
    password = request.json.get('password', None).strip()
    username = request.json.get('username', None).strip()

    email_exists = User.query.filter_by(email=email).first()
    if email_exists:
        return jsonify(msg='Email already exists'), 409
    
    username_exists = User.query.filter_by(username=username).first()
    if username_exists:
        return jsonify(msg='Username already exists'), 409

    new_user = User(
        email=email,
        password=generate_password_hash(password),
        username=username,
        creation_date=get_est_time()
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        return jsonify(msg=str(e)), 400
    
    access_token = create_access_token(identity=new_user)

    return jsonify(data=access_token,
                   msg='Sign up successful!'), 200


@auth.route('/signin-user', methods=['POST'])
def signin_user():
    email = request.json.get('email', None).strip()
    password = request.json.get('password', None).strip()

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify(msg='Email or password is invalid'), 401

    if not check_password_hash(user.password, password):
        return jsonify(msg='Email or password is invalid'), 401
    
    access_token = create_access_token(identity=user)

    return jsonify(data=access_token, msg="Sign In successful!"), 200


@auth.route("/signout-user", methods=["POST"])
def signout_user():
    response = jsonify(msg="signout successful")
    unset_jwt_cookies(response)
    return response, 200