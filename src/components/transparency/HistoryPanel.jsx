// src/components/transparency/HistoryPanel.jsx
import React, { useState, useEffect, useMemo } from "react";

/* =========================
   Local storage helpers
   ========================= */
const STORAGE_KEY = "brahma_conversation_history";

export const saveConversationToHistory = (record) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const now = new Date().toISOString();
    const withId = {
      id: Date.now(),
      createdAt: record?.createdAt || now,
      updatedAt: now,
      ...record,
    };
    const updated = [withId, ...existing].slice(0, 500); // keep last 500
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return withId.id;
  } catch (error) {
    console.error("Failed to save conversation:", error);
    return null;
  }
};

const loadConversationHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    console.error("Failed to load conversation history:", error);
    return [];
  }
};

const deleteConversationFromHistory = (id) => {
  try {
    const existing = loadConversationHistory();
    const filtered = existing.filter((conv) => conv.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Failed to delete conversation:", error);
    return false;
  }
};

const toggleFavoriteConversation = (id) => {
  try {
    const existing = loadConversationHistory();
    const updated = existing.map((conv) =>
      conv.id === id ? { ...conv, isFavorite: !conv.isFavorite } : conv
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    return false;
  }
};

/* =========================
   History Panel
   ========================= */
const HistoryPanel = ({ isOpen, onClose, onLoadConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // date | title | project | length
  const [sortOrder, setSortOrder] = useState("desc"); // desc | asc
  const [showFilters, setShowFilters] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load conversations when the panel opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    // tiny delay for nicer UX
    const t = setTimeout(() => {
      setConversations(loadConversationHistory());
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [isOpen]);

  // toast helper
  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  // unique projects / tags
  const { projects, tags } = useMemo(() => {
    const projectSet = new Set();
    const tagSet = new Set();
    conversations.forEach((conv) => {
      if (conv?.project) projectSet.add(conv.project);
      if (Array.isArray(conv?.tags)) conv.tags.forEach((t) => tagSet.add(t));
    });
    return {
      projects: Array.from(projectSet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [conversations]);

  // filter + sort
  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter((conv) => {
      // search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = conv?.title?.toLowerCase().includes(q);
        const matchesProject = conv?.project?.toLowerCase().includes(q);
        const matchesTags = (conv?.tags || []).some((t) =>
          t.toLowerCase().includes(q)
        );
        const matchesMessages = (conv?.messages || []).some(
          (m) =>
            (m?.user && m.user.toLowerCase().includes(q)) ||
            (m?.sage && m.sage.toLowerCase().includes(q))
        );
        if (!matchesTitle && !matchesProject && !matchesTags && !matchesMessages)
          return false;
      }

      // project filter
      if (selectedProject !== "all" && conv?.project !== selectedProject)
        return false;

      // tag filter
      if (
        selectedTag !== "all" &&
        !(Array.isArray(conv?.tags) && conv.tags.includes(selectedTag))
      )
        return false;

      return true;
    });

    // sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "date":
          cmp = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case "title":
          cmp = (a.title || "").localeCompare(b.title || "");
          break;
        case "project":
          cmp = (a.project || "").localeCompare(b.project || "");
          break;
        case "length":
          cmp = (a.messages?.length || 0) - (b.messages?.length || 0);
          break;
        default:
          cmp = 0;
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return filtered;
  }, [conversations, searchQuery, selectedProject, selectedTag, sortBy, sortOrder]);

  // handlers
  const handleLoadConversation = (conv) => {
    onLoadConversation?.(conv);
    addNotification(`Loaded "${conv.title || "Conversation"}"`, "success");
  };

  const handleDeleteConversation = (id) => {
    if (window.confirm("Delete this conversation? This action cannot be undone.")) {
      if (deleteConversationFromHistory(id)) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        setSelectedConversations((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        addNotification("Conversation deleted", "success");
      } else {
        addNotification("Failed to delete conversation", "error");
      }
    }
  };

  const handleToggleFavorite = (id) => {
    if (toggleFavoriteConversation(id)) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
      );
      addNotification("Favorite updated", "success");
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedConversations((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedConversations((prev) => {
      if (prev.size === filteredConversations.length && prev.size > 0)
        return new Set();
      return new Set(filteredConversations.map((c) => c.id));
    });
  };

  const handleBulkDelete = () => {
    if (selectedConversations.size === 0) return;
    if (
      window.confirm(
        `Delete ${selectedConversations.size} conversation${
          selectedConversations.size !== 1 ? "s" : ""
        }? This action cannot be undone.`
      )
    ) {
      let deletedCount = 0;
      selectedConversations.forEach((id) => {
        if (deleteConversationFromHistory(id)) deletedCount++;
      });
      setConversations((prev) =>
        prev.filter((c) => !selectedConversations.has(c.id))
      );
      setSelectedConversations(new Set());
      addNotification(`Deleted ${deletedCount} conversation(s)`, "success");
    }
  };

  const handleExportAll = () => {
    try {
      const dataStr = JSON.stringify(conversations, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brahma-conversations-${new Date()
        .toISOString()
        .split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addNotification("Conversations exported", "success");
    } catch (e) {
      addNotification("Export failed", "error");
    }
  };

  // small helpers
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 168) {
      // within 7 days
      return date.toLocaleDateString([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMessageCount = (messages) =>
    Array.isArray(messages)
      ? messages.filter((m) => m?.user || m?.sage).length
      : 0;

  if (!isOpen) return null;

  /* =========================
     Render
     ========================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-2 rounded-lg shadow-lg backdrop-blur-md border text-sm flex items-center gap-2 animate-slide-in ${
              n.type === "success"
                ? "bg-green-600/20 border-green-400/30 text-green-200"
                : n.type === "error"
                ? "bg-red-600/20 border-red-400/30 text-red-200"
                : "bg-blue-600/20 border-blue-400/30 text-blue-200"
            }`}
          >
            <span className="text-lg">
              {n.type === "success" && "✓"}
              {n.type === "error" && "⚠"}
              {n.type === "info" && "ℹ"}
            </span>
            {n.message}
          </div>
        ))}
      </div>

      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-lg">💬</span>
              Conversation History
            </h2>
            <p className="text-sm text-purple-200">
              {filteredConversations.length} of {conversations.length} conversations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAll}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
              title="Export all conversations"
            >
              <span className="text-lg">📥</span>
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? "bg-white/20 text-white" : "hover:bg-white/10 text-gray-300"
              }`}
              title="Toggle filters"
            >
              <span className="text-lg">🔍</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-gray-300 transition-colors"
              title="Close"
            >
              <span className="text-lg">✖</span>
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="p-6 border-b border-white/10 space-y-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search conversations, messages, projects, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all" className="bg-gray-800">
                  All Projects
                </option>
                {projects.map((p) => (
                  <option key={p} value={p} className="bg-gray-800">
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all" className="bg-gray-800">
                  All Tags
                </option>
                {tags.map((t) => (
                  <option key={t} value={t} className="bg-gray-800">
                    #{t}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/10 text-white px-3 py-2 rounded-lg border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date" className="bg-gray-800">Sort by Date</option>
                <option value="title" className="bg-gray-800">Sort by Title</option>
                <option value="project" className="bg-gray-800">Sort by Project</option>
                <option value="length" className="bg-gray-800">Sort by Length</option>
              </select>

              <button
                onClick={() => setSortOrder((v) => (v === "desc" ? "asc" : "desc"))}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 text-sm text-white transition-colors"
              >
                <span className="text-lg">{sortOrder === "desc" ? "⬇" : "⬆"}</span>
                {sortOrder === "desc" ? "Newest" : "Oldest"}
              </button>
            </div>
          )}

          {/* Bulk selection actions */}
          {selectedConversations.size > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-600/20 rounded-lg border border-blue-400/30">
              <span className="text-sm text-blue-200">
                {selectedConversations.size} conversation
                {selectedConversations.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-200 rounded-lg text-sm transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedConversations(new Set())}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-spin">⏳</div>
                <p className="text-gray-300">Loading conversations...</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {searchQuery || selectedProject !== "all" || selectedTag !== "all"
                    ? "No conversations match your filters"
                    : "No conversations yet"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery || selectedProject !== "all" || selectedTag !== "all"
                    ? "Try adjusting your search or filters"
                    : "Your conversation history will appear here"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="checkbox"
                  checked={
                    selectedConversations.size === filteredConversations.length &&
                    filteredConversations.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm text-gray-300">
                  Select all {filteredConversations.length} conversations
                </span>
              </div>

              {filteredConversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  isSelected={selectedConversations.has(conv.id)}
                  onSelect={() => handleSelectConversation(conv.id)}
                  onLoad={() => handleLoadConversation(conv)}
                  onDelete={() => handleDeleteConversation(conv.id)}
                  onToggleFavorite={() => handleToggleFavorite(conv.id)}
                  formatDate={formatDate}
                  getMessageCount={getMessageCount}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 bg-white/5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>Total: {conversations.length} conversations</span>
              <span>Filtered: {filteredConversations.length}</span>
              {selectedConversations.size > 0 && (
                <span>Selected: {selectedConversations.size}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>Storage: ~{Math.round(JSON.stringify(conversations).length / 1024)}KB</span>
              <button
                onClick={onClose}
                className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Conversation Card
   ========================= */
const ConversationCard = ({
  conversation,
  isSelected,
  onSelect,
  onLoad,
  onDelete,
  onToggleFavorite,
  formatDate,
  getMessageCount,
}) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`group bg-white/5 hover:bg-white/10 rounded-lg border transition-all ${
        isSelected ? "border-purple-400 bg-purple-600/20" : "border-white/10"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Selection checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="mt-1 w-4 h-4 rounded"
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate flex items-center gap-2">
                  {conversation.isFavorite && <span className="text-yellow-400">⭐</span>}
                  {conversation.title || "Untitled Conversation"}
                </h3>

                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span>🕒</span>
                    {formatDate(conversation.createdAt || conversation.updatedAt)}
                  </span>

                  <span className="flex items-center gap-1">
                    <span>💬</span>
                    {getMessageCount(conversation.messages)} messages
                  </span>

                  {conversation.project && (
                    <span className="bg-blue-600/30 text-blue-200 px-2 py-0.5 rounded-full">
                      {conversation.project}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {Array.isArray(conversation.tags) && conversation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversation.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="bg-purple-600/30 text-purple-200 text-xs px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                    {conversation.tags.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{conversation.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Preview of first message */}
                {Array.isArray(conversation.messages) &&
                  conversation.messages.length > 0 &&
                  conversation.messages[0]?.user && (
                    <div className="mt-2 text-xs text-gray-300 opacity-75">
                      "
                      {conversation.messages[0].user.slice(0, 100)}
                      {conversation.messages[0].user.length > 100 ? "..." : ""}
                      "
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div
                className={`flex items-center gap-1 transition-opacity ${
                  showActions || isSelected ? "opacity-100" : "opacity-0"
                }`}
              >
                <button
                  onClick={onToggleFavorite}
                  className={`p-1 rounded hover:bg-white/10 transition-colors ${
                    conversation.isFavorite
                      ? "text-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  }`}
                  title={conversation.isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <span className="text-lg">{conversation.isFavorite ? "⭐" : "☆"}</span>
                </button>

                <button
                  onClick={onLoad}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-green-400 transition-colors"
                  title="Load conversation"
                >
                  <span className="text-lg">👁</span>
                </button>

                <button
                  onClick={onDelete}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete conversation"
                >
                  <span className="text-lg">🗑</span>
                </button>
              </div>
            </div>
          </div>
          {/* end content */}
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;