from typing import Optional, List, Dict, Any
import json
from database.db import Database
from models.product import Product

class ProductRepository:
    def __init__(self, db: Database):
        self.db = db
    
    def find_by_id(self, product_id: int) -> Optional[Product]:
        """Find a product by ID"""
        self.db.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        product_data = self.db.fetchone()
        if product_data:
            product = Product.from_dict(product_data)
            self._load_reviews(product)
            return product
        return None
    
    def find_all(self, limit: int = 100, offset: int = 0) -> List[Product]:
        """Find all products with pagination"""
        self.db.execute("SELECT * FROM products LIMIT ? OFFSET ?", (limit, offset))
        product_data_list = self.db.fetchall()
        products = [Product.from_dict(data) for data in product_data_list]
        
        # Load reviews for each product
        for product in products:
            self._load_reviews(product)
        
        return products
    
    def find_by_category(self, category: str, limit: int = 100, offset: int = 0) -> List[Product]:
        """Find products by category"""
        self.db.execute(
            "SELECT * FROM products WHERE category = ? LIMIT ? OFFSET ?", 
            (category, limit, offset)
        )
        product_data_list = self.db.fetchall()
        products = [Product.from_dict(data) for data in product_data_list]
        
        # Load reviews for each product
        for product in products:
            self._load_reviews(product)
        
        return products
    
    def find_by_filters(self, filters: Dict[str, Any], limit: int = 100, offset: int = 0) -> List[Product]:
        """Find products based on multiple filters"""
        query_parts = ["1=1"]  # Base condition that's always true
        params = []
        
        if 'category' in filters and filters['category']:
            query_parts.append("category = ?")
            params.append(filters['category'])
        
        if 'min_price' in filters and filters['min_price'] is not None:
            query_parts.append("price >= ?")
            params.append(filters['min_price'])
        
        if 'max_price' in filters and filters['max_price'] is not None:
            query_parts.append("price <= ?")
            params.append(filters['max_price'])
        
        if 'is_new' in filters and filters['is_new'] is not None:
            query_parts.append("is_new = ?")
            params.append(1 if filters['is_new'] else 0)
        
        if 'trending' in filters and filters['trending'] is not None:
            query_parts.append("trending = ?")
            params.append(1 if filters['trending'] else 0)
        
        if 'search' in filters and filters['search']:
            # Add search condition for name and description
            query_parts.append("(name LIKE ? OR description LIKE ?)")
            search_term = f"%{filters['search']}%"
            params.append(search_term)
            params.append(search_term)
        
        # Build the query
        query = f"SELECT * FROM products WHERE {' AND '.join(query_parts)}"
        
        # Add sorting
        if 'sort' in filters and filters['sort']:
            sort_field = filters['sort']
            sort_order = "DESC" if sort_field.startswith("-") else "ASC"
            sort_field = sort_field.lstrip("-")
            
            # Map frontend sort fields to database fields
            sort_field_map = {
                "price": "price",
                "rating": "rating",
                "createdAt": "created_at",
                "name": "name"
            }
            
            if sort_field in sort_field_map:
                query += f" ORDER BY {sort_field_map[sort_field]} {sort_order}"
        else:
            # Default sorting by ID
            query += " ORDER BY id DESC"
        
        # Add limit and offset
        query += " LIMIT ? OFFSET ?"
        params.append(limit)
        params.append(offset)
        
        # Execute the query
        self.db.execute(query, tuple(params))
        product_data_list = self.db.fetchall()
        products = [Product.from_dict(data) for data in product_data_list]
        
        # Load reviews for each product
        for product in products:
            self._load_reviews(product)
        
        return products
    
    def _load_reviews(self, product: Product) -> None:
        """Load reviews for a product"""
        self.db.execute("""
            SELECT r.*, u.name as user_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = ?
        """, (product.id,))
        
        reviews = self.db.fetchall()
        product.load_reviews([{
            'id': r['id'],
            'rating': r['rating'],
            'comment': r['comment'],
            'user': {
                'id': r['user_id'],
                'name': r['user_name']
            },
            'createdAt': r['created_at']
        } for r in reviews])
    
    def create(self, product: Product) -> Optional[Product]:
        """Create a new product"""
        self.db.execute(
            """
            INSERT INTO products 
            (name, description, price, original_price, discount, stock, category,
            images, is_new, trending, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product.name,
                product.description,
                product.price,
                product.original_price,
                product.discount,
                product.stock,
                product.category,
                json.dumps(product.images),
                1 if product.is_new else 0,
                1 if product.trending else 0,
                product.rating
            )
        )
        
        # Get the last inserted ID
        self.db.execute("SELECT last_insert_rowid()")
        last_id = self.db.fetchone()['last_insert_rowid()']
        
        return self.find_by_id(last_id)
    
    def update(self, product: Product) -> Optional[Product]:
        """Update an existing product"""
        if not product.id:
            return None
        
        self.db.execute(
            """
            UPDATE products SET
            name = ?, description = ?, price = ?, original_price = ?,
            discount = ?, stock = ?, category = ?, images = ?,
            is_new = ?, trending = ?, rating = ?
            WHERE id = ?
            """,
            (
                product.name,
                product.description,
                product.price,
                product.original_price,
                product.discount,
                product.stock,
                product.category,
                json.dumps(product.images),
                1 if product.is_new else 0,
                1 if product.trending else 0,
                product.rating,
                product.id
            )
        )
        
        return self.find_by_id(product.id)
    
    def delete(self, product_id: int) -> bool:
        """Delete a product by ID"""
        self.db.execute("DELETE FROM products WHERE id = ?", (product_id,))
        return True
    
    def add_review(self, product_id: int, user_id: int, rating: int, comment: str) -> bool:
        """Add a review to a product"""
        self.db.execute(
            "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)",
            (product_id, user_id, rating, comment)
        )
        
        # Update the average rating for the product
        self.db.execute(
            """
            UPDATE products SET
            rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?)
            WHERE id = ?
            """,
            (product_id, product_id)
        )
        
        return True 