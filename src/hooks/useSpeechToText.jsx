import { useEffect, useRef, useState } from 'react';

export default function useSpeechToText({ lang = 'en-US' } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let text = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setTranscript(text);
    };
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    setSupported(true);
  }, [lang]);

  const start = () => recRef.current && recRef.current.start();
  const stop  = () => recRef.current && recRef.current.stop();
  const reset = () => setTranscript('');

  return { supported, listening, transcript, start, stop, reset };
}