# Egadget - Tech Products E-Commerce Store

Egadget is a full-stack e-commerce application for tech products, with a React/Next.js frontend and Python/Flask backend.

## Project Structure

```
project/
├── app/              # Frontend Next.js app folders and pages
├── components/       # Frontend UI components
├── lib/              # Frontend utilities and providers
├── public/           # Static assets
├── styles/           # CSS/styling files
├── backend/          # Python backend
│   ├── app/          # Flask application
│   ├── database/     # Database connection and models
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   └── utils/        # Utility functions
```

## Technologies Used

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn UI Components

### Backend
- Python 3.8+
- Flask
- SQLite
- JWT Authentication

## Getting Started

### Setup Environment

1. **Clone the repository**

2. **Install frontend dependencies**
   ```
   npm install
   # or
   pnpm install
   ```

3. **Setup backend**
   ```
   cd backend
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

### Run the Application

1. **Start the backend**
   ```
   cd backend
   python run.py
   ```
   The API will be available at http://localhost:5000

2. **In a new terminal, start the frontend**
   ```
   npm run dev
   # or
   pnpm run dev
   ```
   The website will be available at http://localhost:3000

## Features

- Product browsing and filtering
- User authentication (register/login)
- Shopping cart management
- Product reviews
- Responsive design for mobile and desktop

## API Endpoints

The backend provides RESTful API endpoints:

- `/api/auth/*` - Authentication related endpoints
- `/api/products/*` - Product data endpoints
- `/api/cart/*` - Shopping cart operations

## Demo Credentials

- Email: demo@example.com
- Password: password123 