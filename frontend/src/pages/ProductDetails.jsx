import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

import API from "../services/api";

import Navbar from "../components/Navbar";

import ProductCard from "../components/ProductCard";

import toast from "react-hot-toast";

import {
  ShoppingCart,
  Heart,
  Store,
  Trash2,
  ImagePlus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

import {
  increaseCartCount,
  increaseWishlistCount,
} from "../redux/slices/cartSlice";

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({ children }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div className="h-5 w-1.5 rounded-full bg-slate-900 transition-colors duration-300 group-hover:bg-indigo-600" />

      <h2 className="text-base font-semibold text-slate-900 transition-colors duration-300 hover:text-indigo-600 sm:text-lg">
        {children}
      </h2>
    </div>
  );
}

// =====================================================
// STAR RATING
// =====================================================

function StarRating({ value, size = "text-sm" }) {
  return (
    <span className={`text-amber-500 ${size}`}>
      {"★".repeat(Math.round(value || 0))}
      {"☆".repeat(5 - Math.round(value || 0))}
    </span>
  );
}

// =====================================================
// PRODUCT DETAILS
// =====================================================

function ProductDetails() {
  const { user, token } = useSelector((state) => state.auth);

  const { id } = useParams();

  const dispatch = useDispatch();

  // =====================================================
  // STATES
  // =====================================================

  const [product, setProduct] = useState(null);

  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");

  const [reviewImages, setReviewImages] = useState([]);

  const [zoomStyle, setZoomStyle] = useState({});

  const [activeTab, setActiveTab] = useState("description");

  // =====================================================
  // OPTIONAL DELIVERY LOCATION
  // =====================================================

  const [location, setLocation] = useState(null);

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  const fetchProduct = async () => {
    try {
      let savedLocation = null;

      // =================================================
      // LOAD OPTIONAL LOCATION
      // =================================================

      try {
        const storedLocation = localStorage.getItem("zentraCartLocation");

        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);

          if (
            Number.isFinite(Number(parsedLocation.latitude)) &&
            Number.isFinite(Number(parsedLocation.longitude))
          ) {
            savedLocation = {
              latitude: Number(parsedLocation.latitude),
              longitude: Number(parsedLocation.longitude),
            };

            setLocation(savedLocation);
          }
        }
      } catch (locationError) {
        console.log("LOCATION LOAD ERROR:", locationError);
      }

      // =================================================
      // PRODUCT API URL
      // =================================================

      let productUrl = `/products/${id}`;

      // Location available hai to coordinates send karo
      if (savedLocation) {
        const params = new URLSearchParams();

        params.append("latitude", savedLocation.latitude);

        params.append("longitude", savedLocation.longitude);

        productUrl += `?${params.toString()}`;
      }

      // =================================================
      // FETCH PRODUCT
      // =================================================

      const res = await API.get(productUrl);

      setProduct(res.data.product);

      setRelatedProducts(res.data.relatedProducts || []);

      // =================================================
      // RECENT PRODUCTS
      // =================================================

      let viewed = JSON.parse(localStorage.getItem("recentProducts")) || [];

      viewed = viewed.filter((item) => item._id !== res.data.product._id);

      viewed.unshift(res.data.product);

      viewed = viewed.slice(0, 6);

      localStorage.setItem("recentProducts", JSON.stringify(viewed));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // =====================================================
  // SET FIRST IMAGE
  // =====================================================

  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0].url);
    }
  }, [product]);

  // =====================================================
  // FETCH REVIEWS
  // =====================================================

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${id}`);

      setReviews(res.data.reviews || []);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [id]);

  // =====================================================
  // ADD TO CART
  // =====================================================

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

      toast.success(res.data.message || "Added To Cart Successfully");

      dispatch(increaseCartCount());

      console.log(res.data);
    } catch (error) {
      console.log(error.response?.data);

      toast.error(error.response?.data?.message || "Failed To Add Cart");
    }
  };

  // =====================================================
  // ADD TO WISHLIST
  // =====================================================

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

      toast.error(error.response?.data?.message || "Failed To Add Wishlist");
    }
  };

  // =====================================================
  // ADD REVIEW
  // =====================================================

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

      toast.error(error.response?.data?.message || "Failed To Add Review");
    }
  };

  // =====================================================
  // DELETE REVIEW
  // =====================================================

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

      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!product) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900" />

            <p className="text-sm font-medium text-slate-400">
              Loading product…
            </p>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FAF7F6]">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 sm:py-7 lg:px-6">
          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <div className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-slate-500 sm:text-xs">
            <Link
              to="/"
              className="shrink-0 font-medium transition-colors duration-200 hover:text-indigo-600"
            >
              Home
            </Link>

            <ChevronRight size={13} className="shrink-0" />

            {product.category && (
              <>
                <Link
                  to={`/products?category=${product.category}`}
                  className="max-w-[110px] shrink-0 truncate font-medium transition-colors duration-200 hover:text-indigo-600 sm:max-w-none"
                >
                  {product.category}
                </Link>

                <ChevronRight size={13} className="shrink-0" />
              </>
            )}

            <span className="min-w-0 truncate font-medium text-slate-800">
              {product.title}
            </span>
          </div>

          {/* =================================================
              PRODUCT MAIN SECTION
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.15)] sm:p-6 lg:p-7">
            <div className="grid items-start gap-7 md:grid-cols-2 md:gap-8 lg:gap-12">
              {/* =================================================
                  PRODUCT IMAGE
              ================================================= */}

              <div className="min-w-0">
                {product.images?.[0]?.url && (
                  <div className="flex flex-col">
                    <div className="flex h-[300px] items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 transition duration-300 hover:border-slate-200 sm:h-[400px] md:h-[450px] lg:h-[500px]">
                      <img
                        src={selectedImage || product.images?.[0]?.url}
                        alt={product.title}
                        className="max-h-full w-auto max-w-full object-contain transition-transform duration-100"
                        style={zoomStyle}
                        onMouseMove={(e) => {
                          if (window.innerWidth < 768) {
                            return;
                          }

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

                    {/* THUMBNAILS */}

                    <div className="mt-4 flex gap-2.5 overflow-x-auto pb-1 sm:gap-3">
                      {product.images?.map((img, index) => (
                        <img
                          key={index}
                          src={img.url}
                          alt={`${product.title} ${index + 1}`}
                          onClick={() => setSelectedImage(img.url)}
                          className={`h-16 w-16 shrink-0 cursor-pointer rounded-lg border-2 object-cover transition-all duration-200 sm:h-20 sm:w-20 ${
                            selectedImage === img.url
                              ? "border-slate-900 shadow-md"
                              : "border-slate-200 hover:border-indigo-400"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  PRODUCT INFO
              ================================================= */}

              <div className="min-w-0">
                {/* CATEGORY */}

                {product.category && (
                  <span className="mb-3 inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-slate-700 uppercase transition duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:text-xs">
                    {product.category}
                  </span>
                )}

                {/* TITLE */}

                <h1 className="mb-3 text-2xl leading-tight font-bold text-slate-900 transition-colors duration-300 hover:text-indigo-600 sm:text-3xl lg:text-4xl">
                  {product.title}
                </h1>

                {/* RATING */}

                <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white transition duration-200 hover:bg-indigo-600">
                    {product.rating || 0}

                    <StarRating value={1} size="text-[10px]" />
                  </span>

                  <span className="text-xs text-slate-400 sm:text-sm">
                    {reviews.length} review
                    {reviews.length !== 1 && "s"}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                </div>

                {/* PRICE */}

                <p className="mb-5 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                  <span className="ml-2 text-xs font-normal text-slate-400 sm:text-sm">
                    inclusive of all taxes
                  </span>
                </p>

                {/* SELLER */}

                <p className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 sm:text-sm">
                  <Store
                    size={15}
                    className="text-slate-700 transition-colors hover:text-indigo-600"
                  />

                  <span className="font-medium text-slate-700">Sold by</span>

                  <Link
                    to={`/store/${product.seller?._id}`}
                    className="font-semibold text-slate-900 transition-colors duration-200 hover:text-indigo-600 hover:underline"
                  >
                    {product.seller?.name} Store
                  </Link>
                </p>

                {/* =================================================
                    DELIVERY DISTANCE
                ================================================= */}

                {product.distance !== undefined &&
                  product.distance !== null &&
                  Number.isFinite(Number(product.distance)) && (
                    <div className="mb-6">
                      {Number(product.distance) <= 30 ? (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg">
                            📍
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-emerald-700">
                              Available for Delivery
                            </p>

                            <p className="mt-0.5 text-xs text-emerald-600">
                              Seller is {Number(product.distance).toFixed(1)} KM
                              away and within your 30 KM delivery range.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                            ⚠️
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-amber-700">
                              Outside Delivery Range
                            </p>

                            <p className="mt-0.5 text-xs text-amber-600">
                              Seller is {Number(product.distance).toFixed(1)} KM
                              away. Maximum delivery distance is 30 KM.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleAddToCart}
                    className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98]"
                  >
                    <ShoppingCart size={17} />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleAddToWishlist}
                    className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-900 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:border-indigo-600 hover:bg-indigo-600 hover:text-white active:scale-[0.98] sm:px-6"
                  >
                    <Heart size={17} />
                    Wishlist
                  </button>
                </div>

                {/* TRUST STRIP */}

                <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50 py-4">
                  <div className="group flex flex-col items-center gap-1 px-1 text-center">
                    <Truck
                      size={18}
                      className="text-slate-800 transition-colors duration-200 group-hover:text-indigo-600"
                    />

                    <span className="text-[9px] font-medium text-slate-600 transition-colors group-hover:text-indigo-600 sm:text-[11px]">
                      Free Delivery
                    </span>
                  </div>

                  <div className="group flex flex-col items-center gap-1 px-1 text-center">
                    <RotateCcw
                      size={18}
                      className="text-slate-800 transition-colors duration-200 group-hover:text-indigo-600"
                    />

                    <span className="text-[9px] font-medium text-slate-600 transition-colors group-hover:text-indigo-600 sm:text-[11px]">
                      7-Day Returns
                    </span>
                  </div>

                  <div className="group flex flex-col items-center gap-1 px-1 text-center">
                    <ShieldCheck
                      size={18}
                      className="text-slate-800 transition-colors duration-200 group-hover:text-indigo-600"
                    />

                    <span className="text-[9px] font-medium text-slate-600 transition-colors group-hover:text-indigo-600 sm:text-[11px]">
                      Secure Payment
                    </span>
                  </div>
                </div>

                {/* DESCRIPTION / SPECIFICATIONS */}

                <div className="mt-7 sm:mt-8">
                  <div className="flex gap-5 overflow-x-auto border-b border-slate-200 sm:gap-6">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`shrink-0 border-b-2 pb-3 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                        activeTab === "description"
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      Description
                    </button>

                    {product.features?.length > 0 && (
                      <button
                        onClick={() => setActiveTab("specifications")}
                        className={`shrink-0 border-b-2 pb-3 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                          activeTab === "specifications"
                            ? "border-slate-900 text-slate-900"
                            : "border-transparent text-slate-400 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        Specifications
                      </button>
                    )}
                  </div>

                  <div className="pt-5">
                    {activeTab === "description" && (
                      <p className="text-xs leading-6 whitespace-pre-line text-slate-600 sm:text-sm sm:leading-7">
                        {product.description}
                      </p>
                    )}

                    {activeTab === "specifications" &&
                      product.features?.length > 0 && (
                        <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                          {product.features.map((feature, index) => (
                            <li
                              key={index}
                              className="group flex items-start gap-2 border-b border-slate-100 pb-2 text-xs text-slate-600 sm:text-sm"
                            >
                              <span className="mt-0.5 text-slate-900 transition-colors group-hover:text-indigo-600">
                                ✔
                              </span>

                              <span className="transition-colors group-hover:text-slate-900">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              ADD REVIEW
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.12)] sm:p-6">
            <SectionHeader>Add a Review</SectionHeader>

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-100"
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
              className="mb-3 min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 transition-all outline-none focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

            {/* REVIEW IMAGE UPLOAD */}

            <label className="group mb-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 hover:text-indigo-600 sm:text-sm">
              <ImagePlus
                size={16}
                className="transition-colors group-hover:text-indigo-600"
              />

              <span className="truncate">
                {reviewImages.length > 0
                  ? `${reviewImages.length} image(s) selected`
                  : "Attach photos (optional)"}
              </span>

              <input
                type="file"
                multiple
                onChange={(e) => setReviewImages([...e.target.files])}
                className="hidden"
              />
            </label>

            <button
              onClick={handleAddReview}
              className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98] sm:w-auto"
            >
              Submit Review
            </button>
          </div>

          {/* =================================================
              CUSTOMER REVIEWS
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-300 sm:p-6">
            <SectionHeader>Customer Reviews</SectionHeader>

            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="group rounded-xl border border-slate-100 bg-slate-50 p-3 transition-all duration-300 hover:border-slate-200 hover:bg-white hover:shadow-sm sm:p-4"
                  >
                    {/* USER */}

                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white transition-colors duration-200 group-hover:bg-indigo-600">
                        {review.user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>

                      <h4 className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                        {review.user?.name}
                      </h4>
                    </div>

                    {/* RATING */}

                    <p className="my-2 flex items-center gap-1.5 text-sm">
                      <StarRating value={review.rating} />

                      <span className="text-slate-500">{review.rating}</span>
                    </p>

                    {/* COMMENT */}

                    <p className="text-xs leading-6 text-slate-600 sm:text-sm">
                      {review.comment}
                    </p>

                    {/* REVIEW IMAGES */}

                    {review.images?.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {review.images.map((img, index) => (
                          <img
                            key={index}
                            src={img.url}
                            alt="review"
                            className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover sm:h-20 sm:w-20"
                          />
                        ))}
                      </div>
                    )}

                    {/* DELETE REVIEW */}

                    {user?._id === review.user?._id && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition-all hover:bg-red-50"
                      >
                        <Trash2 size={12} />
                        Delete Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              RELATED PRODUCTS
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-slate-300 sm:p-6">
            <SectionHeader>Related Products</SectionHeader>

            {relatedProducts.length === 0 ? (
              <p className="text-sm text-slate-400">
                No related products found.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
