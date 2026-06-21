import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        "/auth/forgot-password",
        { email }
      );

      toast.success(res.data.message);

      setEmail("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
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
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="mb-6 w-full rounded-xl border p-4"
        />

        <button
          type="submit"
          className="w-full rounded-xl bg-[#285570] py-4 text-white"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;