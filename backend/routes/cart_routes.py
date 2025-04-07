from flask import Blueprint, request, jsonify, current_app
from models.repositories.product_repository import ProductRepository
from utils.auth import token_required

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@token_required
def get_cart(current_user):
    """Get the current user's cart"""
    db = current_app.db
    
    # Get cart items for the current user
    db.execute("""
        SELECT c.*, p.name, p.price, p.original_price, p.discount, p.stock, p.images,
        p.is_new, p.trending, p.rating
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    """, (current_user.id,))
    
    cart_items = db.fetchall()
    
    # Process cart items
    items = []
    total = 0
    
    for item in cart_items:
        # Parse product images
        images = item['images']
        if isinstance(images, str):
            try:
                import json
                images = json.loads(images)
            except json.JSONDecodeError:
                images = []
        
        product = {
            'id': item['product_id'],
            'name': item['name'],
            'price': item['price'],
            'originalPrice': item['original_price'],
            'discount': item['discount'],
            'stock': item['stock'],
            'images': images,
            'isNew': bool(item['is_new']),
            'trending': bool(item['trending']),
            'rating': item['rating']
        }
        
        cart_item = {
            'id': item['id'],
            'product': product,
            'quantity': item['quantity'],
            'subtotal': item['price'] * item['quantity']
        }
        
        items.append(cart_item)
        total += cart_item['subtotal']
    
    return jsonify({
        'items': items,
        'total': total,
        'count': len(items)
    }), 200

@cart_bp.route('', methods=['POST'])
@token_required
def add_to_cart(current_user):
    """Add a product to the cart"""
    data = request.json
    
    # Check if required fields are present
    if not all(key in data for key in ['product_id', 'quantity']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    product_id = data['product_id']
    quantity = int(data['quantity'])
    
    # Validate quantity
    if quantity <= 0:
        return jsonify({'message': 'Quantity must be greater than 0'}), 400
    
    # Check if product exists and has sufficient stock
    product_repo = ProductRepository(current_app.db)
    product = product_repo.find_by_id(product_id)
    
    if not product:
        return jsonify({'message': 'Product not found'}), 404
    
    if product.stock < quantity:
        return jsonify({'message': 'Insufficient stock'}), 400
    
    db = current_app.db
    
    # Check if product is already in cart
    db.execute(
        "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
        (current_user.id, product_id)
    )
    
    existing_item = db.fetchone()
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item['quantity'] + quantity
        
        if new_quantity > product.stock:
            return jsonify({'message': 'Insufficient stock'}), 400
        
        db.execute(
            "UPDATE cart SET quantity = ? WHERE id = ?",
            (new_quantity, existing_item['id'])
        )
    else:
        # Add new item to cart
        db.execute(
            "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
            (current_user.id, product_id, quantity)
        )
    
    # Return updated cart
    return get_cart(current_user)

@cart_bp.route('/<int:item_id>', methods=['PUT'])
@token_required
def update_cart_item(current_user, item_id):
    """Update a cart item quantity"""
    data = request.json
    
    # Check if required fields are present
    if 'quantity' not in data:
        return jsonify({'message': 'Missing quantity field'}), 400
    
    quantity = int(data['quantity'])
    
    # Validate quantity
    if quantity <= 0:
        return jsonify({'message': 'Quantity must be greater than 0'}), 400
    
    db = current_app.db
    
    # Check if cart item exists and belongs to the current user
    db.execute(
        "SELECT c.*, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = ? AND c.user_id = ?",
        (item_id, current_user.id)
    )
    
    cart_item = db.fetchone()
    
    if not cart_item:
        return jsonify({'message': 'Cart item not found'}), 404
    
    # Check if quantity is within stock limits
    if quantity > cart_item['stock']:
        return jsonify({'message': 'Insufficient stock'}), 400
    
    # Update quantity
    db.execute(
        "UPDATE cart SET quantity = ? WHERE id = ?",
        (quantity, item_id)
    )
    
    # Return updated cart
    return get_cart(current_user)

@cart_bp.route('/<int:item_id>', methods=['DELETE'])
@token_required
def remove_from_cart(current_user, item_id):
    """Remove a product from the cart"""
    db = current_app.db
    
    # Check if cart item exists and belongs to the current user
    db.execute(
        "SELECT * FROM cart WHERE id = ? AND user_id = ?",
        (item_id, current_user.id)
    )
    
    cart_item = db.fetchone()
    
    if not cart_item:
        return jsonify({'message': 'Cart item not found'}), 404
    
    # Delete cart item
    db.execute("DELETE FROM cart WHERE id = ?", (item_id,))
    
    # Return updated cart
    return get_cart(current_user)

@cart_bp.route('', methods=['DELETE'])
@token_required
def clear_cart(current_user):
    """Clear the cart"""
    db = current_app.db
    
    # Delete all cart items for the current user
    db.execute("DELETE FROM cart WHERE user_id = ?", (current_user.id,))
    
    return jsonify({
        'message': 'Cart cleared successfully',
        'items': [],
        'total': 0,
        'count': 0
    }), 200 