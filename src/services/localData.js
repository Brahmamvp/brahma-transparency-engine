// src/services/localData.js

export const getStoredTheme = () => {
  try {
    return localStorage.getItem("brahma_theme") || "dark";
  } catch {
    return "dark";
  }
};

export const setStoredTheme = (theme) => {
  try {
    localStorage.setItem("brahma_theme", theme);
  } catch {}
};

export const getStoredMode = () => {
  try {
    return localStorage.getItem("brahma_mode") === "education" ? "education" : "career";
  } catch {
    return "career";
  }
};

export const setStoredMode = (mode) => {
  try {
    localStorage.setItem("brahma_mode", mode);
  } catch {}
};

export const getStoredSettings = () => {
  try {
    return {
      showParticles: localStorage.getItem("brahma_show_particles") !== "false",
      showAvatar: localStorage.getItem("brahma_show_avatar") !== "false",
      reducedMotion: localStorage.getItem("brahma_reduced_motion") === "true",
      theme: getStoredTheme(),
    };
  } catch {
    return {
      showParticles: true,
      showAvatar: true,
      reducedMotion: false,
      theme: "dark",
    };
  }
};

export const setStoredSetting = (key, value) => {
  try {
    localStorage.setItem(`brahma_${key}`, value);
  } catch {}
};

/**
 * @returns {object} Context data for the LLM's system prompt. This ambient data
 * is used to ground Sage's curious, non-therapeutic persona.
 */
export function getUserContext() {
  return {
    // Emotional Intelligence Core Data
    currentEmotion: localStorage.getItem("brahma.emotion") || "peaceful",
    lastInsight: localStorage.getItem("brahma.lastInsight") || "",
    // Ambient User Data
    userName: localStorage.getItem("brahma.username") || "Friend",
    recentTopic: localStorage.getItem("brahma.topic") || "general",
    silhouetteTag: localStorage.getItem("brahma.silhouette") || "none",
  };
}
 