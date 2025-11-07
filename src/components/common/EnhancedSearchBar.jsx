// src/components/common/EnhancedSearchBar.jsx
import React, { useEffect, useRef, useState } from "react";

const EnhancedSearchBar = ({ onSearch, placeholder = "Search your thoughts, decisions, or ask…" }) => {
  const [query, setQuery] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [shouldPulse, setShouldPulse] = useState(true);
  const [hasBeenUsed, setHasBeenUsed] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const searchUsed = localStorage.getItem("brahma-search-used");
    if (searchUsed) {
      setHasBeenUsed(true);
      setShouldPulse(false);
    }

    if (!searchUsed) {
      const interval = setInterval(() => {
        setShouldPulse(true);
        setTimeout(() => setShouldPulse(false), 3000);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      localStorage.setItem("brahma-search-used", "true");
      setHasBeenUsed(true);
      setShouldPulse(false);
      onSearch?.(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      <form
        onSubmit={handleSearch}
        className={`relative bg-white/10 backdrop-blur-md rounded-full border-2 transition-all duration-300 ${
          isActive ? "border-purple-500 shadow-lg shadow-purple-500/25" : "border-white/20 hover:border-white/40"
        }`}
      >
        {/* Search icon with pulse */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className={`relative ${shouldPulse && !isActive ? "animate-pulse" : ""}`}>
            <span className={`text-gray-400 ${isActive ? "text-purple-400" : ""}`}>🔍</span>
            {shouldPulse && !isActive && (
              <>
                <div className="absolute inset-0 -m-2 w-9 h-9 border-2 border-purple-400/50 rounded-full animate-ping"></div>
                <div className="absolute inset-0 -m-1 bg-purple-500/20 rounded-full blur-sm animate-pulse"></div>
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setIsActive(true); setShouldPulse(false); }}
          onBlur={() => setIsActive(false)}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-gray-400 pl-12 pr-24 py-4 rounded-full focus:outline-none text-sm"
        />

        {/* Ask button */}
        <button
          type="submit"
          disabled={!query.trim()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            query.trim()
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              : "bg-white/10 text-gray-500 cursor-not-allowed"
          }`}
        >
          Ask
        </button>
      </form>

      {/* Quick actions */}
      {isActive && query.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 shadow-xl">
          <p className="text-xs text-gray-300 mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setQuery("help me decide between")} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs text-gray-200 transition-all text-left">🤔 Help me decide between…</button>
            <button onClick={() => setQuery("search my notes for")} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs text-gray-200 transition-all text-left">📝 Search my notes for…</button>
            <button onClick={() => setQuery("what are my options for")} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs text-gray-200 transition-all text-left">🎯 What are my options for…</button>
            <button onClick={() => setQuery("translate this document")} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-xs text-gray-200 transition-all text-left">🌍 Translate this document</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;