import { useNavigate } from "react-router-dom";

function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        border: "1px solid #333",
        borderRadius: "10px",
        padding: "20px",
        background: "#111827",
        color: "white",
      }}
    >
      <h3>{product.title}</h3>

      <p>{product.description}</p>

      <h2>₹{product.price}</h2>

      <button onClick={() => navigate(`/products/${product._id}`)}>
        View Details
      </button>
    </div>
  );
}

export default ProductCard;
