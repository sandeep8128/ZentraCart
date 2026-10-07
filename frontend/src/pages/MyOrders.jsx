import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

const statusConfig = {
  delivered: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },

  shipped: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },

  confirmed: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },

  cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },

  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
};

const trackingMessage = {
  pending: "Order received and waiting for seller confirmation.",

  confirmed: "Seller confirmed your order and is preparing shipment.",

  shipped: "Package is on the way to your delivery address.",

  delivered: "Package delivered successfully. Enjoy your purchase!",

  cancelled: "This order has been cancelled.",
};

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize sm:px-3 sm:text-xs ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />

      <span className="truncate">{status}</span>
    </span>
  );
}

// =====================================================
// TRACKING BAR
// =====================================================

function TrackingBar({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="w-full min-w-0">
      <div className="grid w-full min-w-0 grid-cols-4">
        {STATUS_STEPS.map((step, index) => {
          const done = index <= currentIndex;
          const active = index === currentIndex;

          return (
            <div key={step} className="relative min-w-0">
              {/* CONNECTOR */}

              {index < STATUS_STEPS.length - 1 && (
                <div
                  className={`absolute top-3.5 right-0 left-1/2 h-0.5 sm:top-4 ${
                    index < currentIndex ? "bg-slate-900" : "bg-slate-200"
                  }`}
                />
              )}

              {/* STEP */}

              <div className="relative z-10 flex min-w-0 flex-col items-center">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-all duration-300 sm:h-8 sm:w-8 sm:text-[10px] ${
                    done
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-300"
                  } ${active ? "ring-4 ring-indigo-100" : ""}`}
                >
                  {done ? (
                    <svg
                      className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                <span
                  className={`mt-1.5 max-w-full truncate px-0.5 text-center text-[8px] font-medium capitalize sm:text-[10px] ${
                    done ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// ORDER CARD
// =====================================================

function OrderCard({ order, onCancel, onDelete, onPay, onInvoice }) {
  const [expanded, setExpanded] = useState(true);

  const deliveryDate = new Date(
    new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000,
  );

  const canCancel = !["cancelled", "shipped", "delivered"].includes(
    order.orderStatus,
  );

  return (
    <div className="box-border w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-[0_16px_40px_-12px_rgba(15,23,42,0.14)]">
      {/* =================================================
          CARD HEADER
      ================================================= */}

      <div className="box-border w-full min-w-0 border-b border-slate-100 bg-slate-50/60 px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          {/* ORDER INFO */}

          <div className="grid min-w-0 grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-4">
            {/* ORDER ID */}

            <div className="min-w-0">
              <p className="truncate text-[8px] font-semibold tracking-[0.14em] text-slate-400 uppercase sm:text-[10px] sm:tracking-[0.18em]">
                Order
              </p>

              <h3 className="mt-0.5 truncate font-mono text-[10px] font-semibold text-slate-800 sm:text-sm">
                #{order._id.slice(-8).toUpperCase()}
              </h3>
            </div>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* DATE */}

            <div className="min-w-0">
              <p className="truncate text-[8px] font-semibold tracking-[0.14em] text-slate-400 uppercase sm:text-[10px] sm:tracking-[0.18em]">
                Placed
              </p>

              <p className="mt-0.5 truncate text-[10px] font-medium text-slate-700 sm:text-sm">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* TOTAL */}

            <div className="min-w-0">
              <p className="truncate text-[8px] font-semibold tracking-[0.14em] text-slate-400 uppercase sm:text-[10px] sm:tracking-[0.18em]">
                Total
              </p>

              <p className="mt-0.5 truncate text-[10px] font-bold text-slate-900 sm:text-sm">
                ₹{Number(order.finalAmount).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* STATUS + TOGGLE */}

          <div className="flex min-w-0 items-center justify-between gap-2">
            <StatusBadge status={order.orderStatus} />

            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Collapse order" : "Expand order"}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================
          EXPANDED BODY
      ================================================= */}

      {expanded && (
        <div className="box-border w-full max-w-full min-w-0 p-3 sm:p-6">
          <div className="grid w-full max-w-full min-w-0 gap-5 lg:grid-cols-5 lg:gap-6">
            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div className="max-w-full min-w-0 lg:col-span-3">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Items
              </p>

              <div className="w-full max-w-full min-w-0 space-y-2">
                {order.products.map((item) => (
                  <div
                    key={item._id}
                    className="flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-all duration-200 hover:border-indigo-100 hover:bg-indigo-50/30 sm:gap-3 sm:p-3"
                  >
                    {/* IMAGE */}

                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain p-1 sm:h-16 sm:w-16"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-400 sm:h-16 sm:w-16">
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                          />
                        </svg>
                      </div>
                    )}

                    {/* NAME */}

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="line-clamp-2 text-[11px] leading-4 font-semibold break-words text-slate-800 sm:text-sm">
                        {item.product?.title}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* PRICE */}

                    {item.product?.price && (
                      <p className="max-w-[65px] shrink-0 truncate text-right text-[10px] font-bold text-slate-800 sm:max-w-none sm:text-sm">
                        ₹{Number(item.product.price).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* =================================================
                  TRACKING
              ================================================= */}

              {order.orderStatus !== "cancelled" && (
                <div className="mt-6 min-w-0">
                  <p className="mb-4 text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    Tracking
                  </p>

                  <TrackingBar status={order.orderStatus} />
                </div>
              )}
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="max-w-full min-w-0 lg:col-span-2">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Summary
              </p>

              <div className="box-border w-full max-w-full min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
                <div className="w-full min-w-0 space-y-3">
                  {/* ORDER DATE */}

                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="min-w-0 text-xs break-words text-slate-500">
                      Order date
                    </span>

                    <span className="max-w-full text-right text-[10px] font-medium text-slate-700 sm:text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* DELIVERY */}

                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="min-w-0 text-xs break-words text-slate-500">
                      Expected delivery
                    </span>

                    <span className="max-w-full text-right text-[10px] font-medium text-emerald-600 sm:text-xs">
                      {deliveryDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* PAYMENT */}

                  <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="min-w-0 text-xs break-words text-slate-500">
                      Payment status
                    </span>

                    <span className="max-w-[110px] truncate text-right text-[10px] font-medium text-slate-700 capitalize sm:text-xs">
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>

                  {/* TOTAL */}

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className="shrink-0 text-sm font-semibold text-slate-700">
                        Total
                      </span>

                      <span className="min-w-0 truncate text-right text-base font-extrabold text-slate-900 sm:text-xl">
                        ₹{Number(order.finalAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRACKING MESSAGE */}

              <div
                className={`mt-3 box-border w-full max-w-full min-w-0 rounded-xl border p-3 ${
                  order.orderStatus === "cancelled"
                    ? "border-red-100 bg-red-50"
                    : "border-indigo-100 bg-indigo-50/50"
                }`}
              >
                <p
                  className={`text-xs leading-5 break-words ${
                    order.orderStatus === "cancelled"
                      ? "text-red-600"
                      : "text-indigo-700"
                  }`}
                >
                  {trackingMessage[order.orderStatus] ||
                    trackingMessage.pending}
                </p>
              </div>

              {/* DELIVERY ADDRESS */}

              {order.shippingAddress && (
                <div className="mt-5 box-border w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-800">
                    📍 Delivery Address
                  </h4>

                  <p className="text-sm font-semibold break-words text-slate-800">
                    {order.shippingAddress.fullName}
                  </p>

                  <p className="mt-1 text-sm break-words text-slate-500">
                    {order.shippingAddress.phone}
                  </p>

                  <p className="mt-2 text-sm leading-5 break-words text-slate-700">
                    {order.shippingAddress.address}
                  </p>

                  <p className="text-sm leading-5 break-words text-slate-700">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>

                  <p className="text-sm break-words text-slate-700">
                    PIN: {order.shippingAddress.pincode}
                  </p>

                  {order.shippingAddress.landmark && (
                    <p className="mt-1 text-sm leading-5 break-words text-slate-500">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              )}

              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="mt-4 grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
                {/* PAY */}

                <button
                  type="button"
                  onClick={() => onPay(order)}
                  className="w-full min-w-0 rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 active:scale-[0.98]"
                >
                  Pay Now
                </button>

                {/* INVOICE */}

                <button
                  type="button"
                  onClick={() => onInvoice(order._id)}
                  className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.98]"
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>

                  <span className="truncate">Download Invoice</span>
                </button>

                {/* CANCEL */}

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => onCancel(order._id)}
                    className="w-full min-w-0 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-100 hover:shadow-sm active:scale-[0.98]"
                  >
                    Cancel Order
                  </button>
                )}

                {/* DELETE */}

                {order.orderStatus === "cancelled" && (
                  <button
                    type="button"
                    onClick={() => onDelete(order._id)}
                    className="w-full min-w-0 rounded-xl border border-red-200 bg-red-600 px-3 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-red-700 hover:shadow-sm active:scale-[0.98]"
                  >
                    Delete Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MY ORDERS
// =====================================================

function MyOrders() {
  const { token } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ORDERS
  // =====================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await API.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error.response?.data);

      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DOWNLOAD INVOICE
  // =====================================================

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await API.get(`/orders/invoice/${orderId}`, {
        responseType: "blob",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", `invoice-${orderId}.pdf`);

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error.response?.data);

      toast.error("Failed to download invoice");
    }
  };

  // =====================================================
  // CANCEL ORDER
  // =====================================================

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await API.put(
        `/orders/cancel/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  // =====================================================
  // DELETE CANCELLED ORDER
  // =====================================================

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this cancelled order?",
    );

    if (!confirmed) return;

    try {
      const res = await API.delete(`/orders/delete/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message || "Order deleted successfully");

      setOrders((previousOrders) =>
        previousOrders.filter((order) => order._id !== orderId),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  // =====================================================
  // RAZORPAY
  // =====================================================

  const handleRazorpay = async (order) => {
    try {
      const { data } = await API.post(
        "/payment/create-order",
        {
          orderId: order._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const options = {
        key: data.key,

        amount: data.razorpayOrder.amount,

        currency: "INR",

        name: "ZentraCart",

        description: "Order Payment",

        order_id: data.razorpayOrder.id,

        prefill: {
          name: "Test User",
          email: "test@test.com",
          contact: "9999999999",
        },

        handler: async (response) => {
          try {
            const verifyRes = await API.post(
              "/payment/verify",
              {
                orderId: order._id,

                razorpay_order_id: response.razorpay_order_id,

                razorpay_payment_id: response.razorpay_payment_id,

                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            toast.success(verifyRes.data.message);

            fetchOrders();
          } catch (error) {
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },

        theme: {
          color: "#285570",
        },
      };

      if (!window.Razorpay) {
        toast.error("Razorpay is not loaded.");

        return;
      }

      new window.Razorpay(options).open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen w-full max-w-full min-w-0 overflow-x-hidden bg-gray-50">
        <div className="mx-auto box-border w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase sm:text-[11px]">
                ZentraCart
              </p>

              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                My Orders
              </h1>

              <p className="mt-1 text-sm break-words text-gray-500">
                Track and manage your orders
              </p>
            </div>

            {orders.length > 0 && (
              <span className="w-fit shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            )}
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#285570] border-t-transparent" />
            </div>
          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading && orders.length === 0 && (
            <div className="box-border flex w-full max-w-full min-w-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center shadow-sm sm:px-6 sm:py-20">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-700">
                No orders yet
              </h3>

              <p className="mt-1 max-w-sm text-sm break-words text-slate-400">
                Orders you place will appear here.
              </p>
            </div>
          )}

          {/* =================================================
              ORDERS LIST
          ================================================= */}

          {!loading && orders.length > 0 && (
            <div className="w-full max-w-full min-w-0 space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={handleCancelOrder}
                  onDelete={handleDeleteOrder}
                  onPay={handleRazorpay}
                  onInvoice={handleDownloadInvoice}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default MyOrders;
