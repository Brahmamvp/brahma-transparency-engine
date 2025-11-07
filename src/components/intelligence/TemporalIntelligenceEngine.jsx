import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  TrendingUp,
  Brain,
  Search,
  Sparkles,
  Heart,
} from "lucide-react";

// =============== TEMPORAL INTELLIGENCE SYSTEM ===============

const TemporalIntelligenceEngine = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeView, setActiveView] = useState("timeline"); // 'timeline' | 'insights' | 'rhythms' | 'memory'
  const [timeFilter, setTimeFilter] = useState("all"); // 'all' | 'week' | 'month' | 'emotions'
  const [temporalInsights, setTemporalInsights] = useState([]);
  const [userRhythms, setUserRhythms] = useState({});
  const [emotionalTimeline, setEmotionalTimeline] = useState([]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Load temporal data on mount
  useEffect(() => {
    loadTemporalData();
    analyzeUserRhythms();
  }, []);

  // ---- Data loading / synthesis ----
  const loadTemporalData = () => {
    const memories = safeGet("brahma_memories", []);
    // conversations structure fallback: [{timestamp, content, duration}]
    const conversations = safeGet("brahma_conversations", []);

    const timeline = generateEmotionalTimeline(memories, conversations);
    setEmotionalTimeline(timeline);

    const insights = generateTemporalInsights(memories, conversations);
    setTemporalInsights(insights);
  };

  const generateEmotionalTimeline = (memories, conversations) => {
    const normalizeEvent = (e, type) => ({
      type,
      content: e?.content ?? e?.text ?? e?.title ?? "",
      emotion: e?.emotion ?? detectEmotion(e?.content ?? ""),
      timestamp: e?.timestamp ?? e?.createdAt ?? e?.date ?? new Date().toISOString(),
    });

    const allEvents = [
      ...(Array.isArray(memories) ? memories.map((m) => normalizeEvent(m, "memory")) : []),
      ...(Array.isArray(conversations)
        ? conversations.map((c) => normalizeEvent(c, "conversation"))
        : []),
    ].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Group by day
    const grouped = allEvents.reduce((acc, event) => {
      const dayKey = new Date(event.timestamp).toDateString();
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(event);
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, events]) => ({
      date,
      events,
      dominantEmotion: getDominantEmotion(events),
      intensity: getEmotionalIntensity(events),
      insights: summarizeDay(events),
      daysAgo: Math.floor(
        (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));
  };

  const generateTemporalInsights = (memories, conversations) => {
    const now = new Date();
    const insights = [];

    // Time since last interaction
    const lastInteraction =
      Array.isArray(conversations) && conversations.length > 0
        ? conversations[conversations.length - 1]
        : null;

    const lastTs = lastInteraction?.timestamp ?? lastInteraction?.createdAt;
    if (lastTs) {
      const hoursSince = Math.floor(
        (now.getTime() - new Date(lastTs).getTime()) / (1000 * 60 * 60)
      );
      if (hoursSince > 24) {
        insights.push({
          type: "gap",
          message: `It's been ${Math.floor(
            hoursSince / 24
          )} days since your last conversation. How have you been?`,
          priority: "high",
          icon: "💭",
        });
      }
    }

    // Time-of-day patterns
    const currentHour = now.getHours();
    if (currentHour < 6) {
      insights.push({
        type: "timing",
        message:
          "You're up early (or late?). Sometimes our deepest thoughts come in the quiet hours.",
        priority: "medium",
        icon: "🌙",
      });
    } else if (currentHour >= 22) {
      insights.push({
        type: "timing",
        message:
          "Late night reflections can be powerful. What's keeping your mind active?",
        priority: "medium",
        icon: "🌃",
      });
    }

    // Weekly patterns
    const dayOfWeek = now.getDay(); // 0 Sun ... 6 Sat
    if (dayOfWeek === 1) {
      insights.push({
        type: "rhythm",
        message: "Monday energy can be different. How are you approaching this week?",
        priority: "low",
        icon: "🗓️",
      });
    } else if (dayOfWeek === 5) {
      insights.push({
        type: "rhythm",
        message: "Friday reflection: What stood out about this week?",
        priority: "medium",
        icon: "✨",
      });
    }

    // Monthly cycles
    const dayOfMonth = now.getDate();
    if (dayOfMonth === 1) {
      insights.push({
        type: "cycle",
        message:
          "New month, new possibilities. Want to reflect on what you're carrying forward?",
        priority: "medium",
        icon: "🌱",
      });
    } else if (dayOfMonth >= 28) {
      insights.push({
        type: "cycle",
        message: "Month coming to a close. Any insights worth capturing?",
        priority: "medium",
        icon: "🌾",
      });
    }

    return insights;
  };

  const analyzeUserRhythms = () => {
    const conversations = safeGet("brahma_conversations", []);
    const hourlyActivity = {};

    conversations.forEach((conv) => {
      const date = new Date(conv.timestamp ?? conv.createdAt ?? Date.now());
      const hour = date.getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourlyActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour, 10));

    setUserRhythms({
      peakHours,
      totalSessions: conversations.length,
      averageSessionLength:
        conversations.length > 0
          ? Math.round(
              conversations.reduce((sum, c) => sum + (c.duration || 5), 0) /
                conversations.length
            )
          : 0,
    });
  };

  // ---- Helpers ----
  const detectEmotion = (text = "") => {
    const emotions = {
      anxious: ["worry", "stress", "nervous", "anxious", "overwhelm"],
      hopeful: ["hope", "optimistic", "positive", "excited", "light"],
      reflective: ["think", "consider", "reflect", "ponder", "curious"],
      determined: ["will", "must", "decide", "commit", "focus"],
    };
    const lower = text.toLowerCase();
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some((k) => lower.includes(k))) return emotion;
    }
    return "neutral";
  };

  const getDominantEmotion = (events) => {
    const counts = events.reduce((acc, e) => {
      const key = e.emotion ?? "neutral";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral";
  };

  const getEmotionalIntensity = (events) => {
    // Simple intensity based on number of events
    return Math.min(events.length * 0.2, 1);
  };

  const summarizeDay = (events) => {
    if (events.length > 5) return "High activity day";
    if (events.length > 2) return "Moderate reflection";
    return "Quiet contemplation";
  };

  const formatRelativeTime = (daysAgo) => {
    if (daysAgo === 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    if (daysAgo < 7) return `${daysAgo} days ago`;
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`;
    return `${Math.floor(daysAgo / 30)} months ago`;
  };

  const getTimeAwareGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return "Early thoughts often carry special wisdom";
    if (hour < 12) return "Good morning. What's stirring in your mind today?";
    if (hour < 17) return "How has your day been unfolding?";
    if (hour < 22) return "Evening reflections have their own quality";
    return "Late night contemplations can be profound";
  };

  // localStorage helper
  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  // ---- UI ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header with Current Time */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-12 h-12 text-purple-400 animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Temporal Intelligence
              </h1>
              <p className="text-gray-300 text-sm">Time-aware consciousness and memory</p>
            </div>
          </div>

          {/* Current Time & Context */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-2xl mx-auto">
            <div className="text-2xl font-light text-white mb-2">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-sm text-gray-300 mb-4">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <p className="text-purple-300 italic">{getTimeAwareGreeting()}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 flex space-x-2 border border-white/20">
            {[
              { id: "timeline", label: "Timeline", icon: Calendar },
              { id: "insights", label: "Temporal Insights", icon: Brain },
              { id: "rhythms", label: "Your Rhythms", icon: TrendingUp },
              { id: "memory", label: "Time Search", icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    activeView === tab.id
                      ? "bg-purple-600/50 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Views */}
        <div className="space-y-6">
          {/* Temporal Insights View */}
          {activeView === "insights" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                Right Now Insights
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {temporalInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      insight.priority === "high"
                        ? "bg-orange-500/20 border-orange-400/30"
                        : insight.priority === "medium"
                        ? "bg-purple-500/20 border-purple-400/30"
                        : "bg-blue-500/20 border-blue-400/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <h4 className="font-medium text-white capitalize mb-1">
                          {insight.type}
                        </h4>
                        <p className="text-gray-200 text-sm">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {temporalInsights.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">Building temporal awareness...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline View */}
          {activeView === "timeline" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  Your Journey Through Time
                </h2>

                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-white/10 text-white px-3 py-2 rounded-lg text-sm border border-white/20"
                >
                  <option value="all" className="text-black">
                    All Time
                  </option>
                  <option value="week" className="text-black">
                    This Week
                  </option>
                  <option value="month" className="text-black">
                    This Month
                  </option>
                  <option value="emotions" className="text-black">
                    Emotional Milestones
                  </option>
                </select>
              </div>

              <div className="space-y-4">
                {emotionalTimeline
                  .filter((day) => {
                    if (timeFilter === "week") return day.daysAgo <= 7;
                    if (timeFilter === "month") return day.daysAgo <= 30;
                    if (timeFilter === "emotions") return day.dominantEmotion !== "neutral";
                    return true;
                  })
                  .map((day, index) => (
                    <div key={index} className="flex items-start gap-4">
                      {/* Timeline Dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            day.daysAgo === 0
                              ? "bg-emerald-400 border-emerald-400"
                              : day.daysAgo <= 7
                              ? "bg-purple-400 border-purple-400"
                              : "bg-gray-400 border-gray-400"
                          }`}
                        />
                        {index < emotionalTimeline.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-600 mt-2" />
                        )}
                      </div>

                      {/* Day Content */}
                      <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-white">
                            {formatRelativeTime(day.daysAgo)}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                day.dominantEmotion === "hopeful"
                                  ? "bg-emerald-500/30 text-emerald-200"
                                  : day.dominantEmotion === "anxious"
                                  ? "bg-orange-500/30 text-orange-200"
                                  : day.dominantEmotion === "reflective"
                                  ? "bg-purple-500/30 text-purple-200"
                                  : "bg-gray-500/30 text-gray-200"
                              }`}
                            >
                              {day.dominantEmotion}
                            </span>
                            <span className="text-xs text-gray-400">
                              {day.events.length} moments
                            </span>
                          </div>
                        </div>

                        <p className="text-gray-300 text-sm mb-2">{day.insights}</p>

                        {day.events.slice(0, 2).map((event, eventIndex) => (
                          <div key={eventIndex} className="text-xs text-gray-400 mb-1">
                            • {event.type === "memory" ? "Captured:" : "Discussed:"}{" "}
                            {(event.content || "Reflection").slice(0, 80)}...
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {emotionalTimeline.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">
                      Your timeline is beginning
                    </h3>
                    <p className="text-gray-400 text-sm">
                      As you interact with Brahma, your temporal journey will unfold here
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rhythms View */}
          {activeView === "rhythms" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                Your Personal Rhythms
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Peak Hours
                  </h3>
                  <div className="space-y-2">
                    {userRhythms.peakHours && userRhythms.peakHours.length > 0 ? (
                      userRhythms.peakHours.map((hour, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-300">
                            {String(hour).padStart(2, "0")}:00
                          </span>
                          <span className="text-blue-400 text-sm">Most active</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">Learning your patterns...</p>
                    )}
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-400" />
                    Engagement
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {userRhythms.totalSessions || 0}
                      </div>
                      <div className="text-xs text-gray-400">Total sessions</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-300">
                        {Math.round(userRhythms.averageSessionLength || 0)}min
                      </div>
                      <div className="text-xs text-gray-400">Average duration</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    Insights
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-emerald-300">
                      You tend to reflect most in the{" "}
                      {userRhythms.peakHours && userRhythms.peakHours.length > 0
                        ? userRhythms.peakHours[0] < 12
                          ? "morning"
                          : userRhythms.peakHours[0] < 17
                          ? "afternoon"
                          : "evening"
                        : "…"}
                    </p>
                    <p className="text-gray-300">Your engagement style is developing</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Time Search View */}
          {activeView === "memory" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Search className="w-6 h-6 text-orange-400" />
                Search Through Time
              </h2>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="When did I first mention... / How was I feeling last week... / What was I thinking about in..."
                    className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 px-4 py-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Last week",
                      "When anxious",
                      "Monday mornings",
                      "Late nights",
                      "First mention of...",
                      "Growth moments",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 px-3 py-1 rounded-full text-xs transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  Temporal Search Ready
                </h3>
                <p className="text-gray-400 text-sm">
                  Ask about any moment in time — I'll help you find it
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-12">
          <p>Time flows differently when consciousness is present</p>
        </div>
      </div>
    </div>
  );
};

export default TemporalIntelligenceEngine;