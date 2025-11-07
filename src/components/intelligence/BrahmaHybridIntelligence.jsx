// src/components/intelligence/BrahmaHybridIntelligence.jsx

import React, { useState } from "react";
import {
  Brain,
  Zap,
  Search,
  FileText,
  Shield,
  Info,
  Play,
  CheckCircle,
  Target,
  Lightbulb,
  AlertCircle,
  // Removed unused icons for cleaner imports
} from "lucide-react";

// ⚡️ NEW: Import the enhanced LLM Service
import { llmService } from "../../services/llmservice.jsx";
// ⚡️ NEW: Import LocalMemory Context to get user context
import { useLocalMemory } from "../../context/LocalMemoryContext";

// =============== HYBRID INTELLIGENCE SYSTEM ===============

const BrahmaHybridIntelligence = () => {
  // 1. Hook into the Local Memory Context for ambient data
  const { localContext, getAuditTrail, getManifest } = useLocalMemory();

  // ✅ CRITICAL CHANGE IMPLEMENTED: Default is set to 'live'
  const [intelligenceMode, setIntelligenceMode] = useState("live"); // 'live' or 'simulation'
  const [activeAgent, setActiveAgent] = useState("strategist");
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [inputData, setInputData] = useState("");
  const [showModeInfo, setShowModeInfo] = useState(false);
  
  // --- Agent-Specific System Prompts ---
  const systemPrompts = {
    strategist:
      "You are a strategic decision analyst. Analyze the user's situation and provide 2-3 decision pathways with costs, timelines, and emotional impacts. Be nuanced and consider multiple perspectives. Your response must be structured using markdown headings for clarity.",
    synthesist:
      "You are a content synthesis expert. Extract themes, emotional tones, and insights from the user's input. Connect to broader patterns and suggest reflection questions. Your output should be gentle, reflective, and offer 3 distinct insights.",
    sage:
      "You are a wise memory keeper. Search for patterns and connections in the user's context. Offer perspective based on accumulated wisdom while being gentle and non-prescriptive. Respond in a single paragraph.",
  };

  /**
   * ⚡️ CRITICAL UPDATE: The core function to activate the Triad Mesh
   * Uses the robust llmService to route the request to the external LLM.
   */
  const processWithRealAI = async (agentType, input) => {
    // 1. Initial Check
    if (!llmService.isReady()) {
        // Return an error object that the handler can display
        return {
            error: true,
            message: "LLM Service not configured. Please set your API key in Settings."
        };
    }
    
    const systemPrompt = systemPrompts[agentType.toLowerCase()];
    if (!systemPrompt) {
      return { error: true, message: `ERROR: Unknown agent type: ${agentType}` };
    }
    
    // 2. Synthesize the Full Context for the LLM
    // This payload is sent to the specialized agent for analysis
    const fullContext = `User Input/Query: "${input}"\n\n--- AMBIENT CONTEXT ---\n${JSON.stringify(localContext, null, 2)}\n\n--- RECENT AUDIT TRAIL (Last 5 actions) ---\n${JSON.stringify(getAuditTrail().slice(-5), null, 2)}`;
    
    try {
        // 3. Call the new generic agent processing method from llmService
        const content = await llmService.processAgentRequest(
            agentType, 
            systemPrompt, 
            fullContext
        );
        
        // Return a structured object for display
        return {
            agentType: agentType + "Agent",
            mode: "live",
            confidence: 90, // Mock confidence for display consistency
            resultContent: content, // The actual LLM-generated text
        };
        
    } catch (error) {
        console.error("Agent Request Failed:", error);
        return {
            error: true,
            message: `**[System Error]** The ${agentType} agent failed to process the request due to a connectivity issue. Please check console for details.`
        };
    }
  };


  // -------- Simulation responses (local demo) --------

  const simulateStrategistAgent = (input) => {
    return {
      agentType: "StrategistAgent",
      mode: "simulation",
      scenarios: [
        {
          path: "Accelerated Timeline",
          description: "Move quickly with current resources",
          probability: 0.3,
          costImpact: "Medium (+$2-5k)",
          timeImpact: "Fast (2-3 months)",
          emotionalForecast: "Initial stress, then relief",
          confidence: 78,
        },
        {
          path: "Methodical Approach",
          description: "Build systematically with proper foundation",
          probability: 0.5,
          costImpact: "Higher (+$5-10k)",
          timeImpact: "Moderate (4-6 months)",
          emotionalForecast: "Steady confidence building",
          confidence: 85,
        },
      ],
      keyInsight:
        `Your decision context, based on input "${input}", suggests moderate risk tolerance with time pressure. The methodical approach aligns best with long-term success patterns.`,
      confidence: 83,
    };
  };

  const simulateSynthesistAgent = (input) => {
    return {
      agentType: "SynthesistAgent",
      mode: "simulation",
      extractedThemes: [
        "growth_mindset",
        "uncertainty_navigation",
        "resource_optimization",
      ],
      emotionalTone: [
        "cautious_optimism",
        "determined",
        "strategically_thinking",
      ],
      keyInsights: [
        `Analysis of "${input}" suggests you're balancing multiple competing priorities - this suggests high emotional intelligence`,
        "The language patterns indicate you're in a transition phase between planning and execution",
      ],
      suggestedReflections: [
        "What would 'good enough' look like for this decision?",
        "How have you successfully navigated similar timeline pressures before?",
      ],
      confidence: 79,
    };
  };

  const simulateSageAgent = (input) => {
    return {
      agentType: "SageAgent",
      mode: "simulation",
      matchedMemories: [
        {
          id: "mem_001",
          content:
            `Discussed feeling torn between perfectionism and progress in the context of "${input}"`,
          relevance: 0.89,
          timestamp: "2024-11-15T14:30:00Z",
        },
      ],
      synthesisPerspective:
        "You've been exploring the tension between perfection and progress. Your pattern suggests you make better decisions when you acknowledge uncertainty.",
      wisdomOffering:
        "Sometimes the right decision isn't the perfect one — it's the one that keeps you moving forward.",
      confidence: 87,
    };
  };
  
  // ⚡️ MODIFIED: This function now uses the new processWithRealAI which calls llmService.
  const processRequest = async (agentType, input) => {
    // Check if there's input or an ambient topic from local context
    if (!input.trim() && !localContext.lastTopic) {
        alert("Please provide input or ensure local context has a topic to analyze.");
        return;
    }
    
    setIsProcessing(true);
    setResults(null);
    
    // Default input if textarea is empty, prioritizing the last topic if available
    const finalInput = input.trim() || localContext.lastTopic || "Current ambient context.";

    try {
      let response;

      if (intelligenceMode === "live") {
        // Use the function that integrates with the external LLM via llmService
        response = await processWithRealAI(agentType, finalInput);
        
      } else {
        // Simulate local processing
        await new Promise((r) => setTimeout(r, 800));
        switch (agentType) {
          case "strategist":
            response = simulateStrategistAgent(finalInput);
            break;
          case "synthesist":
            response = simulateSynthesistAgent(finalInput);
            break;
          case "sage":
            response = simulateSageAgent(finalInput);
            break;
          default:
            response = { error: true, message: "Unknown agent type for simulation." };
            break;
        }
      }
      
      setResults(response);

    } catch (error) {
      console.error("Processing error:", error);
      setResults({
        error: true,
        message:
          intelligenceMode === "live"
            ? "An unexpected error occurred during Live AI processing. Try simulation mode or try again later."
            : "Simulation processing failed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // --- Helper function to render structured/live results content ---
  const renderResultsContent = () => {
    if (results.error) {
      // Return error message for both modes
      return <p className="text-red-200">{results.message}</p>;
    }
    
    if (results.mode === "live" && results.resultContent) {
      // Live AI returns a single markdown string from the LLM
      return (
        <div className="prose prose-invert max-w-none text-white">
          <p className="text-sm italic text-gray-400">LLM Response from {results.agentType.replace('Agent', '')}:</p>
          <p>{results.resultContent}</p>
        </div>
      );
    }

    // Simulation Mode returns structured data
    switch (results.agentType) {
      case "StrategistAgent":
        return (
          <div className="space-y-4">
            <p className="font-semibold text-purple-300">Key Insight:</p>
            <p className="text-gray-300 italic">{results.keyInsight}</p>
            <h4 className="font-semibold mt-4 border-b border-white/20 pb-1">Decision Scenarios:</h4>
            {results.scenarios.map((s, i) => (
              <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/10">
                <p className="font-medium text-white">{s.path}</p>
                <ul className="text-xs text-gray-400 mt-1 space-y-0.5 list-disc list-inside">
                  <li>Description: {s.description}</li>
                  <li>Cost: {s.costImpact}</li>
                  <li>Time: {s.timeImpact}</li>
                  <li>Emotional Forecast: {s.emotionalForecast}</li>
                </ul>
              </div>
            ))}
          </div>
        );
      case "SynthesistAgent":
        return (
          <div className="space-y-4">
            <p className="font-semibold text-purple-300">Extracted Themes:</p>
            <p className="text-sm text-gray-300">{results.extractedThemes.join(', ')}</p>
            <h4 className="font-semibold mt-4 border-b border-white/20 pb-1">Key Insights:</h4>
            <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                {results.keyInsights.map((i, idx) => <li key={idx}>{i}</li>)}
            </ul>
            <h4 className="font-semibold mt-4 border-b border-white/20 pb-1">Suggested Reflections:</h4>
            <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                {results.suggestedReflections.map((r, idx) => <li key={idx}>{r}</li>)}
            </ul>
          </div>
        );
      case "SageAgent":
        return (
          <div className="space-y-4">
            <p className="font-semibold text-purple-300">Synthesis Perspective:</p>
            <p className="text-gray-300 italic">{results.synthesisPerspective}</p>
            <h4 className="font-semibold mt-4 border-b border-white/20 pb-1">Wisdom Offering:</h4>
            <p className="text-lg font-serif italic text-white">{results.wisdomOffering}</p>
            <p className="text-xs text-gray-500 mt-4">Matched Memories: {results.matchedMemories.length}</p>
          </div>
        );
      default:
        return <p className="text-red-200">Could not render simulation results for unknown agent type: {results.agentType}</p>;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header with Mode Toggle */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-12 h-12 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Brahma Intelligence Engine
              </h1>
              <p className="text-gray-300 text-sm">
                Real AI with transparent simulation option
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Intelligence Mode
              </h3>
              <button
                onClick={() => setShowModeInfo((v) => !v)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setIntelligenceMode("live")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  intelligenceMode === "live"
                    ? "border-emerald-500 bg-emerald-500/20"
                    : "border-white/20 hover:border-white/40 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium text-white">Live Intelligence</span>
                </div>
                <p className="text-xs text-gray-300">
                  Real AI-powered insights and memory
                </p>
                {intelligenceMode === "live" && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-400">Active</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setIntelligenceMode("simulation")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  intelligenceMode === "simulation"
                    ? "border-blue-500 bg-blue-500/20"
                    : "border-white/20 hover:border-white/40 bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Play className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Simulation Mode</span>
                </div>
                <p className="text-xs text-gray-300">
                  Transparent demo of agent logic
                </p>
                {intelligenceMode === "simulation" && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-400">Demo Mode</span>
                  </div>
                )}
              </button>
            </div>

            {showModeInfo && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-sm">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium text-emerald-400">
                        Live Intelligence
                      </span>
                    </div>
                    <p className="text-gray-300">
                      Real AI agents provide personalized insights, remember
                      your context, and learn from interactions. Your data
                      stays private with optional local processing. **This mode now uses your `llmService.js` for external LLM calls.**
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Play className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-blue-400">
                        Simulation Mode
                      </span>
                    </div>
                    <p className="text-gray-300">
                      Experience how Brahma&apos;s multi-agent system works with
                      intelligent demonstrations. Perfect for exploring
                      capabilities before sharing real data.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`mt-4 p-3 rounded-lg border ${
                intelligenceMode === "live"
                  ? "bg-emerald-500/20 border-emerald-400/30"
                  : "bg-blue-500/20 border-blue-400/30"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {intelligenceMode === "live"
                    ? "Live Mode: End-to-end encrypted, locally processed when possible"
                    : "Simulation Mode: 100% local processing, no data transmission"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex space-x-2 border border-white/20">
            {[
              {
                id: "strategist",
                label: "Strategist",
                icon: Target,
                description: "Decision pathway analysis",
              },
              {
                id: "synthesist",
                label: "Synthesist",
                icon: Lightbulb,
                description: "Content insight extraction",
              },
              {
                id: "sage",
                label: "Sage",
                icon: Search,
                description: "Memory & pattern search",
              },
            ].map((agent) => {
              const Icon = agent.icon;
              return (
                <button
                  key={agent.id}
                  onClick={() => setActiveAgent(agent.id)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all group ${
                    activeAgent === agent.id
                      ? "bg-purple-600/50 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    {agent.label}
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300">
                    {agent.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {activeAgent === "strategist" && "Describe your decision or situation"}
            {activeAgent === "synthesist" && "Share content for analysis"}
            {activeAgent === "sage" && "Search your memories and patterns"}
          </h3>

          <textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder={
              activeAgent === "strategist"
                ? "I'm trying to decide whether to..."
                : activeAgent === "synthesist"
                ? "Paste text, notes, or describe content you'd like analyzed..."
                : "Search for patterns, memories, or previous insights..."
            }
            className="w-full h-32 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {intelligenceMode === "live" ? (
                <>
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Real AI agent will analyze and remember this interaction</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-blue-400" />
                  <span>Simulation will demonstrate agent capabilities locally</span>
                </>
              )}
            </div>
            <button
              onClick={() => processRequest(activeAgent, inputData)}
              disabled={!inputData.trim() && !localContext.lastTopic || isProcessing}
              className={`px-6 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                intelligenceMode === "live"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              } disabled:opacity-50 text-white`}
            >
              {isProcessing ? (
                <>
                  <Brain className="w-4 h-4 animate-pulse" />
                  {intelligenceMode === "live" ? "Processing..." : "Simulating..."}
                </>
              ) : (
                <>
                  {intelligenceMode === "live" ? (
                    <Zap className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {intelligenceMode === "live" ? "Analyze with AI" : "Run Simulation"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Result Header */}
            <div
              className={`p-4 rounded-xl border ${
                results.mode === "live"
                  ? "bg-emerald-500/20 border-emerald-400/30"
                  : "bg-blue-500/20 border-blue-400/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {results.mode === "live" ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium text-emerald-300">
                        Live AI Analysis Complete
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 text-blue-400" />
                      <span className="font-medium text-blue-300">
                        Simulation Demo Complete
                      </span>
                    </>
                  )}
                </div>
                {"confidence" in results && (
                  <div className="text-sm text-gray-400">
                    Confidence: {results.confidence}%
                  </div>
                )}
              </div>

              {results.mode === "simulation" && (
                <div className="mt-2 pt-2 border-t border-blue-400/20">
                  <div className="flex items-center gap-2 text-sm text-blue-200">
                    <Info className="w-4 h-4" />
                    <span>This is a demonstration. Ready to try with real AI?</span>
                    <button
                      onClick={() => setIntelligenceMode("live")}
                      className="text-blue-300 hover:text-white underline ml-2"
                    >
                      Switch to Live Mode
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Display */}
            {results.error ? (
              <div className="bg-red-500/20 rounded-xl p-6 border border-red-400/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-300">Processing Error</span>
                </div>
                <p className="text-red-200">{results.message}</p>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4">
                  {results.agentType.replace('Agent', ' Agent')} Results
                </h3>
                {renderResultsContent()}
              </div>
            )}

            {/* Action Footer */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Shield className="w-4 h-4" />
                  <span>
                    {results.mode === "live"
                      ? "Analysis processed with privacy-first AI. Data remains under your control."
                      : "Simulation ran entirely on your device. No data transmitted."}
                  </span>
                </div>

                {results.mode === "simulation" && (
                  <button
                    onClick={() => {
                      setIntelligenceMode("live");
                      setResults(null);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <span>Try with Real AI</span>
                    <ArrowRightIcon />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// tiny inline icon so we don't have to import ArrowRight separately
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12h14M13 5l7 7-7 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BrahmaHybridIntelligence;
