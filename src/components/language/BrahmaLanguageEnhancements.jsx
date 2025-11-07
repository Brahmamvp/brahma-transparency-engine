import React, { useEffect, useState } from "react";
import {
  Clock,
  Brain,
  Target,
  Lightbulb,
  Heart,
  BookOpen,
  Zap,
  Globe,
  Sun,
  Moon,
  Sunrise,
  Sunset,
} from "lucide-react";

/**
 * =============== ENHANCED LANGUAGE SYSTEM ===============
 * Time-aware, mode-adaptive language + quick actions + wisdom seeds.
 * Modes: 'personal' | 'professional' | 'research'
 */
const BrahmaLanguageEnhancements = () => {
  const [currentMode, setCurrentMode] = useState("personal"); // personal, professional, research
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTooltip, setShowTooltip] = useState(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced Sage Language System
  const getTimeAwareGreeting = (mode = "personal") => {
    const hour = currentTime.getHours();

    const greetings = {
      personal: {
        early:
          "Early thoughts often carry special wisdom. What's stirring in the quiet hours?",
        morning: "Good morning. What's awakening in your mind today?",
        afternoon:
          "How has your day been unfolding? What threads are you following?",
        evening:
          "Evening reflections have their own quality. What's settling into view?",
        late:
          "Late night contemplations can be profound. What's keeping your consciousness company?",
      },
      professional: {
        early:
          "Early strategic thinking often yields clarity. What factors are you considering?",
        morning:
          "Good morning. What decisions or analysis are you working through today?",
        afternoon:
          "How are your current projects progressing? What needs deeper examination?",
        evening:
          "End-of-day reflection: What insights emerged from today's work?",
        late:
          "Late evening analysis can be productive. What strategic questions are you exploring?",
      },
      research: {
        early:
          "Early research sessions can be particularly focused. What hypotheses are you developing?",
        morning:
          "Good morning. What patterns or questions are you investigating today?",
        afternoon:
          "How is your research progressing? What connections are emerging?",
        evening: "Evening synthesis: What has today's exploration revealed?",
        late:
          "Late night research often uncovers unexpected insights. What are you discovering?",
      },
    };

    const timeKey =
      hour < 6
        ? "early"
        : hour < 12
        ? "morning"
        : hour < 17
        ? "afternoon"
        : hour < 22
        ? "evening"
        : "late";
    return greetings[mode][timeKey];
  };

  // Enhanced Response Patterns
  const getEnhancedResponses = (mode = "personal") => {
    return {
      personal: {
        question:
          "If this decision were a compass, what would be your true north?",
        insight:
          "I see a thread here worth following. Want to pull on it together?",
        reflection:
          "What does your intuition whisper when logic stops talking?",
        validation: "This decision has been patient with you. Ready to meet it?",
        closing:
          "Every maybe contains a universe. What universe are you ready to explore?",
      },
      professional: {
        question:
          "What strategic factors deserve deeper consideration in this context?",
        insight:
          "I'm identifying patterns that may inform your decision framework.",
        reflection:
          "How do these considerations align with your organizational objectives?",
        validation: "Your analysis demonstrates thorough strategic thinking.",
        closing:
          "What additional data points would strengthen your confidence in this direction?",
      },
      research: {
        question: "What hypotheses are emerging from this line of inquiry?",
        insight: "I'm detecting methodological patterns that may be significant.",
        reflection:
          "How does this finding connect to your broader research framework?",
        validation: "Your approach shows rigorous analytical thinking.",
        closing:
          "What additional evidence would validate or challenge this hypothesis?",
      },
    }[mode];
  };

  // Enhanced Quick Actions
  const getEnhancedQuickActions = (mode = "personal") => {
    const actions = {
      personal: [
        {
          id: "mirror",
          label: "Mirror Paths",
          icon: "🪞",
          description: "See multiple decision pathways",
        },
        {
          id: "shadow",
          label: "Light & Shadow",
          icon: "☯️",
          description: "Explore pros and considerations",
        },
        {
          id: "compass",
          label: "True North Check",
          icon: "🧭",
          description: "Align with your values",
        },
        {
          id: "echo",
          label: "Tomorrow's Echo",
          icon: "🔮",
          description: "Envision future scenarios",
        },
      ],
      professional: [
        {
          id: "analysis",
          label: "Strategic Analysis",
          icon: "📊",
          description: "Comprehensive decision framework",
        },
        {
          id: "risk",
          label: "Risk Assessment",
          icon: "⚠️",
          description: "Evaluate potential challenges",
        },
        {
          id: "stakeholder",
          label: "Stakeholder Impact",
          icon: "👥",
          description: "Consider all affected parties",
        },
        {
          id: "timeline",
          label: "Implementation Path",
          icon: "📅",
          description: "Map execution strategy",
        },
      ],
      research: [
        {
          id: "hypothesis",
          label: "Hypothesis Testing",
          icon: "🔬",
          description: "Validate assumptions",
        },
        {
          id: "methodology",
          label: "Method Review",
          icon: "📋",
          description: "Examine approach rigor",
        },
        {
          id: "literature",
          label: "Context Mapping",
          icon: "📚",
          description: "Connect to existing knowledge",
        },
        {
          id: "implications",
          label: "Implications",
          icon: "💡",
          description: "Explore broader significance",
        },
      ],
    };

    return actions[mode] || actions.personal;
  };

  // Wisdom Seeds - Proactive Prompts
  const getWisdomSeeds = (mode = "personal") => {
    const seeds = {
      personal: [
        "Sometimes the smallest decisions reveal the largest truths. Is there a 'small' choice that's been surprisingly persistent?",
        "Between what was and what could be, there's a space where clarity lives. What's calling to you from that space?",
        "The decisions that feel most unclear often carry the most growth. What confusion might be trying to teach you?",
        "Your hesitation itself is information. What is your uncertainty trying to protect or preserve?",
        "Sometimes we know the answer but haven't given ourselves permission to acknowledge it. What would you choose if you trusted yourself completely?",
      ],
      professional: [
        "Strategic clarity often emerges from examining what we're not considering. What assumptions might be limiting your options?",
        "The most robust strategies account for multiple scenarios. What would your decision framework look like if key variables changed?",
        "Organizational decisions ripple through systems in unexpected ways. What second and third-order effects deserve attention?",
        "Data informs decisions, but context shapes interpretation. What contextual factors might influence your analysis?",
        "The strongest strategic positions often emerge from understanding what others overlook. What blind spots might create opportunity?",
      ],
      research: [
        "Research breakthroughs often come from examining what seems obvious but hasn't been tested. What assumptions are you taking for granted?",
        "The most interesting findings often emerge at the intersection of disciplines. What unexpected connections might be significant?",
        "Methodology shapes findings more than we often acknowledge. How might different approaches yield different insights?",
        "The questions that make you slightly uncomfortable often lead to the most valuable discoveries. What are you avoiding investigating?",
        "Academic rigor and creative intuition both serve discovery. Where might you need more of each in your current work?",
      ],
    };

    const list = seeds[mode] || seeds.personal;
    return list[Math.floor(Math.random() * list.length)];
  };

  // Time Icon Component
  const getTimeIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return <Moon className="w-4 h-4" />;
    if (hour < 12) return <Sunrise className="w-4 h-4" />;
    if (hour < 17) return <Sun className="w-4 h-4" />;
    if (hour < 20) return <Sunset className="w-4 h-4" />;
    return <Moon className="w-4 h-4" />;
  };

  // Tooltip Component
  const Tooltip = ({ children, content, id }) => (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(id)}
      onMouseLeave={() => setShowTooltip(null)}
    >
      {children}
      {showTooltip === id && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs rounded-lg px-3 py-2 mb-2 whitespace-nowrap z-50 border border-white/20">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90" />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header with Mode Toggle */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Enhanced Brahma Experience
          </h1>
          <p className="text-gray-300 mb-6">
            Time-aware, context-intelligent, mode-adaptive companion
          </p>

          {/* Mode Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex space-x-2 border border-white/20 max-w-md mx-auto">
            {[
              {
                id: "personal",
                label: "Personal",
                icon: Heart,
                description: "Reflective and intuitive guidance",
              },
              {
                id: "professional",
                label: "Professional",
                icon: Target,
                description: "Strategic and analytical support",
              },
              {
                id: "research",
                label: "Research",
                icon: BookOpen,
                description: "Academic and investigative focus",
              },
            ].map((mode) => {
              const Icon = mode.icon;
              return (
                <Tooltip
                  key={mode.id}
                  content={mode.description}
                  id={`mode-${mode.id}`}
                >
                  <button
                    onClick={() => setCurrentMode(mode.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      currentMode === mode.id
                        ? "bg-purple-600/50 text-white"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {mode.label}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Time-Aware Greeting */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 text-purple-400">
              {getTimeIcon()}
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">
                {currentTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="text-sm text-gray-400">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 border border-purple-400/30">
            <p className="text-purple-200 italic leading-relaxed">
              {getTimeAwareGreeting(currentMode)}
            </p>
          </div>
        </div>

        {/* Enhanced Response Patterns Demo */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Sage's Enhanced Language */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Sage&apos;s Enhanced Language
            </h3>

            <div className="space-y-4">
              {Object.entries(getEnhancedResponses(currentMode)).map(
                ([type, response]) => (
                  <div
                    key={type}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="text-xs text-blue-400 mb-1 capitalize">
                      {type}:
                    </div>
                    <p className="text-gray-200 text-sm italic">"{response}"</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Wisdom Seed */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-emerald-400" />
              Wisdom Seed
            </h3>

            <div className="bg-emerald-500/20 rounded-lg p-4 border border-emerald-400/30">
              <p className="text-emerald-200 text-sm leading-relaxed italic">
                "{getWisdomSeeds(currentMode)}"
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
            >
              Generate new wisdom seed →
            </button>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-400" />
            Enhanced Quick Actions
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {getEnhancedQuickActions(currentMode).map((action) => (
              <Tooltip
                key={action.id}
                content={action.description}
                id={`action-${action.id}`}
              >
                <button className="bg-white/10 hover:bg-white/20 p-4 rounded-lg text-left transition-all group border border-white/20 hover:border-white/30">
                  <div className="text-lg mb-2">{action.icon}</div>
                  <div className="text-sm font-medium text-white group-hover:text-purple-200 transition-colors">
                    {action.label}
                  </div>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Language Philosophy */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            Brahma Language Philosophy
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
              <h4 className="font-medium text-purple-200 mb-2">Personal Mode</h4>
              <ul className="text-purple-100 text-sm space-y-1">
                <li>• Metaphors from nature</li>
                <li>• Introspective questions</li>
                <li>• Emotional acknowledgment</li>
                <li>• Timeless wisdom</li>
              </ul>
            </div>

            <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
              <h4 className="font-medium text-blue-200 mb-2">
                Professional Mode
              </h4>
              <ul className="text-blue-100 text-sm space-y-1">
                <li>• Strategic frameworks</li>
                <li>• Systems thinking</li>
                <li>• Stakeholder awareness</li>
                <li>• Risk consciousness</li>
              </ul>
            </div>

            <div className="bg-emerald-500/20 rounded-lg p-4 border border-emerald-400/30">
              <h4 className="font-medium text-emerald-200 mb-2">
                Research Mode
              </h4>
              <ul className="text-emerald-100 text-sm space-y-1">
                <li>• Hypothesis-driven</li>
                <li>• Methodological rigor</li>
                <li>• Evidence-based</li>
                <li>• Interdisciplinary</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="bg-emerald-500/20 rounded-xl p-6 border border-emerald-400/30">
          <h3 className="text-lg font-semibold mb-4 text-emerald-200">
            ✅ Quick Wins Implemented
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-emerald-300 mb-2">
                Language Enhancements:
              </h4>
              <ul className="text-emerald-100 text-sm space-y-1">
                <li>✅ Time-aware greetings</li>
                <li>✅ Mode-specific language patterns</li>
                <li>✅ Enhanced quick action labels</li>
                <li>✅ Wisdom seeds (proactive prompts)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-300 mb-2">
                UX Improvements:
              </h4>
              <ul className="text-emerald-100 text-sm space-y-1">
                <li>✅ Professional mode toggle</li>
                <li>✅ Comprehensive tooltips</li>
                <li>✅ Time-contextual icons</li>
                <li>✅ Mode-adaptive quick actions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-12">
          <p>Language is a living interface between context and meaning.</p>
        </div>
      </div>
    </div>
  );
};

export default BrahmaLanguageEnhancements;