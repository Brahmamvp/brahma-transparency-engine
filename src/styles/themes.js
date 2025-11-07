// src/styles/themes.js

// This object contains all the theme configurations for the application.
const themes = {
  light: {
    name: "Aurora",
    icon: "☀️",
    background: "bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50",
    glass: "bg-white/40 backdrop-blur-xl border-white/30",
    text: {
      primary: "text-gray-900",
      secondary: "text-gray-600",
      muted: "text-gray-500",
    },
    accent: "from-purple-500 to-pink-500",
    nav: "bg-white/60 backdrop-blur-xl border-white/40",
    particle: "light",
  },
  dark: {
    name: "Midnight",
    icon: "🌙",
    background: "bg-gradient-to-br from-gray-900 via-purple-900 to-black",
    glass: "bg-white/10 backdrop-blur-xl border-white/20",
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      muted: "text-gray-400",
    },
    accent: "from-blue-400 via-purple-400 to-pink-400",
    nav: "bg-black/40 backdrop-blur-xl border-white/10",
    particle: "dark",
  },
  void: {
    name: "Void",
    icon: "⚫",
    background: "bg-black",
    glass: "bg-white/5 backdrop-blur-xl border-white/10",
    text: {
      primary: "text-white",
      secondary: "text-gray-300",
      muted: "text-gray-500",
    },
    accent: "from-gray-400 to-gray-600",
    nav: "bg-black/80 backdrop-blur-xl border-white/5",
    particle: "dark",
  },
  cosmic: {
    name: "Cosmic",
    icon: "🌌",
    background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    glass: "bg-white/10 backdrop-blur-xl border-purple-300/20",
    text: {
      primary: "text-white",
      secondary: "text-purple-100",
      muted: "text-purple-200",
    },
    accent: "from-cyan-400 via-purple-400 to-pink-400",
    nav: "bg-purple-900/40 backdrop-blur-xl border-purple-300/10",
    particle: "dark",
  },
  nature: {
    name: "Nature",
    icon: "🌿",
    background: "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50",
    glass: "bg-white/50 backdrop-blur-xl border-emerald-200/40",
    text: {
      primary: "text-gray-900",
      secondary: "text-emerald-700",
      muted: "text-emerald-600",
    },
    accent: "from-emerald-500 to-teal-500",
    nav: "bg-emerald-50/80 backdrop-blur-xl border-emerald-200/40",
    particle: "light",
  },
  sunset: {
    name: "Sunset",
    icon: "🌅",
    background: "bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100",
    glass: "bg-white/40 backdrop-blur-xl border-orange-200/40",
    text: {
      primary: "text-gray-900",
      secondary: "text-orange-700",
      muted: "text-orange-600",
    },
    accent: "from-orange-500 via-pink-500 to-purple-500",
    nav: "bg-orange-50/80 backdrop-blur-xl border-orange-200/40",
    particle: "light",
  },
};

export { themes };
