from flask import Flask, render_template_string, request, redirect, url_for, session
import uuid

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production

# Sample product data
PRODUCTS = {
    '1': {'name': 'Laptop', 'price': 999.99, 'image': 'laptop.jpg'},
    '2': {'name': 'Smartphone', 'price': 599.99, 'image': 'phone.jpg'},
    '3': {'name': 'Headphones', 'price': 199.99, 'image': 'headphones.jpg'},
    '4': {'name': 'Tablet', 'price': 399.99, 'image': 'tablet.jpg'},
    '5': {'name': 'Smart Watch', 'price': 299.99, 'image': 'watch.jpg'}
}

def get_cart():
    """Get cart from session or create empty cart"""
    if 'cart' not in session:
        session['cart'] = {}
    return session['cart']

def save_cart(cart):
    """Save cart to session"""
    session['cart'] = cart
    session.modified = True

def calculate_cart_total():
    """Calculate total price of items in cart"""
    cart = get_cart()
    total = 0
    for product_id, quantity in cart.items():
        if product_id in PRODUCTS:
            total += PRODUCTS[product_id]['price'] * quantity
    return total

def get_cart_item_count():
    """Get total number of items in cart"""
    cart = get_cart()
    return sum(cart.values())

# HTML Templates
HOME_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Flask Shop</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .header { background: #333; color: white; padding: 20px; margin: -40px -40px 40px -40px; }
        .header h1 { margin: 0; display: inline-block; }
        .cart-info { float: right; }
        .cart-info a { color: white; text-decoration: none; font-weight: bold; }
        .products { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .product { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .product h3 { margin-top: 0; color: #333; }
        .price { font-size: 24px; font-weight: bold; color: #007bff; margin: 10px 0; }
        .btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { background: #0056b3; }
        .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Flask Shop</h1>
        <div class="cart-info">
            <a href="{{ url_for('view_cart') }}">Cart ({{ cart_count }} items) - ${{ "%.2f"|format(cart_total) }}</a>
        </div>
        <div style="clear: both;"></div>
    </div>
    
    {% if message %}
        <div class="success">{{ message }}</div>
    {% endif %}
    
    <div class="products">
        {% for product_id, product in products.items() %}
        <div class="product">
            <h3>{{ product.name }}</h3>
            <div class="price">${{ "%.2f"|format(product.price) }}</div>
            <form method="POST" action="{{ url_for('add_to_cart') }}">
                <input type="hidden" name="product_id" value="{{ product_id }}">
                <button type="submit" class="btn">Add to Cart</button>
            </form>
        </div>
        {% endfor %}
    </div>
</body>
</html>
'''

CART_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Shopping Cart - Flask Shop</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
        .header { background: #333; color: white; padding: 20px; margin: -40px -40px 40px -40px; }
        .header h1 { margin: 0; }
        .cart-item { background: white; padding: 20px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .item-info h3 { margin: 0 0 10px 0; }
        .item-controls { display: flex; align-items: center; gap: 10px; }
        .quantity-input { width: 60px; padding: 5px; text-align: center; }
        .btn { background: #007bff; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #218838; }
        .total { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 20px; text-align: right; }
        .total h2 { margin: 0; color: #333; }
        .empty-cart { text-align: center; padding: 40px; background: white; border-radius: 8px; }
        .back-link { margin-bottom: 20px; }
        .back-link a { color: #007bff; text-decoration: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Shopping Cart</h1>
    </div>
    
    <div class="back-link">
        <a href="{{ url_for('index') }}">← Continue Shopping</a>
    </div>
    
    {% if cart_items %}
        {% for item in cart_items %}
        <div class="cart-item">
            <div class="item-info">
                <h3>{{ item.name }}</h3>
                <p>Price: ${{ "%.2f"|format(item.price) }}</p>
                <p>Subtotal: ${{ "%.2f"|format(item.subtotal) }}</p>
            </div>
            <div class="item-controls">
                <form method="POST" action="{{ url_for('update_cart') }}" style="display: inline;">
                    <input type="hidden" name="product_id" value="{{ item.id }}">
                    <input type="number" name="quantity" value="{{ item.quantity }}" min="0" class="quantity-input">
                    <button type="submit" class="btn">Update</button>
                </form>
                <form method="POST" action="{{ url_for('remove_from_cart') }}" style="display: inline;">
                    <input type="hidden" name="product_id" value="{{ item.id }}">
                    <button type="submit" class="btn btn-danger">Remove</button>
                </form>
            </div>
        </div>
        {% endfor %}
        
        <div class="total">
            <h2>Total: ${{ "%.2f"|format(total) }}</h2>
            <form method="POST" action="{{ url_for('clear_cart') }}" style="display: inline; margin-right: 10px;">
                <button type="submit" class="btn btn-danger">Clear Cart</button>
            </form>
            <button class="btn btn-success">Checkout</button>
        </div>
    {% else %}
        <div class="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <a href="{{ url_for('index') }}" class="btn">Shop Now</a>
        </div>
    {% endif %}
</body>
</html>
'''

@app.route('/')
def index():
    message = request.args.get('message')
    return render_template_string(HOME_TEMPLATE, 
                                products=PRODUCTS,
                                cart_count=get_cart_item_count(),
                                cart_total=calculate_cart_total(),
                                message=message)

@app.route('/add_to_cart', methods=['POST'])
def add_to_cart():
    product_id = request.form.get('product_id')
    
    if product_id not in PRODUCTS:
        return redirect(url_for('index'))
    
    cart = get_cart()
    
    if product_id in cart:
        cart[product_id] += 1
    else:
        cart[product_id] = 1
    
    save_cart(cart)
    
    product_name = PRODUCTS[product_id]['name']
    message = f"{product_name} added to cart!"
    
    return redirect(url_for('index', message=message))

@app.route('/cart')
def view_cart():
    cart = get_cart()
    cart_items = []
    
    for product_id, quantity in cart.items():
        if product_id in PRODUCTS:
            product = PRODUCTS[product_id]
            cart_items.append({
                'id': product_id,
                'name': product['name'],
                'price': product['price'],
                'quantity': quantity,
                'subtotal': product['price'] * quantity
            })
    
    total = calculate_cart_total()
    
    return render_template_string(CART_TEMPLATE, 
                                cart_items=cart_items, 
                                total=total)

@app.route('/update_cart', methods=['POST'])
def update_cart():
    product_id = request.form.get('product_id')
    quantity = int(request.form.get('quantity', 0))
    
    cart = get_cart()
    
    if quantity <= 0:
        if product_id in cart:
            del cart[product_id]
    else:
        cart[product_id] = quantity
    
    save_cart(cart)
    return redirect(url_for('view_cart'))

@app.route('/remove_from_cart', methods=['POST'])
def remove_from_cart():
    product_id = request.form.get('product_id')
    
    cart = get_cart()
    if product_id in cart:
        del cart[product_id]
    
    save_cart(cart)
    return redirect(url_for('view_cart'))

@app.route('/clear_cart', methods=['POST'])
def clear_cart():
    session['cart'] = {}
    session.modified = True
    return redirect(url_for('view_cart'))

if __name__ == '__main__':
    app.run(debug=True)