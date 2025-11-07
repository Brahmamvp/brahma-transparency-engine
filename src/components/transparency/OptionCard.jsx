import React, { useState } from "react";

const OptionCard = ({
  option,
  onExplore,
  onPin,
  onArchive,
  isPinned,
  onSimulate, // ✅ optional
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/15 transition-all border border-white/20 focus-within:ring-2 focus-within:ring-purple-500/50"
      tabIndex={0}
      aria-label={`Option: ${option?.title || "untitled option"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-white truncate">
            {option.title}
          </h4>
          <div className="mt-1 flex flex-wrap gap-2">
            {option.risk && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-400/20">
                {option.risk} risk
              </span>
            )}
            {isPinned && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
                pinned
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2 ml-3 shrink-0">
          <button
            onClick={() => onPin?.(option.id)}
            className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
              isPinned
                ? "bg-yellow-500/20 text-yellow-300"
                : "hover:bg-white/10 text-gray-400"
            }`}
            title={isPinned ? "Unpin" : "Pin"}
            aria-pressed={isPinned}
            aria-label={isPinned ? "Unpin option" : "Pin option"}
          >
            📌
          </button>

          <button
            onClick={() => onArchive?.(option.id)}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            title="Archive"
            aria-label="Archive option"
          >
            🗃️
          </button>
        </div>
      </div>

      {/* Description */}
      {option.description && (
        <p className="text-gray-300 text-sm mb-4">{option.description}</p>
      )}

      {/* Cost / Risk summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Estimated Cost</div>
          <div className="text-sm font-medium text-emerald-400">
            {option.cost || "—"}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Risk Level</div>
          <div className="text-sm font-medium text-yellow-400">
            {option.risk || "—"}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-white/10 pt-4 space-y-3">
          {option.considerations?.length ? (
            <div>
              <h5 className="text-xs font-semibold text-gray-300 mb-2">
                Key Considerations
              </h5>
              <ul className="text-xs text-gray-300/90 space-y-1">
                {option.considerations.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="opacity-60">•</span>
                    <span className="flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h5 className="text-xs font-semibold text-gray-300 mb-2">Notes</h5>
            <p className="text-xs text-gray-400">
              {option.notes || "No additional notes"}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          onClick={() => onExplore?.(option)}
          className="flex-1 bg-purple-600/30 hover:bg-purple-600/50 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          aria-label={`Explore ${option.title}`}
        >
          Explore This
        </button>

        {/* 🔮 Optional simulate hook (safe to omit) */}
        {typeof onSimulate === "function" && (
          <button
            onClick={() => onSimulate(option)}
            className="px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 text-white/90 transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            title="Run a what-if simulation for this option"
            aria-label={`Simulate ${option.title}`}
          >
            🔮 Simulate
          </button>
        )}

        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="px-4 py-2 text-gray-300 hover:text-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          aria-expanded={isExpanded}
          aria-controls={`option-details-${option.id}`}
        >
          {isExpanded ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
};

export default OptionCard;
