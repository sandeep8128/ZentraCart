import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";

function Wishlist() {
  const { token } = useSelector(
    (state) => state.auth
  );

  const [items, setItems] = useState([]);

  const fetchWishlist = async () => {
    try {
      const res = await API.get(
        "/wishlist",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setItems(res.data.wishlist);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const removeWishlist = async (
    productId
  ) => {
    try {
      await API.delete(
        `/wishlist/remove/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchWishlist();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const moveToCart = async (
    productId
  ) => {
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
        }
      );

      alert("Added To Cart");
    } catch (error) {
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed To Add Cart"
      );
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">

        <h1 className="text-4xl font-bold text-[#285570] mb-8">
          My Wishlist ❤️
        </h1>

        {items.length === 0 ? (
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
              No Wishlist Items
            </h3>
          </div>
        ) : (
          <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            "
          >
            {items.map((item) => (
              <div
                key={item._id}
                className="
                bg-white
                border
                border-[#CBCAC7]
                rounded-2xl
                overflow-hidden
                shadow-sm
                hover:shadow-lg
                transition
                "
              >
                {item.product?.images?.[0]?.url && (
                  <img
                    src={
                      item.product.images[0].url
                    }
                    alt={
                      item.product.title
                    }
                    className="
                    w-full
                    h-64
                    object-cover
                    "
                  />
                )}

                <div className="p-5">

                  <h3 className="text-xl font-semibold text-[#333333] mb-2">
                    {item.product?.title}
                  </h3>

                  <p className="text-[#285570] text-2xl font-bold mb-4">
                    ₹{item.product?.price}
                  </p>

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        moveToCart(
                          item.product._id
                        )
                      }
                      className="
                      flex-1
                      bg-[#285570]
                      text-white
                      py-3
                      rounded-xl
                      hover:bg-[#1E4257]
                      transition
                      "
                    >
                      Add To Cart
                    </button>

                    <button
                      onClick={() =>
                        removeWishlist(
                          item.product._id
                        )
                      }
                      className="
                      flex-1
                      bg-red-500
                      text-white
                      py-3
                      rounded-xl
                      hover:bg-red-600
                      transition
                      "
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