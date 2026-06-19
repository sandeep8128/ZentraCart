import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

function MyOrders() {
  const { token } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);

      setOrders(res.data.orders);
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      fetchOrders();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Cancel Order");
    }
  };

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

        handler: async function (response) {
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

          alert(verifyRes.data.message);

          fetchOrders();
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Payment Failed");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div className="mx-auto min-h-screen max-w-7xl bg-white p-6">
        <h1 className="mb-8 text-4xl font-bold text-black">My Orders 📦</h1>
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
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Order #{order._id.slice(-8)}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
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

                <div className="grid gap-8 md:grid-cols-2">
                  {/* Products */}

                  <div>
                    <h4 className="mb-4 font-semibold tracking-wider text-gray-300 uppercase">
                      Products
                    </h4>

                    <div className="space-y-3">
                      {order.products.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center gap-4 rounded-2xl border border-[#444] bg-[#1F1F1F] p-4"
                        >
                          {item.product?.images?.[0]?.url && (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.title}
                              className="h-16 w-16 rounded-lg object-cover"
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
                      ))}
                    </div>
                  </div>

                  {/* Order Info */}

                  <div className="rounded-2xl border border-[#444] bg-[#333333] p-5">
                    <h4 className="mb-4 font-semibold tracking-wider text-white uppercase">
                      Order Summary
                    </h4>

                    <div className="mb-3 flex justify-between">
                      <span className="text-gray-400">Status</span>

                      <span className="font-medium text-white">
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="mb-5 flex justify-between">
                      <span className="text-gray-400">Total Amount</span>

                      <span className="text-2xl font-bold text-white">
                        ₹{order.finalAmount}
                      </span>
                    </div>
                    {/* Order Tracking */}

                    <div className="mb-6">
                      <h5 className="mb-4 font-semibold text-white">
                        Order Tracking
                      </h5>

                      <div className="flex items-center justify-between">
                        {["pending", "confirmed", "shipped", "delivered"].map(
                          (status, index) => {
                            const currentIndex = [
                              "pending",
                              "confirmed",
                              "shipped",
                              "delivered",
                            ].indexOf(order.orderStatus);

                            return (
                              <div
                                key={status}
                                className="flex flex-1 items-center"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                      index <= currentIndex
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-600 text-gray-300"
                                    } `}
                                  >
                                    ✓
                                  </div>

                                  <span className="mt-2 text-xs text-gray-300 capitalize">
                                    {status}
                                  </span>
                                </div>

                                {index < 3 && (
                                  <div
                                    className={`mx-2 h-1 flex-1 ${
                                      index < currentIndex
                                        ? "bg-green-500"
                                        : "bg-gray-600"
                                    } `}
                                  />
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {order.orderStatus !== "cancelled" &&
                        order.orderStatus !== "shipped" &&
                        order.orderStatus !== "delivered" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                          >
                            Cancel Order
                          </button>
                        )}

                      <button
                        onClick={() => handleRazorpay(order)}
                        className="rounded-lg bg-[#285570] px-4 py-2 text-white hover:bg-[#1E4257]"
                      >
                        Pay Now
                      </button>
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

export default MyOrders;
