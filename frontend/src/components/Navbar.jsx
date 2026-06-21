import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { useEffect } from "react";
import API from "../services/api";
import { setCartCount, setWishlistCount } from "../redux/slices/cartSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const { cartCount, wishlistCount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const { isAuthenticated, role } = useSelector((state) => state.auth);
  // const [darkMode, setDarkMode] = useState(
  //   localStorage.getItem("theme") === "dark",
  // );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  const handleSearch = () => {
    if (!search.trim()) return;

    navigate(`/products?keyword=${encodeURIComponent(search)}`);
  };

  // const toggleTheme = () => {
  //   const newTheme = !darkMode;

  //   setDarkMode(newTheme);

  //   localStorage.setItem("theme", newTheme ? "dark" : "light");
  // };

  // useEffect(() => {
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  // }, [darkMode]);

  const fetchCounts = async () => {
    try {
      if (!isAuthenticated) return;

      const [cartRes, wishlistRes] = await Promise.all([
        API.get("/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),

        API.get("/wishlist", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      dispatch(setCartCount(cartRes.data.count || 0));

      dispatch(setWishlistCount(wishlistRes.data.count || 0));
    } catch (error) {
      console.log(error.response?.data);
    }
  };
  useEffect(() => {
    fetchCounts();
  }, [isAuthenticated]);

  return (
    <nav className="sticky top-0 z-50 bg-[#285570] shadow-md">
      <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="cursor-pointer text-3xl font-bold tracking-wide text-white"
        >
          ZentraCart
        </h1>

        {/* Search Bar */}
        <div className="mx-10 max-w-xl flex-1">
          <div className="relative">
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
              className="w-full rounded-xl bg-white px-4 py-2 text-[#333333] outline-none"
            />

            <button
              onClick={handleSearch}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-[#285570] px-4 py-1 text-white"
            >
              Search
            </button>
          </div>
        </div>

        {/* Menu */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
          >
            Home
          </button>

          <button
            onClick={() => navigate("/cart")}
            className="relative rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
          >
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartCount}
              </span>
            )}
          </button>

          {role === "user" && (
            <button
              onClick={() => navigate("/orders")}
              className="rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
            >
              Orders
            </button>
          )}

          {!isAuthenticated ? (
            <>
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg bg-white px-5 py-2 font-semibold text-[#285570] transition hover:bg-gray-100"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="rounded-lg border border-white px-5 py-2 text-white transition hover:bg-white hover:text-[#285570]"
              >
                Register
              </button>
            </>
          ) : (
            <>
              {role === "user" ? (
                <button
                  onClick={() => navigate("/wishlist")}
                  className="relative rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
                >
                  ❤️ Wishlist
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (role === "admin") {
                      navigate("/admin-dashboard");
                    } else if (role === "seller") {
                      navigate("/seller-dashboard");
                    }
                  }}
                  className="rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
                >
                  Dashboard
                </button>
              )}

              <button
                onClick={() => navigate("/notifications")}
                className="rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
              >
                Notifications
              </button>
              <Link
                to="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-[#285570] transition hover:scale-110"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Link>

              {role === "seller" && (
                <button
                  onClick={() => navigate("/seller-orders")}
                  className="rounded-lg px-4 py-2 text-white transition hover:bg-white/10"
                >
                  Seller Orders
                </button>
              )}

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-5 py-2 text-white transition hover:bg-red-600"
              >
                Logout
              </button>
              {/* <button
                onClick={toggleTheme}
                className="h-12 w-12 rounded-full border-2 border-white text-xl"
              >
                {darkMode ? "🌙" : "☀️"}
              </button> */}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
