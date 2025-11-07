import React, { useEffect, useRef } from "react";

const styles = {
  // Sprint 1 styles (local prototype)
  "shadow-puppet": "opacity-80 backdrop-blur-md mix-blend-soft-light",
  "ethereal-calm": "opacity-70 backdrop-blur-lg mix-blend-overlay saturate-150",
};

/**
 * Renders the visual narrative overlay (SVG, Lottie, or cloud-generated video).
 * @param {object} props - Component props.
 * @param {string} props.src - The URL/path to the SVG, Lottie, or video file.
 * @param {string} props.style - The narrative visual style (e.g., 'shadow-puppet').
 */
export default function NarrativeRenderer({ src, style = "shadow-puppet" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    // Add a simple fade-in/fade-out animation for smooth transition
    el.classList.add("animate-fade-in");
    
    // Cleanup function to remove the class
    return () => el.classList.remove("animate-fade-in");
  }, []);

  return (
    // The overlay is absolutely positioned to cover the message area
    <div
      ref={ref}
      className={`absolute inset-0 transition-all duration-700 ${styles[style]}`}
    >
      <img
        src={src}
        alt="Narrative Overlay"
        className="w-full h-full object-cover rounded-xl pointer-events-none select-none"
      />
    </div>
  );
}
