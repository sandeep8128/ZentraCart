import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ShoppingBag,
  PackageCheck,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log(res.data);

      navigate("/login");
    } catch (error) {
      console.log(error.response?.data);
      setError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: User, label: "Create Your Account" },
    { icon: ShoppingBag, label: "Shop Unlimited Products" },
    { icon: PackageCheck, label: "Manage Orders Easily" },
    { icon: ShieldCheck, label: "Secure & Fast Experience" },
  ];

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#FAF7F6]">
      {/* Left branding panel */}
      <div className="hidden md:flex relative flex-col justify-center overflow-hidden bg-[#285570] px-16 text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
            ZentraCart
          </h1>

          <p className="mt-5 text-lg lg:text-xl text-white/80 max-w-sm">
            Join ZentraCart today
          </p>

          <div className="mt-12 space-y-5">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-base">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="text-white/90">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <form
          onSubmit={handleRegister}
          className="w-full max-w-md rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-slate-200/60 ring-1 ring-black/5"
        >
          {/* Mobile-only brand mark */}
          <div className="mb-6 flex items-center justify-center gap-2 md:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#285570] text-white">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-xl font-bold text-[#285570]">
              ZentraCart
            </span>
          </div>

          <h2 className="mb-1 text-center text-3xl sm:text-4xl font-bold text-[#285570]">
            Create account
          </h2>
          <p className="mb-8 text-center text-sm text-slate-500">
            Sign up to start shopping with ZentraCart
          </p>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Full name */}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Full name
            </span>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition-all focus:border-[#285570] focus:bg-white focus:ring-4 focus:ring-[#285570]/10"
              />
            </div>
          </label>

          {/* Email */}
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-slate-800 outline-none transition-all focus:border-[#285570] focus:bg-white focus:ring-4 focus:ring-[#285570]/10"
              />
            </div>
          </label>

          {/* Password */}
          <label className="mb-6 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-12 text-slate-800 outline-none transition-all focus:border-[#285570] focus:bg-white focus:ring-4 focus:ring-[#285570]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#285570] py-3.5 font-medium text-white transition-all hover:bg-[#1f4359] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#285570] hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;