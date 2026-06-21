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

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function TrackingBar({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all ${
                  done
                    ? "border-[#285570] bg-[#285570] text-white"
                    : "border-gray-200 bg-white text-gray-300"
                } ${active ? "ring-4 ring-[#285570]/10" : ""} `}
              >
                {done ? (
                  <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-[10px] font-medium capitalize ${done ? "text-[#285570]" : "text-gray-400"}`}
              >
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`mx-1 mb-4 h-0.5 flex-1 rounded-full transition-all ${i < currentIndex ? "bg-[#285570]" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onCancel, onPay, onInvoice }) {
  const [expanded, setExpanded] = useState(true);
  const deliveryDate = new Date(
    new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000,
  );
  const canCancel = !["cancelled", "shipped", "delivered"].includes(
    order.orderStatus,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] font-medium tracking-widest text-gray-400 uppercase">
              Order
            </p>
            <h3 className="mt-0.5 font-mono text-sm font-semibold text-gray-800">
              #{order._id.slice(-8).toUpperCase()}
            </h3>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-[11px] font-medium tracking-widest text-gray-400 uppercase">
              Placed on
            </p>
            <p className="mt-0.5 text-sm font-medium text-gray-700">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <p className="text-[11px] font-medium tracking-widest text-gray-400 uppercase">
              Total
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-800">
              ₹{Number(order.finalAmount).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-100"
          >
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
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

      {/* Expanded Body */}
      {expanded && (
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Products — 3 cols */}
            <div className="lg:col-span-3">
              <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                Items
              </p>
              <div className="space-y-2">
                {order.products.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
                        <svg
                          className="h-6 w-6 text-gray-400"
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {item.product?.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    {item.product?.price && (
                      <p className="text-sm font-semibold text-gray-700">
                        ₹{Number(item.product.price).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Tracking bar */}
              {order.orderStatus !== "cancelled" && (
                <div className="mt-6">
                  <p className="mb-4 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                    Tracking
                  </p>
                  <TrackingBar status={order.orderStatus} />
                </div>
              )}
            </div>

            {/* Summary — 2 cols */}
            <div className="lg:col-span-2">
              <p className="mb-3 text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                Summary
              </p>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Order date</span>
                    <span className="text-xs font-medium text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Expected delivery
                    </span>
                    <span className="text-xs font-medium text-emerald-600">
                      {deliveryDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Payment status
                    </span>
                    <span className="text-xs font-medium text-gray-700 capitalize">
                      {order.paymentStatus || "Pending"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">
                        Total
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        ₹{Number(order.finalAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live tracking message */}
              <div
                className={`mt-3 rounded-xl border p-3 ${order.orderStatus === "cancelled" ? "border-red-100 bg-red-50" : "border-[#285570]/10 bg-[#285570]/5"}`}
              >
                <p
                  className={`text-xs leading-relaxed ${order.orderStatus === "cancelled" ? "text-red-600" : "text-[#285570]"}`}
                >
                  {trackingMessage[order.orderStatus] ||
                    trackingMessage.pending}
                </p>
              </div>

              {order.shippingAddress && (
                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-3 font-semibold text-[#285570]">
                    📍 Delivery Address
                  </h4>

                  <p className="font-medium">
                    {order.shippingAddress.fullName}
                  </p>

                  <p className="text-sm text-gray-600">
                    {order.shippingAddress.phone}
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {order.shippingAddress.address}
                  </p>

                  <p className="text-sm text-gray-700">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>

                  <p className="text-sm text-gray-700">
                    PIN: {order.shippingAddress.pincode}
                  </p>

                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-gray-500">
                      Landmark: {order.shippingAddress.landmark}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => onPay(order)}
                  className="w-full rounded-xl bg-[#285570] py-2.5 text-sm font-medium text-white transition hover:bg-[#1e4257] active:scale-[0.98]"
                >
                  Pay Now
                </button>

                <button
                  onClick={() => onInvoice(order._id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Invoice
                </button>

                {canCancel && (
                  <button
                    onClick={() => onCancel(order._id)}
                    className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
                  >
                    Cancel Order
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

function MyOrders() {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await API.get(`/orders/invoice/${orderId}`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await API.put(
        `/orders/cancel/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(res.data.message);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleRazorpay = async (order) => {
    try {
      const { data } = await API.post(
        "/payment/create-order",
        { orderId: order._id },
        {
          headers: { Authorization: `Bearer ${token}` },
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
          const verifyRes = await API.post(
            "/payment/verify",
            {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
          toast.success(verifyRes.data.message);
          fetchOrders();
        },
        theme: { color: "#285570" },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          {/* Page header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                ZentraCart
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                My Orders
              </h1>
            </div>
            {orders.length > 0 && (
              <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500">
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#285570] border-t-transparent" />
            </div>
          )}

          {/* Empty state */}
          {!loading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-8 w-8 text-gray-400"
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
              <h3 className="text-base font-semibold text-gray-700">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Orders you place will appear here.
              </p>
            </div>
          )}

          {/* Orders list */}
          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancel={handleCancelOrder}
                  onPay={handleRazorpay}
                  onInvoice={handleDownloadInvoice}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyOrders;
