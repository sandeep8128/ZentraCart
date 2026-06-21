import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

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

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data.cart);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = total > 999 ? 0 : 49;
  const finalTotal = total + shipping;

  const handlePlaceOrder = async () => {
    
    if (!selectedAddress) {
      alert("Please select delivery address");
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
        { headers: { Authorization: `Bearer ${token}` } },
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

  const saveAddress = async () => {
    try {
      const res = await API.post(
        "/address/add",
        { fullName, phone, address, city, state: stateName, pincode, landmark },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Failed to save address");
      console.log(error.response?.data);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/address/my-addresses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses(res.data.addresses);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#285570] focus:bg-white placeholder:text-gray-400";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {/* Page Header */}
          <div className="mb-8">
            <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
              ZentraCart
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
              Checkout
            </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Cart Items + Address */}
            <div className="space-y-5 lg:col-span-2">
              {/* Cart Items */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                    Your Items
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"} in cart
                  </p>
                </div>

                <div className="divide-y divide-gray-50 px-6">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-8 w-8 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                            />
                          </svg>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-gray-800">
                          {item.product.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          ₹
                          {Number(
                            item.product.price * item.quantity,
                          ).toLocaleString("en-IN")}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          ₹{Number(item.product.price).toLocaleString("en-IN")}{" "}
                          each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {total > 999 && (
                  <div className="mx-6 mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5">
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-xs font-medium text-emerald-700">
                      Free shipping applied on orders above ₹999
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                    Delivery
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    Delivery Address
                  </p>
                </div>

                <div className="space-y-3 p-6">
                  <div className="grid grid-cols-2 gap-3">
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

                  <textarea
                    placeholder="Street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="2"
                    className={inputCls + " resize-none"}
                  />

                  <div className="grid grid-cols-3 gap-3">
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

                  <input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className={inputCls}
                  />

                  <div className="pt-1">
                    <button
                      onClick={saveAddress}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 active:scale-[0.98]"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Save Address
                    </button>
                    <div className="mt-6">
                      <h3 className="mb-3 text-lg font-semibold">
                        Saved Addresses
                      </h3>

                      {addresses.map((item) => (
                        <label
                          key={item._id}
                          className="mb-3 block cursor-pointer rounded-xl border p-4"
                        >
                          <input
                            type="radio"
                            name="address"
                            value={item._id}
                            checked={selectedAddress === item._id}
                            onChange={() => setSelectedAddress(item._id)}
                            // className="mr-2"
                          />

                          <strong>{item.fullName}</strong>

                          <p>
                            {item.address}, {item.city},{item.state}
                          </p>

                          <p>{item.phone}</p>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="h-fit space-y-4">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                    Summary
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    Order Summary
                  </p>
                </div>

                <div className="p-6">
                  {/* Line items */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Subtotal ({cartItems.length} items)
                      </span>
                      <span className="text-sm font-medium text-gray-800">
                        ₹{Number(total).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-sm font-medium text-emerald-600">
                          Free
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-800">
                          ₹{shipping}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="my-4 border-t border-gray-100" />

                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{Number(finalTotal).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Coupon */}
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium text-gray-500">
                      Coupon Code
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={coupon}
                        onChange={(e) => {
                          setCoupon(e.target.value);
                          setCouponApplied(false);
                        }}
                        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition outline-none placeholder:text-gray-400 focus:border-[#285570] focus:bg-white"
                      />
                      <button
                        onClick={() => setCouponApplied(true)}
                        className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
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

                  {/* Place Order */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="mt-5 w-full rounded-xl bg-[#285570] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e4257] active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="h-4 w-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Placing Order...
                      </span>
                    ) : (
                      "Place Order"
                    )}
                  </button>

                  <p className="mt-3 text-center text-[11px] text-gray-400">
                    Secure checkout powered by ZentraCart
                  </p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: "ti-shield-check", label: "Secure Payment" },
                  { icon: "ti-truck-delivery", label: "Fast Delivery" },
                  { icon: "ti-refresh", label: "Easy Returns" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-2 py-3 text-center"
                  >
                    <i
                      className={`ti ${b.icon} text-[#285570]`}
                      style={{ fontSize: 18 }}
                      aria-hidden="true"
                    />
                    <span className="text-[10px] font-medium text-gray-500">
                      {b.label}
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
