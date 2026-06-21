import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );

      toast.success(res.data.message);

      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Reset Failed"
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF7F6]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl"
      >
        <h2 className="mb-6 text-center text-3xl font-bold text-[#285570]">
          Reset Password
        </h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="mb-6 w-full rounded-xl border p-4"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-[#285570] py-4 text-white"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;