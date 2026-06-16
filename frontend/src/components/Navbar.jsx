import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, role } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "#0F172A",
        color: "white",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        ZentraCart
      </h2>

      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <button onClick={() => navigate("/")}>
          Home
        </button>

        <button onClick={() => navigate("/products")}>
          Products
        </button>

        <button onClick={() => navigate("/cart")}>
          Cart
        </button>

        {!isAuthenticated ? (
          <>
    <button onClick={() => navigate("/login")}>
      Login
    </button>

    <button onClick={() => navigate("/register")}>
      Register
    </button>
  </>
        ) : (
          <>
            <button
              onClick={() => {
                if (role === "admin") {
                  navigate("/admin-dashboard");
                } else if (role === "seller") {
                  navigate("/seller-dashboard");
                } else {
                  navigate("/dashboard");
                }
              }}
            >
              Dashboard
            </button>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;