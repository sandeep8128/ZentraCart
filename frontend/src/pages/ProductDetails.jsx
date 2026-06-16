import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();

  const [product, setProduct] = useState(null);

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);

      setProduct(res.data.product);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const res = await API.post(
        "/cart/add",
        {
          product: product._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);

      alert("Added To Cart Successfully");
    } catch (error) {
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed To Add Cart"
      );
    }
  };

  const handleAddToWishlist = async () => {
    try {
      const res = await API.post(
        `/wishlist/add/${product._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);

      alert(res.data.message);
    } catch (error) {
      console.log(error.response?.data);

      alert(
        error.response?.data?.message ||
          "Failed To Add Wishlist"
      );
    }
  };

  if (!product) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>{product.title}</h1>

        <p>{product.description}</p>

        <h2>₹{product.price}</h2>

        <p>
          Seller: {product.seller?.name}
        </p>

        <button onClick={handleAddToCart}>
          Add To Cart
        </button>

        <br />
        <br />

        <button onClick={handleAddToWishlist}>
          ❤️ Add To Wishlist
        </button>
      </div>
    </>
  );
}

export default ProductDetails;