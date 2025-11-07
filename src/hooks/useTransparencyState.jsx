// src/hooks/useTransparencyState.js
import { useState, useEffect, useMemo } from "react";
import getSampleOptions from "../data/options.js";
import { themes } from "../styles/themes.js";
import { getStoredMode, getStoredSettings, setStoredMode, setStoredSetting } from "../services/localData.js";
import getSafeTheme from "../utils/getSafeTheme.js";

// Define a safe default settings object to use as a fallback.
// This is the key to preventing the "undefined" error.
const defaultSettings = {
  theme: "purple-pink",
  mode: "Decision",
  reducedMotion: false,
};

const useTransparencyState = (userData) => {
  const [conversations, setConversations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeModel, setActiveModel] = useState("Sage Default");

  const [options, setOptions] = useState([]);
  const [pinnedOptions, setPinnedOptions] = useState(new Set());
  const [selectedOption, setSelectedOption] = useState(null);

  const [currentView, setCurrentView] = useState("transparency");
  const [navOpen, setNavOpen] = useState(true);

  const [showPrivacyContract, setShowPrivacyContract] = useState(false);
  const [hasLifetimePrivacy, setHasLifetimePrivacy] = useState(false);
  const [showDataShadow, setShowDataShadow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSim, setShowSim] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);

  const [showLiveSearch, setShowLiveSearch] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);

  const [showROI, setShowROI] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showCurriculum, setShowCurriculum] = useState(false);

  const [simScenario, setSimScenario] = useState("");

  // 🟢 NEW: Compare Options panel
  const [showComparePanel, setShowComparePanel] = useState(false);

  const [mode, setModeState] = useState(getStoredMode() || defaultSettings.mode);
  const setMode = (newMode) => {
    setModeState(newMode);
    setStoredMode(newMode);
  };

  // Change this line to provide a fallback defaultSettings object.
  const [settings, setSettingsState] = useState(getStoredSettings() || defaultSettings);
  const setSettings = (key, value) => {
    setSettingsState((p) => ({ ...p, [key]: value }));
    setStoredSetting(key, value);
    if (key === "theme" || key === "reducedMotion") {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
    }
  };

  const [isModuleLoading, setIsModuleLoading] = useState(false);

  const [showDecisionOptions, setShowDecisionOptions] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const theme = useMemo(() => getSafeTheme(settings.theme), [settings.theme]);

  useEffect(() => {
    setOptions(getSampleOptions(mode));
  }, [mode]);

  useEffect(() => {
    window.BRAHMA_OPEN_LIVE_SEARCH = () => setShowLiveSearch(true);
    return () => {
      delete window.BRAHMA_OPEN_LIVE_SEARCH;
    };
  }, []);

  const sageName = userData?.sage?.name || "Sage";

  return {
    conversations, setConversations, isTyping, setIsTyping, activeModel, setActiveModel,
    options, setOptions, pinnedOptions, setPinnedOptions, selectedOption, setSelectedOption,
    currentView, setCurrentView, navOpen, setNavOpen,
    showPrivacyContract, setShowPrivacyContract, hasLifetimePrivacy, setHasLifetimePrivacy,
    showDataShadow, setShowDataShadow, showSettings, setShowSettings, showHistory, setShowHistory,
    showSim, setShowSim, showThemePanel, setShowThemePanel, showModelSelector, setShowModelSelector,
    showLiveSearch, setShowLiveSearch, showSandbox, setShowSandbox,
    showROI, setShowROI, showTime, setShowTime, showCurriculum, setShowCurriculum,
    simScenario, setSimScenario,
    // 🟢 NEW: Compare Options
    showComparePanel, setShowComparePanel,
    mode, setMode,
    settings, setSettings,
    isModuleLoading, setIsModuleLoading,
    showDecisionOptions, setShowDecisionOptions, showQuickActions, setShowQuickActions,
    theme, sageName
  };
};

export default useTransparencyState;