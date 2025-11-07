import { useEffect, useMemo, useState } from 'react';

export default function useTextToSpeech({ lang = 'en-US', rate = 1, pitch = 1 } = {}) {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    setSupported(true);
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const speak = useMemo(() => (text, voiceName) => {
    if (!supported || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    if (voiceName) {
      const chosen = voices.find(v => v.name === voiceName);
      if (chosen) u.voice = chosen;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [supported, lang, rate, pitch, voices]);

  const cancel = () => supported && window.speechSynthesis.cancel();

  return { supported, voices, speak, cancel };
}