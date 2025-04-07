from flask import Blueprint, request, jsonify, current_app
from models.product import Product
from models.repositories.product_repository import ProductRepository
from utils.auth import token_required

product_bp = Blueprint('products', __name__)

@product_bp.route('', methods=['GET'])
def get_products():
    """Get all products with optional filtering"""
    product_repo = ProductRepository(current_app.db)
    
    # Extract query parameters
    category = request.args.get('category')
    search = request.args.get('search')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    sort = request.args.get('sort')
    is_new = request.args.get('is_new')
    trending = request.args.get('trending')
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    # Convert string values to appropriate types
    if min_price:
        min_price = float(min_price)
    if max_price:
        max_price = float(max_price)
    if is_new:
        is_new = is_new.lower() == 'true'
    if trending:
        trending = trending.lower() == 'true'
    
    # Build filters
    filters = {
        'category': category.lower() if category else None,
        'search': search,
        'min_price': min_price,
        'max_price': max_price,
        'sort': sort,
        'is_new': is_new if is_new is not None else None,
        'trending': trending if trending is not None else None
    }
    
    # Remove None values
    filters = {k: v for k, v in filters.items() if v is not None}
    
    # Special case for new arrivals and trending
    if category == 'new-arrivals':
        filters['is_new'] = True
        filters.pop('category', None)
    elif category == 'trending':
        filters['trending'] = True
        filters.pop('category', None)
    
    products = product_repo.find_by_filters(filters, limit, offset)
    
    return jsonify({
        'products': [product.to_dict() for product in products],
        'count': len(products),
        'filters': filters
    }), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    product_repo = ProductRepository(current_app.db)
    product = product_repo.find_by_id(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    return jsonify({
        'product': product.to_dict()
    }), 200

@product_bp.route('/<int:product_id>/reviews', methods=['POST'])
@token_required
def add_review(current_user, product_id):
    """Add a review to a product"""
    data = request.json
    
    # Check if required fields are present
    if not all(key in data for key in ['rating', 'comment']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate rating
    rating = int(data['rating'])
    if not 1 <= rating <= 5:
        return jsonify({'message': 'Rating must be between 1 and 5'}), 400
    
    product_repo = ProductRepository(current_app.db)
    
    # Check if product exists
    product = product_repo.find_by_id(product_id)
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    # Add review
    success = product_repo.add_review(
        product_id=product_id,
        user_id=current_user.id,
        rating=rating,
        comment=data['comment']
    )
    
    if not success:
        return jsonify({'message': 'Failed to add review'}), 500
    
    # Get updated product with new review
    updated_product = product_repo.find_by_id(product_id)
    
    return jsonify({
        'message': 'Review added successfully',
        'product': updated_product.to_dict()
    }), 201 