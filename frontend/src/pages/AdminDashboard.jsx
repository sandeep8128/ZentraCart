import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import API from "../services/api";
import Navbar from "../components/Navbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function AdminDashboard() {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [coupons, setCoupons] = useState([]);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const chartData = {
    labels: ["Products", "Orders", "Revenue (₹)"],
    datasets: [
      {
        label: "Admin Analytics",
        data: [
          stats.totalProducts || 0,
          stats.totalOrders || 0,
          stats.totalRevenue || 0,
        ],
        backgroundColor: ["#EBF3F8", "#D6EAF8", "#285570"],
        borderColor: ["#285570", "#285570", "#1E4257"],
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        grid: { color: "#F1EFE8" },
        ticks: { color: "#888" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#888" },
      },
    },
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await API.get("/admin/pending-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const approveProduct = async (id) => {
    try {
      const res = await API.put(
        `/admin/approve/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(res.data.message);
      fetchPendingProducts();
      fetchStats();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const rejectProduct = async (id) => {
    try {
      const res = await API.put(
        `/admin/reject/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(res.data.message);
      fetchPendingProducts();
      fetchStats();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders);
    } catch (error) {
      console.log(error.response?.data);
    }
  };
  const fetchCoupons = async () => {
    try {
      const res = await API.get("/coupons");

      setCoupons(res.data.coupons);
    } catch (error) {
      console.log(error.response?.data);
    }
  };
  const createCoupon = async () => {
    try {
      const res = await API.post(
        "/coupons",
        {
          code: couponCode,
          discount,
          expiryDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      setCouponCode("");
      setDiscount("");
      setExpiryDate("");

      fetchCoupons();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Create Coupon");
    }
  };
  const deleteCoupon = async (id) => {
    try {
      const res = await API.delete(`/coupons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);

      fetchCoupons();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Delete Failed");
    }
  };

  const deleteUser = async (id) => {
    try {
      const res = await API.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const markDelivered = async (id) => {
    try {
      const res = await API.put(
        `/orders/status/${id}`,
        { orderStatus: "delivered" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(res.data.message);
      fetchOrders();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingProducts();
    fetchUsers();
    fetchOrders();
    fetchCoupons();
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Pending Products", badge: products.length },
    { id: "users", label: "All Users", badge: users.length },
    { id: "orders", label: "All Orders", badge: orders.length },
    { id: "coupons", label: "Coupons", badge: coupons.length },
  ];

  const statCards = [
    { label: "Total Users", value: stats.totalUsers || 0, icon: "👥" },
    { label: "Total Products", value: stats.totalProducts || 0, icon: "📦" },
    { label: "Total Orders", value: stats.totalOrders || 0, icon: "🛒" },
    {
      label: "Pending Products",
      value: stats.pendingProducts || 0,
      icon: "⏳",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue || 0}`,
      icon: "💰",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#F7F8FA] px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-1 text-sm text-gray-400">ZentraCart</p>
          <h1 className="text-2xl font-semibold text-[#285570]">
            Admin Dashboard
          </h1>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#CBCAC7] bg-white p-5"
            >
              <p className="mb-2 text-xl">{card.icon}</p>
              <p className="text-2xl font-semibold text-[#285570]">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-gray-400">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-3xl border border-[#CBCAC7] bg-white p-6">
          <h2 className="mb-6 text-2xl font-bold text-black">
            Analytics Overview 📊
          </h2>
          <div className="h-[450px] w-full">
            <Bar
              data={chartData}
              options={{
                ...chartOptions,
                maintainAspectRatio: false,
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-hidden rounded-3xl border border-[#CBCAC7] bg-white">
          {/* Tab Bar */}
          <div className="flex gap-1 border-b border-[#CBCAC7] px-6 pt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-t-xl px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-[#285570] text-white"
                    : "text-gray-400 hover:bg-[#EBF3F8] hover:text-[#285570]"
                } `}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-[#EBF3F8] text-[#285570]"
                    } `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="py-10 text-center text-gray-400">
                <p className="mb-3 text-4xl">📊</p>
                <p className="text-sm">
                  Select a tab above to manage products, users, or orders.
                </p>
              </div>
            )}

            {/* Pending Products Tab */}
            {activeTab === "products" && (
              <div>
                <h2 className="mb-4 text-base font-semibold text-[#285570]">
                  Pending Products
                </h2>
                {products.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <p className="mb-3 text-4xl">✅</p>
                    <p className="text-sm">No pending products to review.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="overflow-hidden rounded-3xl border border-[#CBCAC7] bg-white shadow-sm transition hover:shadow-xl"
                      >
                        {/* Image */}

                        {product.images?.[0]?.url && (
                          <img
                            src={product.images[0].url}
                            alt={product.title}
                            className="h-56 w-full object-cover"
                          />
                        )}

                        {/* Content */}

                        <div className="p-5">
                          <h3 className="mb-2 text-lg font-bold text-[#285570]">
                            {product.title}
                          </h3>

                          <p className="mb-3 line-clamp-3 text-sm text-gray-500">
                            {product.description}
                          </p>

                          <p className="mb-2 text-xl font-bold text-[#285570]">
                            ₹{product.price}
                          </p>

                          <p className="mb-4 text-sm text-gray-500">
                            Seller:
                            <span className="ml-1 font-medium text-[#285570]">
                              {product.seller?.name}
                            </span>
                          </p>

                          <div className="flex gap-3">
                            <button
                              onClick={() => approveProduct(product._id)}
                              className="flex-1 rounded-xl bg-[#285570] py-3 text-white hover:bg-[#1E4257]"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => rejectProduct(product._id)}
                              className="flex-1 rounded-xl bg-red-500 py-3 text-white hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div>
                <h2 className="mb-4 text-base font-semibold text-[#285570]">
                  All Users
                </h2>
                {users.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <p className="mb-3 text-4xl">👤</p>
                    <p className="text-sm">No users found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="rounded-3xl border border-[#CBCAC7] bg-white p-6 shadow-sm transition hover:shadow-xl"
                      >
                        <div className="mb-4 flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#285570] text-xl font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <h3 className="font-bold text-[#285570]">
                              {user.name}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="rounded-full bg-[#EBF3F8] px-3 py-1 text-sm font-medium text-[#285570]">
                            {user.role}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteUser(user._id)}
                          className="w-full rounded-xl bg-red-500 py-3 text-white transition hover:bg-red-600"
                        >
                          Delete User
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="mb-4 text-base font-semibold text-[#285570]">
                  All Orders
                </h2>
                {orders.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <p className="mb-3 text-4xl">🛒</p>
                    <p className="text-sm">No orders found.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between rounded-2xl border border-[#CBCAC7] px-5 py-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#285570]">
                            Order{" "}
                            <span className="font-mono text-xs">
                              #{order._id.slice(-6)}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            Customer:{" "}
                            <span className="text-[#285570]">
                              {order.user?.name}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            Amount:{" "}
                            <span className="font-medium text-[#285570]">
                              ₹{order.finalAmount || order.totalAmount}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              order.orderStatus === "delivered"
                                ? "border border-green-200 bg-green-50 text-green-600"
                                : "border border-amber-200 bg-amber-50 text-amber-600"
                            } `}
                          >
                            {order.orderStatus}
                          </span>
                          {order.orderStatus !== "delivered" && (
                            <button
                              onClick={() => markDelivered(order._id)}
                              className="rounded-xl bg-[#285570] px-4 py-2 text-xs text-white transition hover:bg-[#1E4257]"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "coupons" && (
              <div>
                <h2 className="mb-4 text-base font-semibold text-[#285570]">
                  Coupon Management
                </h2>

                {/* Create Coupon */}

                <div className="mb-6 rounded-3xl border border-[#CBCAC7] bg-white p-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="rounded-xl border border-[#CBCAC7] px-4 py-3"
                    />

                    <input
                      type="number"
                      placeholder="Discount %"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="rounded-xl border border-[#CBCAC7] px-4 py-3"
                    />

                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="rounded-xl border border-[#CBCAC7] px-4 py-3"
                    />

                    <button
                      onClick={createCoupon}
                      className="rounded-xl bg-[#285570] px-4 py-3 text-white hover:bg-[#1E4257]"
                    >
                      Create Coupon
                    </button>
                  </div>
                </div>

                {/* Coupons List */}

                {coupons.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    No Coupons Found
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon._id}
                        className="rounded-3xl border border-[#CBCAC7] bg-white p-5"
                      >
                        <h3 className="text-xl font-bold text-[#285570]">
                          {coupon.code}
                        </h3>

                        <p className="mt-3 text-3xl font-bold">
                          {coupon.discount}% OFF
                        </p>

                        <p className="mt-3 text-sm text-gray-500">
                          Expires:{" "}
                          {new Date(coupon.expiryDate).toLocaleDateString()}
                        </p>

                        <span
                          className={`mt-4 inline-block rounded-full px-3 py-1 text-sm ${
                            coupon.isActive
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          } `}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() => deleteCoupon(coupon._id)}
                          className="mt-4 w-full rounded-xl bg-red-500 py-2 text-white transition hover:bg-red-600"
                        >
                          Delete Coupon
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
