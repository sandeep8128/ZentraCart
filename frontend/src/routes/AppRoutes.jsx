import { Routes, Route } from "react-router-dom";

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

function AppRoutes() {
  return (
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
    </Routes>
  );
}

export default AppRoutes;
