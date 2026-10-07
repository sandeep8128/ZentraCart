import { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";

function AIAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAskAI = async () => {
    const q = query.trim();

    if (!q || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: q,
      },
    ]);

    setQuery("");
    setLoading(true);

    try {
      const res = await API.post("/ai/recommend", {
        query: q,
      });

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
        {
          role: "ai",
          content: "Something went wrong. Please try again.",
        },
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

  const resetChat = () => {
    setMessages([]);
    setProducts([]);
    setQuery("");
    setSidebarOpen(false);
  };

  const suggestions = [
    "Recommend a product",
    "Analyze my sales data",
    "Summarize customer feedback",
    "Compare two options",
  ];

  const menuItems = [
    { label: "AI Assistant", active: true },
    { label: "Analytics" },
    { label: "History" },
    { label: "Saved" },
  ];

  return (
    <>
      <Navbar />

      <div
        className="relative flex h-[calc(100vh-64px)] min-h-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0d1b3e 100%)",
        }}
      >
        {/* Background Effects */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full"
            style={{
              background: "rgba(127,119,221,0.10)",
              border: "1px solid rgba(175,169,236,0.18)",
            }}
          />

          <div
            className="absolute right-8 top-16 h-[200px] w-[200px] rounded-full"
            style={{
              background: "rgba(93,202,165,0.07)",
              border: "1px solid rgba(93,202,165,0.15)",
            }}
          />

          <div
            className="absolute bottom-20 left-16 h-[140px] w-[140px] rounded-full"
            style={{
              background: "rgba(175,169,236,0.08)",
              border: "1px solid rgba(175,169,236,0.20)",
            }}
          />

          <div
            className="absolute bottom-[-100px] right-[-60px] h-[260px] w-[260px] rounded-full"
            style={{
              background: "rgba(29,158,117,0.06)",
              border: "1px solid rgba(29,158,117,0.12)",
            }}
          />

          <div
            className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full blur-[60px]"
            style={{
              background: "#7F77DD",
              opacity: 0.18,
            }}
          />

          <div
            className="absolute bottom-[-60px] right-[-40px] h-[200px] w-[200px] rounded-full blur-[60px]"
            style={{
              background: "#1D9E75",
              opacity: 0.18,
            }}
          />
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 z-50 flex h-full w-[245px] flex-col px-3 py-5 transition-transform duration-300 lg:relative lg:z-10 lg:w-[210px] lg:min-w-[210px] lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background: "rgba(15,12,41,0.92)",
            backdropFilter: "blur(18px)",
            borderRight: "0.5px solid rgba(175,169,236,0.18)",
          }}
        >
          {/* Logo */}
          <div
            className="mb-2 flex items-center gap-2 pb-4"
            style={{
              borderBottom: "0.5px solid rgba(175,169,236,0.15)",
            }}
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
              style={{
                background: "#534AB7",
                color: "#EEEDFE",
              }}
            >
              ✦
            </div>

            <span
              className="text-sm font-semibold"
              style={{ color: "#e8e6ff" }}
            >
              Zentra
            </span>

            <span
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{
                background: "rgba(127,119,221,0.25)",
                color: "#AFA9EC",
                border: "0.5px solid rgba(175,169,236,0.25)",
              }}
            >
              AI
            </span>

            {/* Mobile Close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            >
              ×
            </button>
          </div>

          {/* New Chat */}
          <button
            onClick={resetChat}
            className="mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all hover:bg-indigo-500/20"
            style={{
              color: "#AFA9EC",
              background: "rgba(127,119,221,0.10)",
              border: "0.5px solid rgba(175,169,236,0.25)",
            }}
          >
            <span className="text-base">+</span>
            New chat
          </button>

          {/* Menu */}
          <p
            className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "rgba(175,169,236,0.45)" }}
          >
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition-all hover:bg-indigo-500/10"
                style={{
                  background: item.active
                    ? "rgba(127,119,221,0.22)"
                    : "transparent",
                  color: item.active
                    ? "#EEEDFE"
                    : "rgba(200,196,255,0.65)",
                }}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    item.active ? "bg-indigo-300" : "bg-white/20"
                  }`}
                />
                {item.label}
              </button>
            ))}
          </div>

          {/* Settings */}
          <p
            className="px-2 pb-1 pt-5 text-[10px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "rgba(175,169,236,0.45)" }}
          >
            Settings
          </p>

          <div className="space-y-1">
            {["Preferences", "Help"].map((label) => (
              <button
                key={label}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition-all hover:bg-white/5"
                style={{
                  color: "rgba(200,196,255,0.65)",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* User */}
          <div
            className="mt-auto flex items-center gap-2 pt-3"
            style={{
              borderTop: "0.5px solid rgba(175,169,236,0.12)",
            }}
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
              style={{
                background: "#534AB7",
                color: "#EEEDFE",
              }}
            >
              JD
            </div>

            <div className="min-w-0">
              <div
                className="truncate text-xs font-medium"
                style={{ color: "#e8e6ff" }}
              >
                John Doe
              </div>

              <div
                className="text-[10px]"
                style={{ color: "rgba(175,169,236,0.55)" }}
              >
                Pro plan
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header
            className="flex min-h-[58px] items-center justify-between gap-3 px-3 py-2 sm:px-5"
            style={{
              background: "rgba(15,12,41,0.35)",
              backdropFilter: "blur(10px)",
              borderBottom: "0.5px solid rgba(175,169,236,0.14)",
            }}
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {/* Mobile Menu */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-lg transition hover:bg-white/10 lg:hidden"
                style={{ color: "#AFA9EC" }}
                aria-label="Open menu"
              >
                ☰
              </button>

              <div
                className="truncate text-sm font-medium"
                style={{ color: "#e8e6ff" }}
              >
                AI Assistant
              </div>

              <span
                className="hidden rounded-full px-3 py-1 text-[10px] sm:flex sm:text-xs"
                style={{
                  color: "rgba(175,169,236,0.7)",
                  background: "rgba(127,119,221,0.15)",
                  border: "0.5px solid rgba(175,169,236,0.2)",
                }}
              >
                Zentra v2 ▾
              </span>
            </div>

            <div className="flex flex-shrink-0 gap-1">
              {["⬆", "⬇", "•••"].map((icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs transition hover:bg-white/10"
                  style={{
                    color: "rgba(175,169,236,0.6)",
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </header>

          {/* Chat Area */}
          <div
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(127,119,221,0.3) transparent",
            }}
          >
            {messages.length === 0 ? (
              <div className="m-auto w-full max-w-lg px-2 py-6 text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl sm:h-16 sm:w-16"
                  style={{
                    background: "rgba(127,119,221,0.18)",
                    border: "0.5px solid rgba(175,169,236,0.25)",
                    color: "#AFA9EC",
                  }}
                >
                  🤖
                </div>

                <h2
                  className="mb-2 text-lg font-semibold sm:text-xl"
                  style={{ color: "#e8e6ff" }}
                >
                  How can I help you today?
                </h2>

                <p
                  className="mx-auto max-w-md text-xs leading-relaxed sm:text-sm"
                  style={{ color: "rgba(175,169,236,0.65)" }}
                >
                  Ask me anything — product recommendations, data analysis, or
                  insights tailored to your needs.
                </p>

                {/* Suggestions */}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setQuery(s)}
                      className="rounded-full px-3 py-2 text-[11px] transition-all hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:text-indigo-200 sm:text-xs"
                      style={{
                        border: "0.5px solid rgba(175,169,236,0.22)",
                        color: "rgba(200,196,255,0.7)",
                        background: "rgba(127,119,221,0.10)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex w-full max-w-[92%] gap-2 sm:max-w-[82%] ${
                      msg.role === "user"
                        ? "ml-auto flex-row-reverse"
                        : "mr-auto"
                    }`}
                  >
                    <div
                      className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-medium sm:h-8 sm:w-8 sm:text-xs"
                      style={{
                        background:
                          msg.role === "ai"
                            ? "rgba(127,119,221,0.25)"
                            : "#534AB7",
                        color:
                          msg.role === "ai" ? "#AFA9EC" : "#EEEDFE",
                        border:
                          msg.role === "ai"
                            ? "0.5px solid rgba(175,169,236,0.25)"
                            : "none",
                      }}
                    >
                      {msg.role === "ai" ? "✦" : "JD"}
                    </div>

                    <div
                      className="max-w-[calc(100%-38px)] px-3 py-2.5 text-xs leading-relaxed sm:px-4 sm:text-sm"
                      style={{
                        borderRadius:
                          msg.role === "ai"
                            ? "14px 14px 14px 4px"
                            : "14px 14px 4px 14px",
                        background:
                          msg.role === "ai"
                            ? "rgba(255,255,255,0.06)"
                            : "#534AB7",
                        color:
                          msg.role === "ai" ? "#e8e6ff" : "#EEEDFE",
                        border:
                          msg.role === "ai"
                            ? "0.5px solid rgba(175,169,236,0.18)"
                            : "none",
                        backdropFilter:
                          msg.role === "ai" ? "blur(8px)" : "none",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Products */}
                {products.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.07]"
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={product.images?.[0]?.url}
                            alt={product.title}
                            className="h-40 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-44"
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <div className="p-3.5 sm:p-4">
                          <h3 className="line-clamp-2 text-sm font-semibold text-white">
                            {product.title}
                          </h3>

                          <p className="mt-2 text-base font-bold text-emerald-400">
                            ₹{product.price}
                          </p>

                          <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-300">
                            {product.reason}
                          </p>

                          <button
                            onClick={() =>
                              (window.location.href = `/products/${product._id}`)
                            }
                            className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-medium text-white transition-all hover:bg-indigo-600 sm:text-sm"
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
                  <div className="flex gap-2">
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs sm:h-8 sm:w-8"
                      style={{
                        background: "rgba(127,119,221,0.25)",
                        color: "#AFA9EC",
                        border: "0.5px solid rgba(175,169,236,0.25)",
                      }}
                    >
                      ✦
                    </div>

                    <div
                      className="flex items-center gap-1.5 px-4 py-3"
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
                          className="block h-1.5 w-1.5 rounded-full"
                          style={{
                            background: "rgba(175,169,236,0.65)",
                            animation: `bounce 1.2s ${delay}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div
            className="px-3 pb-3 pt-2 sm:px-5 sm:pb-5 sm:pt-3"
            style={{
              background: "rgba(15,12,41,0.30)",
              backdropFilter: "blur(12px)",
              borderTop: "0.5px solid rgba(175,169,236,0.14)",
            }}
          >
            <div
              className="overflow-hidden rounded-2xl transition-all focus-within:border-indigo-400/50 focus-within:ring-1 focus-within:ring-indigo-400/20"
              style={{
                border: "0.5px solid rgba(175,169,236,0.22)",
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
                className="w-full resize-none bg-transparent px-3.5 pt-3 text-sm outline-none placeholder:text-white/30 sm:px-4"
                style={{
                  color: "#e8e6ff",
                  minHeight: 45,
                  maxHeight: 110,
                }}
              />

              <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1">
                <div className="flex gap-0.5">
                  {["📎", "🌐", "📋"].map((icon, i) => (
                    <button
                      key={i}
                      type="button"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm transition hover:bg-white/10"
                      style={{
                        color: "rgba(175,169,236,0.4)",
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleAskAI}
                  disabled={!query.trim() || loading}
                  className="rounded-xl px-3.5 py-2 text-xs font-medium transition-all sm:px-4"
                  style={{
                    background:
                      query.trim() && !loading
                        ? "#534AB7"
                        : "rgba(127,119,221,0.18)",
                    color:
                      query.trim() && !loading
                        ? "#EEEDFE"
                        : "rgba(175,169,236,0.35)",
                    cursor:
                      query.trim() && !loading
                        ? "pointer"
                        : "default",
                  }}
                >
                  {loading ? "Thinking..." : "Send ➤"}
                </button>
              </div>
            </div>

            <p
              className="mt-2 hidden text-center sm:block"
              style={{
                fontSize: 10,
                color: "rgba(175,169,236,0.3)",
              }}
            >
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0.7);
            opacity: 0.4;
          }

          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        textarea::-webkit-scrollbar {
          width: 4px;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(127,119,221,0.35);
          border-radius: 999px;
        }

        * {
          scrollbar-width: thin;
        }
      `}</style>
    </>
  );
}

export default AIAssistant;