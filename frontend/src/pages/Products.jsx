import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

function Products() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const res = await API.get(
        `/products?keyword=${keyword}&category=${category}&minPrice=${minPrice}&maxPrice=${maxPrice}&sort=${sort}&page=${page}`,
      );

      setProducts(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";

    setKeyword(urlKeyword);

    fetchProducts();
  }, [page, searchParams]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleReset = () => {
    setKeyword("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("");

    setTimeout(() => {
      fetchProducts();
    }, 100);
  };

  return (
    <>
      <Navbar />

      <div className="mx-auto max-w-7xl p-6">
        <h1 className="mb-6 text-4xl font-bold text-[#285570]">Products</h1>

        {/* Filters */}

        <div className="mb-8 flex flex-wrap gap-4 rounded-2xl border border-[#CBCAC7] bg-white p-6 shadow-sm">
          <input
            type="text"
            placeholder="Search Product"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="min-w-[220px] flex-1 rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
          />

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-[#CBCAC7] px-4 py-3 outline-none"
          >
            <option value="">Sort By</option>
            <option value="priceLow">Price Low To High</option>
            <option value="priceHigh">Price High To Low</option>
            <option value="rating">Highest Rating</option>
          </select>

          <button
            onClick={handleSearch}
            className="rounded-xl bg-[#285570] px-6 py-3 text-white transition hover:bg-[#1E4257]"
          >
            Search
          </button>

          <button
            onClick={handleReset}
            className="rounded-xl bg-gray-200 px-6 py-3 text-[#333333] transition hover:bg-gray-300"
          >
            Reset
          </button>
        </div>

        {/* Products Grid */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <h3>No Products Found</h3>
          ) : (
            products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>

        {/* Pagination */}

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-xl bg-[#285570] px-5 py-2 text-white disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-lg font-semibold">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-xl bg-[#285570] px-5 py-2 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default Products;
