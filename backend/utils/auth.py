from functools import wraps
from flask import request, jsonify, current_app
from models.user import User
import os

def get_token_from_request():
    """Extract token from the Authorization header"""
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None

def token_required(f):
    """Decorator to require a valid token for a route"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({'message': 'Token is missing', 'authenticated': False}), 401
        
        try:
            # Verify the token
            payload = User.verify_token(token, current_app.config['SECRET_KEY'])
            if not payload:
                return jsonify({'message': 'Token is invalid or expired', 'authenticated': False}), 401
            
            # Get the user from the database
            from models.repositories.user_repository import UserRepository
            user_repo = UserRepository(current_app.db)
            user = user_repo.find_by_id(payload['user_id'])
            
            if not user:
                return jsonify({'message': 'User not found', 'authenticated': False}), 401
            
            # Add the user to the request context
            kwargs['current_user'] = user
            return f(*args, **kwargs)
        
        except Exception as e:
            return jsonify({'message': f'Authentication failed: {str(e)}', 'authenticated': False}), 401
    
    return decorated 