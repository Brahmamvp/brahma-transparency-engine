import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings, 
  Pause,
  MessageSquare,
  Shield,
  RotateCcw,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Brain,
  Heart,
  Eye,
  Zap,
  User,
  Waves,
  CloudRain,
  Flame,
  Wind,
  Mountain
} from 'lucide-react';

const VoiceOnlySage = ({ 
  userData, 
  onSendMessage, 
  theme = "dark",
  onVoiceActivity,
  onNewMessage,
  voiceEnabled: externalVoiceEnabled = true
}) => {
  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(externalVoiceEnabled);
  const [canInterrupt, setCanInterrupt] = useState(true);
  const [whisperMode, setWhisperMode] = useState(false);
  const [volumeThreshold, setVolumeThreshold] = useState(0.3); // For whisper detection
  
  // Conversation state
  const [conversation, setConversation] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [conversationContext, setConversationContext] = useState([]);
  const [currentPersona, setCurrentPersona] = useState('witness');
  
  // Ambient soundscape state
  const [currentSoundscape, setCurrentSoundscape] = useState(null);
  const [soundscapeVolume, setSoundscapeVolume] = useState(0.3);
  const [showSoundscapes, setShowSoundscapes] = useState(false);
  
  // Settings
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8,
    whisperRate: 0.7,
    whisperPitch: 0.8
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const contextMemoryRef = useRef(new Map());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const soundscapeAudioRef = useRef(null);

  // Soundscape definitions
  const soundscapes = {
    rain: {
      name: 'Rain',
      icon: CloudRain,
      description: 'Gentle rainfall for reflection',
      color: 'text-blue-400',
      url: '/sounds/rain.mp3' // You'd need to add these audio files
    },
    waves: {
      name: 'Ocean',
      icon: Waves,
      description: 'Calming ocean waves',
      color: 'text-cyan-400',
      url: '/sounds/waves.mp3'
    },
    fire: {
      name: 'Fireplace',
      icon: Flame,
      description: 'Crackling fireplace for warmth',
      color: 'text-orange-400',
      url: '/sounds/fire.mp3'
    },
    forest: {
      name: 'Forest',
      icon: Wind,
      description: 'Rustling leaves and forest sounds',
      color: 'text-green-400',
      url: '/sounds/forest.mp3'
    },
    mountains: {
      name: 'Mountains',
      icon: Mountain,
      description: 'High altitude wind and stillness',
      color: 'text-gray-400',
      url: '/sounds/mountains.mp3'
    }
  };

  // Persona definitions with enhanced characteristics
  const personas = {
    witness: { 
      name: 'Witness', 
      icon: Eye, 
      voiceRate: 0.9, 
      voicePitch: 1.0,
      colorHue: 160,
      description: 'Calm, reflective presence for mindful observation',
      preferredSoundscape: 'forest'
    },
    strategist: { 
      name: 'Strategist', 
      icon: Brain, 
      voiceRate: 1.2, 
      voicePitch: 1.1,
      colorHue: 210,
      description: 'Sharp, decisive guidance for planning and execution',
      preferredSoundscape: 'mountains'
    },
    nurturer: { 
      name: 'Nurturer', 
      icon: Heart, 
      voiceRate: 0.8, 
      voicePitch: 0.9,
      colorHue: 320,
      description: 'Warm, compassionate support for emotional well-being',
      preferredSoundscape: 'fire'
    },
    catalyst: { 
      name: 'Catalyst', 
      icon: Zap, 
      voiceRate: 1.3, 
      voicePitch: 1.2,
      colorHue: 50,
      description: 'Dynamic energy for breakthrough moments and action',
      preferredSoundscape: 'waves'
    }
  };

  // Initialize audio context for volume detection
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
      } catch (error) {
        console.error('Audio context initialization failed:', error);
      }
    };
    
    initAudioContext();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Enhanced Interactive Fluid Orb with whisper mode visualization
  const InteractiveFluidOrb = () => {
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const size = 180;
      
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);
      
      const centerX = size / 2;
      const centerY = size / 2;
      const baseRadius = 60;
      
      const animate = () => {
        timeRef.current += whisperMode ? 0.015 : 0.03; // Slower in whisper mode
        ctx.clearRect(0, 0, size, size);
        
        // Get persona-based color
        const persona = personas[currentPersona];
        const baseHue = persona.colorHue;
        
        // Determine orb behavior based on state
        let pulseIntensity = whisperMode ? 0.05 : 0.1;
        let colorShift = 0;
        let morphIntensity = whisperMode ? 0.08 : 0.15;
        let particleCount = 0;
        
        if (isListening) {
          pulseIntensity = whisperMode ? 0.15 : 0.3 + Math.sin(timeRef.current * 5) * 0.15;
          colorShift = 0.3;
          morphIntensity = whisperMode ? 0.2 : 0.4;
          particleCount = whisperMode ? 4 : 8;
        } else if (isSpeaking) {
          pulseIntensity = whisperMode ? 0.2 : 0.4 + Math.sin(timeRef.current * 7) * 0.25;
          colorShift = 0.6;
          morphIntensity = whisperMode ? 0.25 : 0.5;
          particleCount = whisperMode ? 6 : 12;
        } else if (isProcessing) {
          pulseIntensity = whisperMode ? 0.1 : 0.2 + Math.sin(timeRef.current * 2) * 0.1;
          colorShift = 0.8 + Math.sin(timeRef.current * 1.5) * 0.2;
          morphIntensity = whisperMode ? 0.12 : 0.25;
          particleCount = whisperMode ? 3 : 6;
        }
        
        // Create organic fluid shape
        const points = [];
        const segments = 12;
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const noise1 = Math.sin(timeRef.current * 1.8 + angle * 4) * morphIntensity;
          const noise2 = Math.cos(timeRef.current * 2.2 + angle * 3) * morphIntensity;
          const noise3 = Math.sin(timeRef.current * 1.3 + angle * 2) * morphIntensity * 0.5;
          
          const radiusVariation = (noise1 + noise2 + noise3) * 20;
          const pulseEffect = Math.sin(timeRef.current * 4 + angle) * pulseIntensity * 15;
          const radius = baseRadius + radiusVariation + pulseEffect;
          
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          points.push({ x, y, angle, radius });
        }
        
        // Draw main fluid shape with smooth curves
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const current = points[i];
          const next = points[(i + 1) % points.length];
          
          if (i === 0) {
            ctx.moveTo(current.x, current.y);
          } else {
            const cp1x = current.x + (next.x - current.x) * 0.3;
            const cp1y = current.y + (next.y - current.y) * 0.3;
            const cp2x = current.x + (next.x - current.x) * 0.7;
            const cp2y = current.y + (next.y - current.y) * 0.7;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
          }
        }
        ctx.closePath();
        
        // Create beautiful persona-based gradient with whisper mode softness
        const gradient = ctx.createRadialGradient(
          centerX - 15, centerY - 15, 0,
          centerX, centerY, baseRadius + 40
        );
        
        const hue = baseHue + colorShift * 40;
        const sat = whisperMode ? 60 : 75 + colorShift * 15;
        const lightness = whisperMode ? 45 : 65 + pulseIntensity * 15;
        const alpha = whisperMode ? 0.7 : 0.95;
        
        gradient.addColorStop(0, `hsla(${hue + 30}, ${sat + 10}%, ${lightness + 25}%, ${alpha})`);
        gradient.addColorStop(0.4, `hsla(${hue + 10}, ${sat}%, ${lightness + 10}%, ${alpha * 0.8})`);
        gradient.addColorStop(0.8, `hsla(${hue}, ${sat - 5}%, ${lightness}%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue - 20}, ${sat - 10}%, ${lightness - 15}%, ${alpha * 0.3})`);
        
        // Apply gradient and glow
        ctx.fillStyle = gradient;
        ctx.shadowBlur = whisperMode ? 15 : 30 + pulseIntensity * 25;
        ctx.shadowColor = `hsla(${hue}, ${sat}%, ${lightness}%, ${whisperMode ? 0.4 : 0.7})`;
        ctx.fill();
        
        // Add inner particles for life
        if (particleCount > 0) {
          ctx.shadowBlur = 0;
          for (let i = 0; i < particleCount; i++) {
            const particleAngle = (timeRef.current * 1.5 + i * 0.8) % (Math.PI * 2);
            const particleDistance = 10 + Math.sin(timeRef.current * 3 + i) * 25;
            const particleX = centerX + Math.cos(particleAngle) * particleDistance;
            const particleY = centerY + Math.sin(particleAngle) * particleDistance;
            
            const particleSize = whisperMode ? 0.8 : 1.2 + Math.sin(timeRef.current * 4 + i) * 0.8;
            const opacity = whisperMode ? 0.2 : 0.4 + Math.sin(timeRef.current * 2 + i) * 0.3;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue + 40}, 90%, 85%, ${opacity})`;
            ctx.fill();
          }
        }
        
        // Add core sparkle - gentler in whisper mode
        ctx.beginPath();
        ctx.arc(centerX, centerY, whisperMode ? 1.5 : 2.5 + pulseIntensity * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue + 60}, 100%, 90%, ${whisperMode ? 0.5 : 0.8 + pulseIntensity * 0.2})`;
        ctx.shadowBlur = whisperMode ? 6 : 12;
        ctx.shadowColor = `hsla(${hue + 60}, 100%, 90%, ${whisperMode ? 0.4 : 0.8})`;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Whisper mode indicator - soft outer glow
        if (whisperMode) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, baseRadius + 20, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${hue}, 70%, 80%, 0.2)`;
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 10]);
          ctx.lineDashOffset = timeRef.current * 20;
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isListening, isSpeaking, isProcessing, currentPersona, whisperMode]);
    
    return (
      <canvas 
        ref={canvasRef}
        className="cursor-pointer transition-transform hover:scale-105"
        style={{ filter: `drop-shadow(0 8px 24px hsla(${personas[currentPersona].colorHue}, 60%, 50%, ${whisperMode ? '0.2' : '0.3'}))` }}
      />
    );
  };

  // Soundscape management
  const playSoundscape = (soundscapeKey) => {
    if (soundscapeAudioRef.current) {
      soundscapeAudioRef.current.pause();
      soundscapeAudioRef.current = null;
    }
    
    if (soundscapeKey && soundscapes[soundscapeKey]) {
      try {
        soundscapeAudioRef.current = new Audio(soundscapes[soundscapeKey].url);
        soundscapeAudioRef.current.loop = true;
        soundscapeAudioRef.current.volume = soundscapeVolume;
        soundscapeAudioRef.current.play();
        setCurrentSoundscape(soundscapeKey);
      } catch (error) {
        console.error('Failed to play soundscape:', error);
        // Fallback: create silent audio context for ambient effect
        setCurrentSoundscape(soundscapeKey);
      }
    } else {
      setCurrentSoundscape(null);
    }
  };

  // Volume detection for whisper mode
  const detectWhisperMode = (stream) => {
    if (!audioContextRef.current || !analyserRef.current) return;
    
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkVolume = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedVolume = average / 255;
      
      const shouldBeWhisperMode = normalizedVolume < volumeThreshold;
      if (shouldBeWhisperMode !== whisperMode) {
        setWhisperMode(shouldBeWhisperMode);
      }
      
      if (isListening) {
        requestAnimationFrame(checkVolume);
      }
    };
    
    checkVolume();
  };

  // Initialize speech APIs with enhanced features
  useEffect(() => {
    // Speech Recognition with interruption handling
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        onVoiceActivity?.(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        onVoiceActivity?.(false);
        if (autoListen && !isSpeaking && !isProcessing) {
          setTimeout(startListening, 800);
        }
      };
      
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        let isFinalResult = false;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinalResult = true;
          }
        }
        
        setCurrentTranscript(transcript);
        
        // Handle interruption
        if (isSpeaking && canInterrupt && transcript.trim()) {
          stopSpeaking();
          setCurrentTranscript('');
        }
        
        if (isFinalResult && transcript.trim()) {
          handleVoiceInput(transcript.trim());
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        onVoiceActivity?.(false);
      };
    }
    
    synthRef.current = window.speechSynthesis;
    
    return () => {
      stopListening();
      stopSpeaking();
      if (soundscapeAudioRef.current) {
        soundscapeAudioRef.current.pause();
      }
    };
  }, [autoListen, canInterrupt, isSpeaking, isProcessing, onVoiceActivity]);

  // Sync external voice enabled state
  useEffect(() => {
    setVoiceEnabled(externalVoiceEnabled);
  }, [externalVoiceEnabled]);

  // Enhanced conversation memory and context
  const updateConversationContext = (userInput, sageResponse) => {
    const contextEntry = {
      timestamp: new Date(),
      userInput,
      sageResponse,
      persona: currentPersona,
      whisperMode,
      soundscape: currentSoundscape,
      sessionId: Date.now()
    };
    
    setConversationContext(prev => [...prev.slice(-10), contextEntry]);
    
    // Store in memory map for quick retrieval
    const keywords = userInput.toLowerCase().split(' ').filter(word => word.length > 3);
    keywords.forEach(keyword => {
      if (contextMemoryRef.current.has(keyword)) {
        contextMemoryRef.current.get(keyword).push(contextEntry);
      } else {
        contextMemoryRef.current.set(keyword, [contextEntry]);
      }
    });
  };

  // Intelligent persona detection with whisper mode consideration
  const detectPersonaFromInput = (input) => {
    const lowerInput = input.toLowerCase();
    
    // In whisper mode, bias toward nurturing responses
    if (whisperMode) {
      if (lowerInput.includes('help') || lowerInput.includes('scared') || lowerInput.includes('hurt')) {
        return 'nurturer';
      }
      if (lowerInput.includes('calm') || lowerInput.includes('peace') || lowerInput.includes('breathe')) {
        return 'witness';
      }
    }
    
    if (lowerInput.includes('feel') || lowerInput.includes('emotion') || lowerInput.includes('support') || lowerInput.includes('heart')) {
      return 'nurturer';
    } else if (lowerInput.includes('plan') || lowerInput.includes('strategy') || lowerInput.includes('decide') || lowerInput.includes('analyze')) {
      return 'strategist';
    } else if (lowerInput.includes('action') || lowerInput.includes('energy') || lowerInput.includes('breakthrough') || lowerInput.includes('change')) {
      return 'catalyst';
    } else if (lowerInput.includes('observe') || lowerInput.includes('mindful') || lowerInput.includes('reflect') || lowerInput.includes('notice')) {
      return 'witness';
    }
    return currentPersona;
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        // Get microphone access for volume detection
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            detectWhisperMode(stream);
            recognitionRef.current.start();
          })
          .catch(error => {
            console.error('Microphone access denied:', error);
            recognitionRef.current.start();
          });
      } catch (error) {
        console.error('Failed to start recognition:', error);
      }
    }
  };
  
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };
  
  const handleVoiceInput = async (transcript) => {
    if (!transcript.trim()) return;
    
    setCurrentTranscript('');
    setIsProcessing(true);
    stopListening();
    
    // Detect and switch persona based on input
    const detectedPersona = detectPersonaFromInput(transcript);
    if (detectedPersona !== currentPersona) {
      setCurrentPersona(detectedPersona);
      
      // Auto-suggest matching soundscape
      const preferredSoundscape = personas[detectedPersona].preferredSoundscape;
      if (!currentSoundscape && preferredSoundscape) {
        setTimeout(() => {
          // Subtle suggestion, not automatic
          console.log(`Persona ${detectedPersona} suggests ${preferredSoundscape} soundscape`);
        }, 1000);
      }
    }
    
    const userMessage = { role: 'user', content: transcript, timestamp: new Date(), persona: detectedPersona, whisperMode };
    setConversation(prev => [...prev, userMessage]);
    
    try {
      const response = await generateContextualResponse(transcript, detectedPersona);
      const sageMessage = { role: 'sage', content: response, timestamp: new Date(), persona: detectedPersona, whisperMode };
      setConversation(prev => [...prev, sageMessage]);
      
      // Update conversation context
      updateConversationContext(transcript, response);
      
      if (voiceEnabled) {
        speakText(response, detectedPersona);
      }
      
      onSendMessage?.(transcript);
      onNewMessage?.();
      
    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage = { role: 'sage', content: "I'm experiencing some difficulty right now. Could you try rephrasing that?", timestamp: new Date(), persona: currentPersona };
      setConversation(prev => [...prev, errorMessage]);
      
      if (voiceEnabled) {
        speakText("I'm experiencing some difficulty right now. Could you try rephrasing that?", currentPersona);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Enhanced contextual response generation with whisper mode awareness
  const generateContextualResponse = async (input, persona) => {
    await new Promise(resolve => setTimeout(resolve, whisperMode ? 800 : 1200 + Math.random() * 1800));
    
    // Check for contextual references
    const lowerInput = input.toLowerCase();
    let contextualPrefix = "";
    
    // Look for references to past conversations
    if (lowerInput.includes('last time') || lowerInput.includes('before') || lowerInput.includes('earlier')) {
      const recentContext = conversationContext.slice(-3);
      if (recentContext.length > 0) {
        contextualPrefix = whisperMode ? "Softly building on what we shared earlier, " : "Building on what we discussed earlier, ";
      }
    }
    
    // Whisper mode responses - gentler, more intimate
    if (whisperMode) {
      const whisperResponses = {
        witness: [
          `${contextualPrefix}I'm here with you in this quiet space. What's gently arising?`,
          `${contextualPrefix}In this stillness, what do you notice about this moment?`,
          `${contextualPrefix}Your voice carries something tender. I'm listening.`,
          `${contextualPrefix}What wants to be witnessed right now?`
        ],
        strategist: [
          `${contextualPrefix}Let's think through this together, gently. What's the heart of it?`,
          `${contextualPrefix}I hear the quiet urgency in what you're sharing. What feels most important?`,
          `${contextualPrefix}In this calm space, what clarity is emerging?`,
          `${contextualPrefix}What small step feels right from here?`
        ],
        nurturer: [
          `${contextualPrefix}I can feel how much this matters to you. You're safe here.`,
          `${contextualPrefix}Your gentle voice tells me this is tender ground. I'm with you.`,
          `${contextualPrefix}What would feel most comforting right now?`,
          `${contextualPrefix}How can I hold space for what you're carrying?`
        ],
        catalyst: [
          `${contextualPrefix}Even in whispers, I sense the energy wanting to move. What's ready?`,
          `${contextualPrefix}There's quiet power in what you're saying. What wants to shift?`,
          `${contextualPrefix}Sometimes the most profound changes begin with a whisper. What's calling you?`,
          `${contextualPrefix}I feel the gentle momentum in your words. Where does it want to take you?`
        ]
      };
      
      const whisperPersonaResponses = whisperResponses[persona] || whisperResponses.witness;
      return whisperPersonaResponses[Math.floor(Math.random() * whisperPersonaResponses.length)];
    }
    
    // Regular persona-specific responses
    const responses = {
      witness: [
        `${contextualPrefix}I notice there's something deeper here. What are you truly observing about this situation?`,
        `${contextualPrefix}Let's pause and witness this moment together. What's arising for you right now?`,
        `${contextualPrefix}I sense this touches something important within you. Can you feel into what that might be?`,
        `${contextualPrefix}From this witnessing space, what becomes clearer about your experience?`
      ],
      strategist: [
        `${contextualPrefix}Let's break this down systematically. What's the core challenge we need to address?`,
        `${contextualPrefix}Based on what you're sharing, I see three potential pathways forward. Which resonates most?`,
        `${contextualPrefix}This connects to the strategic thinking we've been developing. What's your next decisive move?`,
        `${contextualPrefix}The pattern I'm seeing suggests we need to focus on execution. What's the first concrete step?`
      ],
      nurturer: [
        `${contextualPrefix}I can hear how much this means to you. What support do you need right now?`,
        `${contextualPrefix}Your heart is speaking something important here. How can we honor what you're feeling?`,
        `${contextualPrefix}I'm holding space for everything you're experiencing. What would feel most nurturing?`,
        `${contextualPrefix}This gentle awareness you're sharing touches me. How are you caring for yourself through this?`
      ],
      catalyst: [
        `${contextualPrefix}There's energy wanting to move through this situation! What's ready to shift?`,
        `${contextualPrefix}I can feel the momentum building in what you're describing. What wants to breakthrough?`,
        `${contextualPrefix}This is activation time! What bold action is calling to you?`,
        `${contextualPrefix}The catalyst moment is here. What transformation is seeking to emerge?`
      ]
    };
    
    const personaResponses = responses[persona] || responses.witness;
    return personaResponses[Math.floor(Math.random() * personaResponses.length)];
  };
  
  // Enhanced speech with persona-based voice characteristics and whisper mode
  const speakText = (text, persona = currentPersona) => {
    if (!synthRef.current || !text) return;
    
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const personaSettings = personas[persona];
    
    // Apply persona-specific voice settings with whisper mode adjustments
    if (whisperMode) {
      utterance.rate = voiceSettings.rate * voiceSettings.whisperRate * personaSettings.voiceRate;
      utterance.pitch = voiceSettings.pitch * voiceSettings.whisperPitch * personaSettings.voicePitch;
      utterance.volume = voiceSettings.volume * 0.7; // Quieter in whisper mode
    } else {
      utterance.rate = voiceSettings.rate * personaSettings.voiceRate;
      utterance.pitch = voiceSettings.pitch * personaSettings.voicePitch;
      utterance.volume = voiceSettings.volume;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setLastSpokenText(text);
      onVoiceActivity?.(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setLastSpokenText('');
      onVoiceActivity?.(false);
      if (autoListen) {
        setTimeout(startListening, whisperMode ? 400 : 600);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setLastSpokenText('');
      onVoiceActivity?.(false);
    };
    
    synthRef.current.speak(utterance);
  };
  
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setLastSpokenText('');
      onVoiceActivity?.(false);
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setAutoListen(false);
    } else {
      startListening();
      setAutoListen(true);
    }
  };

  const themeStyles = theme === "dark" ? {
    background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-black",
    glass: "bg-white/10 backdrop-blur-xl border-white/20",
    text: "text-white",
    textSecondary: "text-gray-300",
    textMuted: "text-gray-400"
  } : {
    background: "bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50",
    glass: "bg-white/60 backdrop-blur-xl border-white/40",
    text: "text-gray-900",
    textSecondary: "text-gray-700",
    textMuted: "text-gray-600"
  };

  return (
    <div className={`min-h-screen ${themeStyles.background} ${themeStyles.text} p-4 ${whisperMode ? 'filter brightness-90' : ''}`}>
      <div className="max-w-3xl mx-auto">
        {/* Compact Header with Whisper Mode Indicator */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Voice Sage
            </h1>
            {whisperMode && (
              <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/20 rounded-full border border-pink-500/30">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                <span className="text-pink-300 text-xs font-medium">Whisper</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs font-medium">Private • Contextual Memory</span>
            {currentSoundscape && (
              <>
                <span className="text-gray-500">•</span>
                <span className={`text-xs font-medium ${soundscapes[currentSoundscape].color}`}>
                  {soundscapes[currentSoundscape].name}
                </span>
              </>
            )}
          </div>
          <p className={`${themeStyles.textSecondary} text-sm`}>
            Speak naturally with {userData?.sage?.name || 'Sage'}
          </p>
        </div>
        
        {/* Main Voice Interface */}
        <div className={`${themeStyles.glass} rounded-2xl p-6 border text-center mb-4 shadow-xl`}>
          {/* Persona Selector */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {Object.entries(personas).map(([key, persona]) => {
              const IconComponent = persona.icon;
              const isActive = currentPersona === key;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentPersona(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all text-xs ${
                    isActive 
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' 
                      : `${themeStyles.glass} border hover:bg-white/10`
                  }`}
                  title={persona.description}
                >
                  <IconComponent size={14} />
                  <span className="hidden sm:inline">{persona.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Interactive Fluid Orb */}
            <div className="flex-shrink-0">
              <InteractiveFluidOrb />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              {/* Sage Info */}
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-1">{personas[currentPersona].name}</h2>
                <p className={`${themeStyles.textSecondary} text-sm`}>
                  {isListening ? (whisperMode ? 'Listening gently...' : 'Listening with full attention...') :
                   isSpeaking ? (whisperMode ? 'Speaking softly...' : 'Sharing wisdom and presence...') :
                   isProcessing ? 'Processing with contextual awareness...' :
                   'Ready for meaningful connection'}
                </p>
              </div>
              
              {/* Current Status */}
              {currentTranscript && (
                <div className={`${themeStyles.glass} rounded-lg p-3 mb-3 border text-xs`}>
                  <p className="text-purple-300 font-medium mb-1">You're saying:</p>
                  <p className="italic">"{currentTranscript.length > 50 ? currentTranscript.substring(0, 50) + '...' : currentTranscript}"</p>
                </div>
              )}
              
              {lastSpokenText && isSpeaking && (
                <div className={`${themeStyles.glass} rounded-lg p-3 mb-3 border border-green-500/30 bg-green-500/10 text-xs`}>
                  <p className="text-green-300 font-medium mb-1">Sage is saying:</p>
                  <p className="italic">"{lastSpokenText.substring(0, 60)}..."</p>
                </div>
              )}
              
              {/* Voice Controls */}
              <div className="flex justify-center sm:justify-start items-center gap-3 mb-3">
                <button
                  onClick={toggleListening}
                  className={`group relative p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                    isListening 
                      ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                      : 'bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                  }`}
                  title={isListening ? 'Stop listening' : 'Start listening'}
                >
                  {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                </button>
                
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`group relative p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                    voiceEnabled 
                      ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white' 
                      : 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                  }`}
                  title={voiceEnabled ? 'Voice responses enabled' : 'Voice responses disabled'}
                >
                  {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                </button>
                
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="group relative p-4 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white transition-all duration-300 transform hover:scale-110 shadow-lg"
                    title="Stop speaking"
                  >
                    <Pause size={24} />
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  </button>
                )}
                
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`group relative p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${themeStyles.glass} border hover:bg-white/20 shadow-xl`}
                  title="Voice settings"
                >
                  <Settings size={20} />
                </button>
                
                <button
                  onClick={() => setShowSoundscapes(!showSoundscapes)}
                  className={`group relative p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${themeStyles.glass} border hover:bg-white/20 shadow-xl ${currentSoundscape ? 'ring-2 ring-cyan-400/50' : ''}`}
                  title="Ambient soundscapes"
                >
                  <Waves size={20} className={currentSoundscape ? 'text-cyan-400' : ''} />
                </button>
              </div>
              
              {/* Settings toggles */}
              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoListen}
                    onChange={(e) => setAutoListen(e.target.checked)}
                    className="w-3 h-3 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>Auto-continue</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canInterrupt}
                    onChange={(e) => setCanInterrupt(e.target.checked)}
                    className="w-3 h-3 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span>Allow interruption</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Soundscape Panel */}
        {showSoundscapes && (
          <div className={`${themeStyles.glass} rounded-xl border mb-4 shadow-xl overflow-hidden`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Ambient Soundscapes</h3>
                <button
                  onClick={() => setShowSoundscapes(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <button
                  onClick={() => playSoundscape(null)}
                  className={`p-3 rounded-lg border transition-all text-xs ${
                    !currentSoundscape 
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' 
                      : `${themeStyles.glass} border-white/20 hover:bg-white/10`
                  }`}
                >
                  <X size={16} className="mx-auto mb-1" />
                  <div>Silence</div>
                </button>
                
                {Object.entries(soundscapes).map(([key, soundscape]) => {
                  const IconComponent = soundscape.icon;
                  const isActive = currentSoundscape === key;
                  return (
                    <button
                      key={key}
                      onClick={() => playSoundscape(key)}
                      className={`p-3 rounded-lg border transition-all text-xs ${
                        isActive 
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                          : `${themeStyles.glass} border-white/20 hover:bg-white/10`
                      }`}
                      title={soundscape.description}
                    >
                      <IconComponent size={16} className={`mx-auto mb-1 ${soundscape.color}`} />
                      <div>{soundscape.name}</div>
                    </button>
                  );
                })}
              </div>
              
              {currentSoundscape && (
                <div className="border-t border-white/10 pt-4">
                  <label className="block text-sm font-medium mb-2">Soundscape Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={soundscapeVolume}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setSoundscapeVolume(newVolume);
                      if (soundscapeAudioRef.current) {
                        soundscapeAudioRef.current.volume = newVolume;
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">{Math.round(soundscapeVolume * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Enhanced Settings Panel */}
        {showSettings && (
          <div className={`${themeStyles.glass} rounded-xl border mb-4 shadow-xl overflow-hidden`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Voice Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Speech Rate</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.rate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">{voiceSettings.rate}x speed</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Pitch</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">{voiceSettings.pitch} tone</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Volume</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-400 mt-1 block">{Math.round(voiceSettings.volume * 100)}% volume</span>
                </div>
              </div>
              
              {/* Whisper Mode Settings */}
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-semibold mb-3 text-pink-300">Whisper Mode Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Whisper Threshold</label>
                    <input
                      type="range"
                      min="0.1"
                      max="0.7"
                      step="0.1"
                      value={volumeThreshold}
                      onChange={(e) => setVolumeThreshold(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 mt-1 block">Sensitivity: {Math.round(volumeThreshold * 100)}%</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Whisper Rate</label>
                    <input
                      type="range"
                      min="0.4"
                      max="1.0"
                      step="0.1"
                      value={voiceSettings.whisperRate}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, whisperRate: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 mt-1 block">{voiceSettings.whisperRate}x speed</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Whisper Pitch</label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.2"
                      step="0.1"
                      value={voiceSettings.whisperPitch}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, whisperPitch: parseFloat(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-400 mt-1 block">{voiceSettings.whisperPitch} tone</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Collapsible Conversation History */}
        {conversation.length > 0 && (
          <div className={`${themeStyles.glass} rounded-xl border shadow-xl overflow-hidden`}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MessageSquare size={16} />
                <span className="font-bold">Conversation History ({conversation.length})</span>
                {whisperMode && <span className="text-pink-400 text-xs">(Whisper)</span>}
              </div>
              {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showHistory && (
              <div className="border-t border-white/10">
                <div className="p-3 flex justify-between items-center bg-black/10">
                  <span className="text-xs text-gray-400">Contextual memory active</span>
                  <button
                    onClick={() => {
                      setConversation([]);
                      setConversationContext([]);
                      contextMemoryRef.current.clear();
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-xs"
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                </div>
                
                <div className="p-4 max-h-80 overflow-y-auto space-y-3">
                  {conversation.map((msg, index) => {
                    const persona = personas[msg.persona || 'witness'];
                    const IconComponent = persona.icon;
                    const isWhisperMessage = msg.whisperMode;
                    
                    return (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-4 py-3 shadow-lg ${
                          msg.role === 'user' 
                            ? `bg-gradient-to-br from-purple-600 to-purple-700 text-white ${isWhisperMessage ? 'opacity-80' : ''}` 
                            : `${themeStyles.glass} border ${isWhisperMessage ? 'opacity-80' : ''}`
                        }`}>
                          {msg.role === 'sage' && (
                            <div className="flex items-center gap-2 mb-2 text-xs opacity-70">
                              <IconComponent size={12} />
                              <span>{persona.name}</span>
                              {isWhisperMessage && <span className="text-pink-300">• Whisper</span>}
                            </div>
                          )}
                          <p className={`text-sm leading-relaxed ${isWhisperMessage ? 'italic' : ''}`}>{msg.content}</p>
                          <p className="text-xs opacity-60 mt-2">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceOnlySage;