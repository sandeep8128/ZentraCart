import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import { useDispatch } from "react-redux";

import { decreaseWishlistCount } from "../redux/slices/cartSlice";

function Wishlist() {
  const { token } = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  const dispatch = useDispatch();

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(res.data.wishlist);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const removeWishlist = async (productId) => {
    try {
      await API.delete(`/wishlist/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(decreaseWishlistCount());

      fetchWishlist();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

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

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-8 text-4xl font-bold text-[#285570]">
          My Wishlist ❤️
        </h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#CBCAC7] bg-white p-10 text-center">
            <h3 className="text-2xl text-gray-500">No Wishlist Items</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-2xl border border-[#CBCAC7] bg-white shadow-sm transition hover:shadow-lg"
              >
                {item.product?.images?.[0]?.url && (
                  <img
                    src={item.product.images[0].url}
                    alt={item.product.title}
                    className="h-64 w-full object-contain"
                  />
                )}

                <div className="p-5">
                  <h3 className="mb-2 text-xl font-semibold text-[#333333]">
                    {item.product?.title}
                  </h3>

                  <p className="mb-4 text-2xl font-bold text-[#285570]">
                    ₹{item.product?.price}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => moveToCart(item.product._id)}
                      className="flex-1 rounded-xl bg-[#285570] py-3 text-white transition hover:bg-[#1E4257]"
                    >
                      Add To Cart
                    </button>

                    <button
                      onClick={() => removeWishlist(item.product._id)}
                      className="flex-1 rounded-xl bg-red-500 py-3 text-white transition hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Wishlist;
