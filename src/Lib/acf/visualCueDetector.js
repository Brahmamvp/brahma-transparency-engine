// /src/Lib/acf/visualCueDetector.js

/**
 * Visual Cue Detection for Brahma Narratives.
 * Determines if a visual narrative overlay is appropriate based on user input
 * and real-time emotional/topical signals.
 * * This uses keyword matching against the input and a dummy signal for MVP.
 * In a full system, userSignals would come from sentiment analysis,
 * active memory search, or Web Speech API transcription analysis.
 */

// Define core emotional/topical anchors for the visual narratives
const NARRATIVE_TOPICS = {
  fear: ["fear", "anxiety", "scared", "afraid", "panic", "retreat", "flee", "overwhelm"],
  doubt: ["doubt", "uncertainty", "hesitation", "unsure", "questioning", "maybe", "confused", "stuck"],
  growth: ["growth", "progress", "improve", "learn", "evolve", "change", "succeed", "future", "hope", "overcome"],
};

/**
 * Analyzes input and signals to determine if a narrative visual should be triggered.
 * @param {string} userInput - The raw text input from the user.
 * @param {object} userSignals - Contextual signals (e.g., detected emotion, topic tags).
 * @returns {{needsNarrative: boolean, topic: string | null, confidence: number, style: string}}
 */
export function detectNarrativeNeed(userInput, userSignals = {}) {
  const normalizedInput = userInput.toLowerCase();
  
  let bestMatch = { topic: null, confidence: 0, style: "shadow-puppet" };
  
  // 1. Keyword Matching (High Confidence)
  for (const [topic, keywords] of Object.entries(NARRATIVE_TOPICS)) {
    const matchedKeyword = keywords.find(keyword => normalizedInput.includes(keyword));
    
    if (matchedKeyword) {
      bestMatch.topic = topic;
      bestMatch.confidence = 0.8; // High confidence from direct keyword match
      if (topic === "doubt") bestMatch.style = "ethereal-calm";
      if (topic === "growth") bestMatch.style = "shadow-puppet";
      break; 
    }
  }

  // 2. Fallback to Signal Matching (Medium Confidence)
  // If no direct keyword match, check emotional signals (simulated or real)
  if (!bestMatch.topic && userSignals.emotion) {
    const emotionMap = {
      "sadness": "doubt",
      "confusion": "doubt",
      "anger": "fear", // Anger often stems from fear/vulnerability
      "interest": "growth",
      "determination": "growth",
    };
    
    const mappedTopic = emotionMap[userSignals.emotion.toLowerCase()];
    if (mappedTopic) {
        bestMatch.topic = mappedTopic;
        bestMatch.confidence = 0.5; // Lower confidence from indirect mapping
        if (mappedTopic === "doubt") bestMatch.style = "ethereal-calm";
    }
  }
  
  // 3. Final Decision
  const needsNarrative = bestMatch.confidence > 0.4;

  return {
    needsNarrative: needsNarrative,
    topic: bestMatch.topic,
    confidence: bestMatch.confidence,
    style: bestMatch.style, // Passed for Renderer styling
  };
}

/**
 * Utility function (Stub: would be part of a larger memory kernel)
 * In a real scenario, this would extract the most salient topic from the user's input context.
 * The current detectNarrativeNeed uses direct keyword matching, making this function redundant 
 * for the MVP, but it's kept as a conceptual placeholder.
 */
export function extractTopicTag(input) {
  const normalized = input.toLowerCase();
  for (const [topic, keywords] of Object.entries(NARRATIVE_TOPICS)) {
    if (keywords.some(keyword => normalized.includes(keyword))) {
      return topic;
    }
  }
  return null;
}

