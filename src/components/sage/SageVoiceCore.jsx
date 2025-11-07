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
  User
} from 'lucide-react';

const VoiceOnlySage = ({ userData, onSendMessage, theme = "dark" }) => {
  // [1] State Definitions
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoListen, setAutoListen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [canInterrupt, setCanInterrupt] = useState(true);

  const [conversation, setConversation] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [conversationContext, setConversationContext] = useState([]);
  const [currentPersona, setCurrentPersona] = useState('witness');

  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // [2] Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const timeRef = useRef(0);
  const contextMemoryRef = useRef(new Map());

  // [3] Persona Definitions
  const personas = {
    witness: {
      name: 'Witness',
      icon: Eye,
      voiceRate: 0.9,
      voicePitch: 1.0,
      colorHue: 160,
      description: 'Calm, reflective presence for mindful observation'
    },
    strategist: {
      name: 'Strategist',
      icon: Brain,
      voiceRate: 1.2,
      voicePitch: 1.1,
      colorHue: 210,
      description: 'Sharp, decisive guidance for planning and execution'
    },
    nurturer: {
      name: 'Nurturer',
      icon: Heart,
      voiceRate: 0.8,
      voicePitch: 0.9,
      colorHue: 320,
      description: 'Warm, compassionate support for emotional well-being'
    },
    catalyst: {
      name: 'Catalyst',
      icon: Zap,
      voiceRate: 1.3,
      voicePitch: 1.2,
      colorHue: 50,
      description: 'Dynamic energy for breakthrough moments and action'
    }
  };

  // [4] Speech Initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();

      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => {
        setIsListening(false);
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
      };
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [autoListen, canInterrupt, isSpeaking, isProcessing]);

  // [5] Helper Functions
  const startListening = () => {
    if (recognitionRef.current && !isListening && !isSpeaking) {
      try {
        recognitionRef.current.start();
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

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setLastSpokenText('');
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

  const speakText = (text, persona = currentPersona) => {
    if (!synthRef.current || !text) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const personaSettings = personas[persona];

    utterance.rate = voiceSettings.rate * personaSettings.voiceRate;
    utterance.pitch = voiceSettings.pitch * personaSettings.voicePitch;
    utterance.volume = voiceSettings.volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setLastSpokenText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setLastSpokenText('');
      if (autoListen) {
        setTimeout(startListening, 600);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setLastSpokenText('');
    };

    synthRef.current.speak(utterance);
  };

  const detectPersonaFromInput = (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('feel') || lower.includes('emotion') || lower.includes('support') || lower.includes('heart')) {
      return 'nurturer';
    } else if (lower.includes('plan') || lower.includes('strategy') || lower.includes('decide') || lower.includes('analyze')) {
      return 'strategist';
    } else if (lower.includes('action') || lower.includes('energy') || lower.includes('breakthrough') || lower.includes('change')) {
      return 'catalyst';
    } else if (lower.includes('observe') || lower.includes('mindful') || lower.includes('reflect') || lower.includes('notice')) {
      return 'witness';
    }
    return currentPersona;
  };

  const updateConversationContext = (userInput, sageResponse) => {
    const contextEntry = {
      timestamp: new Date(),
      userInput,
      sageResponse,
      persona: currentPersona,
      sessionId: Date.now()
    };

    setConversationContext(prev => [...prev.slice(-10), contextEntry]);

    const keywords = userInput.toLowerCase().split(' ').filter(word => word.length > 3);
    keywords.forEach(keyword => {
      if (contextMemoryRef.current.has(keyword)) {
        contextMemoryRef.current.get(keyword).push(contextEntry);
      } else {
        contextMemoryRef.current.set(keyword, [contextEntry]);
      }
    });
  };

  const generateContextualResponse = async (input, persona) => {
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));

    const lowerInput = input.toLowerCase();
    let contextualPrefix = "";

    if (lowerInput.includes('last time') || lowerInput.includes('before') || lowerInput.includes('earlier')) {
      const recentContext = conversationContext.slice(-3);
      if (recentContext.length > 0) {
        contextualPrefix = "Building on what we discussed earlier, ";
      }
    }

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

  const handleVoiceInput = async (transcript) => {
    if (!transcript.trim()) return;

    setCurrentTranscript('');
    setIsProcessing(true);
    stopListening();

    const detectedPersona = detectPersonaFromInput(transcript);
    if (detectedPersona !== currentPersona) {
      setCurrentPersona(detectedPersona);
    }

    const userMessage = {
      role: 'user',
      content: transcript,
      timestamp: new Date(),
      persona: detectedPersona
    };
    setConversation(prev => [...prev, userMessage]);

    try {
      const response = await generateContextualResponse(transcript, detectedPersona);
      const sageMessage = {
        role: 'sage',
        content: response,
        timestamp: new Date(),
        persona: detectedPersona
      };
      setConversation(prev => [...prev, sageMessage]);

      updateConversationContext(transcript, response);

      if (voiceEnabled) {
        speakText(response, detectedPersona);
      }

      onSendMessage?.(transcript);
    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage = {
        role: 'sage',
        content: "I'm experiencing some difficulty right now. Could you try rephrasing that?",
        timestamp: new Date(),
        persona: currentPersona
      };
      setConversation(prev => [...prev, errorMessage]);

      if (voiceEnabled) {
        speakText(errorMessage.content, currentPersona);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // [6] UI continues below...

  return (
    <div className="text-white p-4"> 
      {/* You can continue rendering the JSX for the UI here (fluid orb, buttons, etc.) */}
      <p className="text-lg">VoiceOnlySage initialized.</p>
    </div>
  );
};

export default VoiceOnlySage;