import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const profileRef = useRef(null);

  const { cartCount, wishlistCount } = useSelector(
    (state) => state.cart
  );

  const { user, isAuthenticated, role } = useSelector(
    (state) => state.auth
  );

  // ==========================
  // LOGOUT
  // ==========================

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
    setProfileOpen(false);
    navigate("/login");
  };

  // ==========================
  // SEARCH
  // ==========================

  const handleSearch = () => {
    if (!search.trim()) return;

    navigate(
      `/products?keyword=${encodeURIComponent(search.trim())}`
    );

    setSearch("");
    setMobileOpen(false);
  };

  // ==========================
  // FETCH CART + WISHLIST
  // ==========================

  const fetchCounts = async () => {
    try {
      if (!isAuthenticated) {
        dispatch(setCartCount(0));
        dispatch(setWishlistCount(0));
        return;
      }

      const token = localStorage.getItem("token");

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

      dispatch(
        setCartCount(cartRes.data.count || 0)
      );

      dispatch(
        setWishlistCount(wishlistRes.data.count || 0)
      );
    } catch (error) {
      console.log(
        "Navbar count error:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchCounts();
  }, [isAuthenticated]);

  // ==========================
  // CLOSE PROFILE DROPDOWN
  // ==========================

  useEffect(() => {
    const handler = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // ==========================
  // NAV ICON BUTTON
  // ==========================

  const NavIconButton = ({
    onClick,
    icon,
    count,
    label,
  }) => (
    <button
      onClick={onClick}
      className="
        group relative flex flex-col items-center
        justify-center gap-1 rounded-lg
        px-2.5 py-1.5
        text-slate-200
        transition-colors
        hover:bg-white/10 hover:text-white
      "
    >
      <span className="relative">
        {icon}

        {count > 0 && (
          <span
            className="
              absolute -right-2 -top-1.5
              flex h-4 min-w-4 items-center
              justify-center rounded-full
              bg-amber-400 px-1
              text-[9px] font-bold
              text-slate-900 shadow
            "
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </span>

      <span className="hidden text-[11px] font-medium leading-none lg:block">
        {label}
      </span>
    </button>
  );

  // ==========================
  // CLOSE MOBILE MENU
  // ==========================

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <nav
      className="
        sticky top-0 z-50
        border-b border-white/10
        bg-gradient-to-r
        from-[#0f2b3d]
        via-[#16405a]
        to-[#0f2b3d]
        shadow-lg
      "
    >
      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <div
        className="
          mx-auto flex w-full max-w-7xl
          items-center
          gap-2
          px-3 py-2.5
          sm:gap-4 sm:px-6 sm:py-3
        "
      >
        {/* ==========================
            LOGO
        ========================== */}

        <button
          onClick={() => navigate("/")}
          className="
            flex min-w-0 shrink-0
            items-center gap-1.5
            sm:gap-2
          "
        >
          <svg
            width="42"
            height="42"
            viewBox="0 0 100 100"
            className="
              h-9 w-9 shrink-0
              sm:h-10 sm:w-10
            "
          >
            <defs>
              <linearGradient
                id="zBackdrop"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#0f766e"
                />

                <stop
                  offset="55%"
                  stopColor="#4338ca"
                />

                <stop
                  offset="100%"
                  stopColor="#c026d3"
                />
              </linearGradient>

              <linearGradient
                id="zCorner"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#22d3ee"
                />

                <stop
                  offset="100%"
                  stopColor="#c026d3"
                />
              </linearGradient>

              <linearGradient
                id="zSwoosh"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#22d3ee"
                />

                <stop
                  offset="100%"
                  stopColor="#f472b6"
                />
              </linearGradient>
            </defs>

            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="20"
              fill="url(#zBackdrop)"
            />

            <path
              d="M96 4 V34 L66 4 Z"
              fill="url(#zCorner)"
            />

            <path
              d="M24 26 H76 L34 74 H78"
              fill="none"
              stroke="#ffffff"
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M18 68 C 34 80, 56 80, 70 64"
              fill="none"
              stroke="url(#zSwoosh)"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>

          <span
            className="
              hidden text-xl font-extrabold
              tracking-tight text-white
              xs:block
              sm:text-2xl
            "
          >
            Zentra
            <span className="text-amber-400">
              Cart
            </span>
          </span>
        </button>

        {/* ==========================
            DESKTOP SEARCH
        ========================== */}

        <div
          className="
            mx-2 hidden max-w-2xl
            flex-1 md:block
          "
        >
          <div
            className="
              flex overflow-hidden
              rounded-xl bg-white
              shadow-inner
              ring-1 ring-black/5
              focus-within:ring-2
              focus-within:ring-amber-400
            "
          >
            <input
              type="text"
              placeholder="Search for products, brands and more..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="
                w-full min-w-0
                bg-transparent
                px-4 py-2.5
                text-sm text-slate-800
                outline-none
                placeholder:text-slate-400
              "
            />

            <button
              onClick={handleSearch}
              className="
                flex shrink-0
                items-center gap-1.5
                bg-[#285570]
                px-4 sm:px-5
                text-sm font-semibold
                text-white
                transition
                hover:bg-[#1d4258]
              "
            >
              <Search size={16} />

              <span className="hidden lg:inline">
                Search
              </span>
            </button>
          </div>
        </div>

        {/* ==========================
            DESKTOP MENU
        ========================== */}

        <div
          className="
            ml-auto hidden
            items-center gap-0.5
            md:flex
          "
        >
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

          {!isAuthenticated ? (
            <div className="ml-1 flex items-center gap-1">
              <button
                onClick={() => navigate("/login")}
                className="
                  rounded-lg px-3 py-2
                  text-sm font-semibold
                  text-white
                  transition
                  hover:bg-white/10
                "
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="
                  rounded-lg
                  bg-amber-400
                  px-4 py-2
                  text-sm font-bold
                  text-[#0f2b3d]
                  shadow
                  transition
                  hover:bg-amber-300
                "
              >
                Register
              </button>
            </div>
          ) : (
            <>
              {role === "user" ? (
                <NavIconButton
                  onClick={() =>
                    navigate("/wishlist")
                  }
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
                        : "/seller-dashboard"
                    )
                  }
                  icon={
                    <LayoutDashboard size={20} />
                  }
                  label="Dashboard"
                />
              )}

              {role === "seller" && (
                <NavIconButton
                  onClick={() =>
                    navigate("/seller-orders")
                  }
                  icon={
                    <PackageSearch size={20} />
                  }
                  label="Seller Orders"
                />
              )}

              <NavIconButton
                onClick={() =>
                  navigate("/notifications")
                }
                icon={<Bell size={20} />}
                label="Alerts"
              />

              {/* PROFILE */}

              <div
                className="relative ml-1"
                ref={profileRef}
              >
                <button
                  onClick={() =>
                    setProfileOpen((p) => !p)
                  }
                  className="
                    flex items-center gap-1.5
                    rounded-full py-1 pl-1 pr-2
                    transition
                    hover:bg-white/10
                  "
                >
                  <span
                    className="
                      flex h-8 w-8
                      items-center justify-center
                      rounded-full
                      bg-amber-400
                      text-sm font-bold
                      text-[#0f2b3d]
                    "
                  >
                    {user?.name
                      ?.charAt(0)
                      .toUpperCase() || (
                      <User size={16} />
                    )}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`
                      text-slate-300
                      transition-transform
                      ${
                        profileOpen
                          ? "rotate-180"
                          : ""
                      }
                    `}
                  />
                </button>

                {profileOpen && (
                  <div
                    className="
                      absolute right-0 mt-2
                      w-48 overflow-hidden
                      rounded-xl bg-white
                      py-1 shadow-xl
                      ring-1 ring-black/5
                    "
                  >
                    <div
                      className="
                        border-b border-slate-100
                        px-4 py-2
                        text-xs text-slate-500
                      "
                    >
                      Signed in as

                      <div
                        className="
                          truncate text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        {user?.name}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() =>
                        setProfileOpen(false)
                      }
                      className="
                        flex items-center gap-2
                        px-4 py-2
                        text-sm text-slate-700
                        hover:bg-slate-50
                      "
                    >
                      <User size={15} />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="
                        flex w-full
                        items-center gap-2
                        px-4 py-2
                        text-left text-sm
                        text-red-600
                        hover:bg-red-50
                      "
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

        {/* ==========================
            MOBILE ACTIONS
        ========================== */}

        <div className="ml-auto flex items-center md:hidden">

          {/* Cart quick button */}

          <button
            onClick={() => navigate("/cart")}
            className="
              relative rounded-lg
              p-2 text-white
              transition
              hover:bg-white/10
            "
          >
            <ShoppingCart size={21} />

            {cartCount > 0 && (
              <span
                className="
                  absolute -right-0.5 -top-0.5
                  flex h-4 min-w-4
                  items-center justify-center
                  rounded-full bg-amber-400
                  px-1 text-[9px]
                  font-bold text-slate-900
                "
              >
                {cartCount > 9
                  ? "9+"
                  : cartCount}
              </span>
            )}
          </button>

          {/* Menu */}

          <button
            onClick={() =>
              setMobileOpen((p) => !p)
            }
            className="
              ml-1 rounded-lg
              p-2 text-white
              transition
              hover:bg-white/10
            "
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {mobileOpen && (
        <div
          className="
            border-t border-white/10
            bg-[#0f2b3d]
            px-3 py-4
            shadow-xl
            md:hidden
          "
        >
          {/* MOBILE SEARCH */}

          <div className="mb-4 flex overflow-hidden rounded-xl bg-white shadow">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="
                min-w-0 flex-1
                px-4 py-3
                text-sm text-slate-800
                outline-none
              "
            />

            <button
              onClick={handleSearch}
              className="
                shrink-0
                bg-[#285570]
                px-4
                text-white
              "
            >
              <Search size={18} />
            </button>
          </div>

          {/* USER INFO */}

          {isAuthenticated && (
            <div
              className="
                mb-3 flex items-center
                gap-3 rounded-xl
                bg-white/5 px-3 py-3
              "
            >
              <span
                className="
                  flex h-10 w-10
                  shrink-0
                  items-center justify-center
                  rounded-full
                  bg-amber-400
                  font-bold
                  text-[#0f2b3d]
                "
              >
                {user?.name
                  ?.charAt(0)
                  .toUpperCase() || "U"}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-slate-300">
                  {user?.email}
                </p>
              </div>
            </div>
          )}

          {/* MOBILE LINKS */}

          <div className="flex flex-col">

            <button
              onClick={() => {
                navigate("/");
                closeMobileMenu();
              }}
              className="
                flex items-center
                gap-3 border-b
                border-white/10
                py-3 text-left
                text-sm font-medium
                text-white
              "
            >
              <PackageSearch size={18} />
              Home
            </button>

            <button
              onClick={() => {
                navigate("/cart");
                closeMobileMenu();
              }}
              className="
                flex items-center
                justify-between
                border-b
                border-white/10
                py-3 text-left
                text-sm font-medium
                text-white
              "
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={18} />
                Cart
              </span>

              {cartCount > 0 && (
                <span
                  className="
                    rounded-full
                    bg-amber-400
                    px-2 py-0.5
                    text-xs font-bold
                    text-[#0f2b3d]
                  "
                >
                  {cartCount}
                </span>
              )}
            </button>

            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    closeMobileMenu();
                  }}
                  className="
                    border-b
                    border-white/10
                    py-3 text-left
                    text-sm font-medium
                    text-white
                  "
                >
                  Login
                </button>

                <button
                  onClick={() => {
                    navigate("/register");
                    closeMobileMenu();
                  }}
                  className="
                    py-3 text-left
                    text-sm font-semibold
                    text-amber-400
                  "
                >
                  Register
                </button>
              </>
            ) : (
              <>
                {/* USER ORDERS */}

                {role === "user" && (
                  <button
                    onClick={() => {
                      navigate("/orders");
                      closeMobileMenu();
                    }}
                    className="
                      flex items-center gap-3
                      border-b border-white/10
                      py-3 text-left
                      text-sm font-medium
                      text-white
                    "
                  >
                    <PackageSearch size={18} />
                    Orders
                  </button>
                )}

                {/* WISHLIST / DASHBOARD */}

                {role === "user" ? (
                  <button
                    onClick={() => {
                      navigate("/wishlist");
                      closeMobileMenu();
                    }}
                    className="
                      flex items-center
                      justify-between
                      border-b
                      border-white/10
                      py-3 text-left
                      text-sm font-medium
                      text-white
                    "
                  >
                    <span className="flex items-center gap-3">
                      <Heart size={18} />
                      Wishlist
                    </span>

                    {wishlistCount > 0 && (
                      <span
                        className="
                          rounded-full
                          bg-amber-400
                          px-2 py-0.5
                          text-xs font-bold
                          text-[#0f2b3d]
                        "
                      >
                        {wishlistCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate(
                        role === "admin"
                          ? "/admin-dashboard"
                          : "/seller-dashboard"
                      );

                      closeMobileMenu();
                    }}
                    className="
                      flex items-center gap-3
                      border-b
                      border-white/10
                      py-3 text-left
                      text-sm font-medium
                      text-white
                    "
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </button>
                )}

                {/* SELLER ORDERS */}

                {role === "seller" && (
                  <button
                    onClick={() => {
                      navigate("/seller-orders");
                      closeMobileMenu();
                    }}
                    className="
                      flex items-center gap-3
                      border-b
                      border-white/10
                      py-3 text-left
                      text-sm font-medium
                      text-white
                    "
                  >
                    <PackageSearch size={18} />
                    Seller Orders
                  </button>
                )}

                {/* NOTIFICATIONS */}

                <button
                  onClick={() => {
                    navigate("/notifications");
                    closeMobileMenu();
                  }}
                  className="
                    flex items-center gap-3
                    border-b
                    border-white/10
                    py-3 text-left
                    text-sm font-medium
                    text-white
                  "
                >
                  <Bell size={18} />
                  Notifications
                </button>

                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="
                    flex items-center gap-3
                    border-b
                    border-white/10
                    py-3 text-sm
                    font-medium text-white
                  "
                >
                  <User size={18} />
                  My Profile
                </Link>

                {/* LOGOUT */}

                <button
                  onClick={handleLogout}
                  className="
                    flex items-center gap-3
                    py-3 text-left
                    text-sm font-semibold
                    text-red-400
                  "
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
