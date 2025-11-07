// src/demos/AvatarShowcase.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import InteractiveSageAvatar from "../common/InteractiveSageAvatar.jsx";
import ModuleWrapper from "../common/ModuleWrapper.jsx";

const AvatarShowcase = ({ userData, theme, onSaveAvatarSettings }) => {
  const [avatarSettings, setAvatarSettings] = useState({
    mood: userData?.sage?.emotion || "peaceful",
    form: userData?.sage?.form || "orb",
    size: "large",
    isListening: false,
    isThinking: false,
    isSpeaking: false,
  });

  const moods = ["peaceful", "curious", "focused", "joyful", "calm"];
  const forms = ["orb", "aura", "fractal", "nebula"];
  const sizes = ["small", "medium", "large", "xlarge"];

  const moodDescriptions = {
    peaceful: "Optimized for calm, reflective conversations.",
    curious: "Ready to explore new topics and ask probing questions.",
    focused: "Concentrating on a complex problem or task.",
    joyful: "Infusing the conversation with positivity and energy.",
    calm: "Providing a sense of stability and reassurance.",
  };

  const handleSettingChange = (key, value) => {
    setAvatarSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (onSaveAvatarSettings) {
      onSaveAvatarSettings(avatarSettings);
    }
  };

  return (
    <ModuleWrapper
      title="Interactive Sage Avatar Lab"
      description="Customize the visual form and emotional state of your Sage companion. Your changes are live and local."
      theme={theme}
    >
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Avatar Preview */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-shrink-0 w-64 h-64 flex flex-col items-center justify-center"
        >
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full h-full flex items-center justify-center">
            <InteractiveSageAvatar
              mood={avatarSettings.mood}
              form={avatarSettings.form}
              size={avatarSettings.size}
              isListening={avatarSettings.isListening}
              isThinking={avatarSettings.isThinking}
              isSpeaking={avatarSettings.isSpeaking}
              theme={theme}
            />
          </div>
          <motion.p
            key={avatarSettings.mood}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-sm text-gray-400 mt-4 text-center w-full"
          >
            {moodDescriptions[avatarSettings.mood]}
          </motion.p>
        </motion.div>

        {/* Customization Controls */}
        <div className="flex-grow space-y-6">
          {/* Mood Controls */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Mood</h3>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <motion.button
                  key={m}
                  onClick={() => handleSettingChange("mood", m)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    avatarSettings.mood === m
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form Controls */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Form</h3>
            <div className="flex flex-wrap gap-2">
              {forms.map((f) => (
                <motion.button
                  key={f}
                  onClick={() => handleSettingChange("form", f)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    avatarSettings.form === f
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Size Controls */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <motion.button
                  key={s}
                  onClick={() => handleSettingChange("size", s)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    avatarSettings.size === s
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div>
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 mt-4 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl"
            >
              Save Avatar Settings
            </motion.button>
          </div>
        </div>
      </div>
    </ModuleWrapper>
  );
};

export default AvatarShowcase;
