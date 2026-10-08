import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

import {
  ShieldCheck,
  Truck,
  RefreshCw,
  ImageOff,
  Loader2,
  Tag,
  CheckCircle2,
  MapPin,
  CreditCard,
  Navigation,
  AlertTriangle,
  ShoppingBag,
  ChevronLeft,
} from "lucide-react";

function Checkout() {
  const { token } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const location = useLocation();

  // =====================================================
  // BUY NOW DATA
  // =====================================================

  /*
    Normal Cart:
      /checkout

    Buy Now:
      /checkout
      state = {
        buyNow: {
          product: {...},
          quantity: 1
        }
      }
  */

  const buyNowData = location.state?.buyNow || null;

  const isBuyNow = Boolean(buyNowData?.product?._id || buyNowData?.product?.id);

  // =====================================================
  // CART ITEMS
  // =====================================================

  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // =====================================================
  // COUPON
  // =====================================================

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // =====================================================
  // ADDRESS FORM
  // =====================================================

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  // =====================================================
  // LOCATION
  // =====================================================

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationReady, setLocationReady] = useState(false);

  // =====================================================
  // SAVED ADDRESSES
  // =====================================================

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  // =====================================================
  // DELIVERY WARNING
  // =====================================================

  const [deliveryWarning, setDeliveryWarning] = useState("");

  // =====================================================
  // AUTH CONFIG
  // =====================================================

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart", authConfig);

      setCartItems(res.data.cart || []);
    } catch (error) {
      console.log("CART ERROR:", error.response?.data);

      toast.error(error.response?.data?.message || "Failed to load cart");

      setCartItems([]);
    }
  };

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/address/my-addresses", authConfig);

      const savedAddresses = res.data.addresses || [];

      setAddresses(savedAddresses);

      if (!selectedAddress && savedAddresses.length > 0) {
        setSelectedAddress(savedAddresses[0]._id);
      }
    } catch (error) {
      console.log("ADDRESS FETCH ERROR:", error.response?.data);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!token) return;

    const loadCheckout = async () => {
      try {
        setPageLoading(true);

        /*
          IMPORTANT:

          Buy Now mode:
          ----------------
          Do NOT fetch cart for products.

          Normal mode:
          ----------------
          Fetch cart normally.
        */

        if (!isBuyNow) {
          await fetchCart();
        }

        await fetchAddresses();
      } finally {
        setPageLoading(false);
      }
    };

    loadCheckout();
  }, [token, isBuyNow]);

  // =====================================================
  // CHECKOUT ITEMS
  // =====================================================

  const checkoutItems = useMemo(() => {
    if (isBuyNow && buyNowData?.product) {
      return [
        {
          _id: "buy-now-item",
          product: buyNowData.product,
          quantity: Math.max(1, Number(buyNowData.quantity || 1)),
        },
      ];
    }

    return cartItems;
  }, [isBuyNow, buyNowData, cartItems]);

  // =====================================================
  // TOTAL
  // =====================================================

  const total = checkoutItems.reduce(
    (sum, item) =>
      sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
    0,
  );

  const totalQuantity = checkoutItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  const shipping = total > 999 ? 0 : 49;

  const finalTotal = total + shipping;

  // =====================================================
  // CURRENT LOCATION
  // =====================================================

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lng);

        setLocationReady(true);
        setLocationLoading(false);

        toast.success("Current location detected successfully.");
      },

      (error) => {
        console.log("LOCATION ERROR:", error);

        setLocationLoading(false);
        setLocationReady(false);

        if (error.code === 1) {
          toast.error(
            "Location permission denied. You can continue without location.",
          );
        } else if (error.code === 2) {
          toast.error(
            "Unable to detect your location. You can continue without location.",
          );
        } else if (error.code === 3) {
          toast.error(
            "Location request timed out. You can continue without location.",
          );
        } else {
          toast.error(
            "Unable to detect location. You can continue without location.",
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // =====================================================
  // CLEAR LOCATION
  // =====================================================

  const clearLocation = () => {
    setLatitude(null);
    setLongitude(null);

    setLocationReady(false);
    setDeliveryWarning("");

    toast.success("Location disabled. Normal shopping/order mode enabled.");
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrder = async () => {
    setDeliveryWarning("");

    // ---------------------------------------------------
    // CHECK ITEMS
    // ---------------------------------------------------

    if (!checkoutItems.length) {
      toast.error(
        isBuyNow ? "Buy Now product is unavailable." : "Your cart is empty.",
      );

      return;
    }

    // ---------------------------------------------------
    // CHECK ADDRESS
    // ---------------------------------------------------

    if (!selectedAddress) {
      toast.error("Please select delivery address");
      return;
    }

    const selected = addresses.find((item) => item._id === selectedAddress);

    if (!selected) {
      toast.error("Selected address not found.");
      return;
    }

    // ---------------------------------------------------
    // BUY NOW PRODUCT
    // ---------------------------------------------------

    const buyNowProductId =
      buyNowData?.product?._id || buyNowData?.product?.id || null;

    const buyNowQuantity = Math.max(1, Number(buyNowData?.quantity || 1));

    // ---------------------------------------------------
    // REQUEST PAYLOAD
    // ---------------------------------------------------

    const orderPayload = {
      coupon: coupon?.trim() || "",
      addressId: selectedAddress,
    };

    /*
      BUY NOW MODE

      Backend should use this information instead
      of reading the user's complete cart.
    */

    if (isBuyNow && buyNowProductId) {
      orderPayload.buyNow = true;
      orderPayload.productId = buyNowProductId;
      orderPayload.quantity = buyNowQuantity;
    }

    try {
      setLoading(true);

      console.log("CHECKOUT MODE:", isBuyNow ? "BUY NOW" : "CART");

      console.log("ORDER PAYLOAD:", orderPayload);

      const res = await API.post("/orders/create", orderPayload, authConfig);

      console.log("ORDER RESPONSE:", res.data);

      toast.success(
        isBuyNow
          ? "Buy Now order placed successfully!"
          : "Order placed successfully!",
      );

      /*
        Remove Buy Now history state so if user
        comes back to checkout, it doesn't accidentally
        place the same Buy Now product again.
      */

      navigate("/orders", {
        replace: true,
      });
    } catch (error) {
      console.log("ORDER ERROR:", error.response?.data);

      const errorData = error.response?.data;

      // =================================================
      // OUTSIDE 30 KM
      // =================================================

      if (errorData?.code === "OUTSIDE_DELIVERY_RADIUS") {
        const distance = errorData.distance;

        const message =
          distance !== undefined
            ? `${errorData.message} Distance: ${distance} KM. Maximum delivery distance is 30 KM.`
            : errorData.message ||
              "This seller is outside your 30 KM delivery range.";

        setDeliveryWarning(message);

        toast.error(message);

        return;
      }

      // =================================================
      // SELLER LOCATION MISSING
      // =================================================

      if (errorData?.code === "SELLER_LOCATION_MISSING") {
        const message = errorData.message || "Seller location is unavailable.";

        setDeliveryWarning(message);

        toast.error(message);

        return;
      }

      // =================================================
      // CUSTOMER LOCATION REQUIRED
      // =================================================

      if (errorData?.code === "DELIVERY_LOCATION_REQUIRED") {
        const message =
          "Location is optional. Please update your backend OrderController to allow normal orders without location.";

        setDeliveryWarning(message);

        toast.error(message);

        return;
      }

      // =================================================
      // STOCK ERROR
      // =================================================

      if (
        errorData?.code === "OUT_OF_STOCK" ||
        errorData?.message?.toLowerCase()?.includes("stock")
      ) {
        toast.error(errorData.message || "Product is out of stock.");

        return;
      }

      // =================================================
      // GENERIC ERROR
      // =================================================

      toast.error(errorData?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAVE ADDRESS
  // =====================================================

  const saveAddress = async () => {
    const cleanFullName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanCity = city.trim();
    const cleanState = stateName.trim();
    const cleanPincode = pincode.trim();
    const cleanLandmark = landmark.trim();

    // =================================================
    // VALIDATION
    // =================================================

    if (!cleanFullName) {
      toast.error("Please enter full name");
      return;
    }

    if (!cleanPhone) {
      toast.error("Please enter phone number");
      return;
    }

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10 digit phone number");
      return;
    }

    if (!cleanAddress) {
      toast.error("Please enter address");
      return;
    }

    if (!cleanCity) {
      toast.error("Please enter city");
      return;
    }

    if (!cleanState) {
      toast.error("Please enter state");
      return;
    }

    if (!cleanPincode) {
      toast.error("Please enter pincode");
      return;
    }

    if (!/^[0-9]{6}$/.test(cleanPincode)) {
      toast.error("Please enter a valid 6 digit pincode");
      return;
    }

    // =================================================
    // PAYLOAD
    // =================================================

    const payload = {
      fullName: cleanFullName,
      phone: cleanPhone,
      address: cleanAddress,
      city: cleanCity,
      state: cleanState,
      pincode: cleanPincode,
      landmark: cleanLandmark,
    };

    // =================================================
    // OPTIONAL LOCATION
    // =================================================

    if (
      latitude !== null &&
      longitude !== null &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude))
    ) {
      payload.latitude = Number(latitude);
      payload.longitude = Number(longitude);
    }

    try {
      console.log("ADDRESS PAYLOAD:", payload);

      const res = await API.post("/address/add", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("ADDRESS SUCCESS:", res.data);

      toast.success(res.data.message || "Address Added Successfully");

      await fetchAddresses();

      // Auto select new address

      if (res.data.address?._id) {
        setSelectedAddress(res.data.address._id);
      }

      // Clear form

      setFullName("");
      setPhone("");
      setAddress("");
      setCity("");
      setStateName("");
      setPincode("");
      setLandmark("");

      // Clear temporary location

      setLatitude(null);
      setLongitude(null);
      setLocationReady(false);
    } catch (error) {
      console.log("ADDRESS ERROR:", error.response?.data);

      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  // =====================================================
  // SELECT ADDRESS
  // =====================================================

  const handleSelectAddress = (addressId) => {
    setSelectedAddress(addressId);
    setDeliveryWarning("");

    const selected = addresses.find((item) => item._id === addressId);

    if (
      selected?.location?.latitude !== null &&
      selected?.location?.latitude !== undefined &&
      selected?.location?.longitude !== null &&
      selected?.location?.longitude !== undefined
    ) {
      console.log("Selected address has location:", selected.location);
    }
  };

  // =====================================================
  // INPUT STYLE
  // =====================================================

  const inputCls = `
    w-full
    rounded-xl
    border
    border-slate-200
    bg-slate-50
    px-4
    py-3
    text-sm
    text-slate-800
    outline-none
    transition-all
    duration-200
    placeholder:text-slate-400
    focus:border-slate-900
    focus:bg-white
    focus:ring-2
    focus:ring-slate-100
    hover:border-slate-300
  `;

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (pageLoading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-[#FAF7F6] px-3 py-6 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-4 w-60 animate-pulse rounded bg-slate-200" />

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <div className="h-56 animate-pulse rounded-2xl bg-white" />
                <div className="h-[600px] animate-pulse rounded-2xl bg-white" />
              </div>

              <div className="hidden h-96 animate-pulse rounded-2xl bg-white lg:block" />
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

      <div className="min-h-screen bg-[#FAF7F6] pb-8">
        <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-8 lg:py-10">
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-5 sm:mb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mb-3 flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ChevronLeft size={15} />
              Back
            </button>

            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase sm:text-[11px]">
              ZentraCart
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Checkout
              </h1>

              {isBuyNow && (
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                  BUY NOW
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              {isBuyNow
                ? "Complete your purchase for this product"
                : "Complete your order securely"}
            </p>
          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            {/* =================================================
                LEFT
            ================================================= */}

            <div className="space-y-5 lg:col-span-2">
              {/* =================================================
                  ITEMS
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                    {isBuyNow ? "Buy Now" : "Your Items"}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {checkoutItems.length}{" "}
                    {checkoutItems.length === 1 ? "item" : "items"} · Qty{" "}
                    {totalQuantity}
                  </p>
                </div>

                <div className="divide-y divide-slate-100 px-4 sm:px-6">
                  {checkoutItems.length === 0 ? (
                    <div className="py-10 text-center">
                      <ShoppingBag
                        size={32}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-2 text-sm text-slate-400">
                        {isBuyNow
                          ? "Buy Now product is unavailable."
                          : "Your cart is empty."}
                      </p>

                      <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    checkoutItems.map((item) => (
                      <div key={item._id} className="flex gap-3 py-4 sm:gap-4">
                        {/* IMAGE */}

                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 sm:h-24 sm:w-24">
                          {item.product?.images?.[0]?.url ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.title || "Product"}
                              className="h-full w-full object-contain p-1.5"
                            />
                          ) : (
                            <ImageOff size={22} className="text-slate-300" />
                          )}
                        </div>

                        {/* PRODUCT */}

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-xs font-semibold text-slate-800 sm:text-sm">
                            {item.product?.title || "Product"}
                          </h3>

                          {item.product?.brand && (
                            <p className="mt-1 text-[10px] text-slate-400">
                              {item.product.brand}
                            </p>
                          )}

                          <p className="mt-2 text-[11px] text-slate-400 sm:text-xs">
                            Qty: {item.quantity}
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-900 sm:text-sm">
                            ₹
                            {Number(item.product?.price || 0).toLocaleString(
                              "en-IN",
                            )}{" "}
                            each
                          </p>
                        </div>

                        {/* PRICE */}

                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold text-slate-900 sm:text-sm">
                            ₹
                            {Number(
                              (item.product?.price || 0) * item.quantity,
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {total > 999 && (
                  <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 sm:mx-6">
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-emerald-600"
                    />

                    <p className="text-[11px] font-medium text-emerald-700 sm:text-xs">
                      Free shipping applied on orders above ₹999
                    </p>
                  </div>
                )}
              </div>

              {/* =================================================
                  DELIVERY ADDRESS
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={17} className="text-slate-800" />

                    <div>
                      <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                        Delivery
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-slate-800">
                        Delivery Address
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 sm:p-6">
                  {/* NAME + PHONE */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputCls}
                    />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className={inputCls}
                    />
                  </div>

                  {/* ADDRESS */}

                  <textarea
                    placeholder="Street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />

                  {/* CITY STATE PIN */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputCls}
                    />

                    <input
                      type="text"
                      placeholder="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className={inputCls}
                    />

                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) =>
                        setPincode(e.target.value.replace(/\D/g, ""))
                      }
                      className={inputCls}
                    />
                  </div>

                  {/* LANDMARK */}

                  <input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className={inputCls}
                  />

                  {/* =================================================
                      OPTIONAL LOCATION
                  ================================================= */}

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Navigation size={18} className="text-indigo-600" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800">
                          Delivery Location
                          <span className="ml-2 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-indigo-600">
                            Optional
                          </span>
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Use your current location to enable the{" "}
                          <strong className="text-indigo-600">30 KM</strong>{" "}
                          nearby-seller delivery system.
                        </p>

                        {locationReady &&
                          latitude !== null &&
                          longitude !== null && (
                            <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                              <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 size={13} />
                                Current location detected
                              </p>

                              <p className="mt-1 text-[10px] text-emerald-600">
                                30 KM delivery checking is active.
                              </p>
                            </div>
                          )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {locationLoading ? (
                              <>
                                <Loader2 size={15} className="animate-spin" />
                                Detecting...
                              </>
                            ) : (
                              <>
                                <Navigation size={15} />
                                Use My Current Location
                              </>
                            )}
                          </button>

                          {locationReady && (
                            <button
                              type="button"
                              onClick={clearLocation}
                              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              Continue Without Location
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!locationReady && (
                    <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-500"
                      />

                      <p className="text-xs leading-5 text-slate-600">
                        Location is <strong>optional</strong>. You can continue
                        checkout normally without sharing your location.
                      </p>
                    </div>
                  )}

                  {/* SAVE ADDRESS */}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={saveAddress}
                      className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:border-indigo-600 hover:bg-indigo-600 sm:w-auto"
                    >
                      Save Address
                    </button>
                  </div>

                  {/* =================================================
                      SAVED ADDRESSES
                  ================================================= */}

                  <div className="mt-6">
                    <h3 className="mb-3 text-sm font-semibold text-slate-800">
                      Saved Addresses
                    </h3>

                    {addresses.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        No saved addresses yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((item) => {
                          const hasLocation =
                            item.location?.latitude !== null &&
                            item.location?.latitude !== undefined &&
                            item.location?.longitude !== null &&
                            item.location?.longitude !== undefined;

                          return (
                            <label
                              key={item._id}
                              className={`group block cursor-pointer rounded-xl border p-3 transition-all sm:p-4 ${
                                selectedAddress === item._id
                                  ? "border-slate-900 bg-slate-50 shadow-sm"
                                  : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="address"
                                  value={item._id}
                                  checked={selectedAddress === item._id}
                                  onChange={() => handleSelectAddress(item._id)}
                                  className="mt-1 h-4 w-4 accent-slate-900"
                                />

                                <div className="min-w-0 text-sm">
                                  <strong className="text-slate-800">
                                    {item.fullName}
                                  </strong>

                                  <p className="mt-1 leading-5 text-slate-500">
                                    {item.address}, {item.city}, {item.state}
                                  </p>

                                  <p className="mt-1 text-slate-500">
                                    {item.phone}
                                  </p>

                                  {item.pincode && (
                                    <p className="mt-1 text-xs text-slate-400">
                                      PIN: {item.pincode}
                                    </p>
                                  )}

                                  {hasLocation ? (
                                    <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                      <CheckCircle2 size={13} />
                                      Location available — 30 KM check can apply
                                    </p>
                                  ) : (
                                    <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                      <MapPin size={13} />
                                      No location — normal order mode
                                    </p>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* DELIVERY WARNING */}

                    {deliveryWarning && (
                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                        <AlertTriangle
                          size={18}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                          <p className="text-sm font-bold text-red-700">
                            Delivery unavailable
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-600">
                            {deliveryWarning}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT — ORDER SUMMARY
            ================================================= */}

            <div className="h-fit space-y-4 lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* HEADER */}

                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <CreditCard size={17} className="text-slate-800" />

                    <div>
                      <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                        Summary
                      </p>

                      <p className="mt-0.5 text-sm font-semibold text-slate-800">
                        Order Summary
                      </p>
                    </div>
                  </div>
                </div>

                {/* BODY */}

                <div className="p-5 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        Subtotal ({totalQuantity}{" "}
                        {totalQuantity === 1 ? "item" : "items"})
                      </span>

                      <span className="text-sm font-medium text-slate-800">
                        ₹{Number(total).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Shipping</span>

                      {shipping === 0 ? (
                        <span className="text-sm font-medium text-emerald-600">
                          Free
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-800">
                          ₹{shipping}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="my-4 border-t border-slate-100" />

                  {/* TOTAL */}

                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Total
                    </span>

                    <span className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                      ₹{Number(finalTotal).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* COUPON */}

                  <div className="mt-5">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Tag size={13} />
                      Coupon Code
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value);
                          setCouponApplied(false);
                        }}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm uppercase outline-none focus:border-slate-900 focus:bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (!coupon.trim()) {
                            toast.error("Please enter coupon code");
                            return;
                          }

                          setCouponApplied(true);

                          toast.success(`Coupon "${coupon.trim()}" added`);
                        }}
                        className="rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 text-xs font-semibold text-white transition hover:border-indigo-600 hover:bg-indigo-600"
                      >
                        Apply
                      </button>
                    </div>

                    {couponApplied && coupon && (
                      <p className="mt-1.5 text-xs font-medium text-emerald-600">
                        Coupon "{coupon}" applied!
                      </p>
                    )}
                  </div>

                  {/* PLACE ORDER */}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={loading || !checkoutItems.length}
                    className="mt-5 flex min-h-[50px] w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Placing Order...
                      </span>
                    ) : isBuyNow ? (
                      "Buy Now & Place Order"
                    ) : (
                      "Place Order"
                    )}
                  </button>

                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-400 sm:text-[11px]">
                    <ShieldCheck size={13} />
                    Secure checkout powered by ZentraCart
                  </p>
                </div>
              </div>

              {/* TRUST BADGES */}

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    Icon: ShieldCheck,
                    label: "Secure Payment",
                  },
                  {
                    Icon: Truck,
                    label: "Fast Delivery",
                  },
                  {
                    Icon: RefreshCw,
                    label: "Easy Returns",
                  },
                ].map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1 py-3 text-center transition hover:border-indigo-200 hover:bg-indigo-50/40"
                  >
                    <Icon
                      size={18}
                      className="text-slate-800 group-hover:text-indigo-600"
                    />

                    <span className="text-[9px] font-medium text-slate-500 group-hover:text-indigo-600 sm:text-[10px]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          MOBILE BOTTOM ORDER BAR
      ================================================= */}

      {checkoutItems.length > 0 && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-slate-200 bg-white p-2.5 shadow-[0_-5px_20px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500">
                {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
              </p>

              <p className="text-base font-extrabold text-slate-900">
                ₹{Number(finalTotal).toLocaleString("en-IN")}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-4 text-sm font-bold text-white hover:bg-[#6D28D9] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Placing...
                </>
              ) : isBuyNow ? (
                "Buy Now"
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Checkout;
