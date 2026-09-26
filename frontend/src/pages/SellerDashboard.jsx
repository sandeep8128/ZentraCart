import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

import {
  Plus,
  X,
  Package,
  Wallet,
  Boxes,
  AlertTriangle,
  XCircle,
  Search,
  Pencil,
  Trash2,
  ImageOff,
  ImagePlus,
} from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, tone }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase sm:text-[11px]">
          {label}
        </p>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition group-hover:bg-indigo-600 group-hover:text-white ${tones[tone]}`}
        >
          <Icon size={17} />
        </span>
      </div>

      <p className="text-xl font-bold text-slate-900 sm:text-2xl">{value}</p>

      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "inStock", label: "In Stock" },
  { key: "lowStock", label: "Low Stock" },
  { key: "outOfStock", label: "Out of Stock" },
];

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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addingProduct, setAddingProduct] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // ================= FETCH PRODUCTS =================
  const fetchMyProducts = async () => {
    try {
      setLoading(true);

      const res = await API.get("/products/my-products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE PRODUCT =================
  const handleDelete = async (id) => {
    try {
      setDeletingProduct(id);

      const res = await API.delete(`/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(res.data.message);
      await fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingProduct(null);
    }
  };

  // ================= ADD PRODUCT =================
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Product title is required");
      return;
    }

    if (!price || Number(price) < 0) {
      toast.error("Enter a valid price");
      return;
    }

    if (!category.trim()) {
      toast.error("Category is required");
      return;
    }

    if (!stock || Number(stock) < 0) {
      toast.error("Enter a valid stock quantity");
      return;
    }

    try {
      setAddingProduct(true);

      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("features", features);
      formData.append("price", price);
      formData.append("category", category.trim());
      formData.append("stock", stock);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await API.post("/products/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message);

      setTitle("");
      setDescription("");
      setFeatures("");
      setPrice("");
      setCategory("");
      setStock("");
      setImages([]);

      setAddOpen(false);

      await fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setAddingProduct(false);
    }
  };

  // ================= OPEN EDIT =================
  const handleEdit = (product) => {
    setEditProduct(product);
    setEditTitle(product.title || "");
    setEditPrice(product.price || "");
    setEditStock(product.stock ?? "");
    setEditCategory(product.category || "");
  };

  // ================= UPDATE PRODUCT =================
  const handleUpdateProduct = async () => {
    if (!editProduct) return;

    if (!editTitle.trim()) {
      toast.error("Product title is required");
      return;
    }

    try {
      setUpdatingProduct(true);

      const res = await API.put(
        `/products/${editProduct._id}`,
        {
          title: editTitle.trim(),
          price: editPrice,
          stock: editStock,
          category: editCategory.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      setEditProduct(null);

      await fetchMyProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setUpdatingProduct(false);
    }
  };

  // ================= STATS =================
  const totalProducts = products.length;

  const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

  const totalValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0),
    0,
  );

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  const outOfStock = products.filter((p) => Number(p.stock) === 0).length;

  // ================= FILTER PRODUCTS =================
  const visibleProducts = useMemo(() => {
    return products
      .filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => {
        if (statusFilter === "inStock") {
          return Number(p.stock) > 5;
        }

        if (statusFilter === "lowStock") {
          return Number(p.stock) > 0 && Number(p.stock) <= 5;
        }

        if (statusFilter === "outOfStock") {
          return Number(p.stock) === 0;
        }

        return true;
      });
  }, [products, search, statusFilter]);

  useEffect(() => {
    if (token) {
      fetchMyProducts();
    }
  }, [token]);

  // ================= INPUT STYLE =================
  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* ================= HEADER ================= */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase sm:text-[11px]">
                ZentraCart Seller Hub
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Seller Dashboard
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-slate-500 sm:text-base">
                Manage your catalog, track inventory and keep your listings up
                to date.
              </p>
            </div>

            <button
              onClick={() => setAddOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-600 active:scale-[0.98] sm:w-auto"
            >
              <Plus size={17} />
              Add Product
            </button>
          </div>

          {/* ================= STATS ================= */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total Products"
              value={totalProducts}
              sub="Listed items"
              icon={Package}
              tone="indigo"
            />

            <StatCard
              label="Inventory Value"
              value={`₹${Number(totalValue).toLocaleString("en-IN")}`}
              sub="Stock × price"
              icon={Wallet}
              tone="emerald"
            />

            <StatCard
              label="Total Stock"
              value={totalStock}
              sub="Units available"
              icon={Boxes}
              tone="sky"
            />

            <StatCard
              label="Low Stock"
              value={lowStock}
              sub="≤ 5 units left"
              icon={AlertTriangle}
              tone="amber"
            />

            <StatCard
              label="Out of Stock"
              value={outOfStock}
              sub="Needs restocking"
              icon={XCircle}
              tone="rose"
            />
          </div>

          {/* ================= TOOLBAR ================= */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* FILTERS */}
              <div className="flex w-full gap-2 overflow-x-auto pb-1 lg:w-auto">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition duration-200 ${
                      statusFilter === tab.key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SEARCH */}
              <div className="relative w-full lg:w-72">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search your products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-3 pl-10 text-sm transition outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </div>

          {/* ================= PRODUCTS ================= */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <h2 className="text-base font-bold text-slate-800">
                My Products
              </h2>

              <span className="text-xs text-slate-400">
                {visibleProducts.length} of {totalProducts} shown
              </span>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
              </div>
            ) : visibleProducts.length === 0 ? (
              /* Empty */
              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Package size={28} className="text-slate-400" />
                </div>

                <p className="text-base font-semibold text-slate-700">
                  {products.length === 0
                    ? "No products yet"
                    : "No products match your filters"}
                </p>

                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  {products.length === 0
                    ? 'Click "Add Product" to list your first item.'
                    : "Try a different search term or filter."}
                </p>
              </div>
            ) : (
              /* Table */
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      <th className="px-5 py-3.5 sm:px-6">Product</th>

                      <th className="px-4 py-3.5">Category</th>

                      <th className="px-4 py-3.5">Price</th>

                      <th className="px-4 py-3.5">Stock</th>

                      <th className="px-4 py-3.5">Status</th>

                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {visibleProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="transition duration-200 hover:bg-indigo-50/30"
                      >
                        {/* PRODUCT */}
                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.title}
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <ImageOff
                                  size={17}
                                  className="text-slate-300"
                                />
                              )}
                            </div>

                            <div className="max-w-[230px] min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {product.title}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {product.description || "No description"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CATEGORY */}
                        <td className="px-4 py-4 text-slate-500">
                          {product.category || "—"}
                        </td>

                        {/* PRICE */}
                        <td className="px-4 py-4 font-bold text-slate-800">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </td>

                        {/* STOCK */}
                        <td className="px-4 py-4 font-semibold text-slate-700">
                          {product.stock}
                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                              Number(product.stock) === 0
                                ? "border-red-100 bg-red-50 text-red-600"
                                : Number(product.stock) <= 5
                                  ? "border-amber-100 bg-amber-50 text-amber-700"
                                  : "border-emerald-100 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {Number(product.stock) === 0
                              ? "Out of stock"
                              : Number(product.stock) <= 5
                                ? "Low stock"
                                : "In stock"}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              title="Edit"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-600 hover:text-white"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              onClick={() => handleDelete(product._id)}
                              disabled={deletingProduct === product._id}
                              title="Delete"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingProduct === product._id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ===================================================== */}
      {/* ADD PRODUCT MODAL */}
      {/* ===================================================== */}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
                  New Listing
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Add Product
                </h2>
              </div>

              <button
                onClick={() => setAddOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleAddProduct}
              className="overflow-y-auto p-5 sm:p-6"
            >
              <div className="space-y-3.5">
                <input
                  type="text"
                  placeholder="Product title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputCls}
                />

                <textarea
                  placeholder="Product description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className={`${inputCls} resize-none`}
                />

                <textarea
                  placeholder={
                    "Features (one per line)\n100% Cotton\nBreathable\nRegular Fit\nEasy Wash"
                  }
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  rows="4"
                  className={`${inputCls} resize-none`}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Price (₹)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputCls}
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock quantity"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className={inputCls}
                  />

                  <label className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600">
                    <ImagePlus size={17} className="shrink-0" />

                    <span className="truncate">
                      {images.length > 0
                        ? `${images.length} image(s) selected`
                        : "Upload images"}
                    </span>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImages([...e.target.files])}
                    />
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="submit"
                  disabled={addingProduct}
                  className="rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingProduct ? "Adding Product..." : "Add Product"}
                </button>

                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* EDIT PRODUCT MODAL */}
      {/* ===================================================== */}

      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4 backdrop-blur-sm sm:px-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">
                  Editing
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Update Product
                </h2>
              </div>

              <button
                onClick={() => setEditProduct(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title"
                  className={inputCls}
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Price (₹)"
                    className={inputCls}
                  />

                  <input
                    type="number"
                    min="0"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    placeholder="Stock"
                    className={inputCls}
                  />
                </div>

                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="Category"
                  className={inputCls}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={handleUpdateProduct}
                  disabled={updatingProduct}
                  className="rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingProduct ? "Saving..." : "Save Changes"}
                </button>

                <button
                  onClick={() => setEditProduct(null)}
                  className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SellerDashboard;
