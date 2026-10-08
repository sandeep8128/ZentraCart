import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../redux/slices/authSlice";
import API from "../services/api";
import { setCartCount, setWishlistCount } from "../redux/slices/cartSlice";

import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  PackageSearch,
  ChevronDown,
  Menu,
  X,
  MapPin,
  LocateFixed,
  CircleX,
  Loader2,
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const dispatch = useDispatch();

  // =====================================================
  // STATES
  // =====================================================

  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Optional delivery location
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const profileRef = useRef(null);

  // =====================================================
  // REDUX
  // =====================================================

  const { cartCount, wishlistCount } = useSelector((state) => state.cart);

  const { user, isAuthenticated, role } = useSelector((state) => state.auth);

  // =====================================================
  // BUY NOW CHECKOUT DETECTION
  // =====================================================

  /*
    IMPORTANT:

    Normal checkout:
      /checkout

    Buy Now checkout:
      /checkout
      state = {
        buyNow: {
          product: {...},
          quantity: 1
        }
      }

    In Buy Now mode we MUST NOT call /cart.
  */

  const isBuyNowCheckout =
    routeLocation.pathname === "/checkout" &&
    Boolean(
      routeLocation.state?.buyNow?.product?._id ||
      routeLocation.state?.buyNow?.product?.id,
    );

  // =====================================================
  // LOAD SAVED LOCATION
  // =====================================================

  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem("zentraCartLocation");

      if (!savedLocation) {
        setDeliveryLocation(null);
        return;
      }

      const parsed = JSON.parse(savedLocation);

      const latitude = Number(parsed.latitude);
      const longitude = Number(parsed.longitude);

      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        setDeliveryLocation({
          latitude,
          longitude,
          address: parsed.address || "",
        });
      } else {
        setDeliveryLocation(null);
      }
    } catch (error) {
      console.log("Location load error:", error);

      localStorage.removeItem("zentraCartLocation");

      setDeliveryLocation(null);
    }
  }, []);

  // =====================================================
  // GET CURRENT LOCATION
  // =====================================================

  const handleUseLocation = () => {
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Location is not supported by this browser.");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = Number(position.coords.latitude);

          const longitude = Number(position.coords.longitude);

          if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            throw new Error("Invalid location received.");
          }

          const newLocation = {
            latitude,
            longitude,
            address: "",
          };

          // Save locally
          localStorage.setItem(
            "zentraCartLocation",
            JSON.stringify(newLocation),
          );

          setDeliveryLocation(newLocation);

          // Save to logged-in user
          if (isAuthenticated) {
            try {
              const token = localStorage.getItem("token");

              if (token) {
                await API.put(
                  "/auth/location",
                  {
                    latitude,
                    longitude,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );
              }
            } catch (error) {
              console.log(
                "Server location save skipped:",
                error.response?.data || error.message,
              );
            }
          }

          // Notify other components
          window.dispatchEvent(new Event("zentraCartLocationChanged"));
        } catch (error) {
          console.log("Location save error:", error);

          setLocationError("Unable to save your location.");
        } finally {
          setLocationLoading(false);
        }
      },

      (error) => {
        console.log("Geolocation error:", error);

        setLocationLoading(false);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. You can continue shopping normally.",
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError("Your location is currently unavailable.");
        } else if (error.code === error.TIMEOUT) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError("Unable to get your location.");
        }
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
    localStorage.removeItem("zentraCartLocation");

    setDeliveryLocation(null);
    setLocationError("");

    window.dispatchEvent(new Event("zentraCartLocationChanged"));
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    dispatch(logout());

    setMobileOpen(false);
    setProfileOpen(false);

    navigate("/login");
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    const keyword = search.trim();

    if (!keyword) return;

    navigate(`/products?keyword=${encodeURIComponent(keyword)}`);

    setSearch("");
    setMobileOpen(false);
  };

  // =====================================================
  // FETCH CART + WISHLIST COUNTS
  // =====================================================

  const fetchCounts = async () => {
    try {
      // -----------------------------------------------
      // LOGGED OUT
      // -----------------------------------------------

      if (!isAuthenticated) {
        dispatch(setCartCount(0));
        dispatch(setWishlistCount(0));
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(setCartCount(0));
        dispatch(setWishlistCount(0));
        return;
      }

      // -----------------------------------------------
      // 🔥 IMPORTANT BUY NOW FIX
      // -----------------------------------------------

      /*
        Buy Now checkout does NOT depend on cart.

        Therefore:

        ❌ DO NOT call /cart
        ❌ DO NOT trigger cart-empty handling

        Only wishlist count is fetched.
      */

      if (isBuyNowCheckout) {
        dispatch(setCartCount(0));

        try {
          const wishlistRes = await API.get("/wishlist", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          dispatch(setWishlistCount(wishlistRes.data?.count || 0));
        } catch (wishlistError) {
          console.log(
            "Wishlist count error:",
            wishlistError.response?.data || wishlistError.message,
          );
        }

        return;
      }

      // -----------------------------------------------
      // NORMAL MODE
      // -----------------------------------------------

      const [cartRes, wishlistRes] = await Promise.all([
        API.get("/cart", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        API.get("/wishlist", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      dispatch(setCartCount(cartRes.data?.count || 0));

      dispatch(setWishlistCount(wishlistRes.data?.count || 0));
    } catch (error) {
      /*
        IMPORTANT:

        Never show toast here.

        Especially don't show:
        "Cart is empty"

        because Navbar is only responsible
        for displaying count.
      */

      console.log("Navbar count error:", error.response?.data || error.message);
    }
  };

  // =====================================================
  // FETCH COUNTS ON ROUTE / AUTH CHANGE
  // =====================================================

  useEffect(() => {
    fetchCounts();
  }, [isAuthenticated, routeLocation.pathname, isBuyNowCheckout]);

  // =====================================================
  // LOCATION CHANGE LISTENER
  // =====================================================

  useEffect(() => {
    const handleLocationChange = () => {
      try {
        const saved = localStorage.getItem("zentraCartLocation");

        if (!saved) {
          setDeliveryLocation(null);
          return;
        }

        const parsed = JSON.parse(saved);

        const latitude = Number(parsed.latitude);

        const longitude = Number(parsed.longitude);

        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
          setDeliveryLocation({
            latitude,
            longitude,
            address: parsed.address || "",
          });
        } else {
          setDeliveryLocation(null);
        }
      } catch (error) {
        console.log("Location listener error:", error);

        setDeliveryLocation(null);
      }
    };

    window.addEventListener("zentraCartLocationChanged", handleLocationChange);

    return () => {
      window.removeEventListener(
        "zentraCartLocationChanged",
        handleLocationChange,
      );
    };
  }, []);

  // =====================================================
  // CLOSE PROFILE DROPDOWN
  // =====================================================

  useEffect(() => {
    const handler = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // =====================================================
  // NAV ICON BUTTON
  // =====================================================

  const NavIconButton = ({ onClick, icon, count, label }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
      >
        <span className="relative">
          {icon}

          {count > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-slate-900 shadow-md">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </span>

        <span className="hidden text-[11px] leading-none font-medium lg:block">
          {label}
        </span>
      </button>
    );
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  // =====================================================
  // LOCATION LABEL
  // =====================================================

  const locationLabel = deliveryLocation ? "30 KM ON" : "Location";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-[#0b2435] via-[#16405a] to-[#0b2435] shadow-lg">
      {/* =================================================
          MAIN NAVBAR
      ================================================= */}

      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        {/* =================================================
            LOGO
        ================================================= */}

        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="ZentraCart Home"
          className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-[0_6px_18px_rgba(99,102,241,0.35)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_25px_rgba(99,102,241,0.55)] sm:h-11 sm:w-11">
            <span className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-[#102f43] via-[#183f59] to-[#111827]" />

            <span className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-cyan-300/30 blur-md" />

            <span className="relative z-10 text-[25px] leading-none font-black tracking-[-3px] text-white italic drop-shadow sm:text-[27px]">
              Z
            </span>

            <span className="absolute bottom-[7px] left-[8px] z-10 h-[3px] w-[23px] rotate-[-8deg] rounded-full bg-gradient-to-r from-cyan-300 to-pink-400" />

            <span className="absolute bottom-[4px] left-[11px] z-10 h-[3px] w-[3px] rounded-full bg-white" />

            <span className="absolute bottom-[3px] left-[27px] z-10 h-[3px] w-[3px] rounded-full bg-white" />
          </span>

          <span className="hidden text-xl font-extrabold tracking-tight text-white sm:block sm:text-2xl">
            Zentra
            <span className="text-amber-400">Cart</span>
          </span>
        </button>

        {/* =================================================
            DESKTOP SEARCH
        ================================================= */}

        <div className="mx-1 hidden max-w-2xl flex-1 md:block">
          <div className="flex overflow-hidden rounded-xl bg-white shadow-inner ring-1 ring-black/5 transition-all focus-within:ring-2 focus-within:ring-amber-400">
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full min-w-0 bg-transparent px-4 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              onClick={handleSearch}
              className="flex shrink-0 items-center gap-1.5 bg-[#285570] px-4 text-sm font-semibold text-white transition hover:bg-indigo-600 sm:px-5"
            >
              <Search size={16} />

              <span className="hidden lg:inline">Search</span>
            </button>
          </div>
        </div>

        {/* =================================================
            DESKTOP MENU
        ================================================= */}

        <div className="ml-auto hidden items-center gap-0.5 md:flex">
          <NavIconButton
            onClick={() => navigate("/")}
            icon={<PackageSearch size={20} />}
            label="Home"
          />

          {role === "user" && (
            <NavIconButton
              onClick={() => navigate("/orders")}
              icon={<PackageSearch size={20} />}
              label="Orders"
            />
          )}

          <NavIconButton
            onClick={() => navigate("/cart")}
            icon={<ShoppingCart size={20} />}
            count={cartCount}
            label="Cart"
          />

          {/* LOCATION */}

          <div className="relative ml-1">
            <button
              type="button"
              onClick={
                deliveryLocation ? handleClearLocation : handleUseLocation
              }
              disabled={locationLoading}
              title={
                deliveryLocation
                  ? "Disable 30 KM delivery filter"
                  : "Use my location for 30 KM delivery"
              }
              className={`group relative flex flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 transition-all duration-200 hover:-translate-y-0.5 ${
                deliveryLocation
                  ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              {locationLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : deliveryLocation ? (
                <MapPin size={20} />
              ) : (
                <LocateFixed size={20} />
              )}

              <span className="hidden text-[10px] leading-none font-semibold lg:block">
                {locationLabel}
              </span>

              {deliveryLocation && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#16405a]" />
              )}
            </button>
          </div>

          {/* LOGIN / REGISTER */}

          {!isAuthenticated ? (
            <div className="ml-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-[#0f2b3d] shadow transition hover:bg-amber-300"
              >
                Register
              </button>
            </div>
          ) : (
            <>
              {role === "user" ? (
                <NavIconButton
                  onClick={() => navigate("/wishlist")}
                  icon={<Heart size={20} />}
                  count={wishlistCount}
                  label="Wishlist"
                />
              ) : (
                <NavIconButton
                  onClick={() =>
                    navigate(
                      role === "admin"
                        ? "/admin-dashboard"
                        : "/seller-dashboard",
                    )
                  }
                  icon={<LayoutDashboard size={20} />}
                  label="Dashboard"
                />
              )}

              {role === "seller" && (
                <NavIconButton
                  onClick={() => navigate("/seller-orders")}
                  icon={<PackageSearch size={20} />}
                  label="Seller Orders"
                />
              )}

              <NavIconButton
                onClick={() => navigate("/notifications")}
                icon={<Bell size={20} />}
                label="Alerts"
              />

              {/* PROFILE */}

              <div className="relative ml-1" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1 transition hover:bg-white/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-[#0f2b3d] shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`text-slate-300 transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 shadow-2xl ring-1 ring-black/5">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                        Signed in as
                      </p>

                      <div className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                        {user?.name}
                      </div>

                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <User size={15} />
                      My Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* =================================================
            MOBILE ACTIONS
        ================================================= */}

        <div className="ml-auto flex items-center md:hidden">
          {/* LOCATION */}

          <button
            type="button"
            onClick={deliveryLocation ? handleClearLocation : handleUseLocation}
            disabled={locationLoading}
            aria-label="Location"
            className={`relative rounded-lg p-2 transition ${
              deliveryLocation
                ? "text-emerald-300 hover:bg-emerald-500/10"
                : "text-white hover:bg-white/10"
            }`}
          >
            {locationLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : deliveryLocation ? (
              <MapPin size={21} />
            ) : (
              <LocateFixed size={21} />
            )}

            {deliveryLocation && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* CART */}

          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative rounded-lg p-2 text-white transition hover:bg-white/10"
          >
            <ShoppingCart size={21} />

            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-bold text-slate-900">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>

          {/* MENU */}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="ml-1 rounded-lg p-2 text-white transition hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      {/* =====================================================
          LOCATION STATUS BAR
      ===================================================== */}

      {deliveryLocation && (
        <div className="border-t border-emerald-400/10 bg-emerald-500/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <MapPin size={13} className="shrink-0 text-emerald-300" />

              <span className="truncate text-[10px] font-medium text-emerald-200 sm:text-xs">
                Showing products from sellers within{" "}
                <strong className="mx-1 font-bold text-emerald-300">
                  30 KM
                </strong>{" "}
                of your location
              </span>
            </div>

            <button
              type="button"
              onClick={handleClearLocation}
              className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-emerald-300 transition hover:text-white"
            >
              <CircleX size={12} />

              <span className="hidden sm:inline">Disable</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          LOCATION ERROR
      ===================================================== */}

      {locationError && (
        <div className="border-t border-amber-400/10 bg-amber-400/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-1.5 sm:px-6">
            <p className="text-[10px] text-amber-200 sm:text-xs">
              ⚠️ {locationError}
            </p>

            <button
              type="button"
              onClick={() => setLocationError("")}
              className="shrink-0 text-amber-300 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0b2435] px-3 py-4 shadow-xl md:hidden">
          {/* SEARCH */}

          <div className="mb-4 flex overflow-hidden rounded-xl bg-white shadow">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="min-w-0 flex-1 px-4 py-3 text-sm text-slate-800 outline-none"
            />

            <button
              type="button"
              onClick={handleSearch}
              className="shrink-0 bg-[#285570] px-4 text-white transition hover:bg-indigo-600"
            >
              <Search size={18} />
            </button>
          </div>

          {/* LOCATION CARD */}

          <div
            className={`mb-4 rounded-2xl border p-3 ${
              deliveryLocation
                ? "border-emerald-400/20 bg-emerald-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    deliveryLocation
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {deliveryLocation ? (
                    <MapPin size={19} />
                  ) : (
                    <LocateFixed size={19} />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {deliveryLocation
                      ? "30 KM Delivery Active"
                      : "Nearby Delivery"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {deliveryLocation
                      ? "Nearby sellers are being shown"
                      : "Optional — use your location"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  deliveryLocation ? handleClearLocation : handleUseLocation
                }
                disabled={locationLoading}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  deliveryLocation
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-red-400/10 hover:text-red-300"
                    : "bg-amber-400 text-[#0b2435] hover:bg-amber-300"
                }`}
              >
                {locationLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : deliveryLocation ? (
                  "Disable"
                ) : (
                  "Use Location"
                )}
              </button>
            </div>
          </div>

          {/* USER INFO */}

          {isAuthenticated && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 font-bold text-[#0f2b3d]">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-slate-300">{user?.email}</p>
              </div>
            </div>
          )}

          {/* MOBILE LINKS */}

          <div className="flex flex-col">
            {/* HOME */}

            <button
              type="button"
              onClick={() => {
                navigate("/");
                closeMobileMenu();
              }}
              className="flex items-center gap-3 border-b border-white/10 py-3 text-left text-sm font-medium text-white transition hover:text-amber-300"
            >
              <PackageSearch size={18} />
              Home
            </button>

            {/* CART */}

            <button
              type="button"
              onClick={() => {
                navigate("/cart");
                closeMobileMenu();
              }}
              className="flex items-center justify-between border-b border-white/10 py-3 text-left text-sm font-medium text-white"
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={18} />
                Cart
              </span>

              {cartCount > 0 && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-[#0f2b3d]">
                  {cartCount}
                </span>
              )}
            </button>

            {/* LOCATION */}

            <button
              type="button"
              onClick={() => {
                if (deliveryLocation) {
                  handleClearLocation();
                } else {
                  handleUseLocation();
                }
              }}
              disabled={locationLoading}
              className="flex items-center justify-between border-b border-white/10 py-3 text-left text-sm font-medium text-white"
            >
              <span className="flex items-center gap-3">
                {locationLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : deliveryLocation ? (
                  <MapPin size={18} className="text-emerald-300" />
                ) : (
                  <LocateFixed size={18} />
                )}

                {deliveryLocation ? "30 KM Delivery Active" : "Use My Location"}
              </span>

              {deliveryLocation && (
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  ON
                </span>
              )}
            </button>

            {/* NOT AUTHENTICATED */}

            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/login");
                    closeMobileMenu();
                  }}
                  className="border-b border-white/10 py-3 text-left text-sm font-medium text-white"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/register");
                    closeMobileMenu();
                  }}
                  className="py-3 text-left text-sm font-semibold text-amber-400"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                {/* ORDERS */}

                {role === "user" && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/orders");
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 border-b border-white/10 py-3 text-left text-sm font-medium text-white"
                  >
                    <PackageSearch size={18} />
                    Orders
                  </button>
                )}

                {/* WISHLIST / DASHBOARD */}

                {role === "user" ? (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/wishlist");
                      closeMobileMenu();
                    }}
                    className="flex items-center justify-between border-b border-white/10 py-3 text-left text-sm font-medium text-white"
                  >
                    <span className="flex items-center gap-3">
                      <Heart size={18} />
                      Wishlist
                    </span>

                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-[#0f2b3d]">
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      navigate(
                        role === "admin"
                          ? "/admin-dashboard"
                          : "/seller-dashboard",
                      );

                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 border-b border-white/10 py-3 text-left text-sm font-medium text-white"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </button>
                )}

                {/* SELLER ORDERS */}

                {role === "seller" && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/seller-orders");
                      closeMobileMenu();
                    }}
                    className="flex items-center gap-3 border-b border-white/10 py-3 text-left text-sm font-medium text-white"
                  >
                    <PackageSearch size={18} />
                    Seller Orders
                  </button>
                )}

                {/* NOTIFICATIONS */}

                <button
                  type="button"
                  onClick={() => {
                    navigate("/notifications");
                    closeMobileMenu();
                  }}
                  className="flex items-center gap-3 border-b border-white/10 py-3 text-left text-sm font-medium text-white"
                >
                  <Bell size={18} />
                  Notifications
                </button>

                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 border-b border-white/10 py-3 text-sm font-medium text-white"
                >
                  <User size={18} />
                  My Profile
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 py-3 text-left text-sm font-semibold text-red-400 transition hover:text-red-300"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
