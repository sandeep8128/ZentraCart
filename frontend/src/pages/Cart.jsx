import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { decreaseCartCount } from "../redux/slices/cartSlice";

function Cart() {
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);
  const dispatch = useDispatch();

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
       dispatch(decreaseCartCount());

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

      <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-8 text-4xl font-bold text-[#285570]">My Cart 🛒</h1>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl border border-[#CBCAC7] bg-white p-10 text-center">
            <h3 className="text-2xl text-gray-500">Your Cart Is Empty</h3>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}

            <div className="lg:col-span-2">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="mb-5 rounded-2xl border border-[#CBCAC7] bg-white p-5 shadow-sm"
                >
                  <div className="flex gap-5">
                    {item.product?.images?.[0]?.url && (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        className="h-32 w-32 rounded-xl object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[#333333]">
                        {item.product?.title}
                      </h3>

                      <p className="mt-2 text-2xl font-bold text-[#285570]">
                        ₹{item.product?.price}
                      </p>

                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="h-10 w-10 rounded-lg bg-gray-200"
                        >
                          -
                        </button>

                        <span className="text-lg font-bold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="h-10 w-10 rounded-lg bg-gray-200"
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeItem(item._id)}
                          className="ml-3 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <h4 className="mt-4 font-semibold">
                        Subtotal: ₹{item.product.price * item.quantity}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}

            <div className="h-fit rounded-2xl border border-[#CBCAC7] bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-bold text-[#285570]">
                Order Summary
              </h2>

              <div className="mb-4 flex justify-between">
                <span>Total Items</span>

                <span>{cartItems.length}</span>
              </div>

              <div className="mb-6 flex justify-between">
                <span>Total Amount</span>

                <span className="text-xl font-bold text-[#285570]">
                  ₹{total}
                </span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full rounded-xl bg-[#285570] py-4 font-semibold text-white transition hover:bg-[#1E4257]"
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
