import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

function SellerOrders() {
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/seller/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await API.put(
        `/seller/orders/${orderId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success(res.data.message);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const res = await API.delete(`/seller/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusConfig = {
    pending: {
      label: "Pending",
      bg: "#FEF3C7",
      color: "#92400E",
      dot: "#D97706",
    },
    confirmed: {
      label: "Confirmed",
      bg: "#DBEAFE",
      color: "#1E40AF",
      dot: "#3B82F6",
    },
    shipped: {
      label: "Shipped",
      bg: "#EDE9FE",
      color: "#5B21B6",
      dot: "#7C3AED",
    },
    delivered: {
      label: "Delivered",
      bg: "#D1FAE5",
      color: "#065F46",
      dot: "#10B981",
    },
    cancelled: {
      label: "Cancelled",
      bg: "#FEE2E2",
      color: "#991B1B",
      dot: "#EF4444",
    },
  };

  const nextActionConfig = {
    pending: {
      label: "Confirm Order",
      next: "confirmed",
      bg: "#10B981",
      hover: "#059669",
    },
    confirmed: {
      label: "Mark Shipped",
      next: "shipped",
      bg: "#3B82F6",
      hover: "#2563EB",
    },
    shipped: {
      label: "Mark Delivered",
      next: "delivered",
      bg: "#7C3AED",
      hover: "#6D28D9",
    },
  };

  return (
    <>
      <Navbar />

      <div
        style={{ minHeight: "100vh", background: "#f5f6fa", padding: "2rem" }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Page Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "#EDE9FE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                }}
              >
                📦
              </div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Seller Orders
              </h1>
            </div>
            <p
              style={{
                fontSize: 13,
                color: "#9ca3af",
                margin: 0,
                paddingLeft: 48,
              }}
            >
              {orders.length} order{orders.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Empty State */}
          {orders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "#ffffff",
                borderRadius: 16,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>
                No orders found
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {orders.map((order) => {
                const status = order.orderStatus;
                const sc = statusConfig[status] || statusConfig.pending;
                const na = nextActionConfig[status];

                return (
                  <div
                    key={order._id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 16,
                      padding: "1.5rem",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Top accent line */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 3,
                        background: sc.dot,
                        borderRadius: "16px 16px 0 0",
                      }}
                    />

                    {/* Order Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "1.25rem",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "#111827",
                            }}
                          >
                            Order #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11,
                              fontWeight: 500,
                              padding: "3px 10px",
                              borderRadius: 20,
                              background: sc.bg,
                              color: sc.color,
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: sc.dot,
                                display: "inline-block",
                              }}
                            />
                            {sc.label}
                          </span>
                        </div>
                        <p
                          style={{ fontSize: 12, color: "#6b7280", margin: 0 }}
                        >
                          {order.user?.name} · {order.user?.email}
                        </p>
                      </div>

                      {/* Next Action Button */}
                      {na && (
                        <button
                          onClick={() => updateStatus(order._id, na.next)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            background: na.bg,
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 500,
                            flexShrink: 0,
                            transition: "background 0.15s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = na.hover)
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background = na.bg)
                          }
                        >
                          {na.label} →
                        </button>
                      )}
                    </div>

                    {/* Body Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                      }}
                    >
                      {/* Products */}
                      <div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            textTransform: "uppercase",
                            letterSpacing: "0.07em",
                            margin: "0 0 10px",
                            fontWeight: 500,
                          }}
                        >
                          Products
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          {order.products.map((item) => (
                            <div
                              key={item._id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "10px 12px",
                                background: "#f9fafb",
                                border: "1px solid #e5e7eb",
                                borderRadius: 10,
                              }}
                            >
                              {item.product?.images?.[0]?.url && (
                                <img
                                  src={item.product.images[0].url}
                                  alt={item.product.title}
                                  style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                    border: "1px solid #e5e7eb",
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <div>
                                <p
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: "#111827",
                                    margin: "0 0 2px",
                                  }}
                                >
                                  {item.product?.title}
                                </p>
                                <p
                                  style={{
                                    fontSize: 11,
                                    color: "#9ca3af",
                                    margin: 0,
                                  }}
                                >
                                  Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                        }}
                      >
                        {/* Order Summary */}
                        <div
                          style={{
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            borderRadius: 10,
                            padding: "14px 16px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              textTransform: "uppercase",
                              letterSpacing: "0.07em",
                              margin: "0 0 10px",
                              fontWeight: 500,
                            }}
                          >
                            Order Summary
                          </p>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 8,
                            }}
                          >
                            <span style={{ fontSize: 12, color: "#6b7280" }}>
                              Order Date
                            </span>

                            <span style={{ fontSize: 12, fontWeight: 500 }}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 12,
                            }}
                          >
                            <span style={{ fontSize: 12, color: "#6b7280" }}>
                              Payment
                            </span>

                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 500,
                                textTransform: "capitalize",
                              }}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 12,
                            }}
                          >
                            <span style={{ fontSize: 12, color: "#6b7280" }}>
                              Total Amount
                            </span>
                            <span
                              style={{
                                fontSize: 18,
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              ₹{order.finalAmount || order.totalAmount}
                            </span>
                          </div>

                          <select
                            value={order.orderStatus}
                            onChange={(e) =>
                              updateStatus(order._id, e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: 8,
                              fontSize: 12,
                              background: "#ffffff",
                              border: "1px solid #d1d5db",
                              color: "#111827",
                              cursor: "pointer",
                              outline: "none",
                              marginBottom: status === "cancelled" ? 10 : 0,
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {status === "cancelled" && (
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              style={{
                                width: "100%",
                                padding: "8px",
                                borderRadius: 8,
                                border: "1px solid #FCA5A5",
                                background: "#FEE2E2",
                                color: "#991B1B",
                                fontSize: 12,
                                cursor: "pointer",
                                fontWeight: 500,
                                transition: "background 0.15s",
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.background = "#FECACA")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.background = "#FEE2E2")
                              }
                            >
                              Delete Order
                            </button>
                          )}
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div
                            style={{
                              background: "#f9fafb",
                              border: "1px solid #e5e7eb",
                              borderRadius: 10,
                              padding: "14px 16px",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 11,
                                color: "#9ca3af",
                                textTransform: "uppercase",
                                letterSpacing: "0.07em",
                                margin: "0 0 10px",
                                fontWeight: 500,
                              }}
                            >
                              📍 Delivery Address
                            </p>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#111827",
                                margin: "0 0 4px",
                              }}
                            >
                              {order.shippingAddress.fullName}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#6b7280",
                                margin: "0 0 2px",
                              }}
                            >
                              {order.shippingAddress.phone}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#6b7280",
                                margin: "0 0 2px",
                              }}
                            >
                              {order.shippingAddress.address}
                            </p>
                            <p
                              style={{
                                fontSize: 12,
                                color: "#6b7280",
                                margin: "0 0 2px",
                              }}
                            >
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.state} —{" "}
                              {order.shippingAddress.pincode}
                            </p>
                            {order.shippingAddress.landmark && (
                              <p
                                style={{
                                  fontSize: 12,
                                  color: "#9ca3af",
                                  margin: 0,
                                }}
                              >
                                Near: {order.shippingAddress.landmark}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SellerOrders;
