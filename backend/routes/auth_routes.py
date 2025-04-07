from flask import Blueprint, request, jsonify, current_app
from models.user import User
from models.repositories.user_repository import UserRepository
from utils.auth import token_required, get_token_from_request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if required fields are present
    if not all(key in data for key in ['name', 'email', 'password']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if user already exists
    user_repo = UserRepository(current_app.db)
    existing_user = user_repo.find_by_email(data['email'])
    
    if existing_user:
        return jsonify({'message': 'User with this email already exists'}), 409
    
    # Create new user
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=data['password']
    )
    
    created_user = user_repo.create(new_user)
    
    if not created_user:
        return jsonify({'message': 'Failed to create user'}), 500
    
    # Generate token
    token = User.generate_token(created_user.id, current_app.config['SECRET_KEY'])
    
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': created_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # Check if required fields are present
    if not all(key in data for key in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Find user by email
    user_repo = UserRepository(current_app.db)
    user = user_repo.find_by_email(data['email'])
    
    if not user:
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Check password
    if not User.check_password(data['password'], user.password):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Generate token
    token = User.generate_token(user.id, current_app.config['SECRET_KEY'])
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({
        'user': current_user.to_dict()
    }), 200

@auth_bp.route('/check', methods=['GET'])
def check_auth():
    token = get_token_from_request()
    
    if not token:
        return jsonify({'authenticated': False}), 200
    
    try:
        # Verify the token
        payload = User.verify_token(token, current_app.config['SECRET_KEY'])
        if not payload:
            return jsonify({'authenticated': False}), 200
        
        # Get the user from the database
        user_repo = UserRepository(current_app.db)
        user = user_repo.find_by_id(payload['user_id'])
        
        if not user:
            return jsonify({'authenticated': False}), 200
        
        return jsonify({
            'authenticated': True,
            'user': user.to_dict()
        }), 200
    
    except Exception:
        return jsonify({'authenticated': False}), 200 