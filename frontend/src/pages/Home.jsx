import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import API from "../services/api";

const CATEGORIES = [
  "All",
  "Electronics",
  "Beauty",
  "Furniture",
  "Fashion",
  "Home",
  "Sports",
];

const CATEGORY_META = [
  { cat: "Electronics", emoji: "📱", color: "#2563EB" },
  { cat: "Beauty", emoji: "💄", color: "#EC4899" },
  { cat: "Fashion", emoji: "👗", color: "#7C3AED" },
  { cat: "Home", emoji: "🏠", color: "#10B981" },
  { cat: "Sports", emoji: "⚽", color: "#F97316" },
  { cat: "Furniture", emoji: "🛋️", color: "#F59E0B" },
  { cat: "Mobile", emoji: "📱", color: "#06B6D4" },
];

const TRUST_ITEMS = [
  {
    icon: "🛡️",
    title: "Secure Payments",
    sub: "100% safe checkout",
  },
  {
    icon: "🚀",
    title: "Fast Delivery",
    sub: "Pan India shipping",
  },
  {
    icon: "✅",
    title: "Trusted Sellers",
    sub: "Verified merchants",
  },
  {
    icon: "💎",
    title: "Premium Quality",
    sub: "Handpicked products",
  },
];

const QUICK_LINKS = [
  ["Home", "/"],
  ["Products", "/products"],
  ["Wishlist", "/wishlist"],
  ["Cart", "/cart"],
];

const WHY_US = [
  "Premium Products",
  "Secure Payments",
  "Fast Delivery",
  "Trusted Sellers",
];

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSellers: 0,
    averageRating: 0,
  });

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");

      setProducts(res.data.products || []);

      if (res.data.stats) {
        setStats({
          totalProducts: res.data.stats.totalProducts || 0,
          totalSellers: res.data.stats.totalSellers || 0,
          averageRating: res.data.stats.averageRating || 0,
        });
      }
    } catch (error) {
      console.log(
        "HOME PRODUCTS ERROR =>",
        error.response?.data
      );
    }
  };

  useEffect(() => {
    fetchProducts();

    const viewed =
      JSON.parse(localStorage.getItem("recentProducts")) || [];

    setRecentProducts(viewed);
  }, []);

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter(
          (p) =>
            p.category?.toLowerCase() ===
            activeCategory.toLowerCase()
        );

  return (
    <>
      <Navbar />

      <div className="min-h-screen overflow-x-hidden bg-[#FAF7F6] dark:bg-[#121212]">

        {/* ================= HERO ================= */}

        <section className="relative min-h-[540px] overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#141b3d] to-[#1a1436]">

          <div className="pointer-events-none absolute -right-24 -top-24 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.22)_0%,transparent_70%)] sm:h-[360px] sm:w-[360px] lg:h-[420px] lg:w-[420px]" />

          <div className="pointer-events-none absolute -bottom-16 -left-16 h-[240px] w-[240px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.18)_0%,transparent_70%)] sm:h-[280px] sm:w-[280px] lg:h-[320px] lg:w-[320px]" />

          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:px-6 lg:py-20">

            {/* HERO LEFT */}

            <div className="text-center lg:text-left">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-1.5 sm:mb-6 sm:px-4">
                <span className="h-2 w-2 rounded-full bg-pink-400" />

                <span className="text-[11px] font-medium text-teal-200 sm:text-[13px]">
                  New arrivals every week
                </span>
              </div>

              <h1 className="mb-4 text-[36px] font-extrabold leading-[1.08] text-white sm:text-[46px] md:text-[52px] lg:mb-5 lg:text-[60px]">
                Discover Products
                <br />
                <span className="bg-gradient-to-r from-teal-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
                  You'll Love
                </span>
              </h1>

              <p className="mx-auto mb-7 max-w-[460px] text-[14px] leading-[1.7] text-slate-400 sm:text-[16px] lg:mx-0 lg:mb-9">
                ZentraCart brings you handpicked deals across
                electronics, fashion, beauty & more — at prices
                that make sense.
              </p>

              <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:justify-center lg:justify-start">

                <button
                  onClick={() => navigate("/products")}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 via-indigo-500 to-pink-500 px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_24px_rgba(99,102,241,0.35)] transition-transform hover:-translate-y-0.5 sm:w-auto sm:px-8 sm:text-[15px]"
                >
                  Shop Now →
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.08] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/[0.14] sm:w-auto"
                >
                  Browse All
                </button>

              </div>

              {/* STATS */}

              <div className="flex justify-center gap-6 sm:gap-8 lg:justify-start">

                <div className="text-center lg:text-left">
                  <p className="m-0 bg-gradient-to-r from-teal-300 to-pink-300 bg-clip-text text-[19px] font-extrabold text-transparent sm:text-[22px]">
                    {stats.totalProducts}+
                  </p>
                  <p className="m-0 text-[11px] text-slate-500 sm:text-[13px]">
                    Products
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <p className="m-0 bg-gradient-to-r from-teal-300 to-pink-300 bg-clip-text text-[19px] font-extrabold text-transparent sm:text-[22px]">
                    {stats.totalSellers}+
                  </p>
                  <p className="m-0 text-[11px] text-slate-500 sm:text-[13px]">
                    Sellers
                  </p>
                </div>

                <div className="text-center lg:text-left">
                  <p className="m-0 bg-gradient-to-r from-teal-300 to-pink-300 bg-clip-text text-[19px] font-extrabold text-transparent sm:text-[22px]">
                    {stats.averageRating > 0
                      ? `${stats.averageRating}★`
                      : "New"}
                  </p>
                  <p className="m-0 text-[11px] text-slate-500 sm:text-[13px]">
                    Rating
                  </p>
                </div>

              </div>
            </div>

            {/* HERO RIGHT */}

            <div className="relative hidden h-[340px] items-center justify-center lg:flex">

              <div className="flex h-60 w-60 items-center justify-center rounded-[40px] border border-white/[0.08] bg-gradient-to-br from-teal-400/20 via-indigo-500/20 to-pink-500/20 text-[90px]">
                🛍️
              </div>

              <div className="absolute right-5 top-2.5 flex h-[54px] w-[54px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-2xl">
                🎧
              </div>

              <div className="absolute bottom-7 left-5 flex h-[54px] w-[54px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-2xl">
                ⌚
              </div>

              <div className="absolute left-0 top-[110px] flex h-[54px] w-[54px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-2xl">
                👟
              </div>

            </div>
          </div>
        </section>

        {/* ================= FEATURED PRODUCTS ================= */}

        <section className="mx-auto max-w-7xl px-2.5 py-8 sm:px-6 sm:py-14 lg:py-16">

          <div className="mb-4 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-[2px] text-indigo-500 uppercase sm:text-xs">
                Featured
              </p>

              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Trending Right Now
              </h2>
            </div>

            <button
              onClick={() => navigate("/products")}
              className="w-full rounded-lg border border-indigo-500 px-5 py-2.5 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 sm:w-auto"
            >
              View All →
            </button>
          </div>

          {/* CATEGORY PILLS */}

          <div className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:mb-7 sm:flex-wrap sm:overflow-visible sm:pb-0">

            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors sm:px-[18px] sm:py-[7px] sm:text-[13px] ${
                  activeCategory === cat
                    ? "border-indigo-600 bg-gradient-to-r from-indigo-600 to-pink-500 text-white"
                    : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}

          </div>

          {/* PRODUCT GRID */}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-400 sm:p-12">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">

              {filtered.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}

            </div>
          )}

        </section>

        {/* ================= SHOP BY CATEGORY ================= */}

        <section className="bg-indigo-50/60 px-4 py-10 sm:px-5 sm:py-14 lg:py-15">

          <div className="mx-auto max-w-7xl">

            <h2 className="mb-7 text-center text-2xl font-extrabold text-gray-900 sm:mb-10 sm:text-3xl">
              Shop by Category
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">

              {CATEGORY_META.map(({ cat, emoji, color }) => (
                <div
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  style={{
                    borderTop: `3px solid ${color}`,
                  }}
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white px-2 py-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:rounded-2xl sm:px-3 sm:py-6"
                >

                  <div className="mb-2 text-[27px] sm:text-[30px]">
                    {emoji}
                  </div>

                  <div className="text-[12px] font-semibold text-slate-800 sm:text-[13px]">
                    {cat}
                  </div>

                </div>
              ))}

            </div>
          </div>
        </section>

        {/* ================= RECENTLY VIEWED ================= */}

        {recentProducts.length > 0 && (
          <section className="mx-auto max-w-7xl px-2.5 py-8 sm:px-6 sm:py-14 lg:py-16">

            <div className="mb-6 sm:mb-8">

              <p className="mb-1.5 text-[11px] font-semibold tracking-[2px] text-indigo-500 uppercase sm:text-xs">
                Your History
              </p>

              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Recently Viewed
              </h2>

            </div>

            {/* MOBILE = 2 COLUMNS */}

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">

              {recentProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}

            </div>

          </section>
        )}

        {/* ================= TRUST STRIP ================= */}

        <section className="bg-[#0b1220] px-4 py-10 sm:px-5 sm:py-12">

          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-7 sm:gap-8 md:grid-cols-4">

            {TRUST_ITEMS.map(({ icon, title, sub }) => (
              <div
                key={title}
                className="text-center"
              >

                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-[23px] sm:h-12 sm:w-12 sm:text-[26px]">
                  {icon}
                </div>

                <p className="m-0 text-[12px] font-semibold text-white sm:text-[13px]">
                  {title}
                </p>

                <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                  {sub}
                </p>

              </div>
            ))}

          </div>
        </section>

        {/* ================= AI FLOATING BUTTON ================= */}

        <div
          onClick={() => navigate("/ai")}
          className="fixed bottom-4 right-4 z-50 cursor-pointer sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8"
        >

          <div className="absolute inset-0 -m-2 animate-pulse rounded-full bg-gradient-to-r from-teal-400 via-indigo-500 to-pink-500 opacity-40 blur-lg sm:-m-3" />

          <div
            className="absolute inset-0 -m-2.5 animate-spin rounded-full border border-transparent"
            style={{
              borderTopColor: "rgba(45,212,191,0.7)",
              borderRightColor: "rgba(168,85,247,0.4)",
              animationDuration: "3s",
            }}
          />

          <div
            className="absolute inset-0 -m-3.5 rounded-full border border-transparent"
            style={{
              borderBottomColor: "rgba(236,72,153,0.5)",
              borderLeftColor: "rgba(45,212,191,0.35)",
              animation: "spin 5s linear infinite reverse",
            }}
          />

          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform duration-200 hover:scale-110 active:scale-95 sm:h-[72px] sm:w-[72px]"
            style={{
              background:
                "linear-gradient(135deg, #2dd4bf 0%, #6366f1 55%, #ec4899 100%)",
              boxShadow:
                "0 8px 32px rgba(99,102,241,0.5), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >

            <svg
              className="h-6 w-6 text-white sm:h-8 sm:w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
              />
            </svg>

            <span className="absolute right-0.5 top-0.5 flex h-3 w-3 items-center justify-center sm:right-1 sm:top-1 sm:h-3.5 sm:w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400 sm:h-2.5 sm:w-2.5" />
            </span>

          </div>

          <p className="mt-1.5 text-center text-[9px] font-medium tracking-wide text-gray-400 sm:mt-2 sm:text-[11px]">
            AI Assistant
          </p>

        </div>

        {/* ================= FOOTER ================= */}

        <footer className="border-t border-[#1e2d45] bg-[#0d1525] text-white">

          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:gap-10 sm:px-6 sm:py-14 md:grid-cols-3">

            {/* BRAND */}

            <div>

              <h2 className="m-0 text-lg font-bold">
                Zentra
                <span className="bg-gradient-to-r from-teal-300 to-pink-400 bg-clip-text text-transparent">
                  Cart
                </span>
              </h2>

              <p className="mt-3 max-w-md text-sm leading-[1.7] text-slate-400">
                Discover premium products from trusted sellers
                with a seamless shopping experience.
              </p>

            </div>

            {/* QUICK LINKS */}

            <div>

              <h3 className="mb-4 text-[11px] font-semibold tracking-[2px] text-slate-400 uppercase">
                Quick Links
              </h3>

              <ul className="m-0 flex list-none flex-col gap-2 p-0">

                {QUICK_LINKS.map(([label, path]) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate(path)}
                      className="border-none bg-transparent p-0 text-sm text-slate-400 transition-colors hover:text-teal-300"
                    >
                      {label}
                    </button>
                  </li>
                ))}

              </ul>
            </div>

            {/* WHY US */}

            <div>

              <h3 className="mb-4 text-[11px] font-semibold tracking-[2px] text-slate-400 uppercase">
                Why ZentraCart?
              </h3>

              <ul className="m-0 flex list-none flex-col gap-2 p-0">

                {WHY_US.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <span className="text-teal-300">
                      ✔
                    </span>

                    {item}
                  </li>
                ))}

              </ul>
            </div>

          </div>

          {/* COPYRIGHT */}

          <div className="border-t border-[#1e2d45] px-4 py-[18px] text-center text-[10px] text-slate-600 sm:text-xs">
            © 2026 ZentraCart. All Rights Reserved.
          </div>

        </footer>

      </div>
    </>
  );
}

export default Home;