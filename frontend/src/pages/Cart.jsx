import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);

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

  const updateQuantity = async (id, quantity) => {
    try {
      if (quantity < 1) return;

      await API.put(
        `/cart/update/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchCart();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const removeItem = async (id) => {
    try {
      await API.delete(`/cart/remove/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCart();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>My Cart</h1>

        {cartItems.length === 0 ? (
          <h3>Cart Empty</h3>
        ) : (
          <>
            {cartItems.map((item) => (
              <div
                key={item._id}
                style={{
                  border: "1px solid gray",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <h3>{item.product?.title}</h3>

                <p>₹{item.product?.price}</p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    +
                  </button>

                  <button onClick={() => removeItem(item._id)}>Remove</button>
                </div>

                <h4>Subtotal: ₹{item.product.price * item.quantity}</h4>
              </div>
            ))}

            <hr />

            <h2>Total: ₹{total}</h2>

            <button onClick={() => navigate("/checkout")}>
              Proceed To Checkout
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;
