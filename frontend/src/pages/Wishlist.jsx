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

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>My Wishlist ❤️</h1>

        {items.length === 0 ? (
          <h3>No Wishlist Items</h3>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <h3>
                {item.product?.title}
              </h3>

              <p>
                ₹{item.product?.price}
              </p>

              <button
                onClick={() =>
                  removeWishlist(
                    item.product._id
                  )
                }
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Wishlist;