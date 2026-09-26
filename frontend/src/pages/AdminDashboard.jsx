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

import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  TicketPercent,
  TrendingUp,
  Clock3,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Search,
  Trash2,
  Check,
  Ban,
  Truck,
  Plus,
  CalendarDays,
  UserRound,
  ChevronRight,
} from "lucide-react";

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

  const [search, setSearch] = useState("");

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  // =========================================================
  // FETCH STATS
  // =========================================================

  const fetchStats = async () => {
    try {
      setLoadingStats(true);

      const res = await API.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoadingStats(false);
    }
  };

  // =========================================================
  // FETCH PENDING PRODUCTS
  // =========================================================

  const fetchPendingProducts = async () => {
    try {
      setLoadingProducts(true);

      const res = await API.get("/admin/pending-products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================================================
  // APPROVE PRODUCT
  // =========================================================

  const approveProduct = async (id) => {
    try {
      const res = await API.put(
        `/admin/approve/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      await fetchPendingProducts();
      await fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve product");
    }
  };

  // =========================================================
  // REJECT PRODUCT
  // =========================================================

  const rejectProduct = async (id) => {
    try {
      const res = await API.put(
        `/admin/reject/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      await fetchPendingProducts();
      await fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject product");
    }
  };

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);

      const res = await API.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data.users || []);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoadingUsers(false);
    }
  };

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);

      const res = await API.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data.orders || []);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoadingOrders(false);
    }
  };

  // =========================================================
  // FETCH COUPONS
  // =========================================================

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);

      const res = await API.get("/coupons");

      setCoupons(res.data.coupons || []);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // =========================================================
  // CREATE COUPON
  // =========================================================

  const createCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    if (!discount || Number(discount) <= 0) {
      toast.error("Enter a valid discount");
      return;
    }

    if (!expiryDate) {
      toast.error("Expiry date is required");
      return;
    }

    try {
      const res = await API.post(
        "/coupons",
        {
          code: couponCode.trim().toUpperCase(),
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

      await fetchCoupons();
    } catch (error) {
      console.log(error.response?.data);

      toast.error(error.response?.data?.message || "Failed To Create Coupon");
    }
  };

  // =========================================================
  // DELETE COUPON
  // =========================================================

  const deleteCoupon = async (id) => {
    try {
      const res = await API.delete(`/coupons/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);

      await fetchCoupons();
    } catch (error) {
      console.log(error.response?.data);

      toast.error(error.response?.data?.message || "Delete Failed");
    }
  };

  // =========================================================
  // DELETE USER
  // =========================================================

  const deleteUser = async (id) => {
    try {
      const res = await API.delete(`/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);

      await fetchUsers();
      await fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // =========================================================
  // MARK ORDER DELIVERED
  // =========================================================

  const markDelivered = async (id) => {
    try {
      const res = await API.put(
        `/orders/status/${id}`,
        {
          orderStatus: "delivered",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      await fetchOrders();
      await fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    if (!token) return;

    fetchStats();
    fetchPendingProducts();
    fetchUsers();
    fetchOrders();
    fetchCoupons();
  }, [token]);

  // =========================================================
  // TABS
  // =========================================================

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "products",
      label: "Pending Products",
      badge: products.length,
      icon: Package,
    },
    {
      id: "users",
      label: "All Users",
      badge: users.length,
      icon: Users,
    },
    {
      id: "orders",
      label: "All Orders",
      badge: orders.length,
      icon: ShoppingBag,
    },
    {
      id: "coupons",
      label: "Coupons",
      badge: coupons.length,
      icon: TicketPercent,
    },
  ];

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers || 0,
      icon: Users,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Total Products",
      value: stats.totalProducts || 0,
      icon: Package,
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders || 0,
      icon: ShoppingBag,
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Pending Products",
      value: stats.pendingProducts || 0,
      icon: Clock3,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Total Revenue",
      value: `₹${Number(stats.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
  ];

  // =========================================================
  // ORDER STATUS
  // =========================================================

  const getStatusStyle = (status) => {
    if (status === "delivered") {
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    }

    if (status === "shipped") {
      return "border-indigo-100 bg-indigo-50 text-indigo-700";
    }

    if (status === "confirmed") {
      return "border-blue-100 bg-blue-50 text-blue-700";
    }

    if (status === "cancelled") {
      return "border-red-100 bg-red-50 text-red-700";
    }

    return "border-amber-100 bg-amber-50 text-amber-700";
  };

  // =========================================================
  // CHART
  // =========================================================

  const chartData = {
    labels: ["Products", "Orders", "Revenue"],
    datasets: [
      {
        label: "Admin Analytics",
        data: [
          stats.totalProducts || 0,
          stats.totalOrders || 0,
          stats.totalRevenue || 0,
        ],
        backgroundColor: ["#e0e7ff", "#dbeafe", "#d1fae5"],
        borderColor: ["#6366f1", "#3b82f6", "#10b981"],
        borderWidth: 2,
        borderRadius: 10,
        barThickness: 48,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#fff",
        bodyColor: "#e2e8f0",
        padding: 12,
        cornerRadius: 10,
      },
    },

    scales: {
      y: {
        beginAtZero: true,

        grid: {
          color: "#f1f5f9",
        },

        border: {
          display: false,
        },

        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },
      },

      x: {
        grid: {
          display: false,
        },

        border: {
          display: false,
        },

        ticks: {
          color: "#64748b",
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="relative mb-7 overflow-hidden rounded-3xl bg-slate-900 px-5 py-7 text-white shadow-xl sm:px-8 sm:py-9">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-2xl" />
            <div className="absolute right-20 -bottom-24 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />

            <div className="relative">
              <div className="mb-2 flex items-center gap-2 text-indigo-300">
                <TrendingUp size={15} />

                <p className="text-[10px] font-bold tracking-[0.2em] uppercase sm:text-[11px]">
                  ZentraCart Control Center
                </p>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
                Monitor your marketplace, manage products, users, orders and
                promotional campaigns.
              </p>
            </div>
          </div>

          {/* ================================================= */}
          {/* STAT CARDS */}
          {/* ================================================= */}

          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bg} ${card.text} transition group-hover:bg-indigo-600 group-hover:text-white`}
                    >
                      <Icon size={20} />
                    </div>

                    <ChevronRight
                      size={17}
                      className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-500"
                    />
                  </div>

                  {loadingStats ? (
                    <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-900">
                      {card.value}
                    </p>
                  )}

                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {card.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ================================================= */}
          {/* ANALYTICS */}
          {/* ================================================= */}

          <div className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <TrendingUp size={18} />
                  </div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Analytics Overview
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-400">
                  Current marketplace performance snapshot
                </p>
              </div>

              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                Live Data
              </span>
            </div>

            <div className="h-[260px] w-full sm:h-[320px]">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* ================================================= */}
          {/* MANAGEMENT CARD */}
          {/* ================================================= */}

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* ================================================= */}
            {/* TABS */}
            {/* ================================================= */}

            <div className="border-b border-slate-200 bg-slate-50/70">
              <div className="flex gap-1 overflow-x-auto px-3 pt-3 sm:px-5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-semibold transition ${
                        activeTab === tab.id
                          ? "bg-white text-indigo-600 shadow-sm"
                          : "text-slate-400 hover:bg-white/70 hover:text-indigo-600"
                      }`}
                    >
                      <Icon size={15} />

                      <span>{tab.label}</span>

                      {tab.badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            activeTab === tab.id
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* ================================================= */}
              {/* OVERVIEW */}
              {/* ================================================= */}

              {activeTab === "overview" && (
                <div className="py-10 text-center sm:py-16">
                  <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
                    <LayoutDashboard size={32} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    Welcome to Admin Control Center
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                    Use the tabs above to manage pending products, users, orders
                    and coupons.
                  </p>
                </div>
              )}

              {/* ================================================= */}
              {/* PRODUCTS */}
              {/* ================================================= */}

              {activeTab === "products" && (
                <div>
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Pending Products
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Review and approve seller listings.
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
                      {products.length} Pending
                    </span>
                  </div>

                  {loadingProducts ? (
                    <div className="flex min-h-[250px] items-center justify-center">
                      <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                    </div>
                  ) : products.length === 0 ? (
                    <EmptyState
                      icon={CheckCircle2}
                      title="All caught up"
                      message="No pending products to review."
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl"
                        >
                          <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-50">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.title}
                                className="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="text-sm text-slate-400">
                                No Image
                              </div>
                            )}

                            <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold text-white shadow">
                              Pending Review
                            </span>
                          </div>

                          <div className="p-5">
                            <h3 className="line-clamp-1 text-base font-bold text-slate-900 transition group-hover:text-indigo-600">
                              {product.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 min-h-[40px] text-xs leading-5 text-slate-400">
                              {product.description}
                            </p>

                            <div className="mt-4 flex items-end justify-between">
                              <div>
                                <p className="text-2xl font-bold text-slate-900">
                                  ₹
                                  {Number(product.price || 0).toLocaleString(
                                    "en-IN",
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Seller:{" "}
                                  <span className="font-semibold text-slate-600">
                                    {product.seller?.name || "Unknown"}
                                  </span>
                                </p>
                              </div>

                              <Package size={19} className="text-slate-300" />
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                              <button
                                onClick={() => approveProduct(product._id)}
                                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                              >
                                <Check size={15} />
                                Approve
                              </button>

                              <button
                                onClick={() => rejectProduct(product._id)}
                                className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                              >
                                <XCircle size={15} />
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

              {/* ================================================= */}
              {/* USERS */}
              {/* ================================================= */}

              {activeTab === "users" && (
                <div>
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        All Users
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Manage registered ZentraCart users.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search
                        size={15}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-9 text-sm transition outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  {loadingUsers ? (
                    <div className="flex min-h-[250px] items-center justify-center">
                      <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {users
                        .filter((user) =>
                          `${user.name || ""} ${user.email || ""}`
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                        )
                        .map((user) => (
                          <div
                            key={user._id}
                            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg"
                          >
                            <div className="mb-5 flex items-center gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white transition group-hover:bg-indigo-600">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-slate-900">
                                  {user.name}
                                </h3>

                                <p className="truncate text-xs text-slate-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>

                            <div className="mb-4 flex items-center justify-between">
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 capitalize">
                                {user.role}
                              </span>

                              <UserRound size={17} className="text-slate-300" />
                            </div>

                            <button
                              onClick={() => deleteUser(user._id)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 size={15} />
                              Delete User
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  {!loadingUsers &&
                    users.filter((user) =>
                      `${user.name || ""} ${user.email || ""}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    ).length === 0 && (
                      <EmptyState
                        icon={Users}
                        title="No users found"
                        message="Try another search term."
                      />
                    )}
                </div>
              )}

              {/* ================================================= */}
              {/* ORDERS */}
              {/* ================================================= */}

              {activeTab === "orders" && (
                <div>
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      All Orders
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Monitor and update customer orders.
                    </p>
                  </div>

                  {loadingOrders ? (
                    <div className="flex min-h-[250px] items-center justify-center">
                      <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                    </div>
                  ) : orders.length === 0 ? (
                    <EmptyState
                      icon={ShoppingBag}
                      title="No orders found"
                      message="Orders will appear here when customers place them."
                    />
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md sm:p-5"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-bold text-slate-900">
                                  Order
                                </p>

                                <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold text-slate-500">
                                  #{order._id.slice(-6).toUpperCase()}
                                </span>
                              </div>

                              <div className="mt-2 grid gap-1 text-xs text-slate-400">
                                <p>
                                  Customer:{" "}
                                  <span className="font-semibold text-slate-600">
                                    {order.user?.name || "Unknown"}
                                  </span>
                                </p>

                                <p>
                                  Amount:{" "}
                                  <span className="font-bold text-slate-900">
                                    ₹
                                    {Number(
                                      order.finalAmount ||
                                        order.totalAmount ||
                                        0,
                                    ).toLocaleString("en-IN")}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <span
                                className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusStyle(
                                  order.orderStatus,
                                )}`}
                              >
                                {order.orderStatus}
                              </span>

                              {order.orderStatus !== "delivered" && (
                                <button
                                  onClick={() => markDelivered(order._id)}
                                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-600"
                                >
                                  <Truck size={14} />
                                  Mark Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ================================================= */}
              {/* COUPONS */}
              {/* ================================================= */}

              {activeTab === "coupons" && (
                <div>
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Coupon Management
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Create and manage promotional discount codes.
                    </p>
                  </div>

                  {/* CREATE COUPON */}
                  <div className="mb-7 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Plus size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          Create New Coupon
                        </p>

                        <p className="text-xs text-slate-400">
                          Add a discount campaign
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Discount %"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                      <div className="relative">
                        <CalendarDays
                          size={16}
                          className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-3 pl-10 text-sm transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <button
                        onClick={createCoupon}
                        className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                      >
                        <Plus size={16} />
                        Create Coupon
                      </button>
                    </div>
                  </div>

                  {/* COUPONS */}
                  {loadingCoupons ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                    </div>
                  ) : coupons.length === 0 ? (
                    <EmptyState
                      icon={TicketPercent}
                      title="No coupons found"
                      message="Create your first promotional coupon above."
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon._id}
                          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                        >
                          <div
                            className={`h-1.5 w-full ${
                              coupon.isActive ? "bg-emerald-500" : "bg-red-400"
                            }`}
                          />

                          <div className="p-5">
                            <div className="mb-5 flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                  Coupon Code
                                </p>

                                <h3 className="mt-1 text-lg font-black tracking-widest text-slate-900 transition group-hover:text-indigo-600">
                                  {coupon.code}
                                </h3>
                              </div>

                              <span
                                className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                                  coupon.isActive
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {coupon.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <p className="text-4xl font-black text-slate-900">
                              {coupon.discount}%
                              <span className="ml-1 text-sm font-semibold text-slate-400">
                                OFF
                              </span>
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                              <CalendarDays size={14} />

                              <span>
                                Expires:{" "}
                                <span className="font-semibold text-slate-600">
                                  {new Date(
                                    coupon.expiryDate,
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                            </div>

                            <button
                              onClick={() => deleteCoupon(coupon._id)}
                              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 size={15} />
                              Delete Coupon
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={28} />
      </div>

      <h3 className="text-base font-bold text-slate-700">{title}</h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default AdminDashboard;
