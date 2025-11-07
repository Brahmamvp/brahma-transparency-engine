import React from "react";
import { X } from "lucide-react";

const ConsentModal = ({ isOpen, scope, details, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Confirm Consent
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Brahma would like to update your <b>{scope}</b> settings.
          <br />
          <span className="italic">
            {details?.pii
              ? details.description || "This action may include sensitive or personally identifiable information."
              : "This update will refine how Sage learns and adapts."}
          </span>
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentModal;
