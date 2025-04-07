# Egadget Backend

This is the Python backend for the Egadget e-commerce application. It provides RESTful APIs for product browsing, user authentication, and cart management.

## Technology Stack

- **Python 3.8+**: Core programming language
- **Flask**: Web framework for building the API
- **SQLite**: Database for storing application data
- **JWT**: For user authentication

## Project Structure

```
backend/
├── app/              # Main application package
├── database/         # Database connection and schema definitions
├── models/           # Data models
│   └── repositories/ # Repository classes for database operations
├── routes/           # API route definitions
├── utils/            # Utility functions
└── run.py            # Entry point to run the application
```

## Setup Instructions

1. **Install Python**

   Make sure you have Python 3.8+ installed. You can download it from [python.org](https://www.python.org/downloads/).

2. **Create a virtual environment**

   ```
   python -m venv venv
   ```

3. **Activate the virtual environment**

   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. **Install dependencies**

   ```
   pip install -r requirements.txt
   ```

5. **Run the application**

   ```
   python run.py
   ```

   The API will be available at http://localhost:5000

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and get authentication token
- `GET /api/auth/me`: Get current user data
- `GET /api/auth/check`: Check if authentication token is valid

### Products

- `GET /api/products`: Get list of products with filtering options
- `GET /api/products/{id}`: Get a specific product by ID
- `POST /api/products/{id}/reviews`: Add a review to a product

### Cart

- `GET /api/cart`: Get current user's cart
- `POST /api/cart`: Add a product to cart
- `PUT /api/cart/{id}`: Update a cart item's quantity
- `DELETE /api/cart/{id}`: Remove an item from cart
- `DELETE /api/cart`: Clear the entire cart 