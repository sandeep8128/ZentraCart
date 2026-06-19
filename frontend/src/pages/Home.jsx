import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import API from "../services/api";


const CATEGORIES = ["All", "Electronics", "Beauty", "Furniture", "Fashion", "Home", "Sports"];

const CATEGORY_META = [
  { cat: "Electronics", emoji: "📱", color: "#2563EB" },
  { cat: "Beauty",      emoji: "💄", color: "#EC4899" },
  { cat: "Fashion",     emoji: "👗", color: "#7C3AED" },
  { cat: "Home",        emoji: "🏠", color: "#10B981" },
  { cat: "Sports",      emoji: "⚽", color: "#F97316" },
  { cat: "Furniture",   emoji: "🛋️", color: "#F59E0B" },
];

function Home() {
  const navigate = useNavigate();
  const [products, setProducts]             = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.products);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchProducts();
    const viewed = JSON.parse(localStorage.getItem("recentProducts")) || [];
    setRecentProducts(viewed);
  }, []);

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter(
          (p) => p.category?.toLowerCase() === activeCategory.toLowerCase()
        );

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          style={{
            background: "linear-gradient(135deg, #1a2332 0%, #0F172A 100%)",
            minHeight: 520,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative orbs */}
          <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />
          <div style={{ position:"absolute", bottom:-60, left:-60, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)" }} />

          <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center relative z-10">

            {/* Left */}
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(37,99,235,0.15)", border:"1px solid rgba(37,99,235,0.3)", borderRadius:100, padding:"6px 16px", marginBottom:24 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#f97316" }} />
                <span style={{ color:"#93C5FD", fontSize:13, fontWeight:500 }}>New arrivals every week</span>
              </div>

              <h1 className="font-extrabold" style={{ color:"#fff", fontSize:"clamp(36px,5vw,60px)", lineHeight:1.1, marginBottom:20 }}>
                Discover Products<br />
                <span style={{ color:"#f97316" }}>You'll Love</span>
              </h1>

              <p style={{ color:"#94A3B8", fontSize:16, lineHeight:1.7, marginBottom:36, maxWidth:460 }}>
                ZentraCart brings you handpicked deals across electronics, fashion, beauty &amp; more — at prices that make sense.
              </p>

              <div style={{ display:"flex", gap:14, marginBottom:40 }}>
                <button
                  onClick={() => navigate("/products")}
                  style={{ background:"linear-gradient(135deg,#f97316,#ea580c)", border:"none", color:"#fff", padding:"13px 30px", borderRadius:12, fontSize:15, fontWeight:700, boxShadow:"0 8px 24px rgba(249,115,22,0.35)", cursor:"pointer", transition:"transform 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform="none"}
                >
                  Shop Now →
                </button>
                <button
                  onClick={() => navigate("/products")}
                  style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", padding:"13px 26px", borderRadius:12, fontSize:14, fontWeight:500, cursor:"pointer" }}
                >
                  Browse All
                </button>
              </div>

              <div style={{ display:"flex", gap:32 }}>
                {[["10K+","Products"],["500+","Sellers"],["4.8★","Rating"]].map(([num,label]) => (
                  <div key={label}>
                    <p style={{ color:"#f97316", fontSize:22, fontWeight:800, margin:0 }}>{num}</p>
                    <p style={{ color:"#64748B", fontSize:13, margin:0 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating visual */}
            <div className="hidden lg:flex justify-center items-center relative" style={{ height:340 }}>
              <div style={{ width:240, height:240, background:"linear-gradient(135deg,rgba(37,99,235,0.2),rgba(124,58,237,0.2))", borderRadius:40, display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,0.08)", fontSize:90 }}>
                🛍️
              </div>
              {[
                { emoji:"🎧", style:{ position:"absolute", top:10,   right:20 } },
                { emoji:"⌚", style:{ position:"absolute", bottom:30, left:20  } },
                { emoji:"👟", style:{ position:"absolute", top:110,  left:-10  } },
              ].map(({ emoji, style }) => (
                <div key={emoji} style={{ ...style, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:16, width:54, height:54, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>
                  {emoji}
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── FEATURED PRODUCTS ────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 py-16">

          <div className="flex items-end justify-between mb-8">
            <div>
              <p style={{ color:"#f97316", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:2, marginBottom:6 }}>Featured</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Trending Right Now</h2>
            </div>
            <button
              onClick={() => navigate("/products")}
              style={{ color:"#2563EB", background:"transparent", border:"1px solid #2563EB", padding:"8px 20px", borderRadius:8, fontSize:14, fontWeight:500, cursor:"pointer" }}
            >
              View All →
            </button>
          </div>

          {/* Category pills */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:32 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? "#2563EB" : "#f1f5f9",
                  color:      activeCategory === cat ? "#fff"     : "#64748b",
                  border:     activeCategory === cat ? "1px solid #2563EB" : "1px solid #e2e8f0",
                  padding:"7px 18px", borderRadius:100, fontSize:13, fontWeight:500,
                  cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* ── SHOP BY CATEGORY ─────────────────────────────── */}
        <section style={{ background:"#EFF6FF", padding:"60px 20px" }}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-10">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORY_META.map(({ cat, emoji, color }) => (
                <div
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    window.scrollTo({ top: 0, behavior:"smooth" });
                  }}
                  style={{ background:"#fff", border:"1px solid #e2e8f0", borderTop:`3px solid ${color}`, borderRadius:16, padding:"24px 12px", textAlign:"center", cursor:"pointer", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 24px ${color}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
                >
                  <div style={{ fontSize:30, marginBottom:8 }}>{emoji}</div>
                  <div style={{ fontWeight:600, color:"#1e293b", fontSize:13 }}>{cat}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RECENTLY VIEWED ──────────────────────────────── */}
        {recentProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="mb-8">
              <p style={{ color:"#f97316", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:2, marginBottom:6 }}>Your History</p>
              <h2 className="text-3xl font-extrabold text-gray-900">Recently Viewed</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ── TRUST STRIP ──────────────────────────────────── */}
        <section style={{ background:"#0F172A", padding:"48px 20px" }}>
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon:"🛡️", title:"Secure Payments", sub:"100% safe checkout"  },
              { icon:"🚀", title:"Fast Delivery",    sub:"Pan India shipping"  },
              { icon:"✅", title:"Trusted Sellers",  sub:"Verified merchants"  },
              { icon:"💎", title:"Premium Quality",  sub:"Handpicked products" },
            ].map(({ icon, title, sub }) => (
              <div key={title}>
                <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
                <p style={{ color:"#fff", fontWeight:600, fontSize:13, margin:0 }}>{title}</p>
                <p style={{ color:"#64748b", fontSize:12, margin:"4px 0 0" }}>{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────── */}
        <footer style={{ background:"#0d1525", borderTop:"1px solid #1e2d45", color:"#fff" }}>
          <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-10">

            <div>
              <h2 style={{ fontSize:18, fontWeight:700, margin:0 }}>
                Zentra<span style={{ color:"#f97316" }}>Cart</span>
              </h2>
              <p style={{ color:"#94A3B8", fontSize:14, marginTop:12, lineHeight:1.7 }}>
                Discover premium products from trusted sellers with a seamless shopping experience.
              </p>
            </div>

            <div>
              <h3 style={{ color:"#94A3B8", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:2, marginBottom:16 }}>Quick Links</h3>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8 }}>
                {[["Home","/"],["Products","/products"],["Wishlist","/wishlist"],["Cart","/cart"]].map(([label,path]) => (
                  <li key={label}>
                    <button
                      onClick={() => navigate(path)}
                      style={{ background:"none", border:"none", color:"#94A3B8", fontSize:14, cursor:"pointer", padding:0, transition:"color 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.color="#f97316"}
                      onMouseLeave={e => e.currentTarget.style.color="#94A3B8"}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ color:"#94A3B8", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:2, marginBottom:16 }}>Why ZentraCart?</h3>
              <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:8 }}>
                {["Premium Products","Secure Payments","Fast Delivery","Trusted Sellers"].map(item => (
                  <li key={item} style={{ color:"#94A3B8", fontSize:14, display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:"#f97316" }}>✔</span> {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
          <div style={{ borderTop:"1px solid #1e2d45", padding:"18px 0", textAlign:"center", color:"#475569", fontSize:12 }}>
            © 2026 ZentraCart. All Rights Reserved.
          </div>
        </footer>

      </div>
    </>
  );
}

export default Home;