// /src/utils/sessionMemory.js
export class SessionMemory {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {
      topics: [],
      sentiment: 'neutral',
      decisionStage: 'exploring',
      explorationCount: 0,
      lastActivity: Date.now()
    };
    this.reflectionEntries = [];
    this.decisionInsights = [];
    this.sessionStartTime = Date.now();
  }

  // ============================================================================
  // CONVERSATION TRACKING
  // ============================================================================

  addMessage(role, text, metadata = {}) {
    const message = {
      id: this.generateId(),
      role,
      text,
      timestamp: Date.now(),
      metadata
    };
    
    this.conversationHistory.push(message);
    this.updateLastActivity();
    
    return message;
  }

  getConversationHistory(limit = null) {
    if (limit) {
      return this.conversationHistory.slice(-limit);
    }
    return this.conversationHistory;
  }

  getMessageCount() {
    return this.conversationHistory.length;
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  updateContext(updates) {
    this.userContext = { 
      ...this.userContext, 
      ...updates,
      lastActivity: Date.now()
    };
    
    // Track exploration progression
    if (updates.decisionStage === 'deepDiving') {
      this.userContext.explorationCount += 1;
    }
  }

  getContext() {
    return { ...this.userContext };
  }

  // Detect patterns in user's conversation style
  getConversationPatterns() {
    const messages = this.conversationHistory.filter(m => m.role === 'user');
    
    return {
      averageMessageLength: messages.reduce((acc, m) => acc + m.text.length, 0) / messages.length || 0,
      questionCount: messages.filter(m => m.text.includes('?')).length,
      emotionalWords: messages.filter(m => 
        m.text.toLowerCase().includes('feel') || 
        m.text.toLowerCase().includes('scared') || 
        m.text.toLowerCase().includes('excited')
      ).length,
      totalMessages: messages.length
    };
  }

  // ============================================================================
  // REFLECTION MANAGEMENT
  // ============================================================================

  addReflection(entry) {
    const reflection = {
      id: this.generateId(),
      content: entry.content,
      prompt: entry.prompt,
      timestamp: entry.timestamp || Date.now(),
      conversationContext: { ...this.userContext }
    };
    
    this.reflectionEntries.push(reflection);
    this.updateLastActivity();
    
    return reflection;
  }

  getReflections(limit = null) {
    const sorted = this.reflectionEntries.sort((a, b) => b.timestamp - a.timestamp);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  getReflectionCount() {
    return this.reflectionEntries.length;
  }

  // ============================================================================
  // DECISION INSIGHTS
  // ============================================================================

  addInsight(insight) {
    const newInsight = {
      id: this.generateId(),
      content: insight.content,
      type: insight.type || 'general', // 'pattern', 'concern', 'excitement', etc.
      confidence: insight.confidence || 0.7,
      timestamp: Date.now(),
      relatedOptions: insight.relatedOptions || []
    };
    
    this.decisionInsights.push(newInsight);
    return newInsight;
  }

  getInsights(type = null) {
    if (type) {
      return this.decisionInsights.filter(insight => insight.type === type);
    }
    return this.decisionInsights;
  }

  // ============================================================================
  // SESSION ANALYTICS
  // ============================================================================

  getSessionSummary() {
    const duration = Date.now() - this.sessionStartTime;
    const patterns = this.getConversationPatterns();
    
    return {
      sessionId: this.generateSessionId(),
      duration: duration,
      durationMinutes: Math.round(duration / 60000),
      messageCount: this.conversationHistory.length,
      userMessageCount: this.conversationHistory.filter(m => m.role === 'user').length,
      sageMessageCount: this.conversationHistory.filter(m => m.role === 'sage').length,
      reflectionCount: this.reflectionEntries.length,
      insightCount: this.decisionInsights.length,
      explorationLevel: this.userContext.explorationCount,
      topicsExplored: this.userContext.topics,
      finalSentiment: this.userContext.sentiment,
      conversationPatterns: patterns,
      lastActivity: this.userContext.lastActivity
    };
  }

  // Identify key themes from the session
  getSessionThemes() {
    const allText = this.conversationHistory
      .filter(m => m.role === 'user')
      .map(m => m.text.toLowerCase())
      .join(' ');

    const themes = {
      careerFocus: this.countKeywords(allText, ['career', 'job', 'work', 'professional']),
      financialConcern: this.countKeywords(allText, ['money', 'cost', 'expensive', 'afford']),
      emotionalProcessing: this.countKeywords(allText, ['feel', 'scared', 'excited', 'nervous']),
      familyConsideration: this.countKeywords(allText, ['family', 'partner', 'kids']),
      timeConstraints: this.countKeywords(allText, ['time', 'busy', 'schedule', 'when'])
    };

    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  exportSession(format = 'summary') {
    const summary = this.getSessionSummary();
    const themes = this.getSessionThemes();
    
    if (format === 'summary') {
      return {
        summary,
        themes,
        keyReflections: this.getReflections(3),
        topInsights: this.getInsights().slice(0, 5)
      };
    }
    
    if (format === 'full') {
      return {
        summary,
        themes,
        fullConversation: this.conversationHistory,
        allReflections: this.reflectionEntries,
        allInsights: this.decisionInsights,
        contextHistory: this.userContext
      };
    }
    
    return summary;
  }

  // Generate downloadable reflection document
  generateReflectionDocument() {
    const summary = this.getSessionSummary();
    const themes = this.getSessionThemes();
    const reflections = this.getReflections();
    
    return {
      title: `Decision Exploration - ${new Date().toLocaleDateString()}`,
      content: {
        overview: `You spent ${summary.durationMinutes} minutes exploring possibilities with Sage.`,
        keyThemes: themes,
        reflections: reflections.map(r => ({
          prompt: r.prompt,
          content: r.content,
          date: new Date(r.timestamp).toLocaleDateString()
        })),
        insights: this.decisionInsights.map(i => i.content),
        nextSteps: "Continue exploring when you feel ready. Your reflections will be here when you return."
      },
      metadata: {
        sessionId: this.generateSessionId(),
        brahmaModule: 'TransparencyEngine',
        version: '1.0'
      }
    };
  }

  // ============================================================================
  // BRAHMA INTEGRATION HELPERS
  // ============================================================================

  // Prepare data for Brahma Context Engine
  getBrahmaPayload() {
    return {
      module: 'TransparencyEngine',
      version: '1.0',
      sessionData: this.exportSession('summary'),
      userState: {
        currentStage: this.userContext.decisionStage,
        primaryTopics: this.userContext.topics.slice(0, 3),
        explorationDepth: this.userContext.explorationCount,
        emotionalState: this.userContext.sentiment
      },
      recommendations: {
        suggestCompass: this.userContext.topics.length >= 2,
        suggestLegacyEcho: this.userContext.explorationCount >= 3,
        suggestBreak: this.getSessionSummary().durationMinutes > 45
      }
    };
  }

  // Sync with Compass Profile data
  syncWithCompass(compassData) {
    if (compassData) {
      this.updateContext({
        compassProfile: compassData.profile,
        values: compassData.values,
        personalityFactors: compassData.personality
      });
      
      // Auto-adjust assumptions based on Compass data
      if (compassData.riskTolerance) {
        this.userContext.assumptionsSource = 'compass';
      }
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  generateSessionId() {
    return `te_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
  }

  updateLastActivity() {
    this.userContext.lastActivity = Date.now();
  }

  countKeywords(text, keywords) {
    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
  }

  // Clear session but preserve structure
  reset() {
    this.conversationHistory = [];
    this.userContext = {
      topics: [],
      sentiment: 'neutral',
      decisionStage: 'exploring',
      explorationCount: 0,
      lastActivity: Date.now()
    };
    this.reflectionEntries = [];
    this.decisionInsights = [];
    this.sessionStartTime = Date.now();
  }

  // ============================================================================
  // SESSION PERSISTENCE (for localStorage when available)
  // ============================================================================

  saveToStorage(key = 'brahma_transparency_session') {
    try {
      const sessionData = {
        conversationHistory: this.conversationHistory,
        userContext: this.userContext,
        reflectionEntries: this.reflectionEntries,
        decisionInsights: this.decisionInsights,
        sessionStartTime: this.sessionStartTime,
        savedAt: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.warn('Could not save session to storage:', error);
      return false;
    }
  }

  loadFromStorage(key = 'brahma_transparency_session') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const sessionData = JSON.parse(saved);
        
        this.conversationHistory = sessionData.conversationHistory || [];
        this.userContext = sessionData.userContext || this.userContext;
        this.reflectionEntries = sessionData.reflectionEntries || [];
        this.decisionInsights = sessionData.decisionInsights || [];
        this.sessionStartTime = sessionData.sessionStartTime || Date.now();
        
        return true;
      }
    } catch (error) {
      console.warn('Could not load session from storage:', error);
    }
    return false;
  }
}

// ============================================================================
// FACTORY FUNCTION FOR EASY INSTANTIATION
// ============================================================================

export const createSessionMemory = (options = {}) => {
  const memory = new SessionMemory();
  
  // Initialize with any provided data
  if (options.compassData) {
    memory.syncWithCompass(options.compassData);
  }
  
  if (options.loadFromStorage) {
    memory.loadFromStorage(options.storageKey);
  }
  
  return memory;
};

// ============================================================================
// HOOKS FOR REACT INTEGRATION
// ============================================================================

import { useState, useEffect } from 'react';

export const useSessionMemory = (options = {}) => {
  const [memory] = useState(() => createSessionMemory(options));
  const [sessionData, setSessionData] = useState(memory.getSessionSummary());

  // Update session data when memory changes
  useEffect(() => {
    const updateSessionData = () => {
      setSessionData(memory.getSessionSummary());
    };

    // Auto-save to storage periodically (if available)
    const autoSaveInterval = setInterval(() => {
      if (options.autoSave !== false) {
        memory.saveToStorage();
      }
      updateSessionData();
    }, 30000); // Save every 30 seconds

    // Save when page unloads
    const handleBeforeUnload = () => {
      memory.saveToStorage();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(autoSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      memory.saveToStorage(); // Final save
    };
  }, [memory, options.autoSave]);

  return {
    memory,
    sessionData,
    addMessage: (role, text, metadata) => memory.addMessage(role, text, metadata),
    addReflection: (entry) => memory.addReflection(entry),
    addInsight: (insight) => memory.addInsight(insight),
    updateContext: (updates) => memory.updateContext(updates),
    exportSession: (format) => memory.exportSession(format),
    getBrahmaPayload: () => memory.getBrahmaPayload(),
    reset: () => memory.reset()
  };
};