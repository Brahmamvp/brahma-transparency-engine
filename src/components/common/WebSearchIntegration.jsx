// src/components/common/WebSearchIntegration.jsx
import React, { useEffect, useRef, useState } from "react";

// Side-panel Web Search with enhanced pulsing bar (current events / market / news)
export default function WebSearchIntegration({
  isOpen = false,
  onClose = () => {},
  onSearchResults = () => {},
}) {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  // gentle pulse for visibility
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setShouldPulse(true);
      setTimeout(() => setShouldPulse(false), 2500);
    }, 9000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!query.trim()) return;

    setIsSearching(true);
    // ----- mock fetch (replace with real fetch to your server if needed) -----
    await new Promise((r) => setTimeout(r, 900));
    const mock = [
      {
        type: "news",
        title: `Latest headlines for "${query}"`,
        source: "Top publishers",
        snippet:
          "A curated set of real-time stories and market context relevant to your query.",
        url: "#",
      },
      {
        type: "markets",
        title: "Market snapshot",
        source: "Live ticker",
        snippet: "Indexes mixed; yields steady; crude flat; USD range-bound.",
        url: "#",
      },
      {
        type: "analysis",
        title: "Key takeaways",
        source: "Synthesis",
        snippet:
          "Macro tone cautious; watch guidance revisions and liquidity conditions.",
        url: "#",
      },
    ];
    // -----------------------------------------------------------------------
    setResults(mock);
    onSearchResults(mock);
    setIsSearching(false);
  };

  return (
    <>
      {/* backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          onClick={onClose}
        />
      )}

      {/* panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] lg:w-[560px] z-50
        bg-gradient-to-b from-[#1b1233] via-[#1b143b] to-[#0f0a1f]
        border-l border-white/10 shadow-2xl transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/40 to-pink-500/40 grid place-items-center border border-white/10">
            <span className="text-lg">🌐</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white/90">
              Live Web Search
            </div>
            <div className="text-[11px] text-white/60">
              Current events • Markets • Latest news
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white/80"
            title="Close"
          >
            Close
          </button>
        </div>

        {/* enhanced search bar */}
        <div className="p-4">
          <form
            onSubmit={handleSearch}
            className={`relative bg-white/10 backdrop-blur-md rounded-full border-2 transition-all duration-300 ${
              isActive
                ? "border-purple-500 shadow-lg shadow-purple-500/25"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            {/* icon + pulse */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div
                className={`relative ${
                  shouldPulse && !isActive ? "animate-pulse" : ""
                }`}
              >
                <span
                  className={`text-gray-400 ${
                    isActive ? "text-purple-400" : ""
                  }`}
                >
                  🔎
                </span>
                {shouldPulse && !isActive && (
                  <>
                    <div className="absolute inset-0 -m-2 w-9 h-9 border-2 border-purple-400/50 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 -m-1 bg-purple-500/20 rounded-full blur-sm animate-pulse"></div>
                  </>
                )}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsActive(true);
                setShouldPulse(false);
              }}
              onBlur={() => setIsActive(false)}
              placeholder="Search news, tickers, companies, topics…"
              className="w-full bg-transparent text-white placeholder-gray-400 pl-12 pr-28 py-4 rounded-full focus:outline-none text-sm"
            />

            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                query.trim() && !isSearching
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSearching ? "Searching…" : "Search"}
            </button>
          </form>

          {/* quick chips */}
          {!query && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "fed rate decision",
                "AAPL earnings",
                "crypto market cap",
                "AI regulation news",
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* results */}
        <div className="px-4 pb-6 space-y-3 overflow-y-auto max-h-[calc(100%-150px)]">
          {results.map((r, i) => (
            <a
              key={i}
              href={r.url}
              className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4"
            >
              <div className="text-xs text-purple-200 mb-1 uppercase tracking-wide">
                {r.type} • {r.source}
              </div>
              <div className="text-white font-medium">{r.title}</div>
              <div className="text-sm text-white/70 mt-1">{r.snippet}</div>
            </a>
          ))}

          {!results.length && (
            <div className="text-sm text-white/60 px-1">
              Tip: try a company, ticker, event, or macro theme.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}