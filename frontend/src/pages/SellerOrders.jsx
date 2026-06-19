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
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      fetchOrders();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Update Failed");
    }
  };
  const handleDeleteOrder = async (orderId) => {
    try {
      const res = await API.delete(`/seller/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);

      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Delete Failed");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-8 text-4xl font-bold text-[#285570]">
          Seller Orders 📦
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#CBCAC7] bg-white p-10 text-center">
            <h3 className="text-2xl text-gray-500">No Orders Found</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-3xl border border-[#555] bg-[#2E2E2E] p-6 shadow-lg"
              >
                {/* Header */}

                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Order #{order._id.slice(-8)}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      Customer: {order.user?.name}
                    </p>

                    <p className="text-sm text-gray-400">{order.user?.email}</p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-700"
                        : order.orderStatus === "shipped"
                          ? "bg-blue-100 text-blue-700"
                          : order.orderStatus === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                    } `}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Content */}

                <div className="grid gap-8 md:grid-cols-2">
                  {/* Products */}

                  <div>
                    <h4 className="mb-4 font-semibold text-white">Products</h4>

                    <div className="space-y-3">
                      {order.products.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 rounded-2xl border border-[#444] bg-[#1F1F1F] p-4"
                        >
                          <div className="flex items-center gap-4">
                            {item.product?.images?.[0]?.url && (
                              <img
                                src={item.product.images[0].url}
                                alt={item.product.title}
                                className="h-16 w-16 rounded-xl border border-[#444] object-cover"
                              />
                            )}

                            <div>
                              <h5 className="font-medium text-white">
                                {item.product?.title}
                              </h5>

                              <p className="text-sm text-gray-400">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}

                  <div className="rounded-2xl border border-[#444] bg-[#333333] p-5">
                    <h4 className="mb-4 font-semibold text-[#4EA8DE]">
                      Order Summary
                    </h4>

                    <div className="mb-4 flex justify-between">
                      <span className="text-gray-300">Amount</span>

                      <span className="text-xl font-bold text-white">
                        ₹{order.finalAmount || order.totalAmount}
                      </span>
                    </div>

                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="mb-4 w-full rounded-xl border border-[#444] bg-[#1F1F1F] px-4 py-3 text-white"
                    >
                      <option value="pending">Pending</option>

                      <option value="confirmed">Confirmed</option>

                      <option value="shipped">Shipped</option>

                      <option value="delivered">Delivered</option>

                      <option value="cancelled">Cancelled</option>
                    </select>
                    {order.orderStatus === "cancelled" && (
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="mt-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                      >
                        Delete Order
                      </button>
                    )}

                    <div className="text-sm text-gray-400">
                      Update order status directly from the dropdown.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SellerOrders;
