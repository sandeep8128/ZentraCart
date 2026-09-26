import { useSelector, useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { loginSuccess } from "../redux/slices/authSlice";

function Profile() {
  const dispatch = useDispatch();

  const { user, token } = useSelector((state) => state.auth);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState(user?.name || "");

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [becomingSeller, setBecomingSeller] = useState(false);

  // ================= CHANGE PASSWORD =================
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both passwords");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    try {
      setChangingPassword(true);

      const res = await API.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed");
    } finally {
      setChangingPassword(false);
    }
  };

  // ================= UPDATE PROFILE =================
  const handleUpdateProfile = async () => {
    const cleanName = name.trim();

    if (!cleanName) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      setUpdatingProfile(true);

      const res = await API.put(
        "/auth/update-profile",
        {
          name: cleanName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Failed");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ================= BECOME SELLER =================
  const handleBecomeSeller = async () => {
    try {
      setBecomingSeller(true);

      const res = await API.put(
        "/auth/become-seller",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      dispatch(
        loginSuccess({
          user: {
            ...user,
            role: "seller",
          },
          token,
          role: "seller",
        }),
      );

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setBecomingSeller(false);
    }
  };

  const firstLetter = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* ================= PAGE HEADER ================= */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Manage your account information and security settings.
            </p>
          </div>

          {/* ================= PROFILE CARD ================= */}
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            {/* ================= PROFILE HERO ================= */}
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-8 sm:px-8">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white shadow-lg ring-4 ring-white sm:h-28 sm:w-28 sm:text-4xl">
                  {firstLetter}
                </div>

                <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {user?.name || "User"}
                </h2>

                <p className="mt-1 text-sm break-all text-gray-500 sm:text-base">
                  {user?.email}
                </p>

                {/* Role */}
                <span className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white capitalize">
                  {user?.role || "user"}
                </span>

                {/* Become Seller */}
                {user?.role === "user" && (
                  <button
                    onClick={handleBecomeSeller}
                    disabled={becomingSeller}
                    className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {becomingSeller ? "Processing..." : "Become Seller"}
                  </button>
                )}
              </div>
            </div>

            {/* ================= ACCOUNT INFORMATION ================= */}
            <div className="p-5 sm:p-8">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900">
                  Account Information
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  View and update your basic profile details.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Current Name */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-indigo-200 hover:shadow-md">
                  <p className="mb-2 text-sm font-semibold text-gray-500">
                    Full Name
                  </p>

                  <p className="text-lg font-semibold break-words text-slate-900">
                    {user?.name || "Not Available"}
                  </p>
                </div>

                {/* Email */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 transition hover:border-indigo-200 hover:shadow-md">
                  <p className="mb-2 text-sm font-semibold text-gray-500">
                    Email Address
                  </p>

                  <p className="text-lg font-semibold break-all text-slate-900">
                    {user?.email || "Not Available"}
                  </p>
                </div>
              </div>

              {/* ================= UPDATE PROFILE ================= */}
              <div className="mt-6 rounded-2xl border border-gray-200 p-5 sm:p-6">
                <h3 className="mb-1 text-xl font-bold text-slate-900">
                  Update Profile
                </h3>

                <p className="mb-5 text-sm text-gray-500">
                  Change your display name.
                </p>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-base"
                />

                <button
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile}
                  className="mt-4 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {updatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </div>

              {/* ================= CHANGE PASSWORD ================= */}
              <div className="mt-6 rounded-2xl border border-gray-200 p-5 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-slate-900">
                    Change Password
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Keep your account secure by using a strong password.
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Current Password */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Current Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-base"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      New Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-base"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {changingPassword
                      ? "Updating Password..."
                      : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Profile;
