import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function Profile() {
  const { user, token } = useSelector((state) => state.auth);
  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState(user?.name || "");

  const handleChangePassword = async () => {
    try {
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
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await API.put(
        "/auth/update-profile",
        {
          name,
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
    }
  };

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-3xl border border-[#CBCAC7] bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#285570] text-3xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-3xl font-bold text-[#285570]">{user?.name}</h2>

            <p className="mt-2 text-gray-500">{user?.email}</p>

            <span className="mt-4 rounded-full bg-[#EBF3F8] px-4 py-2 text-sm font-semibold text-[#285570]">
              {user?.role}
            </span>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#CBCAC7] p-5">
              <h4 className="mb-2 font-semibold text-[#285570]">Full Name</h4>

              <p>{user?.name}</p>
            </div>

            <div className="rounded-2xl border border-[#CBCAC7] p-5">
              <h4 className="mb-2 font-semibold text-[#285570]">Full Name</h4>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#CBCAC7] px-4 py-3"
              />

              <button
                onClick={handleUpdateProfile}
                className="mt-3 rounded-xl bg-[#285570] px-4 py-2 text-white"
              >
                Update Profile
              </button>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[#CBCAC7] p-6">
            <h3 className="mb-5 text-xl font-bold text-[#285570]">
              Change Password
            </h3>

            <div className="grid gap-4">
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl border border-[#CBCAC7] px-4 py-3"
              />

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl border border-[#CBCAC7] px-4 py-3"
              />

              <button
                onClick={handleChangePassword}
                className="rounded-xl bg-[#285570] py-3 text-white hover:bg-[#1E4257]"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
