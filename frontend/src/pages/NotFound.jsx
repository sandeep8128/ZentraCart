import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-8xl font-bold text-[#285570]">
        404
      </h1>

      <p className="mt-4 text-xl text-gray-500">
        Page Not Found
      </p>

      <Link
        to="/"
        className="
          mt-6
          rounded-xl
          bg-[#285570]
          px-6
          py-3
          text-white
        "
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;