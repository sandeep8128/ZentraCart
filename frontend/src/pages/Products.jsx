import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const SORT_OPTIONS = [
  { value: "", label: "Sort By" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rating" },
];

function Products() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  // ==========================
  // FETCH PRODUCTS
  // ==========================

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const res = await API.get(
        `/products?keyword=${encodeURIComponent(
          keyword,
        )}&category=${encodeURIComponent(
          category,
        )}&minPrice=${minPrice}&maxPrice=${maxPrice}&sort=${sort}&page=${page}`,
      );

      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // LOAD PRODUCTS
  // ==========================

  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";

    setKeyword(urlKeyword);
    fetchProducts();
  }, [page, searchParams]);

  // ==========================
  // SEARCH
  // ==========================

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  // ==========================
  // RESET
  // ==========================

  const handleReset = () => {
    setKeyword("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("");
    setPage(1);

    setTimeout(() => {
      fetchProducts();
    }, 100);
  };

  // ==========================
  // SLIDER PRODUCTS
  // ==========================

  const sliderProducts = products.filter(
    (p) =>
      p.image ||
      p.images?.[0]?.url ||
      p.images?.[0] ||
      p.imageUrl ||
      p.thumbnail,
  );

  // ==========================
  // ACTIVE FILTER COUNT
  // ==========================

  const activeFilterCount = [category, minPrice, maxPrice, sort].filter(
    Boolean,
  ).length;

  return (
    <>
      <Navbar />

      {/* ==========================
          ANIMATION
      ========================== */}

      <style>{`
        @keyframes productMarquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .product-marquee-track {
          animation: productMarquee 28s linear infinite;
        }

        @media (max-width: 640px) {
          .product-marquee-track {
            animation-duration: 35s;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#FAF7F6]">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="relative min-h-[210px] overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#141b3d] to-[#1a1436] px-4 pt-10 pb-16 sm:px-6 sm:pt-12 sm:pb-20">
          {/* ==========================
              SLIDING PRODUCTS
              OPACITY 90%
          ========================== */}

          {sliderProducts.length > 0 && (
            <div className="absolute inset-0 opacity-[0.9]">
              <div className="product-marquee-track flex h-full w-max items-center gap-4 pl-4 sm:gap-6 sm:pl-6">
                {[...sliderProducts, ...sliderProducts].map((product, i) => (
                  <div
                    key={`${product._id}-${i}`}
                    className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:h-40 sm:w-40"
                  >
                    <img
                      src={
                        product.image ||
                        product.images?.[0]?.url ||
                        product.images?.[0] ||
                        product.imageUrl ||
                        product.thumbnail
                      }
                      alt=""
                      onError={(e) => {
                        e.currentTarget.parentElement.style.display = "none";
                      }}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================
              DARK OVERLAY
          ========================== */}

          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220]/90 via-[#141b3d]/85 to-[#1a1436]/90" />

          {/* ==========================
              HEADER CONTENT
          ========================== */}

          <div className="relative z-10 mx-auto max-w-7xl">
            <p className="mb-2 text-[11px] font-semibold tracking-[2px] text-indigo-300 uppercase sm:text-xs">
              Catalog
            </p>

            <h1 className="text-3xl leading-tight font-extrabold text-white sm:text-4xl md:text-5xl">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-teal-300 via-indigo-300 to-pink-300 bg-clip-text text-transparent">
                Products
              </span>
            </h1>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-6">
          {/* =====================================================
              FILTER & SORT
          ===================================================== */}

          <div className="relative z-20 -mt-8 mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:-mt-8 sm:mb-10 sm:p-6">
            {/* TITLE */}

            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-700 sm:text-base">
                Filter &amp; Sort
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-600 sm:text-xs">
                    {activeFilterCount} active
                  </span>
                )}
              </h2>
            </div>

            {/* FILTER CONTROLS */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
              {/* SEARCH */}

              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:min-w-[220px] lg:flex-1"
              />

              {/* CATEGORY */}

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-[245px]"
              />

              {/* MIN PRICE */}

              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-32"
              />

              {/* MAX PRICE */}

              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-32"
              />

              {/* SORT */}

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-[220px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* SEARCH BUTTON */}

              <button
                onClick={handleSearch}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                Search
              </button>

              {/* RESET BUTTON */}

              <button
                onClick={handleReset}
                className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
              >
                Reset
              </button>
            </div>
          </div>

          {/* =====================================================
              RESULTS
          ===================================================== */}

          {!loading && (
            <p className="mb-5 text-xs text-slate-500 sm:text-sm">
              {products.length > 0
                ? `Showing ${products.length} product${
                    products.length > 1 ? "s" : ""
                  }`
                : "No results"}
            </p>
          )}

          {/* =====================================================
              PRODUCT GRID
          ===================================================== */}

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-16">
              <div className="mb-3 text-4xl">🔍</div>

              <h3 className="text-base font-semibold text-slate-700 sm:text-lg">
                No products found
              </h3>

              <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                Try adjusting your filters or search keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          {!loading && products.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12 sm:gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
              >
                ← Previous
              </button>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:px-4 sm:text-sm">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Products;
