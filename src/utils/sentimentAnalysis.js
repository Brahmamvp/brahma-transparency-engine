
// /src/utils/sentimentAnalysis.js
export const analyzeUserInput = (text) => {
  const lowerText = text.toLowerCase();
  let detectedTopics = [];
  let sentiment = 'neutral';

  // Topic detection
  Object.entries(decisionPrompts).forEach(([topic, data]) => {
    if (data.keywords.some(keyword => lowerText.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });

  // Sentiment detection
  if (lowerText.includes('excited') || lowerText.includes('ready') || lowerText.includes('can\'t wait')) {
    sentiment = 'positive';
  } else if (lowerText.includes('scared') || lowerText.includes('worried') || lowerText.includes('unsure')) {
    sentiment = 'concerned';
  }

  return { topics: detectedTopics, sentiment };
};

// /src/utils/sessionMemory.js
export class SessionMemory {
  constructor() {
    this.conversationHistory = [];
    this.userContext = {
      topics: [],
      sentiment: 'neutral',
      decisionStage: 'exploring'
    };
    this.reflectionEntries = [];
  }

  addMessage(role, text) {
    this.conversationHistory.push({ role, text, timestamp: Date.now() });
  }

  updateContext(updates) {
    this.userContext = { ...this.userContext, ...updates };
  }

  addReflection(entry) {
    this.reflectionEntries.push({
      ...entry,
      timestamp: Date.now()
    });
  }

  getContext() {
    return this.userContext;
  }
}
