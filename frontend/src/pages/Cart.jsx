import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { decreaseCartCount } from "../redux/slices/cartSlice";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    try {
      setLoading(true);

      const res = await API.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(res.data.cart || []);
    } catch (error) {
      console.log(error.response?.data);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UPDATE QUANTITY
  // =====================================================

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1 || updatingId === id) return;

    try {
      setUpdatingId(id);

      await API.put(
        `/cart/update/${id}`,
        { quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchCart();
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeItem = async (id) => {
    try {
      setUpdatingId(id);

      await API.delete(`/cart/remove/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(decreaseCartCount());

      await fetchCart();
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setUpdatingId(null);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  // =====================================================
  // TOTALS
  // =====================================================

  const total = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
    0,
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-[#f7f7f7] px-3 py-4 sm:px-6 sm:py-7">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5">
              <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-44 animate-pulse rounded bg-slate-200" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
              <div className="space-y-3 lg:col-span-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 animate-pulse rounded-xl bg-white"
                  />
                ))}
              </div>

              <div className="hidden h-72 animate-pulse rounded-xl bg-white lg:block" />
            </div>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f7f7f7] pb-24 lg:pb-8">
        <div className="mx-auto w-full max-w-7xl px-2.5 py-3 sm:px-4 sm:py-5 lg:px-6">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-3 sm:mb-6">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl lg:text-3xl">
              My Cart
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-sm">
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
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-12 text-center shadow-sm sm:rounded-2xl sm:p-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <ShoppingBag size={28} />
              </div>

              <h3 className="text-lg font-semibold text-slate-800 sm:text-xl">
                Your cart is empty
              </h3>

              <p className="mx-auto mt-1 mb-6 max-w-xs text-xs text-slate-400 sm:text-sm">
                Looks like you haven't added anything yet.
              </p>

              <button
                onClick={() => navigate("/products")}
                className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 active:scale-95"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* =================================================
                  MAIN GRID
              ================================================= */}

              <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
                {/* =================================================
                    CART ITEMS
                ================================================= */}

                <div className="min-w-0 space-y-2.5 sm:space-y-3 lg:col-span-2">
                  {cartItems.map((item) => {
                    const product = item.product;
                    const isUpdating = updatingId === item._id;

                    return (
                      <div
                        key={item._id}
                        className="min-w-0 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-4"
                      >
                        <div className="flex min-w-0 gap-2.5 sm:gap-4">
                          {/* PRODUCT IMAGE */}

                          <button
                            onClick={() => navigate(`/product/${product?._id}`)}
                            className="h-[92px] w-[82px] shrink-0 overflow-hidden rounded-lg bg-slate-50 sm:h-28 sm:w-28"
                          >
                            {product?.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.title}
                                className="h-full w-full object-contain p-1.5 transition-transform duration-300 hover:scale-105 sm:p-2"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                                No Image
                              </div>
                            )}
                          </button>

                          {/* PRODUCT CONTENT */}

                          <div className="min-w-0 flex-1">
                            {/* TITLE + DELETE */}

                            <div className="flex min-w-0 items-start justify-between gap-1">
                              <button
                                onClick={() =>
                                  navigate(`/product/${product?._id}`)
                                }
                                className="min-w-0 flex-1 text-left"
                              >
                                <h3 className="line-clamp-2 text-[12px] leading-4 font-semibold text-slate-800 sm:text-base sm:leading-5">
                                  {product?.title}
                                </h3>
                              </button>

                              <button
                                onClick={() => removeItem(item._id)}
                                disabled={isUpdating}
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40 sm:h-8 sm:w-8"
                                title="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* PRICE */}

                            <div className="mt-1">
                              <span className="text-sm font-bold text-slate-900 sm:text-lg">
                                ₹{formatPrice(product?.price)}
                              </span>

                              {product?.mrp &&
                                Number(product.mrp) > Number(product.price) && (
                                  <span className="ml-1.5 text-[10px] text-slate-400 line-through sm:text-xs">
                                    ₹{formatPrice(product.mrp)}
                                  </span>
                                )}
                            </div>

                            {/* MOBILE ACTION ROW */}

                            <div className="mt-3 flex items-center justify-between gap-2">
                              {/* QUANTITY */}

                              <div className="flex h-8 items-center rounded-md border border-slate-200 bg-white sm:h-9">
                                <button
                                  onClick={() =>
                                    updateQuantity(item._id, item.quantity - 1)
                                  }
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-9"
                                >
                                  <Minus size={13} />
                                </button>

                                <span className="flex h-full min-w-7 items-center justify-center border-x border-slate-200 px-1 text-xs font-semibold text-slate-800 sm:min-w-8 sm:text-sm">
                                  {isUpdating ? "..." : item.quantity}
                                </span>

                                <button
                                  onClick={() =>
                                    updateQuantity(item._id, item.quantity + 1)
                                  }
                                  disabled={isUpdating}
                                  className="flex h-full w-8 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:w-9"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              {/* SUBTOTAL */}

                              <div className="text-right">
                                <p className="text-[9px] text-slate-400 sm:text-xs">
                                  Subtotal
                                </p>

                                <p className="text-xs font-bold text-slate-900 sm:text-sm">
                                  ₹
                                  {formatPrice(
                                    Number(product?.price || 0) *
                                      Number(item.quantity || 0),
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* =================================================
                    DESKTOP ORDER SUMMARY
                ================================================= */}

                <div className="hidden h-fit lg:sticky lg:top-20 lg:block">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-5 text-lg font-bold text-slate-900">
                      Order Summary
                    </h2>

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
                          ₹{formatPrice(total)}
                        </span>
                      </div>

                      <div className="flex justify-between text-slate-500">
                        <span>Delivery</span>
                        <span className="font-medium text-emerald-600">
                          Free
                        </span>
                      </div>
                    </div>

                    <div className="my-4 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        Total Amount
                      </span>

                      <span className="text-xl font-extrabold text-slate-900">
                        ₹{formatPrice(total)}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate("/checkout")}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff9f00] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#fb8c00] active:scale-[0.98]"
                    >
                      Proceed To Checkout
                      <ChevronRight size={17} />
                    </button>

                    <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                      <ShieldCheck size={14} />
                      100% secure checkout
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* =====================================================
          MOBILE STICKY CHECKOUT BAR
      ===================================================== */}

      {cartItems.length > 0 && (
        <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-slate-200 bg-white px-3 py-2.5 shadow-[0_-5px_20px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </p>

              <p className="text-base font-extrabold text-slate-900">
                ₹{formatPrice(total)}
              </p>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#ff9f00] px-4 text-sm font-bold text-white active:scale-[0.98]"
            >
              Proceed to Checkout
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
