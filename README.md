# ShopEase E-Commerce Application

A fully-featured e-commerce web application built with HTML, CSS, JavaScript, Bootstrap, and Firebase.

## Features

### 🛒 Core Features
- User Authentication (Signup/Login with Firebase)
- Product Browsing & Filtering
- Shopping Cart
- Checkout Process
- Order Confirmation
- Search Functionality
- Responsive Design

### 📱 Pages
1. **Home Page** - Featured products, categories, sliders
2. **Products Page** - Product listings with filters
3. **Product Details** - Detailed product view with related products
4. **Categories** - Browse products by category
5. **Shopping Cart** - Manage cart items
6. **Checkout** - Complete purchase process
7. **Order Confirmation** - Order success page
8. **About Us** - Company information
9. **Contact Us** - Contact form with validation
10. **Search** - Product search functionality
11. **Authentication** - Login/Signup pages

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5
- **Icons**: Font Awesome 6
- **Authentication**: Firebase Auth
- **Data**: DummyJSON API
- **Storage**: LocalStorage (cart, orders)

## Project Structure
ecommerce-app/
├── index.html # Home Page
├── products.html # Products Page
├── product-details.html # Product View Page
├── categories.html # Category Page
├── cart.html # Cart Page
├── checkout.html # Checkout Page
├── order-confirmation.html # Order Confirmation
├── about.html # About Us Page
├── contact.html # Contact Us Page
├── search.html # Search Page
├── auth.html # Login & Signup
├── css/
│ ├── style.css # Main CSS file
│ └── auth.css # Authentication styles
├── js/
│ ├── main.js # Common JS functions
│ ├── auth.js # Firebase auth logic
│ ├── cart.js # Cart functionality
│ ├── products.js # Products fetching & display
│ ├── contact.js # Contact form validation
│ └── firebase-config.js # Firebase initialization
├── .env # Environment variables
└── README.md # Documentation


## Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Email/Password sign-in method
4. Register your web app and get configuration
5. Update `.env` file with your Firebase config:

```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id