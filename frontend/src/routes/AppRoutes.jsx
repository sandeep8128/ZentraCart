import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "../pages/Home";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import UserDashboard from "../pages/UserDashboard";
import ProductDetails from "../pages/ProductDetails";
import Checkout from "../pages/Checkout";
import MyOrders from "../pages/MyOrders";
import Wishlist from "../pages/Wishlist";
import SellerDashboard from "../pages/SellerDashboard";
import AdminDashboard from "../pages/AdminDashboard";
import Notifications from "../pages/Notifications";
import SellerOrders from "../pages/SellerOrders";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";


function AppRoutes() {
  return (
  <>
    <Toaster position="top-right" />

    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/seller-orders" element={<SellerOrders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);
}

export default AppRoutes;
