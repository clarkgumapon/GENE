import sqlite3
import os
import json
from pathlib import Path

class Database:
    def __init__(self, db_path="egadget.db"):
        self.db_path = db_path
        self.connection = None
        self.cursor = None
    
    def connect(self):
        try:
            self.connection = sqlite3.connect(self.db_path, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            self.cursor = self.connection.cursor()
            return True
        except sqlite3.Error as e:
            print(f"Database connection error: {e}")
            return False
    
    def close(self):
        if self.connection:
            self.connection.close()
            self.connection = None
            self.cursor = None
    
    def initialize(self):
        """Create tables if they don't exist"""
        if not self.connection:
            self.connect()
        
        try:
            # Users table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            
            # Products table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price REAL NOT NULL,
                original_price REAL,
                discount INTEGER DEFAULT 0,
                stock INTEGER DEFAULT 0,
                category TEXT,
                images TEXT,  -- JSON string of image URLs
                is_new BOOLEAN DEFAULT 0,
                trending BOOLEAN DEFAULT 0,
                rating REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')
            
            # Reviews table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                rating INTEGER NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            ''')
            
            # Orders table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                total_amount REAL NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
            ''')
            
            # Order items table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
            ''')
            
            # Cart table (temporary storage, can be moved to session/localStorage in frontend)
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                UNIQUE(user_id, product_id)
            )
            ''')
            
            # Wishlist table
            self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS wishlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                UNIQUE(user_id, product_id)
            )
            ''')
            
            self.connection.commit()
            return True
        
        except sqlite3.Error as e:
            print(f"Database initialization error: {e}")
            return False
    
    def seed_data(self, sample_data_path=None):
        """Seed the database with sample data if tables are empty"""
        if not self.connection:
            self.connect()
        
        try:
            # Check if products table is empty
            self.cursor.execute("SELECT COUNT(*) FROM products")
            count = self.cursor.fetchone()[0]
            
            # Default path to the sample data
            if sample_data_path is None:
                current_dir = os.path.dirname(os.path.abspath(__file__))
                sample_data_path = os.path.join(current_dir, 'sample_data.json')
            
            if count == 0 and os.path.exists(sample_data_path):
                with open(sample_data_path, 'r') as f:
                    data = json.load(f)
                
                # Insert sample products
                for product in data.get('products', []):
                    self.cursor.execute(
                        '''
                        INSERT INTO products 
                        (name, description, price, original_price, discount, stock, category, 
                        images, is_new, trending, rating)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''',
                        (
                            product['name'],
                            product.get('description', ''),
                            product['price'],
                            product.get('originalPrice', None),
                            product.get('discount', 0),
                            product.get('stock', 10),
                            product.get('category', 'Other'),
                            json.dumps(product.get('images', [])),
                            1 if product.get('isNew', False) else 0,
                            1 if product.get('trending', False) else 0,
                            product.get('rating', 0)
                        )
                    )
                
                # Insert sample users
                for user in data.get('users', []):
                    self.cursor.execute(
                        '''
                        INSERT INTO users (name, email, password)
                        VALUES (?, ?, ?)
                        ''',
                        (user['name'], user['email'], user['password'])
                    )
                
                self.connection.commit()
                print("Database seeded successfully")
                return True
            
            return True
        
        except (sqlite3.Error, FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Database seeding error: {e}")
            return False
    
    def execute(self, query, params=None):
        """Execute a query with parameters"""
        if not self.connection:
            self.connect()
        
        try:
            if params:
                self.cursor.execute(query, params)
            else:
                self.cursor.execute(query)
            
            self.connection.commit()
            return True
        
        except sqlite3.Error as e:
            print(f"Query execution error: {e}")
            return False
    
    def fetchall(self):
        """Fetch all rows from the last query"""
        if not self.cursor:
            return []
        
        results = self.cursor.fetchall()
        return [dict(row) for row in results]
    
    def fetchone(self):
        """Fetch one row from the last query"""
        if not self.cursor:
            return None
        
        row = self.cursor.fetchone()
        if row:
            return dict(row)
        return None 