// src/components/transparency/SageChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { 
  Copy, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw,
  Download, 
  GitBranch, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown,
  Mic, 
  Send, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Brain, 
  Users, 
  Zap,
  Target, 
  Shield, 
  Lightbulb, 
  Briefcase, 
  GraduationCap,
  Heart, 
  Settings, 
  Sparkles, 
  BrainCircuit,
  AlertTriangle,
  MessageCircle,
  X
} from "lucide-react";

import { useLLMClient } from "../../hooks/useLLMClient.jsx"; // FIX: Line 5: Named import for hook (returns service; not default instance)
import { getUserContext } from "../../services/localData";
import { useLocalMemory } from "../../context/LocalMemoryContext";
import { useSageChatContext } from "../../context/SageChatContext";

const getAgentGradient = (color) => {
  const gradients = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    pink: 'from-pink-500 to-pink-600',
    yellow: 'from-yellow-500 to-yellow-600',
    gray: 'from-gray-500 to-gray-600'
  };
  return gradients[color] || gradients.purple;
};

const Dot = ({ delay = "0ms" }) => (
  <span
    className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"
    style={{ animationDelay: delay }}
  />
);

const SageChat = ({
  conversations = [],
  onSendMessage,
  onBranchFrom,
  onEditMessage,
  onDeleteMessage,
  onAgentChange,
  onModeChange,
  onModelChange,
  isTyping: propIsTyping = false, 
  userData,
  settings,
  onRegenerate,
  onFeedback,
  theme,
  branches = [],
  currentBranch = 'main',
  onSwitchBranch,
  currentAgent = 'sage',
  currentMode = 'general',
  currentModel = 'gpt4',
  availableAgents = [],
  availableModes = [],
  availableModels = [],
  // EXISTING NEW PROPS
  onDeleteAdvice,
  onExportAudit,
  onExportManifest,
  onOpenContextOverlay,
  reflectionMode = false,
  // 🚨 NEW SENTINEL GOVERNANCE PROPS
  isPausedBySentinel = false, 
  showSentinelModal = false,
  sentinelReason = "",
  unpauseAgent, 
  setShowSentinelModal,
}) => {
  // FIX: Line ~123: Invoke hook (returns llmService); alias generateResponse to sendMessage (adapts payload)
  const llmService = useLLMClient();
  const generateResponse = async (payload) => {
    if (!llmService.isReady()) throw new Error('LLM Service not initialized. Set API key in Settings.');
    const response = await llmService.sendMessage(payload.user, { 
      system: payload.system, 
      conversationHistory: payload.history || [] 
    });
    return { text: response.content || response.fallbackMessage, model: response.model }; // Adapt to expected { text }
  };
  // FIX: Local loading state (no prop on service; toggle in handleSend)
  const [isGenerating, setIsGenerating] = useState(false);
  const { localContext, redactSensitive, getAuditTrail, getManifest } = useLocalMemory();
  const { sendMessageToSage } = useSageChatContext(); 
  
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRole, setEditingRole] = useState(null); 
  const [editText, setEditText] = useState("");
  const [branchingFrom, setBranchingFrom] = useState(null);
  const [branchInput, setBranchInput] = useState("");
  const [showBranches, setShowBranches] = useState(false);
  const [showSelectors, setShowSelectors] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const scrollRef = useRef(null); 
  const endRef = useRef(null);

  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

  const isTyping = propIsTyping || isGenerating;

  // --- Agent, Mode, Model Definitions (Unchanged) ---
  const defaultAgents = [
    { id: 'sage', name: 'Sage', description: 'Wise, reflective guidance', icon: 'S', color: 'purple' },
    { id: 'strategist', name: 'Strategist', description: 'Analytical planning & tactics', icon: 'T', color: 'blue' },
    { id: 'witness', name: 'Witness', description: 'Empathetic listening & validation', icon: 'W', color: 'green' },
    { id: 'explorer', name: 'Explorer', description: 'Creative possibilities & innovation', icon: 'E', color: 'orange' },
    { id: 'sentinel', name: 'Sentinel', description: 'Risk assessment & protection', icon: 'N', color: 'red' }
  ];

  const defaultModes = [
    { id: 'general', name: 'General', description: 'Open conversation', icon: MessageSquare, color: 'gray' },
    { id: 'decision', name: 'Decision', description: 'Choice exploration', icon: Target, color: 'purple' },
    { id: 'career', name: 'Career', description: 'Professional guidance', icon: Briefcase, color: 'blue' },
    { id: 'education', name: 'Education', description: 'Learning & growth', icon: GraduationCap, color: 'green' },
    { id: 'personal', name: 'Personal', description: 'Life & relationships', icon: Heart, color: 'pink' },
    { id: 'creative', name: 'Creative', description: 'Innovation & brainstorming', icon: Lightbulb, color: 'yellow' }
  ];

  const defaultModels = [
    { id: 'gpt4', name: 'GPT-4', description: 'OpenAI\'s most capable model', provider: 'OpenAI', capabilities: ['reasoning', 'creativity', 'coding'] },
    { id: 'claude-opus', name: 'Claude Opus', description: 'Anthropic\'s most powerful model', provider: 'Anthropic', capabilities: ['analysis', 'writing', 'reasoning'] },
    { id: 'gpt4-turbo', name: 'GPT-4 Turbo', description: 'Faster GPT-4 with larger context', provider: 'OpenAI', capabilities: ['speed', 'context', 'reasoning'] },
    { id: 'claude-sonnet', name: 'Claude Sonnet', description: 'Balanced performance and speed', provider: 'Anthropic', capabilities: ['efficiency', 'writing', 'analysis'] },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s advanced multimodal AI', provider: 'Google', capabilities: ['multimodal', 'reasoning', 'speed'] }
  ];

  const agents = availableAgents.length > 0 ? availableAgents : defaultAgents;
  const modes = availableModes.length > 0 ? availableModes : defaultModes;
  const models = availableModels.length > 0 ? availableModels : defaultModels;
  
  const currentAgentData = agents.find(a => a.id === currentAgent) || agents[0];
  const currentModeData = modes.find(m => m.id === currentMode) || modes[0];
  const currentModelData = models.find(m => m.id === currentModel) || models[0];

  const ModeIcon = currentModeData?.icon || BrainCircuit;

  // --- Effects and Helpers (Unchanged) ---
  useEffect(() => {
    if (endRef.current && scrollRef.current) {
        const el = scrollRef.current;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
        if (nearBottom || settings?.reducedMotion) {
            endRef.current.scrollIntoView({
                behavior: settings?.reducedMotion ? "auto" : "smooth",
                block: "end",
            });
        }
    }
  }, [conversations, isTyping, settings?.reducedMotion]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atTop = el.scrollTop <= 8;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 8;
      setShowTop(!atTop);
      setShowBottom(!atBottom);
    };
    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const toast = (msg, type = 'info') => {
    const colors = {
      info: 'bg-blue-600/90 border-blue-400/50',
      success: 'bg-emerald-600/90 border-emerald-400/50',
      error: 'bg-red-600/90 border-red-400/50',
      warning: 'bg-amber-600/90 border-amber-400/50'
    };
    const d = document.createElement("div");
    d.setAttribute("aria-live", "polite");
    d.setAttribute("aria-atomic", "true");
    d.className = `fixed top-4 left-1/2 -translate-x-1/2 ${colors[type]} text-white border px-4 py-2 rounded-lg text-sm z-50 shadow-lg animate-fade-in-down`;
    d.textContent = msg;
    document.body.appendChild(d);
    setTimeout(() => {
      d.style.opacity = '0';
      d.style.transform = 'translate(-50%, -100%)';
      setTimeout(() => d.remove(), 300);
    }, 2000);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
      toast("Copied to clipboard", 'success');
    } catch {
      toast("Copy failed", 'error');
    }
  };

  const speak = (text) => {
    try {
      if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
      stopSpeaking();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      utter.lang = "en-US";
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    } catch {
      toast("Text-to-speech not available", 'error');
    }
  };

  const stopSpeaking = () => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } catch {}
  };

  const exportMarkdown = () => {
    const title = `Brahma Chat - ${currentBranch} Branch - ${new Date().toLocaleString()}`;
    const lines = [`# ${title}`, ""];
    if (currentBranch !== 'main' && branches.length > 0) {
      lines.push("*This is a conversation branch*", "");
    }
    // Note: This logic assumes message.user and message.sage keys exist.
    conversations.forEach((m, i) => {
      const content = m.user || m.content; // Use content if type-based message
      if (m.type === 'system_alert' || m.type === 'system') {
        lines.push(`***[SYSTEM MESSAGE]:*** ${m.content}`);
      } else if (content && (m.user || m.type === 'user')) {
        lines.push(`**You:** ${content}`);
      } else if (content && (m.sage || m.type === 'sage')) {
        lines.push(`**${userData?.sage?.name || "Sage"}:** ${content}`);
      }
      if (i < conversations.length - 1) lines.push("");
    });
    downloadFile(lines.join("\n"), `brahma-chat-${currentBranch}-${Date.now()}.md`, "text/markdown");
  };

  const exportJSON = () => {
    const payload = {
      title: `Brahma Chat - ${currentBranch} Branch`,
      branch: currentBranch,
      createdAt: new Date().toISOString(),
      messages: conversations, // Exporting the raw conversation array
      branches: branches,
      sage: userData?.sage || { name: "Sage" },
    };
    downloadFile(JSON.stringify(payload, null, 2), `brahma-chat-${currentBranch}-${Date.now()}.json`, "application/json");
  };

  const exportAudit = () => {
    const audit = getAuditTrail();
    const redacted = redactSensitive(audit);
    downloadFile(JSON.stringify(redacted, null, 2), `brahma-audit-${Date.now()}.json`, "application/json");
  };

  const exportManifest = () => {
    const manifest = getManifest();
    downloadFile(JSON.stringify(manifest, null, 2), "brahma-manifest.json", "application/json");
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Export ready", 'success');
  };

  const setReaction = (key, value) => {
    setReactions((p) => ({
      ...p,
      [key]: p[key] === value ? undefined : value,
    }));
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: settings?.reducedMotion ? "auto" : "smooth" });
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: settings?.reducedMotion ? "auto" : "smooth" });
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInput("This is a voice message test");
      toast("Voice input received", 'success');
    }, 2000);
  };

  const handleSend = async (externalMessage = null) => { 
    const userMessage = (externalMessage || input).trim(); 
    // 🛑 Block send if Sentinel is paused
    if (isPausedBySentinel) {
      setShowSentinelModal(true);
      return;
    }
    
    if (!userMessage || isGenerating) return; 

    if (!externalMessage) setInput("");

    // NOTE: In the final app, this entire LLM block is replaced by the orchestrator hook's logic.
    // We are maintaining the existing stub structure here for component continuity.
    const context = getUserContext();

    const SYSTEM_PROMPT = `
      You are Sage, a strategic, objective, and emotionally intelligent AI companion...
      // ... (Rest of SYSTEM_PROMPT logic is unchanged for brevity)
    `.trim(); 

    const historyForAPI = conversations.flatMap(msg => [
      msg.user || (msg.type === 'user' ? { role: "user", content: msg.content } : null),
      msg.sage || (msg.type === 'sage' ? { role: "assistant", content: msg.content } : null),
    ]).filter(m => m !== null);
    
    // FIX: Line ~370: Toggle local isGenerating; call adapted generateResponse (uses llmService.sendMessage)
    setIsGenerating(true);
    try {
      const aiResponse = await generateResponse({
        system: SYSTEM_PROMPT,
        user: userMessage,
        history: historyForAPI,
      });
      
      if (onSendMessage) {
        onSendMessage(
          userMessage, 
          currentAgent, 
          currentMode, 
          currentModel, 
          aiResponse.text
        ); 
      }
    } catch (error) {
      console.error("LLM Generation Error:", error);
      toast("Response generation failed—check API key.", 'error');
      const fallback = "Acknowledged. Let's analyze the input and context for practical insights.";
      if (onSendMessage) onSendMessage(userMessage, currentAgent, currentMode, currentModel, fallback);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAskWhatIveLearned = () => {
    const wisdomQuery = "What have I learned about my local reality, logistical friction, and core emotional patterns?";
    // Call handleSend with the pre-defined query
    handleSend(wisdomQuery);
    toast("Inquiry sent to Sage: 'What have I learned?'", 'info');
  };

  const handleRegenerate = () => {
    stopSpeaking();
    const lastMessage = [...conversations].reverse().find((m) => m.user || m.type === 'user');
    const lastUser = lastMessage?.user || lastMessage?.content || input.trim();
    if (!lastUser) return toast("Nothing to regenerate", 'error');
    if (onRegenerate) onRegenerate(lastUser);
    else handleSend(lastUser);
  };
  
  const handleBranch = (index) => {
    setBranchingFrom(index);
    setBranchInput("");
  };

  const executeBranch = () => {
    const text = branchInput.trim();
    if (!text) return;
    if (onBranchFrom) {
      onBranchFrom(branchingFrom, text);
      toast("New conversation branch created", 'success');
    }
    setBranchingFrom(null);
    setBranchInput("");
  };

  const handleEdit = (index, role) => {
    const message = conversations[index];
    setEditingIndex(index);
    setEditingRole(role);
    setEditText(role === 'user' ? (message.user || message.content) : (message.sage || message.content));
  };

  const saveEdit = () => {
    if (onEditMessage && editText.trim()) {
      onEditMessage(editingIndex, editText.trim(), editingRole);
      toast("Message updated", 'success');
    }
    setEditingIndex(null);
    setEditingRole(null);
    setEditText("");
  };

  const handleDelete = (index) => {
    if (onDeleteMessage && window.confirm("Delete this message?")) {
      onDeleteMessage(index);
      toast("Message deleted", 'success');
    }
  };

  const MessageActions = ({ message, index, role }) => (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={() => copyToClipboard(role === 'user' ? (message.user || message.content) : (message.sage || message.content))} className="p-1 rounded-md hover:bg-white/10 transition-colors" title="Copy message">
        <Copy size={12} />
      </button>
      
      {role === 'sage' && (
        <>
          <button 
            onClick={() => (isSpeaking ? stopSpeaking() : speak(message.sage || message.content))}
            className={`p-1 rounded-md hover:bg-white/10 transition-colors ${isSpeaking ? 'text-green-400' : ''}`} 
            title={isSpeaking ? "Stop reading" : "Read aloud"}
          >
            {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          
          <button onClick={() => handleBranch(index)} className="p-1 rounded-md hover:bg-white/10 transition-colors text-blue-400" title="Branch conversation from here">
            <GitBranch size={12} />
          </button>

          {message.adviceId && (
            <button
              onClick={() => {
                if (window.confirm("Delete this advice permanently from your vault?")) {
                  onDeleteAdvice?.(message.adviceId);
                  toast("Advice deleted", 'warning');
                }
              }}
              className="p-1 rounded-md hover:bg-red-500/20 transition-colors text-red-400"
              title="Delete this advice permanently"
            >
              <Trash2 size={12} />
            </button>
          )}
        </>
      )}
      
      <button onClick={() => handleEdit(index, role)} className="p-1 rounded-md hover:bg-white/10 transition-colors" title="Edit message">
        <Edit3 size={12} />
      </button>
      
      <button onClick={() => handleDelete(index)} className="p-1 rounded-md hover:bg-white/10 transition-colors text-red-400" title="Delete message">
        <Trash2 size={12} />
      </button>
      
      <div className="w-px h-3 bg-white/20 mx-1" />
      
      <button onClick={() => { setReaction(`${index}-${role}`, "like"); onFeedback?.({ index, role, value: "like" }); }} className={`p-1 rounded-md transition-colors ${reactions[`${index}-${role}`] === "like" ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/10"}`} title="Like">
        <ThumbsUp size={12} />
      </button>
      
      <button onClick={() => { setReaction(`${index}-${role}`, "dislike"); onFeedback?.({ index, role, value: "dislike" }); }} className={`p-1 rounded-md transition-colors ${reactions[`${index}-${role}`] === "dislike" ? "bg-red-500/20 text-red-400" : "hover:bg-white/10"}`} title="Dislike">
        <ThumbsDown size={12} />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-[600px] relative bg-gradient-to-b from-transparent to-black/5">
      {/* HEADER (Unchanged) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentAgentData.icon}</span>
            <span className="text-sm font-medium">{currentAgentData.name}</span>
            <span className="text-xs text-gray-400">•</span>
            <ModeIcon size={14} />
            <span className="text-xs text-gray-300">{currentModeData.name}</span>
            <span className="text-xs text-gray-400">•</span>
            <Brain size={12} />
            <span className="text-xs text-gray-300">{currentModelData.name}</span>
          </div>

          {reflectionMode && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/50">
              <MessageCircle size={10} />
              Reflection
            </div>
          )}

          <button onClick={() => setShowSelectors(!showSelectors)} className={`p-1.5 rounded-lg transition-colors ${showSelectors ? 'bg-white/20 text-white' : 'bg-white/10 hover:bg-white/15 text-gray-300'}`} title="Configure AI settings">
            <Settings size={14} />
          </button>
          
          <button onClick={onOpenContextOverlay} className="flex items-center gap-1 p-1.5 text-xs rounded-lg transition-colors bg-white/10 hover:bg-white/15 text-gray-300" title="View Ambient Awareness Context">
            <BrainCircuit size={14} />
            Context
          </button>
          
          <button onClick={handleAskWhatIveLearned} className="flex items-center gap-1 p-1.5 text-xs rounded-lg transition-colors bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/30" title="Ask Sage to summarize current insights.">
            <Sparkles size={14} />
            Wisdom
          </button>

          <div className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-md border border-emerald-500/30">
            <Shield size={10} className="inline mr-1" />
            Local
          </div>
          
          {branches.length > 0 && (
            <button onClick={() => setShowBranches(!showBranches)} className="text-xs bg-blue-500/20 hover:bg-blue-500/30 px-2 py-1 rounded-md border border-blue-500/30 transition-colors flex items-center gap-1">
              <GitBranch size={10} />
              {currentBranch} ({branches.length})
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={handleRegenerate} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/20 transition-colors" title="Regenerate last response">
            <RotateCcw size={10} />
            Regenerate
          </button>
          
          <button onClick={exportMarkdown} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/20 transition-colors" title="Export as Markdown">
            <Download size={10} />
            .md
          </button>
          
          <button onClick={exportJSON} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/20 transition-colors" title="Export as JSON">
            <Download size={10} />
            .json
          </button>

          <button onClick={onExportAudit || exportAudit} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/20 transition-colors" title="Export Audit Trail">
            <Shield size={10} />
            Audit
          </button>

          <button onClick={onExportManifest || exportManifest} className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/20 transition-colors" title="Export System Manifest">
            <BookOpen size={10} />
            Manifest
          </button>
        </div>
      </div>

      {/* SELECTORS PANEL (Unchanged) */}
      {showSelectors && (
        <div className="p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm space-y-4">
          <div>
            <label className="text-xs text-gray-400">Agent</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {agents.map(a => (
                <button
                  key={a.id}
                  onClick={() => onAgentChange?.(a.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    currentAgent === a.id 
                      ? `bg-gradient-to-r ${getAgentGradient(a.color)} text-white shadow-lg` 
                      : 'bg-white/10 hover:bg-white/15 text-gray-300'
                  }`}
                >
                  <span className="mr-1">{a.icon}</span> {a.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Mode</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => onModeChange?.(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1 ${
                    currentMode === m.id 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-white/10 hover:bg-white/15 text-gray-300'
                  }`}
                >
                  <m.icon size={12} /> {m.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Model</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {models.map(m => (
                <button
                  key={m.id}
                  onClick={() => onModelChange?.(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    currentModel === m.id 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-white/10 hover:bg-white/15 text-gray-300'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BRANCHES PANEL (Unchanged) */}
      {showBranches && branches.length > 0 && (
        <div className="p-4 border-b border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">Conversation Branches</h4>
            <button onClick={() => setShowBranches(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {branches.map((b, i) => (
              <button
                key={i}
                onClick={() => onSwitchBranch?.(b.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentBranch === b.id 
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitBranch size={14} />
                  <span>{b.name || `Branch ${i + 1}`}</span>
                  <span className="text-xs text-gray-400 ml-auto">{b.messages?.length || 0} msgs</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversations.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-16 space-y-2">
            <BookOpen size={24} className="mx-auto opacity-50" />
            <p>Start a conversation—your decisions stay yours.</p>
            <p className="text-xs">Your wisdom stays local.</p>
          </div>
        )}

        {conversations.map((message, idx) => (
          <div key={idx} className="space-y-3">
            
            {/* 🚨 NEW: Handle System Alerts (Sentinel) */}
            {message.type === 'system_alert' && (
                <div className="bg-red-700/20 text-red-300 p-3 rounded-lg border border-red-700/50 text-sm italic flex items-start gap-2">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                        {/* Renders content, including markdown from the orchestrator */}
                        <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                </div>
            )}

            {/* NEW: Handle Generic System Messages (e.g., Unpause Confirmation) */}
            {message.type === 'system' && (
                <div className="bg-gray-700/20 text-gray-300 p-3 rounded-lg border border-gray-700/50 text-sm italic">
                    {message.content}
                </div>
            )}
            
            {/* Existing User Message Rendering */}
            {(message.user?.trim() || (message.type === 'user' && message.content?.trim())) && (
              <div className="flex justify-end group">
                <div className="relative max-w-[80%]">
                  {editingIndex === idx && editingRole === 'user' ? (
                    <div className="bg-purple-600/20 rounded-xl p-3 border border-purple-500/30">
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-transparent text-white text-sm resize-none outline-none" rows="2" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={saveEdit} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors">Save</button>
                        <button onClick={() => { setEditingIndex(null); setEditingRole(null); setEditText(""); }} className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-purple-600/30 backdrop-blur-sm rounded-xl px-4 py-3 text-sm border border-purple-500/30 text-white">
                      {message.user || message.content}
                    </div>
                  )}
                  <div className="absolute -top-2 right-2">
                    <MessageActions message={message} index={idx} role="user" />
                  </div>
                </div>
              </div>
            )}

            {/* Existing Sage Message Rendering */}
            {(message.sage?.trim() || (message.type === 'sage' && message.content?.trim())) && (
              <div className="group flex items-start gap-3">
                <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAgentGradient(currentAgentData.color)} flex items-center justify-center text-white text-xs shrink-0 shadow-lg`}>
                  {currentAgentData.icon}
                </div>
                <div className="relative max-w-[85%]">
                  {editingIndex === idx && editingRole === 'sage' ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-transparent text-white text-sm resize-none outline-none" rows="3" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={saveEdit} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded transition-colors">Save</button>
                        <button onClick={() => { setEditingIndex(null); setEditingRole(null); setEditText(""); }} className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 rounded transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-white">
                      <div className="prose prose-sm max-w-none text-gray-100 leading-relaxed">
                        {message.sage || message.content}
                      </div>
                    </div>
                  )}
                  <div className="absolute -top-2 right-2">
                    <MessageActions message={message} index={idx} role="sage" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAgentGradient(currentAgentData.color)} flex items-center justify-center text-white text-xs`}>
              {currentAgentData.icon}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex gap-1">
                <Dot />
                <Dot delay="150ms" />
                <Dot delay="300ms" />
              </span>
              <span>{currentAgentData.name} is thinking…</span>
            </div>
          </div>
        )}
        
        <div ref={endRef} /> 
      </div>

      {/* BRANCHING MODAL (Unchanged) */}
      {branchingFrom !== null && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-6 border border-white/20 max-w-md w-full mx-4">
            <div className="flex items-center gap-2 mb-4">
              <GitBranch className="text-blue-400" size={20} />
              <h3 className="text-lg font-semibold text-white">Create Conversation Branch</h3>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Start a new conversation path from message #{branchingFrom + 1}
            </p>
            <textarea
              value={branchInput}
              onChange={(e) => setBranchInput(e.target.value)}
              placeholder="What would you like to explore instead?"
              className="w-full bg-white/10 text-white placeholder-gray-400 px-3 py-2 rounded-lg border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows="3"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={executeBranch} disabled={!branchInput.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-colors">
                Create Branch
              </button>
              <button onClick={() => setBranchingFrom(null)} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 NEW: SENTINEL GOVERNANCE MODAL */}
      {showSentinelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[500]">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl p-8 border border-red-500/50 max-w-lg w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} className="text-red-500 shrink-0" />
              <h3 className="text-2xl font-bold text-white">Sentinel Agent Activated</h3>
            </div>
            
            <p className="text-red-300 mb-4">
              A **Critical Context Pattern** was detected, causing the dialogue to pause. This action is designed to protect you from potential harm or hard rule violations.
            </p>
            
            <div className="bg-white/5 p-4 rounded-lg mb-6 border border-red-500/30">
                <p className="text-sm font-medium text-white mb-1">Detected Reason:</p>
                <p className="text-lg font-semibold text-red-400">{sentinelReason}</p>
            </div>

            <p className="text-sm text-gray-300 mb-6">
              You have two pathways to proceed:
            </p>

            <div className="space-y-4">
              <button 
                onClick={unpauseAgent}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-lg"
              >
                <RotateCcw size={20} />
                Override & Continue Dialogue
              </button>

              <a 
                href="https://brahmacare.com/support" // Placeholder URL
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-red-800/50 hover:bg-red-800/70 text-red-300 font-medium border border-red-500/50 transition-colors"
              >
                <Heart size={20} />
                Access External Help Resources
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SCROLL CONTROLS (Unchanged) */}
      {showTop && (
        <button onClick={scrollToTop} className="absolute top-20 right-4 p-2 bg-black/80 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-black/90 transition-colors z-20" title="Scroll to top">
          <ArrowUp size={16} />
        </button>
      )}
      
      {showBottom && (
        <button onClick={scrollToBottom} className="absolute bottom-24 right-4 p-2 bg-black/80 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-black/90 transition-colors z-20" title="Scroll to bottom">
          <ArrowDown size={16} />
        </button>
      )}

      {/* INPUT AREA */}
      <div className={`p-4 border-t border-white/10 bg-gradient-to-r from-gray-900/50 to-black/50 backdrop-blur-sm ${isPausedBySentinel ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Share what's on your mind…"
              className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-purple-500 outline-none resize-none min-h-[48px] max-h-32"
              rows="1"
              disabled={isPausedBySentinel || isGenerating}
            />
          </div>
          
          <button onClick={startRecording} className={`p-3 rounded-xl transition-colors border border-white/20 ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-300'}`} title="Voice input" disabled={isRecording || isGenerating || isPausedBySentinel}>
            <Mic size={18} />
          </button>
          
          <button onClick={() => handleSend()} disabled={!input.trim() || isGenerating || isPausedBySentinel} className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/20 transition-colors" title="Send message">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SageChat;
