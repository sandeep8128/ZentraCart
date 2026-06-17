import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";

function SellerDashboard() {
  // ==========================
  // REDUX TOKEN
  // ==========================

  const { token } = useSelector((state) => state.auth);

  // ==========================
  // STATE
  // ==========================

  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  

  // ==========================
  // FETCH SELLER PRODUCTS
  // ==========================

  const fetchMyProducts = async () => {
    try {
      const res = await API.get("/products/my-products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);

      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // ==========================
  // DELETE PRODUCT
  // ==========================

  const handleDelete = async (id) => {
    try {
      const res = await API.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(res.data.message);

      // Refresh Products
      fetchMyProducts();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Delete Failed");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        "/products/add",
        {
          title,
          description,
          price,
          category,
          stock,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert(res.data.message);

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");

      fetchMyProducts();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Add Product");
    }
  };
  // ==========================
  // UPDATE PRODUCT
  // ==========================

  const handleEdit = async (product) => {
    const newTitle = prompt("Enter New Product Title", product.title);

    if (!newTitle) return;

    try {
      const res = await API.put(
        `/products/${product._id}`,
        {
          title: newTitle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      alert(res.data.message);

      fetchMyProducts();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Update Failed");
    }
  };

  // ==========================
  // PAGE LOAD
  // ==========================

  useEffect(() => {
    fetchMyProducts();
  }, []);

  return (
    <>
      <Navbar />

      <div style={{ padding: "30px" }}>
        <h1>Seller Dashboard</h1>

        <h2>Add Product</h2>

        <form onSubmit={handleAddProduct}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <br />
          <br />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <br />
          <br />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <br />
          <br />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <br />
          <br />

          <input
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <br />
          <br />

          <button type="submit">Add Product</button>
        </form>

        <hr />

        <h2>My Products</h2>

        {products.length === 0 ? (
          <h3>No Products Found</h3>
        ) : (
          products.map((product) => (
            <div
              key={product._id}
              style={{
                border: "1px solid gray",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              {/* Product Title */}
              <h3>{product.title}</h3>
              {/* Product Description */}
              <p>{product.description}</p>
              {/* Product Price */}
              <p>₹{product.price}</p>
              {/* Product Stock */}
              <p>Stock: {product.stock}</p>
              {/* Product Category */}
              <p>Category: {product.category}</p>
              {/* Edit Product Button */}
              <button onClick={() => handleEdit(product)}>
                Edit Product
              </button>{" "}
              {/* Delete Product Button */}
              <button onClick={() => handleDelete(product._id)}>
                Delete Product
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default SellerDashboard;
