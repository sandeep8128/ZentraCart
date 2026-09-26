import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from "lucide-react";

import { decreaseCartCount } from "../redux/slices/cartSlice";

function Cart() {
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);

  const dispatch = useDispatch();

  // =====================================================
  // FETCH CART
  // =====================================================

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

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

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

  // =====================================================
  // REMOVE ITEM
  // =====================================================

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

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCart();
  }, []);

  // =====================================================
  // TOTAL
  // =====================================================

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FAF7F6]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-6">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6 sm:mb-8">
            <h1 className="mb-1 text-2xl font-bold text-slate-900 transition-colors duration-300 hover:text-indigo-600 sm:text-3xl">
              My Cart
            </h1>

            <p className="text-xs text-slate-500 sm:text-sm">
              {cartItems.length > 0
                ? `${totalItems} item${
                    totalItems !== 1 ? "s" : ""
                  } in your cart`
                : "Review your items before checkout"}
            </p>
          </div>

          {/* =================================================
              EMPTY CART
          ================================================= */}

          {cartItems.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.15)] sm:p-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-600">
                <ShoppingBag size={28} />
              </div>

              <h3 className="mb-1 text-lg font-semibold text-slate-800 transition-colors hover:text-indigo-600 sm:text-xl">
                Your cart is empty
              </h3>

              <p className="mb-6 text-xs text-slate-400 sm:text-sm">
                Looks like you haven't added anything yet.
              </p>

              <button
                onClick={() => navigate("/products")}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {/* =================================================
                  CART ITEMS
              ================================================= */}

              <div className="space-y-4 lg:col-span-2">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.15)] sm:p-5"
                  >
                    <div className="flex gap-3 sm:gap-5">
                      {/* PRODUCT IMAGE */}

                      {item.product?.images?.[0]?.url && (
                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 transition-all duration-300 group-hover:bg-indigo-50/40 sm:h-28 sm:w-28">
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      {/* PRODUCT INFO */}

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors duration-200 group-hover:text-indigo-600 sm:text-base">
                              {item.product?.title}
                            </h3>

                            <p className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                              ₹
                              {Number(item.product?.price || 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>

                          {/* DELETE */}

                          <button
                            onClick={() => removeItem(item._id)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* QUANTITY + SUBTOTAL */}

                        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                          {/* QUANTITY */}

                          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 transition-colors duration-200 group-hover:border-slate-300">
                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-all duration-200 hover:bg-slate-900 hover:text-white active:scale-95"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="w-8 text-center text-sm font-semibold text-slate-800">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item._id, item.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-all duration-200 hover:bg-indigo-600 hover:text-white active:scale-95"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          {/* SUBTOTAL */}

                          <p className="text-xs text-slate-500 sm:text-sm">
                            Subtotal:{" "}
                            <span className="font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                              ₹
                              {Number(
                                item.product.price * item.quantity,
                              ).toLocaleString("en-IN")}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* =================================================
                  ORDER SUMMARY
              ================================================= */}

              <div className="h-fit space-y-4 lg:sticky lg:top-20">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.15)] sm:p-6">
                  <h2 className="mb-5 text-lg font-bold text-slate-900 transition-colors duration-200 hover:text-indigo-600">
                    Order Summary
                  </h2>

                  {/* SUMMARY DETAILS */}

                  <div className="space-y-3 border-b border-slate-100 pb-4 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Items</span>

                      <span className="font-medium text-slate-700">
                        {totalItems}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>

                      <span className="font-medium text-slate-700">
                        ₹{Number(total).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Delivery</span>

                      <span className="font-medium text-emerald-600">Free</span>
                    </div>
                  </div>

                  {/* TOTAL */}

                  <div className="my-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900 sm:text-base">
                      Total Amount
                    </span>

                    <span className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                      ₹{Number(total).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* CHECKOUT */}

                  <button
                    onClick={() => navigate("/checkout")}
                    className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98]"
                  >
                    Proceed To Checkout
                  </button>

                  {/* SECURITY */}

                  <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 sm:text-xs">
                    <ShieldCheck size={14} />
                    100% secure checkout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Cart;
