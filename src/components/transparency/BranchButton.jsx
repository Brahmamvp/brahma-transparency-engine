// src/components/transparency/BranchButton.jsx
import React from "react";
import { FaCodeBranch } from "react-icons/fa";

const BranchButton = ({ onBranch }) => {
  return (
    <button
      onClick={onBranch}
      title="Branch this conversation"
      className="ml-2 text-xs text-blue-400 hover:text-blue-300"
    >
      <FaCodeBranch className="inline mr-1" />
      Branch
    </button>
  );
};

export default BranchButton;