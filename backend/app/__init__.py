import os
import sys

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from flask import Flask
from flask_cors import CORS
from database.db import Database
from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.cart_routes import cart_bp

def create_app(test_config=None):
    """Create and configure the Flask application"""
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Apply configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_secret_key'),
        DATABASE=os.path.join(app.instance_path, 'egadget.db'),
    )
    
    if test_config is None:
        # Load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # Load the test config if passed in
        app.config.from_mapping(test_config)
    
    # Ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)
    
    # Initialize database
    db = Database(app.config['DATABASE'])
    app.db = db
    
    # Initialize database tables and seed data
    with app.app_context():
        db.connect()
        db.initialize()
        db.seed_data()
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    
    # Add a simple index route
    @app.route('/')
    def index():
        return {
            'message': 'Egadget API is running',
            'version': '1.0.0'
        }
    
    return app 