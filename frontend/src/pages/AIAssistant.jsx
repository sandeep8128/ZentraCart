import { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

function AIAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const handleAskAI = async () => {
    const q = query.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await API.post("/ai/recommend", { query: q });

      setProducts(res.data.products || []);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Found ${res.data.products?.length || 0} products for you`,
        },
      ]);
    } catch (error) {
      console.log(error.response?.data);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAskAI();
    }
  };

  const resetChat = () => setMessages([]);

  const suggestions = [
    "Recommend a product",
    "Analyze my sales data",
    "Summarize customer feedback",
    "Compare two options",
  ];

  return (
    <>
      <Navbar />

      <div
        className="flex h-[calc(100vh-64px)] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)",
          position: "relative",
        }}
      >
        {/* Bubble Background */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              top: -80,
              left: -80,
              background: "rgba(127,119,221,0.10)",
              border: "1px solid rgba(175,169,236,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              top: 60,
              right: 30,
              background: "rgba(93,202,165,0.07)",
              border: "1px solid rgba(93,202,165,0.15)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: "50%",
              bottom: 80,
              left: 60,
              background: "rgba(175,169,236,0.08)",
              border: "1px solid rgba(175,169,236,0.20)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 80,
              height: 80,
              borderRadius: "50%",
              bottom: 160,
              right: 100,
              background: "rgba(127,119,221,0.12)",
              border: "1px solid rgba(200,195,250,0.22)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 55,
              height: 55,
              borderRadius: "50%",
              top: 180,
              left: 160,
              background: "rgba(93,202,165,0.09)",
              border: "1px solid rgba(93,202,165,0.18)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 260,
              height: 260,
              borderRadius: "50%",
              bottom: -100,
              right: -60,
              background: "rgba(29,158,117,0.06)",
              border: "1px solid rgba(29,158,117,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              borderRadius: "50%",
              top: 300,
              right: 200,
              background: "rgba(175,169,236,0.15)",
              border: "1px solid rgba(200,195,250,0.25)",
            }}
          />
          {/* Glow spots */}
          <div
            style={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: "#7F77DD",
              top: -80,
              left: -80,
              filter: "blur(60px)",
              opacity: 0.18,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "#1D9E75",
              bottom: -60,
              right: -40,
              filter: "blur(60px)",
              opacity: 0.18,
            }}
          />
        </div>

        {/* Sidebar */}
        <div
          className="relative z-10 flex flex-col gap-1 px-3 py-5"
          style={{
            width: 210,
            minWidth: 210,
            background: "rgba(15,12,41,0.70)",
            backdropFilter: "blur(16px)",
            borderRight: "0.5px solid rgba(175,169,236,0.18)",
          }}
        >
          {/* Logo */}
          <div
            className="mb-2 flex items-center gap-2 pb-4"
            style={{ borderBottom: "0.5px solid rgba(175,169,236,0.15)" }}
          >
            <div
              className="flex items-center justify-center text-base"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#534AB7",
                color: "#EEEDFE",
              }}
            >
              ✦
            </div>
            <span className="text-sm font-medium" style={{ color: "#e8e6ff" }}>
              Zentra
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs"
              style={{
                background: "rgba(127,119,221,0.25)",
                color: "#AFA9EC",
                border: "0.5px solid rgba(175,169,236,0.25)",
              }}
            >
              AI
            </span>
          </div>

          {/* New Chat Button */}
          <button
            onClick={resetChat}
            className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all"
            style={{
              color: "#AFA9EC",
              background: "rgba(127,119,221,0.10)",
              border: "0.5px solid rgba(175,169,236,0.25)",
            }}
          >
            + New chat
          </button>

          {/* Nav */}
          <p
            className="px-2 pt-2 pb-1 text-xs tracking-widest uppercase"
            style={{ color: "rgba(175,169,236,0.45)" }}
          >
            Menu
          </p>
          {[
            { label: "AI Assistant", active: true },
            { label: "Analytics" },
            { label: "History" },
            { label: "Saved" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all"
              style={{
                background: item.active
                  ? "rgba(127,119,221,0.22)"
                  : "transparent",
                color: item.active ? "#EEEDFE" : "rgba(200,196,255,0.65)",
              }}
            >
              {item.label}
            </div>
          ))}

          <p
            className="px-2 pt-3 pb-1 text-xs tracking-widest uppercase"
            style={{ color: "rgba(175,169,236,0.45)" }}
          >
            Settings
          </p>
          {["Preferences", "Help"].map((label) => (
            <div
              key={label}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs"
              style={{ color: "rgba(200,196,255,0.65)" }}
            >
              {label}
            </div>
          ))}

          {/* Footer */}
          <div
            className="mt-auto flex items-center gap-2 pt-3"
            style={{ borderTop: "0.5px solid rgba(175,169,236,0.12)" }}
          >
            <div
              className="flex flex-shrink-0 items-center justify-center rounded-full text-xs font-medium"
              style={{
                width: 28,
                height: 28,
                background: "#534AB7",
                color: "#EEEDFE",
              }}
            >
              JD
            </div>
            <div>
              <div className="text-xs font-medium" style={{ color: "#e8e6ff" }}>
                John Doe
              </div>
              <div
                className="text-xs"
                style={{ color: "rgba(175,169,236,0.55)" }}
              >
                Pro plan
              </div>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{
              background: "rgba(15,12,41,0.35)",
              backdropFilter: "blur(10px)",
              borderBottom: "0.5px solid rgba(175,169,236,0.14)",
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{ color: "#e8e6ff" }}
              >
                AI Assistant
              </span>
              <span
                className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-xs"
                style={{
                  color: "rgba(175,169,236,0.7)",
                  background: "rgba(127,119,221,0.15)",
                  border: "0.5px solid rgba(175,169,236,0.2)",
                }}
              >
                Zentra v2 ▾
              </span>
            </div>
            <div className="flex gap-1">
              {["⬆", "⬇", "•••"].map((icon, i) => (
                <button
                  key={i}
                  className="flex items-center justify-center rounded-lg text-xs transition-all"
                  style={{
                    width: 30,
                    height: 30,
                    color: "rgba(175,169,236,0.6)",
                    background: "transparent",
                    border: "none",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(127,119,221,0.3) transparent",
            }}
          >
            {messages.length === 0 ? (
              <div className="m-auto max-w-sm text-center">
                <div
                  className="mx-auto mb-4 flex items-center justify-center text-2xl"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "rgba(127,119,221,0.18)",
                    border: "0.5px solid rgba(175,169,236,0.25)",
                    color: "#AFA9EC",
                  }}
                >
                  🤖
                </div>
                <h2
                  className="mb-2 text-base font-medium"
                  style={{ color: "#e8e6ff" }}
                >
                  How can I help you today?
                </h2>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(175,169,236,0.65)" }}
                >
                  Ask me anything — product recommendations, data analysis, or
                  insights tailored to your needs.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <span
                      key={s}
                      onClick={() => setQuery(s)}
                      className="cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all"
                      style={{
                        border: "0.5px solid rgba(175,169,236,0.22)",
                        color: "rgba(200,196,255,0.7)",
                        background: "rgba(127,119,221,0.10)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex max-w-[85%] gap-2 ${msg.role === "user" ? "flex-row-reverse self-end" : "self-start"}`}
                >
                  <div
                    className="mt-0.5 flex flex-shrink-0 items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      width: 26,
                      height: 26,
                      background:
                        msg.role === "ai"
                          ? "rgba(127,119,221,0.25)"
                          : "#534AB7",
                      color: msg.role === "ai" ? "#AFA9EC" : "#EEEDFE",
                      border:
                        msg.role === "ai"
                          ? "0.5px solid rgba(175,169,236,0.25)"
                          : "none",
                    }}
                  >
                    {msg.role === "ai" ? "✦" : "JD"}
                  </div>
                  <div
                    className="px-3.5 py-2.5 text-xs leading-relaxed"
                    style={{
                      borderRadius:
                        msg.role === "ai"
                          ? "14px 14px 14px 4px"
                          : "14px 14px 4px 14px",
                      background:
                        msg.role === "ai"
                          ? "rgba(255,255,255,0.06)"
                          : "#534AB7",
                      color: msg.role === "ai" ? "#e8e6ff" : "#EEEDFE",
                      border:
                        msg.role === "ai"
                          ? "0.5px solid rgba(175,169,236,0.18)"
                          : "none",
                      backdropFilter: msg.role === "ai" ? "blur(8px)" : "none",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {/* AI Recommended Products */}
            {products.length > 0 && (
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                  >
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.title}
                      className="h-48 w-full object-cover"
                    />

                    <div className="p-4">
                      <h3 className="font-semibold text-white">
                        {product.title}
                      </h3>

                      <p className="mt-2 text-green-400">₹{product.price}</p>

                      <p className="mt-2 text-xs text-gray-300">
                        {product.reason}
                      </p>

                      <button
                        onClick={() =>
                          (window.location.href = `/products/${product._id}`)
                        }
                        className="mt-3 w-full rounded-lg bg-[#534AB7] py-2 text-sm text-white"
                      >
                        View Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-2 self-start">
                <div
                  className="flex items-center justify-center rounded-full text-xs"
                  style={{
                    width: 26,
                    height: 26,
                    background: "rgba(127,119,221,0.25)",
                    color: "#AFA9EC",
                    border: "0.5px solid rgba(175,169,236,0.25)",
                  }}
                >
                  ✦
                </div>
                <div
                  className="flex items-center gap-1 px-3.5 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid rgba(175,169,236,0.18)",
                    borderRadius: "14px 14px 14px 4px",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      className="block rounded-full"
                      style={{
                        width: 5,
                        height: 5,
                        background: "rgba(175,169,236,0.55)",
                        animation: `bounce 1.2s ${delay}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            className="px-5 pt-3 pb-5"
            style={{
              background: "rgba(15,12,41,0.30)",
              backdropFilter: "blur(12px)",
              borderTop: "0.5px solid rgba(175,169,236,0.14)",
            }}
          >
            <div
              className="overflow-hidden transition-all"
              style={{
                border: "0.5px solid rgba(175,169,236,0.22)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Ask AI anything..."
                className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm outline-none"
                style={{ color: "#e8e6ff", minHeight: 42, maxHeight: 110 }}
              />
              <div className="flex items-center justify-between px-2 pt-1 pb-2">
                <div className="flex gap-1">
                  {["📎", "🌐", "📋"].map((icon, i) => (
                    <button
                      key={i}
                      className="flex items-center justify-center rounded-lg text-sm"
                      style={{
                        width: 27,
                        height: 27,
                        background: "transparent",
                        border: "none",
                        color: "rgba(175,169,236,0.4)",
                        cursor: "pointer",
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleAskAI}
                  disabled={!query.trim() || loading}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all"
                  style={{
                    background:
                      query.trim() && !loading
                        ? "#534AB7"
                        : "rgba(127,119,221,0.18)",
                    color:
                      query.trim() && !loading
                        ? "#EEEDFE"
                        : "rgba(175,169,236,0.35)",
                    border: "none",
                    cursor: query.trim() && !loading ? "pointer" : "default",
                  }}
                >
                  {loading ? "Thinking..." : "Send ➤"}
                </button>
              </div>
            </div>
            <p
              className="mt-2 text-center"
              style={{ fontSize: 10, color: "rgba(175,169,236,0.3)" }}
            >
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Bounce Animation */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default AIAssistant;
