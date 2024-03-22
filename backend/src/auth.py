from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import pytz
from datetime import datetime

from data_models import db, User


auth = Blueprint('auth', __name__)

def get_est_time() -> str:
    '''Gets the current time in EST
        returns:
            str - current time in EST
    '''
    est = pytz.timezone('US/Eastern')
    est_time = datetime.now(est)

    return est_time


@auth.route('/signup-user', methods=['POST'])
def signup_user():
    email = request.json['email']
    password = request.json['password']
    username = request.json['username']

    email_exists = User.query.filter_by(email=email).first()
    if email_exists:
        return jsonify({'error': 'Email already exists'}), 409
    
    username_exists = User.query.filter_by(username=username).first()
    if username_exists:
        return jsonify({'error': 'Username already exists'}), 409

    new_user = User(
        email=email,
        password=generate_password_hash(password),
        username=username,
        user_creation_date=get_est_time()
        )

    try:
        db.session.add(new_user)
        db.session.commit()
        session['user_id'] = new_user.id
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
    return jsonify({
        'message': 'User Created!',
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'username': new_user.username,
            'password': new_user.password,
        }
        }), 201


@auth.route('/signin-user', methods=['POST'])
def signin_user():
    email = request.json['email']
    password = request.json['password']

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'Email or password is invalid'}), 401

    if not check_password_hash(user.password, password):
        return jsonify({'error': 'Email or password is invalid'}), 401

    session['user_id'] = user.id

    return jsonify({
        'message': 'User signed in!',
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
        }), 200


@auth.route('/delete-user', methods=['DELETE'])
def delete_user():
    email = request.json['email']
    password = request.json['password']

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'Email or password is invalid'}), 401

    if not check_password_hash(user.password, password):
        return jsonify({'error': 'Email or password is invalid'}), 401

    try:
        session.pop('user_id')
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    return jsonify({'message': 'User Deleted!'}), 200


@auth.route("/@me")
def get_current_user():
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user = User.query.filter_by(id=user_id).first()

    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'password': user.password,
        }
        }), 200


@auth.route("/signout-user", methods=["POST"])
def signout_user():
    try:
        session.pop("user_id")
    except KeyError:
        return jsonify({'error': 'User not signed in'}), 401

    return jsonify({'message': 'Signed out successfully'}), 200