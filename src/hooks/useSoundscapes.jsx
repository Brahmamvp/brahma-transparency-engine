// src/hooks/useSoundscapes.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocalMemory } from '../context/LocalMemoryContext'; 

/**
 * useSoundscapes.jsx
 * Hook to manage ambient soundscapes based on user's current emotional state.
 * Links to the Emotional Intelligence Core (EIC) via LocalMemoryContext.
 *
 * Put audio files in: public/assets/audio/soundscapes/*
 * Example: public/assets/audio/soundscapes/forest_stream.mp3
 */

// Mapping of Emotional Tone (from LocalMemory) to Soundscape File and Volume
const SOUNDSCAPE_MAPPING = {
  // Low-Arousal, Positive/Neutral
  Clear:       { file: '/assets/audio/soundscapes/forest_stream.mp3',  defaultVolume: 0.4 },
  Flowing:     { file: '/assets/audio/soundscapes/lofi_focus.mp3',     defaultVolume: 0.5 },
  Hopeful:     { file: '/assets/audio/soundscapes/gentle_chimes.mp3',  defaultVolume: 0.3 },

  // High-Arousal, Positive/Neutral
  Motivated:   { file: '/assets/audio/soundscapes/energetic_synths.mp3', defaultVolume: 0.6 },

  // Negative/High-Arousal (Requires Soothing)
  Anxious:     { file: '/assets/audio/soundscapes/deep_breathing.mp3', defaultVolume: 0.7, soothing: true },
  Overwhelmed: { file: '/assets/audio/soundscapes/calm_ocean.mp3',     defaultVolume: 0.5, soothing: true },
  Drained:     { file: '/assets/audio/soundscapes/slow_rain.mp3',      defaultVolume: 0.6, soothing: true },

  // Default/Uncertain
  Uncertain:   { file: '/assets/audio/soundscapes/silent.mp3',         defaultVolume: 0.0 }, 
  None:        { file: '/assets/audio/soundscapes/silent.mp3',         defaultVolume: 0.0 }, 
};

// Global registry of Audio elements (keyed by file path)
const activeAudio = Object.create(null);

// Small helpers
const isBrowser = () => typeof window !== 'undefined' && typeof Audio !== 'undefined';
const getSafeMapping = (tone) => SOUNDSCAPE_MAPPING[tone] || SOUNDSCAPE_MAPPING.None;

function useSoundscapesInner() {
  const { localContext, audit } = useLocalMemory();

  const initialTone = localContext?.currentEmotionalTone || 'None';
  const initialMap = getSafeMapping(initialTone);

  // State for UI controls
  const [currentTone, setCurrentTone] = useState(initialTone);
  const [activeFile, setActiveFile] = useState(initialMap.file);
  const [volume, setVolume] = useState(initialMap.defaultVolume || 0.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true); // User toggle

  const fadeIntervalRef = useRef(null);

  const clearFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  // === Core Logic to Play/Stop Audio ===
  const playSoundscape = useCallback((tone) => {
    if (!isBrowser()) {
      // In SSR or non-browser env, just update state
      const next = getSafeMapping(tone);
      setActiveFile(next.file);
      setCurrentTone(tone);
      return;
    }

    const nextScape = getSafeMapping(tone);
    const nextFile = nextScape.file;

    if (activeFile === nextFile) return;

    // 1) Fade out current audio
    if (activeAudio[activeFile] && activeFile !== SOUNDSCAPE_MAPPING.None.file) {
      clearFade();
      let currentVol = activeAudio[activeFile].volume || 0;
      const fadeOutStep = currentVol / 20; // ~1s

      fadeIntervalRef.current = setInterval(() => {
        currentVol -= fadeOutStep;
        if (currentVol <= 0) {
          clearFade();
          try {
            activeAudio[activeFile].pause();
            activeAudio[activeFile].currentTime = 0;
          } catch {}
          delete activeAudio[activeFile];
        } else {
          activeAudio[activeFile].volume = currentVol;
        }
      }, 50);
    }

    // 2) Start next audio with fade-in (unless None)
    if (nextFile !== SOUNDSCAPE_MAPPING.None.file) {
      if (!activeAudio[nextFile]) {
        try {
          activeAudio[nextFile] = new Audio(nextFile);
          activeAudio[nextFile].loop = true;
          activeAudio[nextFile].preload = 'auto';
          activeAudio[nextFile].volume = 0;
        } catch (e) {
          console.warn('Audio init failed:', e);
        }
      }

      if (activeAudio[nextFile]) {
        activeAudio[nextFile].play().catch((e) => {
          // Autoplay may be blocked until user gesture
          console.warn('Autoplay prevented. Trigger playback after user interaction.', e);
        });

        clearFade();
        let currentVol = 0;
        const targetVol = isMuted ? 0 : volume;
        const fadeInStep = targetVol / 20;

        fadeIntervalRef.current = setInterval(() => {
          currentVol += fadeInStep;
          if (currentVol >= targetVol) {
            clearFade();
            activeAudio[nextFile].volume = targetVol;
          } else {
            activeAudio[nextFile].volume = currentVol;
          }
        }, 50);
      }
    }

    setActiveFile(nextFile);
    setCurrentTone(tone);
    try {
      audit?.('soundscape_change', { from: activeFile, to: nextFile, tone });
    } catch {}
  }, [activeFile, volume, isMuted, audit]);

  // === React to emotional tone changes ===
  useEffect(() => {
    const newTone = localContext?.currentEmotionalTone || 'None';
    if (newTone !== currentTone && isEnabled) {
      setVolume(getSafeMapping(newTone).defaultVolume || 0.0);
      playSoundscape(newTone);
    }
  }, [localContext?.currentEmotionalTone, currentTone, isEnabled, playSoundscape]);

  // === React to volume/mute toggles ===
  useEffect(() => {
    if (!isBrowser()) return;
    const current = activeAudio[activeFile];
    if (current) current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, activeFile]);

  // === Cleanup on unmount ===
  useEffect(() => {
    return () => {
      clearFade();
      if (!isBrowser()) return;
      // Stop any playing audio on unmount
      Object.keys(activeAudio).forEach((key) => {
        try {
          activeAudio[key].pause();
          activeAudio[key].currentTime = 0;
        } catch {}
        delete activeAudio[key];
      });
    };
  }, []);

  // === Public Controls ===
  const toggleMute = useCallback(() => {
    setIsMuted((v) => !v);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((v) => {
      const next = !v;
      if (!next) {
        // Turning OFF → stop sounds
        playSoundscape('None');
      } else {
        // Turning ON → resume based on current tone
        playSoundscape(localContext?.currentEmotionalTone || 'None');
      }
      return next;
    });
  }, [playSoundscape, localContext?.currentEmotionalTone]);

  const setSoundscapeVolume = useCallback((newVolume) => {
    const safe = Math.min(1, Math.max(0, Number(newVolume) || 0));
    setVolume(safe);
  }, []);

  return {
    // State
    currentTone,
    activeFile,
    volume,
    isMuted,
    isEnabled,
    isSoothing: !!getSafeMapping(currentTone)?.soothing,

    // Controls
    toggleMute,
    setVolume: setSoundscapeVolume,
    toggleEnabled,

    // For UI viz
    SOUNDSCAPE_MAPPING,
  };
}

// Export both default and named for flexibility
export default useSoundscapesInner;
export const useSoundscapes = useSoundscapesInner;