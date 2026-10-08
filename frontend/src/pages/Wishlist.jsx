import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import API from "../services/api";
import Navbar from "../components/Navbar";

import { Heart, ShoppingCart, Trash2, Star, ChevronRight } from "lucide-react";

import { decreaseWishlistCount } from "../redux/slices/cartSlice";

function Wishlist() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  // =====================================================
  // FETCH WISHLIST
  // =====================================================

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const res = await API.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data.wishlist || []);
    } catch (error) {
      console.log(error.response?.data);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REMOVE FROM WISHLIST
  // =====================================================

  const removeWishlist = async (productId) => {
    if (!productId || actionId === productId) return;

    try {
      setActionId(productId);

      await API.delete(`/wishlist/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(decreaseWishlistCount());

      await fetchWishlist();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Remove From Wishlist");
    } finally {
      setActionId(null);
    }
  };

  // =====================================================
  // MOVE TO CART
  // =====================================================

  const moveToCart = async (productId) => {
    if (!productId || actionId === productId) return;

    try {
      setActionId(productId);

      await API.post(
        "/cart/add",
        {
          product: productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert("Added To Cart");
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Add Cart");
    } finally {
      setActionId(null);
    }
  };

  // =====================================================
  // FETCH ON LOAD
  // =====================================================

  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token]);

  // =====================================================
  // PRICE FORMAT
  // =====================================================

  const formatPrice = (price) => Number(price || 0).toLocaleString("en-IN");

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#f7f7f7] px-2.5 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-7xl">
            {/* Header skeleton */}

            <div className="mb-4">
              <div className="h-7 w-36 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-4 w-52 animate-pulse rounded bg-slate-200" />
            </div>

            {/* 2-column mobile skeleton */}

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-[3/4] animate-pulse bg-slate-200" />

                  <div className="space-y-2 p-2.5 sm:p-4">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />

                    <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />

                    <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />

                    <div className="h-9 animate-pulse rounded-lg bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f7f7] px-2.5 py-3 pb-8 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-4 flex items-center justify-between gap-2 sm:mb-7">
            <div className="min-w-0">
              <h1 className="flex items-center gap-1.5 text-xl font-bold text-slate-900 sm:gap-2.5 sm:text-3xl">
                My Wishlist
                <Heart
                  className="shrink-0 text-red-500"
                  fill="currentColor"
                  size={20}
                />
              </h1>

              <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-sm">
                Your saved products are waiting for you.
              </p>
            </div>

            {!loading && items.length > 0 && (
              <div className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white sm:px-4 sm:py-2 sm:text-sm">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </div>
            )}
          </div>

          {/* =================================================
              EMPTY WISHLIST
          ================================================= */}

          {items.length === 0 ? (
            <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:min-h-[420px] sm:rounded-2xl sm:p-8">
              <div className="max-w-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 sm:mb-5 sm:h-20 sm:w-20">
                  <Heart
                    size={28}
                    className="text-slate-300 sm:h-[34px] sm:w-[34px]"
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-900 sm:text-2xl">
                  No Wishlist Items
                </h3>

                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  You haven't added any products to your wishlist yet.
                </p>

                <button
                  onClick={() => (window.location.href = "/products")}
                  className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-600 active:scale-95 sm:text-sm"
                >
                  Explore Products
                </button>
              </div>
            </div>
          ) : (
            /* =================================================
               WISHLIST GRID
            ================================================= */

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => {
                const product = item.product;
                const productId = product?._id;
                const isAction = actionId === productId;

                const price = Number(product?.price || 0);
                const mrp = Number(product?.mrp || 0);

                const discount =
                  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

                return (
                  <div
                    key={item._id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:rounded-2xl"
                  >
                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-white sm:aspect-[4/4.5]">
                      {product?.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title || "Product"}
                          className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105 sm:p-4"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-400 sm:text-sm">
                          No Image
                        </div>
                      )}

                      {/* DISCOUNT */}

                      {discount > 0 && (
                        <span className="absolute top-1.5 left-1.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[8px] font-bold text-white sm:top-3 sm:left-3 sm:px-2 sm:py-1 sm:text-[10px]">
                          {discount}% OFF
                        </span>
                      )}

                      {/* CATEGORY */}

                      {product?.category && (
                        <span className="absolute bottom-1.5 left-1.5 max-w-[65%] truncate rounded bg-white/95 px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 shadow-sm sm:bottom-3 sm:left-3 sm:px-2 sm:py-1 sm:text-[10px]">
                          {product.category}
                        </span>
                      )}

                      {/* REMOVE WISHLIST */}

                      <button
                        onClick={() => removeWishlist(productId)}
                        disabled={!productId || isAction}
                        title="Remove from wishlist"
                        className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-50 active:scale-90 disabled:opacity-40 sm:top-3 sm:right-3 sm:h-9 sm:w-9"
                      >
                        <Heart
                          size={13}
                          fill="currentColor"
                          className="sm:h-4 sm:w-4"
                        />
                      </button>
                    </div>

                    {/* =================================================
                        PRODUCT CONTENT
                    ================================================= */}

                    <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-4">
                      {/* TITLE */}

                      <h3 className="line-clamp-2 min-h-[32px] text-[11px] leading-4 font-semibold text-slate-800 transition group-hover:text-indigo-600 sm:min-h-[44px] sm:text-sm sm:leading-5 lg:text-base">
                        {product?.title || "Product"}
                      </h3>

                      {/* RATING */}

                      {product?.rating !== undefined && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="flex items-center gap-0.5 rounded bg-emerald-600 px-1 py-0.5 text-[8px] font-bold text-white sm:text-[10px]">
                            {Number(product.rating).toFixed(1)}
                            <Star
                              size={8}
                              fill="currentColor"
                              className="sm:h-[9px] sm:w-[9px]"
                            />
                          </span>

                          {product?.numReviews !== undefined && (
                            <span className="text-[8px] text-slate-400 sm:text-[10px]">
                              ({product.numReviews})
                            </span>
                          )}
                        </div>
                      )}

                      {/* PRICE */}

                      <div className="mt-1.5 flex flex-wrap items-center gap-1 sm:mt-2 sm:gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900 sm:text-lg">
                          ₹{formatPrice(price)}
                        </span>

                        {mrp > price && (
                          <>
                            <span className="text-[9px] text-slate-400 line-through sm:text-xs">
                              ₹{formatPrice(mrp)}
                            </span>

                            <span className="text-[8px] font-semibold text-emerald-600 sm:text-[10px]">
                              {discount}% off
                            </span>
                          </>
                        )}
                      </div>

                      {/* FREE DELIVERY */}

                      <p className="mt-1 text-[8px] font-medium text-emerald-600 sm:text-[10px]">
                        Free Delivery
                      </p>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:mt-4 sm:grid-cols-2 sm:gap-2.5">
                        <button
                          onClick={() => moveToCart(productId)}
                          disabled={!productId || isAction}
                          className="flex min-h-8 items-center justify-center gap-1 rounded-lg bg-[#ff9f00] px-1.5 text-[9px] font-bold text-white transition hover:bg-[#fb8c00] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-10 sm:gap-1.5 sm:rounded-xl sm:px-2 sm:text-xs"
                        >
                          <ShoppingCart size={12} className="sm:h-4 sm:w-4" />

                          <span>
                            {isAction ? "Please wait..." : "Add To Cart"}
                          </span>
                        </button>

                        <button
                          onClick={() => removeWishlist(productId)}
                          disabled={!productId || isAction}
                          className="hidden min-h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-1.5 text-[9px] font-semibold text-slate-700 transition hover:border-red-500 hover:bg-red-500 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:flex sm:min-h-10 sm:gap-1.5 sm:rounded-xl sm:px-2 sm:text-xs"
                        >
                          <Trash2 size={13} className="sm:h-4 sm:w-4" />
                          Remove
                        </button>
                      </div>

                      {/* MOBILE REMOVE */}

                      <button
                        onClick={() => removeWishlist(productId)}
                        disabled={!productId || isAction}
                        className="mt-1.5 flex items-center justify-center gap-1 py-1 text-[9px] font-medium text-slate-400 hover:text-red-500 sm:hidden"
                      >
                        <Trash2 size={10} />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Wishlist;
