import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div className="cursor-pointer overflow-hidden rounded-2xl border border-[#CBCAC7] bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* Product Image */}

      {product.images?.[0]?.url && (
        <div className="flex h-64 items-center justify-center bg-white p-3">
          <img
            src={product.images?.[0]?.url}
            alt={product.title}
            className="max-h-full w-auto object-contain"
          />
        </div>
      )}

      {/* Product Content */}

      <div className="p-5">
        <h3 className="mb-2 line-clamp-1 text-xl font-bold text-[#333333]">
          {product.title}
        </h3>

        <p className="mb-4 line-clamp-2 text-sm text-gray-500">
          {product.description}
        </p>

        {/* Price */}

        <div className="mb-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-[#285570]">
            ₹{product.price}
          </span>

          <span className="rounded-full bg-[#E3DED7] px-3 py-1 text-xs font-semibold text-[#285570]">
            {product.category}
          </span>
        </div>

        {/* Button */}

        <button
          onClick={() => navigate(`/products/${product._id}`)}
          className="w-full rounded-xl bg-[#285570] py-3 font-semibold text-white transition hover:bg-[#1E4257]"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
