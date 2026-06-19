import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      className="
      bg-white
      rounded-2xl
      overflow-hidden
      shadow-md
      border
      border-[#CBCAC7]
      hover:shadow-2xl
      hover:-translate-y-2
      transition-all
      duration-300
      cursor-pointer
      "
    >
      {/* Product Image */}

      {product.images?.[0]?.url && (
        <div className="h-60 overflow-hidden bg-[#FAF7F6]">
          <img
            src={product.images[0].url}
            alt={product.title}
            className="
            w-full
            h-full
            object-cover
            hover:scale-105
            transition-all
            duration-500
            "
          />
        </div>
      )}

      {/* Product Content */}

      <div className="p-5">
        <h3
          className="
          text-xl
          font-bold
          text-[#333333]
          mb-2
          line-clamp-1
          "
        >
          {product.title}
        </h3>

        <p
          className="
          text-gray-500
          text-sm
          mb-4
          line-clamp-2
          "
        >
          {product.description}
        </p>

        {/* Price */}

        <div className="flex justify-between items-center mb-4">
          <span
            className="
            text-2xl
            font-bold
            text-[#285570]
            "
          >
            ₹{product.price}
          </span>

          <span
            className="
            bg-[#E3DED7]
            text-[#285570]
            px-3
            py-1
            rounded-full
            text-xs
            font-semibold
            "
          >
            {product.category}
          </span>
        </div>

        {/* Button */}

        <button
          onClick={() =>
            navigate(`/products/${product._id}`)
          }
          className="
          w-full
          bg-[#285570]
          text-white
          py-3
          rounded-xl
          font-semibold
          hover:bg-[#1E4257]
          transition
          "
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;