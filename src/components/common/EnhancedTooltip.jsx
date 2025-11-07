import React, { useState, useRef } from "react";

const EnhancedTooltip = ({ children, content, position = "top", delay = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };
  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const pos = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {isVisible && (
        <div className={`pointer-events-none absolute ${pos} z-50 animate-fadeIn`}>
          <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap max-w-xs border border-white/20 backdrop-blur-sm">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTooltip;