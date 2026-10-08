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

const DELIVERY_RADIUS_KM = 30;

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

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // =====================================================
  // LOCATION
  // =====================================================

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // =====================================================
  // LOAD SAVED LOCATION
  // =====================================================

  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem("zentraCartLocation");

      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);

        if (
          Number.isFinite(Number(parsedLocation.latitude)) &&
          Number.isFinite(Number(parsedLocation.longitude))
        ) {
          setLocation({
            latitude: Number(parsedLocation.latitude),
            longitude: Number(parsedLocation.longitude),
            address: parsedLocation.address || "",
          });
        }
      }
    } catch (error) {
      console.log("LOCATION LOAD ERROR:", error);
    }
  }, []);

  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const handleUseCurrentLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude);

        const longitude = Number(position.coords.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setLocationError("Invalid location detected.");
          setLocationLoading(false);
          return;
        }

        const newLocation = {
          latitude,
          longitude,
        };

        setLocation(newLocation);

        localStorage.setItem("zentraCartLocation", JSON.stringify(newLocation));

        setPage(1);
        setLocationLoading(false);
      },

      (error) => {
        console.log("LOCATION ERROR:", error);

        let message = "Unable to get your location.";

        if (error.code === 1) {
          message =
            "Location permission denied. You can continue shopping normally.";
        } else if (error.code === 2) {
          message = "Your location could not be determined.";
        } else if (error.code === 3) {
          message = "Location request timed out.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  };

  // =====================================================
  // CLEAR LOCATION
  // =====================================================

  const handleClearLocation = () => {
    setLocation(null);
    setLocationError("");

    localStorage.removeItem("zentraCartLocation");

    setPage(1);
  };

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (keyword.trim()) {
        params.append("keyword", keyword.trim());
      }

      if (category.trim()) {
        params.append("category", category.trim());
      }

      if (minPrice !== "") {
        params.append("minPrice", minPrice);
      }

      if (maxPrice !== "") {
        params.append("maxPrice", maxPrice);
      }

      if (sort) {
        params.append("sort", sort);
      }

      params.append("page", page);

      // =================================================
      // OPTIONAL LOCATION
      // =================================================

      if (
        location &&
        Number.isFinite(Number(location.latitude)) &&
        Number.isFinite(Number(location.longitude))
      ) {
        params.append("latitude", Number(location.latitude));

        params.append("longitude", Number(location.longitude));
      }

      const queryString = params.toString();

      const res = await API.get(
        `/products${queryString ? `?${queryString}` : ""}`,
      );

      setProducts(res.data?.products || []);

      setTotalPages(Number(res.data?.totalPages || 1));
    } catch (error) {
      console.log(error.response?.data || error.message);

      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";

    setKeyword(urlKeyword);

    fetchProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchParams, location]);

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    setPage(1);

    setTimeout(() => {
      fetchProducts();
    }, 0);
  };

  // =====================================================
  // RESET
  // =====================================================

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

  // =====================================================
  // SLIDER PRODUCTS
  // =====================================================

  const sliderProducts = products.filter(
    (product) =>
      product?.image ||
      product?.images?.[0]?.url ||
      typeof product?.images?.[0] === "string" ||
      product?.imageUrl ||
      product?.thumbnail,
  );

  // =====================================================
  // ACTIVE FILTER COUNT
  // =====================================================

  const activeFilterCount = [category, minPrice, maxPrice, sort].filter(
    Boolean,
  ).length;

  // =====================================================
  // LOCATION ACTIVE
  // =====================================================

  const isLocationActive =
    Boolean(location) &&
    Number.isFinite(Number(location.latitude)) &&
    Number.isFinite(Number(location.longitude));

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <Navbar />

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

      <div className="min-h-screen overflow-x-hidden bg-[#FAF7F6]">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="relative min-h-[170px] overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#141b3d] to-[#1a1436] px-4 pt-10 pb-16 sm:min-h-[210px] sm:px-6 sm:pt-12 sm:pb-20">
          {/* SLIDING PRODUCTS */}

          {sliderProducts.length > 0 && (
            <div className="absolute inset-0 opacity-[0.9]">
              <div className="product-marquee-track flex h-full w-max items-center gap-4 pl-4 sm:gap-6 sm:pl-6">
                {[...sliderProducts, ...sliderProducts].map(
                  (product, index) => (
                    <div
                      key={`${product._id}-${index}`}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:h-40 sm:w-40"
                    >
                      <img
                        src={
                          product.image ||
                          product.images?.[0]?.url ||
                          (typeof product.images?.[0] === "string"
                            ? product.images[0]
                            : "") ||
                          product.imageUrl ||
                          product.thumbnail ||
                          ""
                        }
                        alt=""
                        onError={(event) => {
                          event.currentTarget.parentElement.style.display =
                            "none";
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* DARK OVERLAY */}

          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220]/90 via-[#141b3d]/85 to-[#1a1436]/90" />

          {/* HEADER CONTENT */}

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

        <div className="mx-auto max-w-7xl px-2.5 py-5 sm:px-6 sm:py-10 lg:px-6">
          {/* =====================================================
              LOCATION CARD
          ===================================================== */}

          <div className="relative z-20 -mt-6 mb-4 rounded-2xl border border-indigo-100 bg-white p-3 shadow-lg sm:-mt-8 sm:mb-6 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                  📍
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                    Nearby Delivery
                  </h3>

                  {isLocationActive ? (
                    <p className="mt-1 text-xs break-words text-slate-500 sm:text-sm">
                      Showing products from sellers within{" "}
                      <span className="font-semibold text-indigo-600">
                        {DELIVERY_RADIUS_KM} KM
                      </span>{" "}
                      of your location.
                    </p>
                  ) : (
                    <p className="mt-1 text-xs break-words text-slate-500 sm:text-sm">
                      Location is optional. You can shop normally without
                      sharing your location.
                    </p>
                  )}

                  {locationError && (
                    <p className="mt-2 text-xs break-words text-amber-600">
                      {locationError}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {!isLocationActive ? (
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locationLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
                  >
                    {locationLoading
                      ? "Getting Location..."
                      : "📍 Use My Location"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto sm:text-sm"
                  >
                    ✕ Browse All Products
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              MOBILE SORT / FILTER
          ===================================================== */}

          <div className="sticky top-0 z-30 -mx-2.5 mb-3 border-y border-slate-200 bg-white shadow-sm sm:hidden">
            <div className="grid grid-cols-2 divide-x divide-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSort(sort === "priceLow" ? "priceHigh" : "priceLow");
                  setPage(1);
                }}
                className="flex min-h-12 items-center justify-center gap-2 text-xs font-semibold text-slate-700 active:bg-slate-50"
              >
                <span className="text-base">⇅</span>
                Sort
                {sort && (
                  <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600">
                    ON
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="relative flex min-h-12 items-center justify-center gap-2 text-xs font-semibold text-slate-700 active:bg-slate-50"
              >
                <span className="text-base">☷</span>
                Filter
                {activeFilterCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              MOBILE FILTER SHEET
          ===================================================== */}

          {mobileFilterOpen && (
            <div className="fixed inset-0 z-[80] sm:hidden">
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFilterOpen(false)}
                className="absolute inset-0 bg-black/45"
              />

              <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Filters
                    </h3>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Refine your products
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 p-5">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />

                    <input
                      type="number"
                      placeholder="Max Price"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleReset();
                        setMobileFilterOpen(false);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600"
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSearch();
                        setMobileFilterOpen(false);
                      }}
                      className="rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              DESKTOP FILTER & SORT
          ===================================================== */}

          <div className="relative z-20 mb-8 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:mb-10 sm:block sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-700 sm:text-base">
                Filter & Sort
                {activeFilterCount > 0 && (
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-600 sm:text-xs">
                    {activeFilterCount} active
                  </span>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap">
              {/* SEARCH */}

              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSearch()}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:min-w-[220px] lg:flex-1"
              />

              {/* CATEGORY */}

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-[245px]"
              />

              {/* MIN PRICE */}

              <input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-32"
              />

              {/* MAX PRICE */}

              <input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-32"
              />

              {/* SORT */}

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 lg:w-[220px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* SEARCH BUTTON */}

              <button
                type="button"
                onClick={handleSearch}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                Search
              </button>

              {/* RESET BUTTON */}

              <button
                type="button"
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
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 sm:mb-5 sm:text-sm">
              <span>
                {products.length > 0
                  ? `Showing ${products.length} product${
                      products.length > 1 ? "s" : ""
                    }`
                  : "No results"}
              </span>

              {isLocationActive && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                  📍 Within {DELIVERY_RADIUS_KM} KM
                </span>
              )}
            </div>
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
                {isLocationActive
                  ? `No products are currently available from sellers within ${DELIVERY_RADIUS_KM} KM. Try browsing all products.`
                  : "Try adjusting your filters or search keyword."}
              </p>

              {isLocationActive && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Browse All Products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
              {products.map((product) => (
                <div key={product._id} className="min-w-0 overflow-hidden">
                  <ProductCard
                    product={product}
                    showNearby={Boolean(isLocationActive)}
                    radiusKm={DELIVERY_RADIUS_KM}
                  />
                </div>
              ))}
            </div>
          )}

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          {!loading && products.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-12 sm:gap-4">
              <button
                type="button"
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
                type="button"
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
