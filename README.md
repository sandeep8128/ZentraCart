# 🛒 ZentraCart

ZentraCart is a full-stack MERN E-Commerce platform featuring user authentication, seller management, product listings, shopping cart, wishlist, order processing, Razorpay payment integration, real-time notifications, and an AI-powered shopping assistant built with Google Gemini API.

Built using React, Redux Toolkit, Node.js, Express.js, MongoDB Atlas, Socket.IO, Cloudinary, Razorpay, and Gemini AI.

---

## 🚀 Live Demo

live link - https://zentra-cart.vercel.app

Frontend: https://your-frontend-url.vercel.app

Backend API: https://your-backend-url.onrender.com

---

## ✨ Features

## 🤖 AI Shopping Assistant

ZentraCart includes an AI-powered shopping assistant built using Google's Gemini API.

Features:
- Product-related queries
- Shopping guidance
- User assistance
- Smart recommendations
- Interactive chatbot experience

### 👤 Authentication & Authorization
- User Registration & Login
- JWT Authentication
- Role-Based Access Control
- User, Seller & Admin Roles
- Protected Routes

### 🛍 Product Management
- Product Listing
- Product Details Page
- Category Filtering
- Product Search
- Product Reviews & Ratings

### 🛒 Cart System
- Add to Cart
- Update Quantity
- Remove Items
- Persistent Cart Storage

### ❤️ Wishlist
- Add Products to Wishlist
- Remove from Wishlist
- View Saved Products

### 📦 Order Management
- Place Orders
- Order History
- Seller Order Dashboard
- Order Status Tracking

### 💳 Payment Integration
- Razorpay Payment Gateway
- Payment Verification
- Payment Records

### 📍 Address Management
- Add Address
- Update Address
- Delete Address
- Multiple Address Support

### 🔔 Notifications
- Real-time Notifications
- Socket.IO Integration
- Order Notifications

### ☁️ Image Upload
- Cloudinary Integration
- Product Image Management

---

## 🏗 Tech Stack

### Frontend
- React.js
- React Router DOM
- Redux Toolkit
- Axios
- Tailwind CSS
- Vite

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Socket.IO
- Nodemailer
- Razorpay

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Media Storage: Cloudinary

---

## 📂 Project Structure

```
ZentraCart
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── socket
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=3200

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

EMAIL_USER=your_email
EMAIL_PASS=your_app_password

GEMINI_API_KEY=your_gemini_key
```

---

## 🛠 Installation

### Clone Repository

```bash
git clone https://github.com/sandeep8128/ZentraCart.git

cd ZentraCart
```

### Backend Setup

```bash
cd backend

npm install

npm run dev
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

## 📊 Database Collections

- Users
- Products
- Reviews
- Cart
- Orders
- Payments
- Addresses
- Notifications
- Coupons
- Wishlists

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected API Routes
- Role-Based Authorization
- Environment Variable Protection

---

## 👨‍💻 Author

**Sandeep Prajapati**

B.Tech Computer Science Engineering

GitHub:
https://github.com/sandeep8128

---

## ⭐ Future Enhancements

- Admin Dashboard
- Product Analytics
- Inventory Management
- Multi-Vendor System
- AI Product Recommendations
- Sales Reports
- Coupon Management Dashboard

---

## 📜 License

This project is developed for educational and portfolio purposes.
