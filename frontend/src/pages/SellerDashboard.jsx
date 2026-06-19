import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

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
  const [image, setImage] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");

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

      toast.success(res.data.message);

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
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);

      if (image) {
        formData.append("image", image);
      }

      const res = await API.post("/products/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message);

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("");
      setStock("");
      setImage(null);

      fetchMyProducts();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Failed To Add Product");
    }
  };
  // ==========================
  // UPDATE PRODUCT
  // ==========================

  const handleEdit = (product) => {
    setEditProduct(product);

    setEditTitle(product.title);
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditCategory(product.category);
  };

  const handleUpdateProduct = async () => {
    try {
      const res = await API.put(
        `/products/${editProduct._id}`,
        {
          title: editTitle,
          price: editPrice,
          stock: editStock,
          category: editCategory,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      setEditProduct(null);

      fetchMyProducts();
    } catch (error) {
      console.log(error.response?.data);

      alert(error.response?.data?.message || "Update Failed");
    }
  };
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, item) => sum + Number(item.stock || 0),
    0,
  );

  const totalValue = products.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.stock || 0),
    0,
  );

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

        <div className="mb-10 rounded-3xl border border-[#CBCAC7] bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-[#285570]">
            Add New Product
          </h2>

          <form onSubmit={handleAddProduct} className="space-y-5">
            <input
              type="text"
              placeholder="Product Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none focus:border-[#285570]"
            />

            <textarea
              placeholder="Product Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none focus:border-[#285570]"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
              />

              <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
              />

              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="rounded-xl border border-[#CBCAC7] bg-white px-4 py-3"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-[#285570] px-8 py-3 font-semibold text-white transition hover:bg-[#1E4257]"
            >
              Add Product
            </button>
          </form>
        </div>

        <hr />
        <div className="mb-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-[#CBCAC7] bg-white p-6 shadow-sm">
            <h3 className="text-sm text-gray-500">Total Products</h3>

            <h2 className="mt-2 text-3xl font-bold text-[#285570]">
              {totalProducts}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#CBCAC7] bg-white p-6 shadow-sm">
            <h3 className="text-sm text-gray-500">Inventory Value</h3>

            <h2 className="mt-2 text-3xl font-bold text-[#285570]">
              ₹{totalValue}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#CBCAC7] bg-white p-6 shadow-sm">
            <h3 className="text-sm text-gray-500">Total Stock</h3>

            <h2 className="mt-2 text-3xl font-bold text-[#285570]">
              {totalStock}
            </h2>
          </div>
        </div>

        <h2>My Products</h2>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-[#CBCAC7] bg-white p-8 text-center">
            <h3 className="text-xl text-gray-500">No Products Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="overflow-hidden rounded-3xl border border-[#CBCAC7] bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                {product.images?.[0]?.url && (
                  <img
                    src={product.images[0].url}
                    alt={product.title}
                    className="h-70 w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <h3 className="mb-2 line-clamp-1 text-xl font-bold text-[#333333]">
                    {product.title}
                  </h3>

                  <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                  </p>

                  <div className="mb-5 space-y-2">
                    <p className="text-2xl font-bold text-[#285570]">
                      ₹{product.price}
                    </p>

                    <p className="text-gray-600">Stock: {product.stock}</p>

                    <p className="text-gray-600">
                      Category: {product.category}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 rounded-xl bg-[#285570] py-2 text-white hover:bg-[#1E4257]"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 rounded-xl bg-red-500 py-2 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {editProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-[#285570]">
                Edit Product
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#CBCAC7] px-4 py-3"
                  placeholder="Title"
                />

                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full rounded-xl border border-[#CBCAC7] px-4 py-3"
                  placeholder="Price"
                />

                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  className="w-full rounded-xl border border-[#CBCAC7] px-4 py-3"
                  placeholder="Stock"
                />

                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-xl border border-[#CBCAC7] px-4 py-3"
                  placeholder="Category"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleUpdateProduct}
                  className="flex-1 rounded-xl bg-[#285570] py-3 text-white hover:bg-[#1E4257]"
                >
                  Update
                </button>

                <button
                  onClick={() => setEditProduct(null)}
                  className="flex-1 rounded-xl bg-gray-200 py-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SellerDashboard;
