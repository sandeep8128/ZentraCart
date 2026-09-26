import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";

import { decreaseWishlistCount } from "../redux/slices/cartSlice";

function Wishlist() {
  const { token } = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // ================= FETCH WISHLIST =================
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
    } finally {
      setLoading(false);
    }
  };

  // ================= REMOVE FROM WISHLIST =================
  const removeWishlist = async (productId) => {
    try {
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
    }
  };

  // ================= MOVE TO CART =================
  const moveToCart = async (productId) => {
    try {
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
    }
  };

  // ================= FETCH ON LOAD =================
  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ================= HEADER ================= */}
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-2.5 text-3xl font-bold text-slate-900 sm:text-4xl">
                My Wishlist
                <Heart className="text-red-500" fill="currentColor" size={26} />
              </h1>

              <p className="mt-1 text-sm text-gray-500 sm:text-base">
                Your saved products are waiting for you.
              </p>
            </div>

            {!loading && items.length > 0 && (
              <div className="w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </div>
            )}
          </div>

          {/* ================= LOADING ================= */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="h-56 animate-pulse bg-gray-200 sm:h-64" />

                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />

                    <div className="flex gap-3">
                      <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-200" />
                      <div className="h-11 flex-1 animate-pulse rounded-xl bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* ================= EMPTY WISHLIST ================= */
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="max-w-md">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Heart size={34} className="text-gray-300" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900">
                  No Wishlist Items
                </h3>

                <p className="mt-2 text-gray-500">
                  You haven't added any products to your wishlist yet.
                </p>
              </div>
            </div>
          ) : (
            /* ================= WISHLIST GRID ================= */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                >
                  {/* ================= IMAGE ================= */}
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-50 p-4 sm:h-64">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        className="max-h-full max-w-[90%] object-contain transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-sm text-gray-400">
                        No Image Available
                      </div>
                    )}

                    {/* Category chip */}
                    {item.product?.category && (
                      <span className="absolute top-3 left-3 rounded-full border border-gray-200 bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-gray-600 uppercase shadow-sm">
                        {item.product.category}
                      </span>
                    )}

                    {/* Wishlist Badge */}
                    <button
                      onClick={() => removeWishlist(item.product?._id)}
                      title="Remove from wishlist"
                      className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:bg-red-50"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>

                  {/* ================= CONTENT ================= */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3 className="mb-2 line-clamp-2 min-h-[52px] text-lg font-semibold text-slate-900 transition group-hover:text-indigo-600 sm:text-xl">
                      {item.product?.title || "Product"}
                    </h3>

                    <p className="mb-5 text-2xl font-bold text-slate-900">
                      ₹
                      {Number(item.product?.price ?? 0).toLocaleString("en-IN")}
                    </p>

                    {/* ================= ACTIONS ================= */}
                    <div className="mt-auto grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => moveToCart(item.product?._id)}
                        disabled={!item.product?._id}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                      >
                        <ShoppingCart size={16} />
                        Add To Cart
                      </button>

                      <button
                        onClick={() => removeWishlist(item.product?._id)}
                        disabled={!item.product?._id}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-900 bg-white px-3 py-3 text-sm font-semibold text-slate-900 transition duration-200 hover:border-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Wishlist;
