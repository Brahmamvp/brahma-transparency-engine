// packages/core/analytics.js
// Analytics and event logging for Brahma

// Initialize session if not exists
export const initializeSession = () => {
  if (!sessionStorage.getItem('brahmaSessionId')) {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('brahmaSessionId', sessionId);
    sessionStorage.setItem('brahmaSessionStart', new Date().toISOString());
  }
  
  // Initialize events array if not exists
  if (!localStorage.getItem('brahmaEvents')) {
    localStorage.setItem('brahmaEvents', JSON.stringify([]));
  }
  
  return sessionStorage.getItem('brahmaSessionId');
};

// Log an event
export const logEvent = (eventData) => {
  try {
    const events = JSON.parse(localStorage.getItem('brahmaEvents') || '[]');
    const event = {
      ...eventData,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('brahmaSessionId') || 'anonymous',
      url: window.location.pathname,
      userAgent: navigator.userAgent.substring(0, 100) // Truncated for privacy
    };
    
    events.push(event);
    
    // Keep only last 1000 events to prevent storage bloat
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('brahmaEvents', JSON.stringify(events));
    
    // Also update session stats
    updateSessionStats(event);
  } catch (error) {
    console.warn('Failed to log event:', error);
  }
};

// Update session statistics
const updateSessionStats = (event) => {
  try {
    const stats = JSON.parse(localStorage.getItem('brahmaSessionStats') || '{}');
    const sessionId = sessionStorage.getItem('brahmaSessionId');
    
    if (!stats[sessionId]) {
      stats[sessionId] = {
        startTime: sessionStorage.getItem('brahmaSessionStart'),
        eventCount: 0,
        moduleUsage: {
          contextEngine: 0,
          transparencyEngine: 0,
          tts: 0,
          sage: 0,
          admin: 0
        },
        emotionalTags: [],
        pages: new Set()
      };
    }
    
    const session = stats[sessionId];
    session.eventCount++;
    session.lastActivity = event.timestamp;
    session.pages.add(event.url);
    
    // Track module usage
    if (event.module && session.moduleUsage.hasOwnProperty(event.module.toLowerCase().replace(/[^a-z]/g, ''))) {
      const moduleKey = event.module.toLowerCase().replace(/[^a-z]/g, '');
      session.moduleUsage[moduleKey]++;
    }
    
    // Track emotional tags
    if (event.value && event.value.emotionalTag) {
      session.emotionalTags.push(event.value.emotionalTag);
    }
    
    // Convert Set back to array for storage
    stats[sessionId] = {
      ...session,
      pages: Array.from(session.pages)
    };
    
    localStorage.setItem('brahmaSessionStats', JSON.stringify(stats));
  } catch (error) {
    console.warn('Failed to update session stats:', error);
  }
};

// Get current session stats
export const getSessionStats = () => {
  try {
    const sessionId = sessionStorage.getItem('brahmaSessionId');
    const stats = JSON.parse(localStorage.getItem('brahmaSessionStats') || '{}');
    return stats[sessionId] || null;
  } catch (error) {
    console.warn('Failed to get session stats:', error);
    return null;
  }
};

// Get all events
export const getAllEvents = () => {
  try {
    return JSON.parse(localStorage.getItem('brahmaEvents') || '[]');
  } catch (error) {
    console.warn('Failed to get events:', error);
    return [];
  }
};

// Export analytics data
export const exportAnalyticsData = () => {
  try {
    const events = getAllEvents();
    const stats = JSON.parse(localStorage.getItem('brahmaSessionStats') || '{}');
    const sessionId = sessionStorage.getItem('brahmaSessionId');
    
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      currentSession: sessionId,
      sessionStats: stats,
      events: events,
      summary: {
        totalEvents: events.length,
        totalSessions: Object.keys(stats).length,
        dateRange: {
          earliest: events.length > 0 ? events[0].timestamp : null,
          latest: events.length > 0 ? events[events.length - 1].timestamp : null
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brahma-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return exportData;
  } catch (error) {
    console.error('Failed to export analytics:', error);
    return null;
  }
};

// Clear analytics data
export const clearAnalyticsData = () => {
  try {
    localStorage.removeItem('brahmaEvents');
    localStorage.removeItem('brahmaSessionStats');
    sessionStorage.removeItem('brahmaSessionId');
    sessionStorage.removeItem('brahmaSessionStart');
    return true;
  } catch (error) {
    console.error('Failed to clear analytics:', error);
    return false;
  }
};

// Common event logging functions
export const logPageView = (page) => {
  logEvent({
    module: 'Navigation',
    action: 'PageView',
    value: { page }
  });
};

export const logModuleUsage = (module, action, details = {}) => {
  logEvent({
    module,
    action,
    value: details
  });
};

export const logTTSUsage = (action, details = {}) => {
  logEvent({
    module: 'TTS',
    action,
    value: details
  });
};

export const logSageInteraction = (action, details = {}) => {
  logEvent({
    module: 'Sage',
    action,
    value: details
  });
};

export const logEmotionalSignal = (tag, context = {}) => {
  logEvent({
    module: 'EmotionalIntelligence',
    action: 'SignalDetected',
    value: { 
      emotionalTag: tag,
      context
    }
  });
};

// Memory usage tracking
export const getMemoryUsage = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      bytes: total,
      formatted: formatBytes(total),
      itemCount: Object.keys(localStorage).length
    };
  } catch (error) {
    return { bytes: 0, formatted: '0 B', itemCount: 0 };
  }
};

// Helper function to format bytes
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Initialize analytics when module loads
initializeSession();