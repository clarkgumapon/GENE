from typing import Optional, List
from database.db import Database
from models.user import User

class UserRepository:
    def __init__(self, db: Database):
        self.db = db
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        """Find a user by ID"""
        self.db.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user_data = self.db.fetchone()
        if user_data:
            return User.from_dict(user_data)
        return None
    
    def find_by_email(self, email: str) -> Optional[User]:
        """Find a user by email"""
        self.db.execute("SELECT * FROM users WHERE email = ?", (email,))
        user_data = self.db.fetchone()
        if user_data:
            return User.from_dict(user_data)
        return None
    
    def create(self, user: User) -> Optional[User]:
        """Create a new user"""
        # Hash the password before storing
        hashed_password = User.hash_password(user.password)
        
        self.db.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (user.name, user.email, hashed_password)
        )
        
        # Get the last inserted ID
        self.db.execute("SELECT last_insert_rowid()")
        last_id = self.db.fetchone()['last_insert_rowid()']
        
        return self.find_by_id(last_id)
    
    def update(self, user: User) -> Optional[User]:
        """Update an existing user"""
        if not user.id:
            return None
        
        fields_to_update = []
        params = []
        
        if user.name:
            fields_to_update.append("name = ?")
            params.append(user.name)
        
        if user.email:
            fields_to_update.append("email = ?")
            params.append(user.email)
        
        if user.password:
            # Hash the new password before storing
            hashed_password = User.hash_password(user.password)
            fields_to_update.append("password = ?")
            params.append(hashed_password)
        
        if not fields_to_update:
            return self.find_by_id(user.id)
        
        # Add the user ID to the params
        params.append(user.id)
        
        self.db.execute(
            f"UPDATE users SET {', '.join(fields_to_update)} WHERE id = ?",
            tuple(params)
        )
        
        return self.find_by_id(user.id)
    
    def delete(self, user_id: int) -> bool:
        """Delete a user by ID"""
        self.db.execute("DELETE FROM users WHERE id = ?", (user_id,))
        return True 