import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function SellerDashboard() {
  const { token } = useSelector((state) => state.auth);

  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products/my-products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await API.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.message);
      fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("features", features);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("stock", stock);
      images.forEach((image) => formData.append("images", image));

      const res = await API.post("/products/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(res.data.message);
      setTitle(""); setDescription(""); setPrice("");
      setCategory(""); setStock(""); setImages([]);
      setAddOpen(false);
      fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  };

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
        { title: editTitle, price: editPrice, stock: editStock, category: editCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      setEditProduct(null);
      fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const totalValue = products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  useEffect(() => { fetchMyProducts(); }, []);

  const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#285570] focus:bg-white placeholder:text-gray-400";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

          {/* Page Header */}
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">ZentraCart</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">Seller Dashboard</h1>
            </div>
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#285570] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#1e4257] active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
            <StatCard label="Total Products" value={totalProducts} sub="Listed items" />
            <StatCard label="Inventory Value" value={`₹${Number(totalValue).toLocaleString("en-IN")}`} sub="Stock × price" />
            <StatCard label="Total Stock" value={totalStock} sub="Units available" />
            <StatCard
              label="Low Stock"
              value={lowStock}
              sub="≤ 5 units left"
            />
            <StatCard
              label="Out of Stock"
              value={outOfStock}
              sub="Needs restocking"
            />
          </div>

          {/* Products Section */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">My Products</h2>
            <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">
              {totalProducts} items
            </span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#285570] border-t-transparent" />
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">No products yet</p>
              <p className="mt-1 text-xs text-gray-400">Click "Add Product" to list your first item.</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="flex h-52 items-center justify-center bg-gray-50 p-4">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="max-h-full w-auto object-contain"
                      />
                    ) : (
                      <svg className="h-14 w-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-semibold text-gray-800">{product.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-400">{product.description}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-[#285570]">₹{Number(product.price).toLocaleString("en-IN")}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        product.stock === 0
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : product.stock <= 5
                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[11px] text-gray-400">{product.category}</p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 rounded-xl border border-[#285570] py-2 text-xs font-medium text-[#285570] transition hover:bg-[#285570] hover:text-white active:scale-[0.98]"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Product Modal ── */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">New listing</p>
                <h2 className="mt-0.5 text-xl font-semibold text-gray-900">Add Product</h2>
              </div>
              <button
                onClick={() => setAddOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <input type="text" placeholder="Product title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
              <textarea placeholder="Product description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className={inputCls + " resize-none"} />
                <textarea
  placeholder="Features (one per line)
100% Cotton
Breathable
Regular Fit
Easy Wash"
  value={features}
  onChange={(e) => setFeatures(e.target.value)}
  rows="4"
  className={inputCls + " resize-none"}
/>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} />
                <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stock quantity" value={stock} onChange={(e) => setStock(e.target.value)} className={inputCls} />
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 transition hover:bg-white">
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{images.length > 0 ? `${images.length} image(s)` : "Upload images"}</span>
                  <input type="file" multiple className="hidden" onChange={(e) => setImages([...e.target.files])} />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-[#285570] py-2.5 text-sm font-medium text-white transition hover:bg-[#1e4257] active:scale-[0.98]">
                  Add Product
                </button>
                <button type="button" onClick={() => setAddOpen(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ── */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">Editing</p>
                <h2 className="mt-0.5 text-xl font-semibold text-gray-900">Update Product</h2>
              </div>
              <button
                onClick={() => setEditProduct(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Price (₹)" className={inputCls} />
                <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} placeholder="Stock" className={inputCls} />
              </div>
              <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Category" className={inputCls} />
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={handleUpdateProduct} className="flex-1 rounded-xl bg-[#285570] py-2.5 text-sm font-medium text-white transition hover:bg-[#1e4257] active:scale-[0.98]">
                Save Changes
              </button>
              <button onClick={() => setEditProduct(null)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SellerDashboard;