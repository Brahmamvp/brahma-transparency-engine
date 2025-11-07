import React, { useState, useEffect } from "react";

// --- ENHANCEMENT: New Portal Loader Icon/Symbol (optional, but good practice)
import { Aperture, Infinity } from "lucide-react"; 

/**
 * Enhanced ModuleLoadingState with Brahma DNA
 * Props:
 * - isLoading: boolean
 * - moduleName?: string
 * - theme?: object
 * - children
 * - loadingVariant?: "orb" | "skeleton" | "dots" | "wisdom" | "sage" | "portal" // 🟢 NEW VARIANT
 * - showProgress?: boolean
 * - minimumDuration?: number (ms) - prevents flash loading
 * - customMessages?: string[] - rotating messages during load
 */
const ModuleLoadingState = ({
  isLoading,
  moduleName = "module",
  theme = {},
  children,
  loadingVariant = "wisdom",
  showProgress = false,
  minimumDuration = 800,
  customMessages = null,
}) => {
  // 🟢 ENHANCEMENT: Use a state to control the visibility of the component's children
  const [showChildren, setShowChildren] = useState(false);
  const [shouldShowLoader, setShouldShowLoader] = useState(isLoading);
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // 1. Prevent flash loading states and manage loader visibility
  useEffect(() => {
    let timer;
    if (isLoading) {
      setShouldShowLoader(true);
      setShowChildren(false); // Hide children immediately when loading starts
    } else {
      // Start the timer to keep the loader visible for minimumDuration
      timer = setTimeout(() => {
        setShouldShowLoader(false);
        // Only show children after the loader is hidden
        setShowChildren(true); 
      }, minimumDuration);
    }
    return () => clearTimeout(timer);
  }, [isLoading, minimumDuration]);


  // 2. Progress simulation
  useEffect(() => {
    if (!shouldShowLoader || !showProgress) return;
    
    // 🟢 ENHANCEMENT: Speed up the progress bar toward the end
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const increment = prev < 50 ? Math.random() * 10 : Math.random() * 5;
        return prev + increment;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [shouldShowLoader, showProgress]);

  // 3. Message rotation
  useEffect(() => {
    if (!shouldShowLoader || !customMessages?.length) return;
    
    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % customMessages.length);
    }, 2500); // 🟢 ENHANCEMENT: Slight increase in time for better readability

    return () => clearInterval(interval);
  }, [shouldShowLoader, customMessages]);

  // 4. Reset on hide
  useEffect(() => {
    if (!shouldShowLoader) {
      setProgress(0);
      setCurrentMessageIndex(0);
    }
  }, [shouldShowLoader]);

  // --- RENDER LOGIC ---

  // If the loader is not showing AND the minimum duration has passed, render the children
  if (!shouldShowLoader) {
      // 🟢 FIX: This ensures children are only rendered once the timer has run out.
      return <div style={{ opacity: showChildren ? 1 : 0, transition: 'opacity 0.3s' }}>{children}</div>;
  }

  // 🟢 ENHANCEMENT: Simplify theme property access
  const { 
    glass = "bg-white/10 backdrop-blur-xl border-white/10",
    text = {},
    accent = "from-cyan-400 via-purple-400 to-pink-400" 
  } = theme;

  const textPrimary = text.primary || "text-white";
  const textSecondary = text.secondary || "text-white/80";
  const textMuted = text.muted || "text-white/60";
  
  const defaultMessages = getDefaultMessages(moduleName);
  const messages = customMessages || defaultMessages;
  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="relative">
      <div className={`min-h-[400px] rounded-2xl ${glass} border overflow-hidden relative`}>
        {/* Background ambient animation */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8">
          {/* Render the appropriate loading animation */}
          <div className="flex items-center justify-center h-48 md:h-56">
            {loadingVariant === "skeleton" && (
              <SkeletonLoader textPrimary={textPrimary} textMuted={textMuted} />
            )}
            {loadingVariant === "dots" && (
              <DotsLoader textPrimary={textPrimary} textMuted={textMuted} />
            )}
            {loadingVariant === "orb" && (
              <OrbLoader textPrimary={textPrimary} textMuted={textMuted} accent={accent} />
            )}
            {loadingVariant === "wisdom" && (
              <WisdomLoader textPrimary={textPrimary} textSecondary={textSecondary} textMuted={textMuted} accent={accent} />
            )}
            {loadingVariant === "sage" && (
              <SageLoader textPrimary={textPrimary} textSecondary={textSecondary} textMuted={textMuted} accent={accent} />
            )}
            {/* 🟢 NEW: Portal Loader Variant */}
            {loadingVariant === "portal" && (
              <PortalLoader textPrimary={textPrimary} accent={accent} />
            )}
          </div>
          

          <div className="pt-4 space-y-3 text-center">
            <h3 className={`text-xl font-light ${textPrimary}`}>
              {getLoadingTitle(moduleName, loadingVariant)}
            </h3>
            
            <p className={`${textSecondary} text-sm transition-all duration-500 min-h-[1.25rem]`}>
              {currentMessage}
            </p>

            {showProgress && (
              <div className="max-w-md mx-auto space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className={textMuted}>Processing Insight Layer...</span>
                  <span className={textMuted}>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${accent} transition-all duration-300 ease-out`}
                    style={{ width: `${Math.min(progress, 99)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Breathing indicator */}
            <div className="flex items-center justify-center pt-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${accent} animate-pulse`}
                    style={{ 
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= Helper Functions ================= */

const titleCase = (s) => s?.replace(/[-_]/g, " ").replace(/\b\w/g, m => m.toUpperCase()) || "Module";

const getLoadingTitle = (moduleName, variant) => {
  const name = titleCase(moduleName);
  
  switch (variant) {
    case "wisdom":
      return `Gathering ${name} Wisdom`;
    case "sage":
      return `Awakening ${name} Intelligence`;
    case "orb":
      return `Materializing ${name}`;
    case "portal": // 🟢 NEW
      return `Opening ${name} Gateway`;
    case "skeleton":
      return `Constructing ${name}`;
    case "dots":
      return `Loading ${name}`;
    default:
      return `Preparing ${name}`;
  }
};

const getDefaultMessages = (moduleName) => {
  const wisdomMessages = [
    "Every moment of preparation deepens the experience to come...",
    "Patience is the companion of wisdom...",
    "The best things unfold in their own time...",
    "Gathering the threads of understanding...",
    "Creating space for insight to emerge..."
  ];

  const generalMessages = [
    `Warming up the ${titleCase(moduleName)} environment...`,
    "Connecting neural pathways...",
    "Calibrating for your unique perspective...",
    "Almost there—polishing the final details...",
    "Preparing your intelligent workspace...",
    "Synthesizing data streams across layers..." // 🟢 ENHANCEMENT: More tech-forward message
  ];

  return moduleName === "wisdom" || moduleName === "memory" ? wisdomMessages : generalMessages;
};

/* ================= Loading Variants ================= */

// 🟢 NEW: PORTAL LOADER VARIANT
const PortalLoader = ({ textPrimary, accent }) => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <div className={`absolute w-full h-full rounded-full border-4 border-white/10 animate-spin-slow`} />
    
    <div className={`absolute w-3/4 h-3/4 rounded-full border-4 ${accent.replace(/from-|via-|to-/, 'border-')} animate-spin-reverse`} />

    <div className="absolute">
      <Infinity size={48} className={`text-white animate-pulse`} />
    </div>

    <style jsx>{`
      .animate-spin-slow {
        animation: spin-slow 10s linear infinite;
      }
      .animate-spin-reverse {
        animation: spin-reverse 4s linear infinite;
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes spin-reverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }
    `}</style>
  </div>
);


const WisdomLoader = ({ textPrimary, textSecondary, textMuted, accent }) => (
  <div className="p-8">
    <div className="w-full h-48 rounded-xl relative overflow-hidden flex items-center justify-center">
      {/* Concentric wisdom circles */}
      <div className="relative">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`absolute inset-0 rounded-full border border-white/20`}
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${-i * 20}px`,
              top: `${-i * 20}px`,
              animation: `wisdomPulse ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
        
        {/* Central orb */}
        <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${accent} relative`}>
          <div className="absolute inset-2 rounded-full bg-white/20 animate-pulse" />
        </div>
      </div>

      {/* Floating wisdom symbols */}
      <div className="absolute inset-0">
        {['◇', '○', '△'].map((symbol, i) => (
          <div
            key={symbol}
            className={`absolute text-2xl ${textMuted} animate-float`}
            style={{
              left: `${20 + i * 30}%`,
              top: `${15 + i * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${4 + i}s`
            }}
          >
            {symbol}
          </div>
        ))}
      </div>
    </div>

    <style jsx>{`
      @keyframes wisdomPulse {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
        25% { transform: translateY(-15px) translateX(5px); opacity: 0.7; }
        50% { transform: translateY(-8px) translateX(-3px); opacity: 0.5; }
        75% { transform: translateY(-20px) translateX(8px); opacity: 0.8; }
      }
    `}</style>
  </div>
);

const SageLoader = ({ textPrimary, textSecondary, textMuted, accent }) => (
  <div className="p-8">
    <div className="w-full h-48 rounded-xl relative overflow-hidden flex items-center justify-center">
      {/* Sage silhouette */}
      <div className="relative">
        {/* Breathing aura */}
        <div 
          className={`absolute w-32 h-32 rounded-full bg-gradient-to-r ${accent} opacity-30 animate-pulse`}
          style={{ 
            filter: 'blur(20px)',
            animationDuration: '2s'
          }}
        />
        
        {/* Main form */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${accent} relative`}>
          {/* Inner consciousness */}
          <div className="absolute inset-3 rounded-full bg-white/30 animate-pulse" style={{ animationDuration: '1.5s' }} />
          
          {/* Thought emanations */}
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/60 rounded-full animate-ping"
              style={{
                left: `${30 + Math.cos(i * Math.PI / 2) * 40}px`,
                top: `${30 + Math.sin(i * Math.PI / 2) * 40}px`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Neural network pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={i}
              x1={`${10 + i * 12}%`}
              y1="20%"
              x2={`${15 + i * 12}%`}
              y2="80%"
              stroke="currentColor"
              strokeWidth="1"
              opacity={0.3}
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </svg>
      </div>
    </div>
  </div>
);

const OrbLoader = ({ textPrimary, textMuted, accent }) => (
  <div className="p-6">
    <div className="w-full h-56 rounded-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0" />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${accent} relative`}>
          {/* Inner layers */}
          <div className="absolute inset-2 rounded-full bg-white/20 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Orbiting particles */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                animation: `orbit ${2 + i * 0.5}s linear infinite`,
                transformOrigin: '50px 50px'
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute -left-1/3 top-0 h-full w-1/3 bg-white/10 rotate-12 animate-shimmer" />
    </div>
    
    <style jsx>{`
      @keyframes shimmer { 
        0% { transform: translateX(-120%) rotate(12deg); } 
        100% { transform: translateX(220%) rotate(12deg); } 
      }
      @keyframes orbit {
        from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
        to { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
      }
    `}</style>
  </div>
);

const DotsLoader = ({ textPrimary, textMuted }) => (
  <div className="p-6">
    <div className="h-40 flex items-center justify-center">
      <div className="flex gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
            style={{ 
              animation: `bounce 1.2s ${i * 0.1}s infinite ease-in-out`,
              opacity: 0.7
            }}
          />
        ))}
      </div>
    </div>
    
    <style jsx>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
        40% { transform: scale(1.2); opacity: 1; }
      }
    `}</style>
  </div>
);

const SkeletonLoader = ({ textPrimary, textMuted }) => (
  // 🟢 ENHANCEMENT: Move some styles out to make it look less 'full-page' and more modular.
  <div className="p-6 w-full">
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-3/4 rounded bg-white/10 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-white/10 animate-pulse" />
      </div>
      
      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-24 rounded-xl bg-white/10 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-2 mt-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i}
            className={`h-3 rounded bg-white/10 animate-pulse`}
            style={{ 
              width: `${80 - i * 15}%`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

export default ModuleLoadingState;
