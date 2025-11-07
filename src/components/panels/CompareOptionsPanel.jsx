import React from "react";

export default function CompareOptionsPanel({ onClose, options = [], theme }) {
  // Note: The 'isOpen' check is removed as the parent component (Orchestrator) 
  // is already handling conditional rendering based on the 'showComparePanel' state.

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className={`${theme?.glass || "bg-white/10"} border border-white/20 rounded-2xl shadow-2xl max-w-3xl w-full mx-4`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Compare Options</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Options Table */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {options.length === 0 ? (
            <p className="text-white/60 text-center">No options available to compare.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-white/70 border-b border-white/20">
                  <th className="py-2 px-3">Option</th>
                  <th className="py-2 px-3">Pros</th>
                  <th className="py-2 px-3">Cons</th>
                  <th className="py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {options.map((opt) => (
                  <tr key={opt.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-2 px-3 text-white">{opt.title}</td>
                    <td className="py-2 px-3 text-emerald-300">{opt.pros || "—"}</td>
                    <td className="py-2 px-3 text-red-300">{opt.cons || "—"}</td>
                    <td className="py-2 px-3 text-white/80">{opt.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
