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
        }
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
    (sum, item) =>
      sum +
      item.product.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-4xl font-bold text-[#285570] mb-8">
          My Cart 🛒
        </h1>

        {cartItems.length === 0 ? (
          <div
            className="
            bg-white
            border
            border-[#CBCAC7]
            rounded-2xl
            p-10
            text-center
            "
          >
            <h3 className="text-2xl text-gray-500">
              Your Cart Is Empty
            </h3>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Cart Items */}

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
                        w-32
                        h-32
                        object-cover
                        rounded-xl
                        "
                      />
                    )}

                    <div className="flex-1">

                      <h3 className="text-xl font-semibold text-[#333333]">
                        {
                          item.product?.title
                        }
                      </h3>

                      <p className="text-[#285570] text-2xl font-bold mt-2">
                        ₹
                        {
                          item.product?.price
                        }
                      </p>

                      <div className="flex items-center gap-3 mt-4">

                        <button
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity - 1
                            )
                          }
                          className="
                          w-10
                          h-10
                          bg-gray-200
                          rounded-lg
                          "
                        >
                          -
                        </button>

                        <span className="font-bold text-lg">
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(
                              item._id,
                              item.quantity + 1
                            )
                          }
                          className="
                          w-10
                          h-10
                          bg-gray-200
                          rounded-lg
                          "
                        >
                          +
                        </button>

                        <button
                          onClick={() =>
                            removeItem(
                              item._id
                            )
                          }
                          className="
                          ml-3
                          bg-red-500
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          hover:bg-red-600
                          "
                        >
                          Remove
                        </button>

                      </div>

                      <h4 className="mt-4 font-semibold">
                        Subtotal: ₹
                        {item.product.price *
                          item.quantity}
                      </h4>

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
              <h2 className="text-2xl font-bold text-[#285570] mb-5">
                Order Summary
              </h2>

              <div className="flex justify-between mb-4">
                <span>Total Items</span>

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

              <button
                onClick={() =>
                  navigate("/checkout")
                }
                className="
                w-full
                bg-[#285570]
                text-white
                py-4
                rounded-xl
                font-semibold
                hover:bg-[#1E4257]
                transition
                "
              >
                Proceed To Checkout
              </button>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

export default Cart;