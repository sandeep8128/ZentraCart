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
        { coupon },
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

      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-4xl font-bold text-[#285570] mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Products */}

          <div className="lg:col-span-2">

            {cartItems.map((item) => (
              <div
                key={item._id}
                className="
                bg-white
                border
                border-[#CBCAC7]
                rounded-2xl
                p-5
                mb-5
                shadow-sm
                "
              >
                <div className="flex gap-5">

                  {item.product?.images?.[0]
                    ?.url && (
                    <img
                      src={
                        item.product.images[0]
                          .url
                      }
                      alt={
                        item.product.title
                      }
                      className="
                      w-28
                      h-28
                      object-cover
                      rounded-xl
                      "
                    />
                  )}

                  <div>

                    <h3 className="text-xl font-semibold">
                      {item.product.title}
                    </h3>

                    <p className="text-[#285570] text-2xl font-bold mt-2">
                      ₹{item.product.price}
                    </p>

                    <p className="mt-2 text-gray-600">
                      Quantity: {item.quantity}
                    </p>

                  </div>

                </div>
              </div>
            ))}

          </div>

          {/* Summary */}

          <div
            className="
            bg-white
            border
            border-[#CBCAC7]
            rounded-2xl
            p-6
            h-fit
            shadow-sm
            "
          >
            <h2 className="text-2xl font-bold text-[#285570] mb-6">
              Order Summary
            </h2>

            <div className="flex justify-between mb-4">
              <span>Items</span>

              <span>
                {cartItems.length}
              </span>
            </div>

            <div className="flex justify-between mb-6">
              <span>Total Amount</span>

              <span className="font-bold text-xl text-[#285570]">
                ₹{total}
              </span>
            </div>

            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={coupon}
              onChange={(e) =>
                setCoupon(e.target.value)
              }
              className="
                w-full
                border
                border-[#CBCAC7]
                rounded-xl
                p-3
                mb-5
                outline-none
              "
            />

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="
              w-full
              bg-[#285570]
              text-white
              py-4
              rounded-xl
              font-semibold
              hover:bg-[#1E4257]
              transition
              disabled:opacity-50
              "
            >
              {loading
                ? "Placing Order..."
                : "Place Order"}
            </button>

          </div>

        </div>
      </div>
    </>
  );
}

export default Checkout;