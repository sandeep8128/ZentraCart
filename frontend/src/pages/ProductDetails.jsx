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
  MapPin,
  Minus,
  Plus,
} from "lucide-react";

import {
  increaseCartCount,
  increaseWishlistCount,
} from "../redux/slices/cartSlice";

// =====================================================
// HELPERS
// =====================================================

const getImageUrl = (image) => {
  if (!image) return "";

  if (typeof image === "string") {
    return image;
  }

  return image.url || image.secure_url || image.path || "";
};

const formatINR = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "₹0";
  }

  return `₹${number.toLocaleString("en-IN")}`;
};

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({ children }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div className="h-5 w-1.5 rounded-full bg-slate-900" />

      <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
        {children}
      </h2>
    </div>
  );
}

// =====================================================
// STAR RATING
// =====================================================

function StarRating({ value, size = "text-sm" }) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));

  return (
    <span className={`text-amber-500 ${size}`}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
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

  const [location, setLocation] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [addingCart, setAddingCart] = useState(false);

  const [addingWishlist, setAddingWishlist] = useState(false);

  const [submittingReview, setSubmittingReview] = useState(false);

  // =====================================================
  // FETCH PRODUCT
  // =====================================================

  const fetchProduct = async () => {
    try {
      let savedLocation = null;

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

      let productUrl = `/products/${id}`;

      if (savedLocation) {
        const params = new URLSearchParams();

        params.append("latitude", savedLocation.latitude);

        params.append("longitude", savedLocation.longitude);

        productUrl += `?${params.toString()}`;
      }

      const res = await API.get(productUrl);

      const fetchedProduct = res.data?.product;

      setProduct(fetchedProduct);

      setRelatedProducts(res.data?.relatedProducts || []);

      if (fetchedProduct?.images?.length > 0) {
        setSelectedImage(getImageUrl(fetchedProduct.images[0]));
      }

      // =================================================
      // RECENT PRODUCTS
      // =================================================

      try {
        let viewed = JSON.parse(localStorage.getItem("recentProducts")) || [];

        viewed = viewed.filter((item) => item._id !== fetchedProduct?._id);

        if (fetchedProduct) {
          viewed.unshift(fetchedProduct);
        }

        viewed = viewed.slice(0, 6);

        localStorage.setItem("recentProducts", JSON.stringify(viewed));
      } catch (recentError) {
        console.log("RECENT PRODUCTS ERROR:", recentError);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Failed to load product");
    }
  };

  // =====================================================
  // FETCH REVIEWS
  // =====================================================

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${id}`);

      setReviews(res.data?.reviews || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchProduct();
    fetchReviews();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =====================================================
  // LOCATION CHANGE
  // =====================================================

  useEffect(() => {
    const handleLocationChanged = () => {
      try {
        const stored = localStorage.getItem("zentraCartLocation");

        if (!stored) {
          setLocation(null);
          return;
        }

        const parsed = JSON.parse(stored);

        if (
          Number.isFinite(Number(parsed.latitude)) &&
          Number.isFinite(Number(parsed.longitude))
        ) {
          setLocation({
            latitude: Number(parsed.latitude),
            longitude: Number(parsed.longitude),
          });

          fetchProduct();
        }
      } catch (error) {
        console.log("LOCATION UPDATE ERROR:", error);
      }
    };

    window.addEventListener("zentraCartLocationChanged", handleLocationChanged);

    return () => {
      window.removeEventListener(
        "zentraCartLocationChanged",
        handleLocationChanged,
      );
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = async () => {
    if (!token) {
      toast.error("Please login to add products to cart.");
      return;
    }

    if (!product?._id) {
      return;
    }

    try {
      setAddingCart(true);

      const res = await API.post(
        "/cart/add",
        {
          product: product._id,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data?.message || "Added To Cart Successfully");

      dispatch(increaseCartCount());
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Failed To Add Cart");
    } finally {
      setAddingCart(false);
    }
  };

  // =====================================================
  // ADD TO WISHLIST
  // =====================================================

  const handleAddToWishlist = async () => {
    if (!token) {
      toast.error("Please login to add products to wishlist.");
      return;
    }

    if (!product?._id) {
      return;
    }

    try {
      setAddingWishlist(true);

      const res = await API.post(
        `/wishlist/add/${product._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data?.message || "Added To Wishlist");

      dispatch(increaseWishlistCount());
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Failed To Add Wishlist");
    } finally {
      setAddingWishlist(false);
    }
  };

  // =====================================================
  // ADD REVIEW
  // =====================================================

  const handleAddReview = async () => {
    if (!token) {
      toast.error("Please login to submit a review.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write your review.");
      return;
    }

    try {
      setSubmittingReview(true);

      const formData = new FormData();

      formData.append("rating", rating);

      formData.append("comment", comment.trim());

      reviewImages.forEach((image) => {
        formData.append("images", image);
      });

      const res = await API.post(`/reviews/${product._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data?.message || "Review Added Successfully");

      setRating(5);
      setComment("");
      setReviewImages([]);

      await fetchReviews();
      await fetchProduct();
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Failed To Add Review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // =====================================================
  // DELETE REVIEW
  // =====================================================

  const handleDeleteReview = async (reviewId) => {
    if (!token) {
      return;
    }

    try {
      const res = await API.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data?.message || "Review Deleted");

      await fetchReviews();
      await fetchProduct();
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  // =====================================================
  // IMAGE ZOOM
  // =====================================================

  const handleImageMove = (event) => {
    if (window.innerWidth < 768) {
      return;
    }

    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - left) / width) * 100;

    const y = ((event.clientY - top) / height) * 100;

    setZoomStyle({
      transform: "scale(2)",
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleImageLeave = () => {
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "center",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (!product) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center bg-[#FAF7F6] px-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900" />

            <p className="text-sm font-medium text-slate-400">
              Loading product…
            </p>
          </div>
        </div>
      </>
    );
  }

  // =====================================================
  // PRODUCT DATA
  // =====================================================

  const images = product.images?.length > 0 ? product.images : [];

  const currentImage = selectedImage || getImageUrl(images[0]);

  const price = Number(product.price || 0);

  const mrp = Number(product.mrp || product.originalPrice || 0);

  const hasDiscount = mrp > price && price > 0;

  const discount = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const distance = Number(product.distance);

  const hasDistance =
    product.distance !== undefined &&
    product.distance !== null &&
    Number.isFinite(distance);

  const withinDelivery = hasDistance && distance <= 30;

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <>
      <Navbar />

      <div className="min-h-screen overflow-x-hidden bg-[#FAF7F6]">
        <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-7 lg:px-6">
          {/* =================================================
              BREADCRUMB
          ================================================= */}

          <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-[10px] whitespace-nowrap text-slate-500 sm:text-xs">
            <Link to="/" className="shrink-0 font-medium hover:text-indigo-600">
              Home
            </Link>

            <ChevronRight size={12} className="shrink-0" />

            {product.category && (
              <>
                <Link
                  to={`/products?category=${encodeURIComponent(
                    product.category,
                  )}`}
                  className="max-w-[100px] shrink-0 truncate font-medium hover:text-indigo-600 sm:max-w-none"
                >
                  {product.category}
                </Link>

                <ChevronRight size={12} className="shrink-0" />
              </>
            )}

            <span className="min-w-0 truncate font-medium text-slate-800">
              {product.title}
            </span>
          </div>

          {/* =================================================
              PRODUCT MAIN CARD
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid items-start lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              {/* =================================================
                  IMAGE SECTION
              ================================================= */}

              <div className="min-w-0 border-b border-slate-100 p-3 sm:p-5 lg:border-r lg:border-b-0 lg:p-7">
                {currentImage ? (
                  <>
                    <div className="relative flex aspect-square max-h-[600px] items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-6">
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs">
                          {discount}% OFF
                        </span>
                      )}

                      <img
                        src={currentImage}
                        alt={product.title}
                        className="h-full w-full object-contain transition-transform duration-150"
                        style={zoomStyle}
                        onMouseMove={handleImageMove}
                        onMouseLeave={handleImageLeave}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    {/* THUMBNAILS */}

                    {images.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4 sm:gap-3">
                        {images.map((image, index) => {
                          const url = getImageUrl(image);

                          return (
                            <button
                              type="button"
                              key={`${url}-${index}`}
                              onClick={() => setSelectedImage(url)}
                              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition sm:h-20 sm:w-20 sm:rounded-xl ${
                                selectedImage === url
                                  ? "border-slate-900 shadow-md"
                                  : "border-slate-200 hover:border-indigo-400"
                              }`}
                            >
                              <img
                                src={url}
                                alt={`${product.title} ${index + 1}`}
                                className="h-full w-full object-contain"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-2xl bg-slate-50 text-5xl text-slate-300">
                    🛍️
                  </div>
                )}
              </div>

              {/* =================================================
                  PRODUCT INFORMATION
              ================================================= */}

              <div className="min-w-0 p-4 sm:p-6 lg:p-8">
                {/* CATEGORY */}

                {product.category && (
                  <span className="mb-2 inline-block rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-semibold tracking-wide text-slate-600 uppercase sm:mb-3 sm:px-3 sm:text-xs">
                    {product.category}
                  </span>
                )}

                {/* TITLE */}

                <h1 className="text-xl leading-tight font-bold text-slate-900 sm:text-3xl lg:text-4xl">
                  {product.title}
                </h1>

                {/* RATING */}

                <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4 sm:gap-3">
                  <span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-1 text-[10px] font-bold text-white sm:text-xs">
                    {Number(product.rating || 0).toFixed(1)}

                    <span>★</span>
                  </span>

                  <span className="text-[11px] text-slate-400 sm:text-sm">
                    {reviews.length} review
                    {reviews.length !== 1 && "s"}
                  </span>

                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 sm:text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                </div>

                <div className="my-4 h-px bg-slate-100 sm:my-5" />

                {/* PRICE */}

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    {formatINR(price)}
                  </span>

                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through sm:text-base">
                      {formatINR(mrp)}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="text-xs font-bold text-green-600 sm:text-sm">
                      {discount}% off
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  Inclusive of all taxes
                </p>

                {/* SELLER */}

                <div className="mt-5 flex min-w-0 items-center gap-2 text-xs text-slate-500 sm:mt-6 sm:text-sm">
                  <Store size={16} className="shrink-0 text-slate-700" />

                  <span className="shrink-0 font-medium text-slate-700">
                    Sold by
                  </span>

                  <Link
                    to={`/store/${product.seller?._id}`}
                    className="min-w-0 truncate font-semibold text-slate-900 hover:text-indigo-600 hover:underline"
                  >
                    {product.seller?.name || "Seller"} Store
                  </Link>
                </div>

                {/* =================================================
                    DELIVERY
                ================================================= */}

                <div className="mt-5">
                  {hasDistance ? (
                    withinDelivery ? (
                      <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 sm:p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                          <MapPin size={17} className="text-emerald-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-700 sm:text-sm">
                            Available for Delivery
                          </p>

                          <p className="mt-0.5 text-[10px] leading-5 text-emerald-600 sm:text-xs">
                            Seller is {distance.toFixed(1)} KM away and within
                            your 30 KM delivery range.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                          ⚠️
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-amber-700 sm:text-sm">
                            Outside Delivery Range
                          </p>

                          <p className="mt-0.5 text-[10px] leading-5 text-amber-600 sm:text-xs">
                            Seller is {distance.toFixed(1)} KM away. Maximum
                            delivery distance is 30 KM.
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                        📍
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-700 sm:text-sm">
                          Delivery available
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                          Location is optional. Normal shopping and ordering is
                          available.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* =================================================
                    QUANTITY
                ================================================= */}

                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold text-slate-700 sm:text-sm">
                    Quantity
                  </p>

                  <div className="flex h-10 w-fit items-center overflow-hidden rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) => Math.max(1, value - 1))
                      }
                      className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      <Minus size={14} />
                    </button>

                    <span className="flex h-full min-w-10 items-center justify-center border-x border-slate-200 text-sm font-semibold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((value) => Math.min(10, value + 1))
                      }
                      className="flex h-full w-10 items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:flex sm:gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={addingCart}
                    className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1 sm:text-sm"
                  >
                    <ShoppingCart size={16} />

                    {addingCart ? "Adding..." : "Add to Cart"}
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToWishlist}
                    disabled={addingWishlist}
                    className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-900 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900 transition hover:border-indigo-600 hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1 sm:text-sm"
                  >
                    <Heart size={16} />

                    {addingWishlist ? "Adding..." : "Wishlist"}
                  </button>
                </div>

                {/* =================================================
                    TRUST STRIP
                ================================================= */}

                <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-100 bg-slate-50 py-3 sm:mt-6 sm:py-4">
                  <div className="flex flex-col items-center gap-1 px-1 text-center">
                    <Truck size={17} className="text-slate-700" />

                    <span className="text-[8px] font-medium text-slate-600 sm:text-[11px]">
                      Free Delivery
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 px-1 text-center">
                    <RotateCcw size={17} className="text-slate-700" />

                    <span className="text-[8px] font-medium text-slate-600 sm:text-[11px]">
                      7-Day Returns
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 px-1 text-center">
                    <ShieldCheck size={17} className="text-slate-700" />

                    <span className="text-[8px] font-medium text-slate-600 sm:text-[11px]">
                      Secure Payment
                    </span>
                  </div>
                </div>

                {/* =================================================
                    DESCRIPTION / SPECIFICATIONS
                ================================================= */}

                <div className="mt-7">
                  <div className="flex gap-5 overflow-x-auto border-b border-slate-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab("description")}
                      className={`shrink-0 border-b-2 pb-3 text-xs font-semibold sm:text-sm ${
                        activeTab === "description"
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-400"
                      }`}
                    >
                      Description
                    </button>

                    {product.features?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("specifications")}
                        className={`shrink-0 border-b-2 pb-3 text-xs font-semibold sm:text-sm ${
                          activeTab === "specifications"
                            ? "border-slate-900 text-slate-900"
                            : "border-transparent text-slate-400"
                        }`}
                      >
                        Specifications
                      </button>
                    )}
                  </div>

                  <div className="pt-4">
                    {activeTab === "description" && (
                      <p className="text-xs leading-6 whitespace-pre-line text-slate-600 sm:text-sm sm:leading-7">
                        {product.description || "No description available."}
                      </p>
                    )}

                    {activeTab === "specifications" &&
                      product.features?.length > 0 && (
                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {product.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 border-b border-slate-100 pb-2 text-xs text-slate-600 sm:text-sm"
                            >
                              <span className="text-green-600">✔</span>

                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              ADD REVIEW
          ===================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader>Add a Review</SectionHeader>

            {!token ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Please login to submit a review.
                </p>
              </div>
            ) : (
              <>
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white sm:max-w-xs"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ — 5 Stars</option>
                  <option value={4}>⭐⭐⭐⭐ — 4 Stars</option>
                  <option value={3}>⭐⭐⭐ — 3 Stars</option>
                  <option value={2}>⭐⭐ — 2 Stars</option>
                  <option value={1}>⭐ — 1 Star</option>
                </select>

                <textarea
                  placeholder="Share your experience with this product…"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="mb-3 min-h-[110px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-900 focus:bg-white"
                />

                <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500 hover:border-indigo-400 sm:text-sm">
                  <ImagePlus size={16} />

                  <span className="truncate">
                    {reviewImages.length > 0
                      ? `${reviewImages.length} image(s) selected`
                      : "Attach photos (optional)"}
                  </span>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(event) =>
                      setReviewImages(Array.from(event.target.files || []))
                    }
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAddReview}
                  disabled={submittingReview}
                  className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-60 sm:w-auto"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </>
            )}
          </div>

          {/* =====================================================
              CUSTOMER REVIEWS
          ===================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
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
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                        {review.user?.name?.charAt(0).toUpperCase() || "U"}
                      </span>

                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-slate-800">
                          {review.user?.name || "User"}
                        </h4>

                        <div className="flex items-center gap-1">
                          <StarRating value={review.rating} size="text-xs" />

                          <span className="text-xs text-slate-500">
                            {review.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-6 text-slate-600 sm:text-sm">
                      {review.comment}
                    </p>

                    {review.images?.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={getImageUrl(image)}
                            alt="Review"
                            className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 object-cover sm:h-20 sm:w-20"
                          />
                        ))}
                      </div>
                    )}

                    {user?._id === review.user?._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review._id)}
                        className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
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

          {/* =====================================================
              RELATED PRODUCTS
          ===================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <SectionHeader>Related Products</SectionHeader>

            {relatedProducts.length === 0 ? (
              <p className="text-sm text-slate-400">
                No related products found.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
                {relatedProducts.map((item) => (
                  <div key={item._id} className="min-w-0 overflow-hidden">
                    <ProductCard
                      product={item}
                      showNearby={Boolean(location)}
                      radiusKm={30}
                    />
                  </div>
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
