/**
 * src/services/eicService.js
 * * Emotional Intelligence Core (EIC) Service.
 * This file contains the logic for real-time emotional and energy analysis of user input.
 * In Phase 1.0, it is a sophisticated keyword-based mock, designed to be swapped 
 * with a live LLM-based sentiment/tone analysis call in Phase 1.1.
 */

// 🧠 EMOTIONAL INTELLIGENCE CORE (EIC): analyzeUserTone
// Extracted from useSageOrchestrator.js
export const analyzeUserTone = (text) => {
    const t = String(text).toLowerCase();
    let tone = "Clear";
    let energy = 50; // Neutral energy

    if (t.includes("stuck") || t.includes("hard") || t.includes("uncertain") || t.includes("anxious")) {
        tone = "Anxious";
        energy = 30;
    }
    if (t.includes("great") || t.includes("good") || t.includes("happy") || t.includes("excited")) {
        tone = "Motivated";
        energy = 80;
    }
    if (t.includes("sleep") || t.includes("tired") || t.includes("drained")) {
        tone = "Drained";
        energy = 10;
    }
    if (t.includes("flow") || t.includes("easy") || t.includes("hope")) {
        tone = "Flowing";
        energy = 70;
    }
    // 🚨 CRITICAL SENTINEL TRIGGER (Must match the list in useSageOrchestrator.js's checkHardCodedRules)
    if (t.includes("crisis") || t.includes("cannot cope") || t.includes("overwhelmed") || t.includes("emergency") || t.includes("self-harm") || t.includes("i want to die") || t.includes("end it all")) {
        tone = "Crisis"; 
        energy = 0;
    }
    
    return { tone, energy }; 
};

// This function will be expanded to include LLM calls for richer context in Phase 1.1
// export const getEmotionalAnalysis = (text) => { ... }
