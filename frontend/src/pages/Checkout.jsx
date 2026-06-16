import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Checkout() {
  const { token } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(res.data.cart);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const res = await API.post(
        "/orders/create",
        {
          coupon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);

      alert("Order Created Successfully");

      navigate("/orders");
    } catch (error) {
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed To Create Order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Checkout</h1>

        {cartItems.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid gray",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>{item.product.title}</h3>

            <p>₹{item.product.price}</p>

            <p>Qty: {item.quantity}</p>
          </div>
        ))}

        <h2>Total: ₹{total}</h2>

        <br />

        <input
          type="text"
          placeholder="Enter Coupon Code"
          value={coupon}
          onChange={(e) =>
            setCoupon(e.target.value)
          }
        />

        <br />
        <br />

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading
            ? "Placing Order..."
            : "Place Order"}
        </button>
      </div>
    </>
  );
}

export default Checkout;