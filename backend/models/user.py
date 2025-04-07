import bcrypt
import jwt
import datetime
from typing import Optional, Dict, Any, List

class User:
    def __init__(self, id: Optional[int] = None, name: str = "", email: str = "", 
                 password: str = "", created_at: Optional[str] = None):
        self.id = id
        self.name = name
        self.email = email
        self.password = password
        self.created_at = created_at
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """Create a User instance from a dictionary"""
        return cls(
            id=data.get('id'),
            name=data.get('name', ''),
            email=data.get('email', ''),
            password=data.get('password', ''),
            created_at=data.get('created_at')
        )
    
    def to_dict(self, include_password: bool = False) -> Dict[str, Any]:
        """Convert User instance to dictionary"""
        user_dict = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at
        }
        
        if include_password:
            user_dict['password'] = self.password
        
        return user_dict
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password for storage"""
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def check_password(password: str, hashed_password: str) -> bool:
        """Check if a password matches the stored hash"""
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    
    @staticmethod
    def generate_token(user_id: int, secret_key: str, expires_in: int = 86400) -> str:
        """Generate a JWT token for the user"""
        payload = {
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)
        }
        return jwt.encode(payload, secret_key, algorithm='HS256')
    
    @staticmethod
    def verify_token(token: str, secret_key: str) -> Optional[Dict[str, Any]]:
        """Verify a JWT token and return the payload"""
        try:
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None 