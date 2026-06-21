import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

import {
  increaseCartCount,
  increaseWishlistCount,
} from "../redux/slices/cartSlice";

function ProductDetails() {
  const { user, token } = useSelector((state) => state.auth);
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [zoomStyle, setZoomStyle] = useState({});
  const dispatch = useDispatch();

  // ==========================
  // FETCH PRODUCT
  // ==========================

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);

      setProduct(res.data.product);

      setRelatedProducts(res.data.relatedProducts || []);

      // Recently Viewed Save

      let viewed = JSON.parse(localStorage.getItem("recentProducts")) || [];

      viewed = viewed.filter((item) => item._id !== res.data.product._id);

      viewed.unshift(res.data.product);

      viewed = viewed.slice(0, 6);

      localStorage.setItem("recentProducts", JSON.stringify(viewed));
    } catch (error) {
      console.log(error.response?.data);
    }
  };
  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0].url);
    }
  }, [product]);

  // ==========================
  // FETCH REVIEWS
  // ==========================

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${id}`);
      setReviews(res.data.reviews);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  // ==========================
  // ADD TO CART
  // ==========================

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
        },
      );

      alert("Added To Cart Successfully");
      dispatch(increaseCartCount());
      console.log(res.data);
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Add Cart");
    }
  };

  // ==========================
  // ADD TO WISHLIST
  // ==========================

  const handleAddToWishlist = async () => {
    try {
      const res = await API.post(
        `/wishlist/add/${product._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      dispatch(increaseWishlistCount());
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Add Wishlist");
    }
  };

  // ==========================
  // ADD REVIEW
  // ==========================

  const handleAddReview = async () => {
    try {
      const formData = new FormData();

      formData.append("rating", rating);
      formData.append("comment", comment);

      reviewImages.forEach((img) => {
        formData.append("images", img);
      });

      const res = await API.post(`/reviews/${product._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message);

      setRating(5);
      setComment("");
      setReviewImages([]);

      fetchReviews();
      fetchProduct();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Add Review");
    }
  };

  // ==========================
  // DELETE REVIEW
  // ==========================

  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await API.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);

      fetchReviews();
      fetchProduct();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Delete Failed");
    }
  };

  if (!product) {
    return <h2>Loading...</h2>;
  }

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl space-y-4 p-6">
        {/* Product Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="grid items-start gap-8 md:grid-cols-2">
            {/* Image */}
            <div>
              {product.images?.[0]?.url && (
                <div className="flex flex-col">
                  <div className="flex items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white p-4">
                    <img
                      src={selectedImage || product.images?.[0]?.url}
                      alt={product.title}
                      className="max-h-[500px] w-auto object-contain transition-transform duration-100"
                      style={zoomStyle}
                      onMouseMove={(e) => {
                        const { left, top, width, height } =
                          e.currentTarget.getBoundingClientRect();

                        const x = ((e.clientX - left) / width) * 100;
                        const y = ((e.clientY - top) / height) * 100;

                        setZoomStyle({
                          transform: "scale(2)",
                          transformOrigin: `${x}% ${y}%`,
                        });
                      }}
                      onMouseLeave={() => {
                        setZoomStyle({
                          transform: "scale(1)",
                        });
                      }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {product.images?.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt=""
                        onClick={() => setSelectedImage(img.url)}
                        className="h-20 w-20 cursor-pointer rounded-lg border-2 border-gray-200 object-cover hover:border-[#285570]"
                      />
                    ))}
                  </div>
                  {/* Key Features */}
                  {product.features?.length > 0 && (
                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-[#285570]">
                        ✨ Key Features
                      </h3>

                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-700"
                          >
                            <span className="text-green-600">✔</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="mb-3 text-2xl font-medium text-gray-900">
                {product.title}
              </h1>

            

              <p className="mb-5 text-3xl font-medium text-[#1a2332]">
                ₹{product.price}
              </p>

              <p className="mb-2 text-sm text-gray-500">
                <span className="font-medium text-gray-800">Seller:</span>{" "}
                <Link
                  to={`/store/${product.seller?._id}`}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {product.seller?.name} Store
                </Link>
              </p>

              <p className="mb-6 text-sm text-gray-500">
                <span className="font-medium text-gray-800">Rating:</span>{" "}
                <span className="text-amber-500">
                  {"★".repeat(Math.round(product.rating))}
                  {"☆".repeat(5 - Math.round(product.rating))}
                </span>{" "}
                {product.rating}
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 rounded-lg bg-[#1a2332] px-5 py-2.5 text-sm text-white transition hover:bg-[#253347]"
                >
                  Add to Cart
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-5 py-2.5 text-sm text-[#1a2332] transition hover:bg-gray-200"
                >
                  ❤️ Wishlist
                </button>
              </div>

                <div className=" mt-8 mb-5 " >
                <h3 className=" mt-10 mb-3 text-lg font-semibold text-gray-900">
                  Product Description
                </h3>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm leading-7 whitespace-pre-line text-gray-600">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Review */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-amber-400" />
            <h2 className="text-base font-medium text-gray-900">
              Add a Review
            </h2>
          </div>

          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-[#1a2332] focus:outline-none"
          >
            <option value="5">⭐⭐⭐⭐⭐ — 5 Stars</option>
            <option value="4">⭐⭐⭐⭐ — 4 Stars</option>
            <option value="3">⭐⭐⭐ — 3 Stars</option>
            <option value="2">⭐⭐ — 2 Stars</option>
            <option value="1">⭐ — 1 Star</option>
          </select>

          <textarea
            placeholder="Share your experience with this product…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-3 min-h-[100px] w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-[#1a2332] focus:outline-none"
          />
          <input
            type="file"
            multiple
            onChange={(e) => setReviewImages([...e.target.files])}
            className="mb-3 w-full rounded-lg border border-gray-200 p-2"
          />

          <button
            onClick={handleAddReview}
            className="flex items-center gap-2 rounded-lg bg-[#1a2332] px-5 py-2.5 text-sm text-white transition hover:bg-[#253347]"
          >
            Submit Review
          </button>
        </div>

        {/* Reviews */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-amber-400" />
            <h2 className="text-base font-medium text-gray-900">
              Customer Reviews
            </h2>
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((review) => (
              <div
                key={review._id}
                className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <h4 className="text-sm font-medium text-gray-900">
                  {review.user?.name}
                </h4>

                <p className="my-1 text-sm text-amber-500">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}{" "}
                  <span className="text-gray-500">{review.rating}</span>
                </p>

                <p className="text-sm text-gray-600">{review.comment}</p>

                {review.images?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((img, index) => (
                      <img
                        key={index}
                        src={img.url}
                        alt="review"
                        className="h-20 w-20 rounded-lg border object-cover"
                      />
                    ))}
                  </div>
                )}

                {user?._id === review.user?._id && (
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="mt-3 rounded-md border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
                  >
                    Delete Review
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Related Products */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-5 w-1 rounded-full bg-amber-400" />
            <h2 className="text-base font-medium text-gray-900">
              Related Products
            </h2>
          </div>

          {relatedProducts.length === 0 ? (
            <p className="text-sm text-gray-400">No related products found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
