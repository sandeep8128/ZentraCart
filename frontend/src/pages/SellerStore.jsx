import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function SellerStore() {
  const { sellerId } = useParams();

  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStore = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/seller/store/${sellerId}`);
      setSeller(res.data.seller);
      setProducts(res.data.products);
      setTotalProducts(res.data.totalProducts);
      setTotalRevenue(res.data.totalRevenue);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStore();
  }, [sellerId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#285570] border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-[#0f1923]">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#285570]/30" />
        <div className="pointer-events-none absolute bottom-6 left-[35%] h-28 w-28 rounded-full bg-[#285570]/15" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-8">

          {/* Seller identity */}
          <div className="flex items-center gap-5 pb-8">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-white/10 bg-[#285570] text-2xl font-semibold text-white">
              {seller?.name?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {seller?.name} Store
              </h1>
              <p className="mt-0.5 text-sm text-white/40">{seller?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-0.5 text-[11px] font-medium text-sky-300">
                <svg className="h-3 w-3 fill-sky-400" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified Seller
              </span>
            </div>
          </div>

          {/* Stats strip — flush to hero bottom */}
          <div className="grid grid-cols-3 divide-x divide-white/[0.06] overflow-hidden rounded-t-2xl border border-b-0 border-white/[0.06] bg-white/[0.03]">
            <div className="px-5 py-5">
              <p className="text-[10px] uppercase tracking-widest text-white/35">Products</p>
              <p className="mt-2 text-3xl font-semibold text-white">{totalProducts}</p>
              <p className="mt-0.5 text-[11px] text-white/25">Listed items</p>
            </div>

            <div className="px-5 py-5">
              <p className="text-[10px] uppercase tracking-widest text-white/35">Revenue</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                ₹{Number(totalRevenue).toLocaleString("en-IN")}
              </p>
              <p className="mt-0.5 text-[11px] text-white/25">Total earned</p>
            </div>

            <div className="px-5 py-5">
              <p className="text-[10px] uppercase tracking-widest text-white/35">Rating</p>
              <p className="mt-2 text-3xl font-semibold text-white">4.9</p>
              <p className="mt-0.5 text-[11px] text-white/25">Based on reviews</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Products section ── */}
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Section header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Seller Products</h2>
          <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs text-gray-500">
            {totalProducts} items
          </span>
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
            <svg className="mb-4 h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            <p className="text-sm font-medium text-gray-400">No products listed yet</p>
            <p className="mt-1 text-xs text-gray-300">Products added by this seller will appear here</p>
          </div>
        )}

      </div>
    </>
  );
}

export default SellerStore;