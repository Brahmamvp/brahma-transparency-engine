import { useState, useEffect } from 'react';

export function useVoiceSettings() {
  const [settings, setSettings] = useState({
    voiceInput: false,
    textToSpeech: false,
    offlineMode: true,
    showPrompts: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('brahma_voice_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.warn('Could not load voice settings');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('brahma_voice_settings', JSON.stringify(settings));
  }, [settings]);

  return [settings, setSettings];
}