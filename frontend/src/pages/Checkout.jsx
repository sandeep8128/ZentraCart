import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

function Checkout() {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");

  // =====================================================
  // FETCH CART
  // =====================================================

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(res.data.cart);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // =====================================================
  // FETCH ADDRESSES
  // =====================================================

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/address/my-addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses(res.data.addresses || []);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  // =====================================================
  // TOTAL
  // =====================================================

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const shipping = total > 999 ? 0 : 49;

  const finalTotal = total + shipping;

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select delivery address");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post(
        "/orders/create",
        {
          coupon,
          addressId: selectedAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log(res.data);

      toast.success("Order placed successfully!");

      navigate("/orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SAVE ADDRESS
  // =====================================================

  const saveAddress = async () => {
    try {
      const res = await API.post(
        "/address/add",
        {
          fullName,
          phone,
          address,
          city,
          state: stateName,
          pincode,
          landmark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      // Refresh saved addresses
      await fetchAddresses();

      // Clear form
      setFullName("");
      setPhone("");
      setAddress("");
      setCity("");
      setStateName("");
      setPincode("");
      setLandmark("");
    } catch (error) {
      toast.error("Failed to save address");

      console.log(error.response?.data);
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
  // UI
  // =====================================================

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#FAF7F6]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:py-10">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6 sm:mb-8">
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase transition-colors hover:text-indigo-600 sm:text-[11px]">
              ZentraCart
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 transition-colors duration-300 hover:text-indigo-600 sm:text-3xl">
              Checkout
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Complete your order securely
            </p>
          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
            {/* =================================================
                LEFT SECTION
            ================================================= */}

            <div className="space-y-5 lg:col-span-2">
              {/* =================================================
                  CART ITEMS
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.12)]">
                {/* HEADER */}

                <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                  <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase">
                    Your Items
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"} in cart
                  </p>
                </div>

                {/* ITEMS */}

                <div className="divide-y divide-slate-100 px-4 sm:px-6">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="group flex gap-3 py-4 transition-colors duration-200 sm:gap-4"
                    >
                      {/* IMAGE */}

                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 transition-all duration-300 group-hover:bg-indigo-50/40 sm:h-20 sm:w-20">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            className="h-full w-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <ImageOff
                            size={22}
                            className="text-slate-300 transition-colors group-hover:text-indigo-400"
                          />
                        )}
                      </div>

                      {/* PRODUCT */}

                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-xs font-semibold text-slate-800 transition-colors duration-200 group-hover:text-indigo-600 sm:text-sm">
                          {item.product.title}
                        </h3>

                        <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      {/* PRICE */}

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-slate-900 sm:text-sm">
                          ₹
                          {Number(
                            item.product.price * item.quantity,
                          ).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                          ₹{Number(item.product.price).toLocaleString("en-IN")}{" "}
                          each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* FREE SHIPPING */}

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

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.12)]">
                {/* HEADER */}

                <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={17}
                      className="text-slate-800 transition-colors hover:text-indigo-600"
                    />

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

                {/* ADDRESS FORM */}

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
                      type="text"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  {/* ADDRESS */}

                  <textarea
                    placeholder="Street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="3"
                    className={`${inputCls} resize-none`}
                  />

                  {/* CITY STATE PINCODE */}

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
                      type="text"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
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

                  {/* SAVE */}

                  <div className="pt-1">
                    <button
                      onClick={saveAddress}
                      className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-indigo-600 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98] sm:w-auto"
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
                        {addresses.map((item) => (
                          <label
                            key={item._id}
                            className={`group block cursor-pointer rounded-xl border p-3 transition-all duration-200 sm:p-4 ${
                              selectedAddress === item._id
                                ? "border-slate-900 bg-slate-50 shadow-sm"
                                : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                            } `}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="address"
                                value={item._id}
                                checked={selectedAddress === item._id}
                                onChange={() => setSelectedAddress(item._id)}
                                className="mt-1 h-4 w-4 accent-slate-900"
                              />

                              <div className="min-w-0 text-sm">
                                <strong className="text-slate-800 transition-colors group-hover:text-indigo-600">
                                  {item.fullName}
                                </strong>

                                <p className="mt-1 leading-5 text-slate-500">
                                  {item.address}, {item.city}, {item.state}
                                </p>

                                <p className="mt-1 text-slate-500">
                                  {item.phone}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT - ORDER SUMMARY
            ================================================= */}

            <div className="h-fit space-y-4 lg:sticky lg:top-20">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.15)]">
                {/* SUMMARY HEADER */}

                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <CreditCard
                      size={17}
                      className="text-slate-800 transition-colors hover:text-indigo-600"
                    />

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

                <div className="p-5 sm:p-6">
                  {/* LINE ITEMS */}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        Subtotal ({cartItems.length} items)
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

                  {/* =================================================
                      COUPON
                  ================================================= */}

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
                        className={`flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-100`}
                      />

                      <button
                        onClick={() => setCouponApplied(true)}
                        className="rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 text-xs font-semibold text-white transition-all duration-300 hover:border-indigo-600 hover:bg-indigo-600 active:scale-[0.98]"
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

                  {/* =================================================
                      PLACE ORDER
                  ================================================= */}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="mt-5 flex min-h-[50px] w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        Placing Order...
                      </span>
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

              {/* =================================================
                  TRUST BADGES
              ================================================= */}

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
                    className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-1 py-3 text-center transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50/40 hover:shadow-sm"
                  >
                    <Icon
                      size={18}
                      className="text-slate-800 transition-colors duration-200 group-hover:text-indigo-600"
                    />

                    <span className="text-[9px] font-medium text-slate-500 transition-colors group-hover:text-indigo-600 sm:text-[10px]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
