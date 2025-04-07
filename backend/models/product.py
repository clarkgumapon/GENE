import json
from typing import Optional, Dict, Any, List

class Product:
    def __init__(self, id: Optional[int] = None, name: str = "", description: str = "",
                 price: float = 0.0, original_price: Optional[float] = None, 
                 discount: int = 0, stock: int = 0, category: str = "", 
                 images: List[str] = None, is_new: bool = False, 
                 trending: bool = False, rating: float = 0.0,
                 created_at: Optional[str] = None):
        self.id = id
        self.name = name
        self.description = description
        self.price = price
        self.original_price = original_price
        self.discount = discount
        self.stock = stock
        self.category = category
        self.images = images or []
        self.is_new = is_new
        self.trending = trending
        self.rating = rating
        self.created_at = created_at
        self.reviews = []
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Product':
        """Create a Product instance from a dictionary"""
        # Parse images from JSON string if needed
        images = data.get('images', '[]')
        if isinstance(images, str):
            try:
                images = json.loads(images)
            except json.JSONDecodeError:
                images = []
        
        return cls(
            id=data.get('id'),
            name=data.get('name', ''),
            description=data.get('description', ''),
            price=float(data.get('price', 0.0)),
            original_price=float(data.get('original_price')) if data.get('original_price') else None,
            discount=int(data.get('discount', 0)),
            stock=int(data.get('stock', 0)),
            category=data.get('category', ''),
            images=images,
            is_new=bool(data.get('is_new', 0)),
            trending=bool(data.get('trending', 0)),
            rating=float(data.get('rating', 0.0)),
            created_at=data.get('created_at')
        )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert Product instance to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'originalPrice': self.original_price,
            'discount': self.discount,
            'stock': self.stock,
            'category': self.category,
            'images': self.images,
            'isNew': self.is_new,
            'trending': self.trending,
            'rating': self.rating,
            'createdAt': self.created_at,
            'reviews': self.reviews
        }
    
    def load_reviews(self, reviews):
        """Load reviews for this product"""
        self.reviews = reviews 