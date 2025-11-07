// /src/data/stories.js
// Real Stories - Anonymized experiences from people who've walked similar paths
export const storyBlocks = [
  // ============================================================================
  // EDUCATION PATH STORIES
  // ============================================================================
  {
    id: 'story_1',
    demographic: 'moderate_flexible',
    category: 'education',
    pathType: 'bootcamp',
    story: 'I started the bootcamp scared but excited. The structure helped, and having a cohort made all the difference.',
    outcome: 'Now a senior UX designer at a tech startup',
    timeframe: '8 months total',
    challenges: 'The first month was overwhelming, but the community support carried me through',
    surprises: 'I discovered I love user research as much as design',
    advice: 'Trust the process and lean on your cohort - they become lifelong connections'
  },
  {
    id: 'story_2',
    demographic: 'conservative_longterm',
    category: 'education',
    pathType: 'degree',
    story: 'The degree felt safer because I could keep working. It took longer, but I never felt overwhelmed.',
    outcome: 'Transitioned to tech lead role at current company',
    timeframe: '2.5 years',
    challenges: 'Balancing coursework with a demanding job required careful planning',
    surprises: 'My employer started valuing my input more as I learned new skills',
    advice: 'Slow and steady wins. Your current job becomes a laboratory for what you learn'
  },
  {
    id: 'story_3',
    demographic: 'adventurous_immediate',
    category: 'education',
    pathType: 'self-directed',
    story: 'I quit my job and gave myself 6 months to learn everything I could. Pure immersion.',
    outcome: 'Freelance developer with multiple recurring clients',
    timeframe: '6 months learning + 4 months building practice',
    challenges: 'Without structure, I had to create my own accountability systems',
    surprises: 'Learning in public on social media opened more doors than formal credentials',
    advice: 'Document everything you learn - it becomes your portfolio and proof of commitment'
  },
  {
    id: 'story_4',
    demographic: 'moderate_immediate',
    category: 'education',
    pathType: 'hybrid',
    story: 'I combined online courses with a part-time mentorship. Best of both worlds.',
    outcome: 'Product manager at a mid-stage startup',
    timeframe: '10 months',
    challenges: 'Finding the right mentor took longer than expected',
    surprises: 'Real-world projects taught me more than any course content',
    advice: 'Invest in relationships, not just content. People open doors that courses cannot'
  },

  // ============================================================================
  // BUSINESS PATH STORIES
  // ============================================================================
  {
    id: 'story_5',
    demographic: 'adventurous_immediate',
    category: 'business',
    pathType: 'consulting',
    story: 'I jumped into consulting with just savings and confidence. The first year was tough but taught me everything.',
    outcome: 'Built a 6-figure practice within 18 months',
    timeframe: '18 months to stability',
    challenges: 'Client acquisition was harder than expected, especially in months 4-8',
    surprises: 'Former colleagues became my best source of referrals',
    advice: 'Start networking before you need clients. Your reputation travels faster than your marketing'
  },
  {
    id: 'story_6',
    demographic: 'moderate_immediate',
    category: 'business',
    pathType: 'side-project',
    story: 'The side project approach let me test ideas without burning bridges. When it took off, the transition felt natural.',
    outcome: 'Launched profitable SaaS while keeping day job initially',
    timeframe: '14 months to sustainable income',
    challenges: 'Time management and energy depletion from working two jobs',
    surprises: 'My day job skills directly applied to my side project in unexpected ways',
    advice: 'Validate demand early. I spent 3 months building before talking to customers - big mistake'
  },
  {
    id: 'story_7',
    demographic: 'conservative_flexible',
    category: 'business',
    pathType: 'gradual-transition',
    story: 'I negotiated 4-day weeks at my job to test freelancing on Fridays. Low risk, real learning.',
    outcome: 'Gradually built client base and transitioned to full-time freelancing',
    timeframe: '2 years transition',
    challenges: 'Lower income during transition period required budget adjustments',
    surprises: 'Clients appreciated my corporate experience and perspective',
    advice: 'Gradual transitions let you learn without panic. Take time to build properly'
  },

  // ============================================================================
  // MIXED PATH STORIES
  // ============================================================================
  {
    id: 'story_8',
    demographic: 'conservative_flexible',
    category: 'mixed',
    pathType: 'skill-plus-network',
    story: 'Online learning gave me control over pace. I could pause during busy family times and accelerate when free.',
    outcome: 'Completed certification and got promoted internally',
    timeframe: '18 months',
    challenges: 'Self-discipline when life got busy, especially with young kids',
    surprises: 'My manager noticed the skills before I finished the program',
    advice: 'Family-friendly learning is possible, but communicate your goals to get support'
  },
  {
    id: 'story_9',
    demographic: 'moderate_longterm',
    category: 'mixed',
    pathType: 'experimental',
    story: 'I tried three different approaches over 2 years - course, bootcamp, and self-study. Each taught me something different.',
    outcome: 'Combined approach led to unique skill set and consulting opportunities',
    timeframe: '2 years of exploration',
    challenges: 'Felt scattered sometimes, like I wasn\'t making progress',
    surprises: 'The "failed" attempts actually built a broader foundation than any single path',
    advice: 'Exploration itself is valuable. Every attempt teaches you something about how you learn best'
  }
];

// ============================================================================
// WISDOM PATTERNS - Aggregated insights from similar decision-makers
// ============================================================================

export const wisdomPatterns = {
  education: {
    bootcamp: {
      completionFactors: "68% of people with similar timelines found the peer support crucial to completion",
      timeManagement: "Most successful participants blocked out dedicated learning hours and protected them fiercely",
      financialPlanning: "Those who saved 3+ months of expenses felt less financial stress during the program",
      careerTransition: "Portfolio projects started during the bootcamp often became talking points in job interviews"
    },
    degree: {
      flexibility: "Most flexible learners appreciated being able to slow down during life events",
      employer: "62% received tuition support or promotion consideration from current employers",
      timeCommitment: "Successful students averaged 12-18 hours/week, with higher success at consistent vs. intense schedules",
      networking: "Online degree students who joined study groups had 40% higher completion rates"
    },
    selfDirected: {
      structure: "Success correlates strongly with having an accountability system - mentor, study group, or public commitment",
      progress: "People who shipped projects every 2-3 weeks maintained motivation better than those focusing on theory",
      validation: "Early feedback from real users/employers helped guide learning priorities more than curriculum alone"
    }
  },
  
  business: {
    consulting: {
      preparation: "People who started with 3+ months expenses saved felt more confident in year one",
      clientAcquisition: "Former colleagues and professional network provided 70% of initial clients",
      pricing: "Those who researched market rates and started at 80% of target had smoother client relationships",
      growth: "Successful consultants typically specialized in 1-2 areas rather than being generalists"
    },
    sideProject: {
      validation: "Those who validated their idea with 10+ potential customers had higher success rates",
      timeManagement: "Most sustainable side projects required 8-12 hours/week minimum to maintain momentum",
      transition: "Successful transitions happened when side income reached 60-70% of day job salary",
      skillTransfer: "Day job skills often provided unexpected advantages in entrepreneurial ventures"
    },
    gradualTransition: {
      riskManagement: "Gradual approaches had 85% less financial stress but required more discipline to maintain momentum",
      employerRelations: "Transparency with current employer often led to supportive arrangements",
      timing: "Most successful gradual transitions took 12-24 months from start to full independence"
    }
  },

  // ============================================================================
  // CROSS-CATEGORY PATTERNS
  // ============================================================================
  universal: {
    familySupport: "Having explicit family conversations about goals and timeline improved success rates across all paths",
    mentalHealth: "People who planned for emotional ups and downs (support, self-care) reported higher satisfaction",
    community: "Every successful path involved connecting with others on similar journeys",
    iteration: "Most people changed course 1-2 times based on what they learned about themselves",
    timing: "Life transitions during stable personal periods (no major family/health changes) had smoother outcomes"
  }
};

// ============================================================================
// STORY MATCHING ALGORITHM
// ============================================================================

export const findRelevantStories = (userProfile, category = null, limit = 3) => {
  const { riskTolerance, timeline, topics = [], lensSettings = {} } = userProfile;
  
  let relevantStories = storyBlocks.filter(story => {
    // Match demographic profile
    const demographicMatch = story.demographic.includes(riskTolerance) || 
                           story.demographic.includes(timeline);
    
    // Match category if specified
    const categoryMatch = !category || story.category === category;
    
    return demographicMatch && categoryMatch;
  });

  // If no demographic matches, find stories from similar categories
  if (relevantStories.length === 0) {
    relevantStories = storyBlocks.filter(story => 
      !category || story.category === category
    );
  }

  // Sort by relevance (exact demographic matches first)
  relevantStories.sort((a, b) => {
    const aExactMatch = a.demographic === `${riskTolerance}_${timeline}`;
    const bExactMatch = b.demographic === `${riskTolerance}_${timeline}`;
    
    if (aExactMatch && !bExactMatch) return -1;
    if (!aExactMatch && bExactMatch) return 1;
    return 0;
  });

  return relevantStories.slice(0, limit);
};

// ============================================================================
// WISDOM PATTERN RETRIEVAL
// ============================================================================

export const getRelevantWisdom = (option, userProfile) => {
  const { category } = option;
  const patterns = wisdomPatterns[category] || {};
  
  // Determine which pattern is most relevant based on user's lens settings
  const { lensSettings = {} } = userProfile;
  
  if (lensSettings.financial && patterns.financialPlanning) {
    return patterns.financialPlanning;
  }
  
  if (lensSettings.familyImpact && wisdomPatterns.universal.familySupport) {
    return wisdomPatterns.universal.familySupport;
  }
  
  if (lensSettings.emotional && wisdomPatterns.universal.mentalHealth) {
    return wisdomPatterns.universal.mentalHealth;
  }
  
  // Default to the first available pattern
  const firstPattern = Object.values(patterns)[0];
  return firstPattern || wisdomPatterns.universal.community;
};

// ============================================================================
// STORY COMPONENTS FOR EASY INTEGRATION
// ============================================================================

export const StoryBlock = ({ story, compact = false }) => {
  if (compact) {
    return (
      <div className="bg-white/40 p-3 rounded-lg border-l-4 border-purple-200">
        <p className="text-sm text-gray-700 italic">"{story.story}"</p>
        <p className="text-xs text-gray-500 mt-1">{story.outcome}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/40 p-4 rounded-lg border-l-4 border-purple-200 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-gray-500">REAL STORY</h4>
        <span className="text-xs text-purple-600">Similar to you</span>
      </div>
      
      <p className="text-sm text-gray-700 italic">"{story.story}"</p>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">{story.outcome}</p>
        <p>Timeline: {story.timeframe}</p>
      </div>
      
      {story.challenges && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-medium">Real Challenge:</p>
          <p className="text-xs text-gray-600">{story.challenges}</p>
        </div>
      )}
      
      {story.advice && (
        <div className="bg-purple-50 p-2 rounded text-xs text-purple-700">
          <span className="font-medium">Their advice:</span> {story.advice}
        </div>
      )}
    </div>
  );
};

export const WisdomPattern = ({ pattern, category }) => {
  return (
    <div className="bg-gradient-to-r from-teal-50 to-purple-50 p-3 rounded-lg">
      <h4 className="text-xs font-medium text-gray-600 mb-1">PATTERN INSIGHT</h4>
      <p className="text-xs text-gray-700">{pattern}</p>
    </div>
  );
};

// ============================================================================
// STORY ANALYTICS & INSIGHTS
// ============================================================================

export const getStoryInsights = (stories) => {
  const insights = {
    totalStories: stories.length,
    averageTimeframe: calculateAverageTimeframe(stories),
    commonChallenges: extractCommonChallenges(stories),
    successFactors: extractSuccessFactors(stories),
    demographics: getdemographicBreakdown(stories)
  };

  return insights;
};

// Helper functions for analytics
const calculateAverageTimeframe = (stories) => {
  const timeframes = stories
    .map(s => s.timeframe)
    .filter(t => t && t.includes('month'))
    .map(t => parseInt(t.match(/\d+/)?.[0] || '0'));
  
  if (timeframes.length === 0) return 'varies';
  
  const average = timeframes.reduce((acc, t) => acc + t, 0) / timeframes.length;
  return `${Math.round(average)} months average`;
};

const extractCommonChallenges = (stories) => {
  const challenges = stories.map(s => s.challenges).filter(Boolean);
  // Simple keyword extraction - in production, this could be more sophisticated
  const keywords = ['time', 'money', 'support', 'motivation', 'balance'];
  
  return keywords.filter(keyword => 
    challenges.some(challenge => 
      challenge.toLowerCase().includes(keyword)
    )
  );
};

const extractSuccessFactors = (stories) => {
  const advice = stories.map(s => s.advice).filter(Boolean);
  const factors = [];
  
  if (advice.some(a => a.toLowerCase().includes('community') || a.toLowerCase().includes('support'))) {
    factors.push('community');
  }
  if (advice.some(a => a.toLowerCase().includes('consistent') || a.toLowerCase().includes('regular'))) {
    factors.push('consistency');
  }
  if (advice.some(a => a.toLowerCase().includes('plan') || a.toLowerCase().includes('structure'))) {
    factors.push('planning');
  }
  
  return factors;
};

const getdemographicBreakdown = (stories) => {
  const demographics = {};
  
  stories.forEach(story => {
    const demo = story.demographic;
    demographics[demo] = (demographics[demo] || 0) + 1;
  });
  
  return demographics;
};

// ============================================================================
// STORY CURATION FOR DIFFERENT USE CASES
// ============================================================================

// Get stories for specific reflection moments
export const getStoriesForReflection = (userJourney, currentOptions) => {
  const { stage, concerns, interests } = userJourney;
  
  let relevantStories = storyBlocks;
  
  // Filter by current concerns
  if (concerns.includes('financial')) {
    relevantStories = relevantStories.filter(story => 
      story.challenges?.toLowerCase().includes('money') ||
      story.advice?.toLowerCase().includes('financial')
    );
  }
  
  if (concerns.includes('time')) {
    relevantStories = relevantStories.filter(story =>
      story.challenges?.toLowerCase().includes('time') ||
      story.timeframe?.includes('month')
    );
  }
  
  return relevantStories.slice(0, 2);
};

// Get comparative stories for option analysis
export const getComparativeStories = (optionA, optionB, userProfile) => {
  const storiesA = findRelevantStories(userProfile, optionA.category, 2);
  const storiesB = findRelevantStories(userProfile, optionB.category, 2);
  
  return {
    optionA: storiesA,
    optionB: storiesB,
    commonThemes: findCommonThemes(storiesA, storiesB)
  };
};

const findCommonThemes = (storiesA, storiesB) => {
  const allStories = [...storiesA, ...storiesB];
  const themes = extractSuccessFactors(allStories);
  return themes;
};

// ============================================================================
// INTEGRATION WITH SAGE CONVERSATION
// ============================================================================

// Generate contextual stories for Sage to reference in conversation
export const getStoriesForSageContext = (conversationTopics, userProfile) => {
  let relevantStories = findRelevantStories(userProfile, null, 5);
  
  // Further filter by conversation topics
  if (conversationTopics.includes('career')) {
    relevantStories = relevantStories.filter(story => 
      story.category === 'education' || story.pathType.includes('career')
    );
  }
  
  if (conversationTopics.includes('financial')) {
    relevantStories = relevantStories.filter(story =>
      story.challenges?.toLowerCase().includes('money') ||
      story.cost || story.outcome?.toLowerCase().includes('income')
    );
  }
  
  return relevantStories.map(story => ({
    id: story.id,
    summary: `${story.outcome} (${story.timeframe})`,
    relevantQuote: story.advice || story.surprises,
    demographic: story.demographic
  }));
};

// ============================================================================
// EXPORT FORMAT FOR BRAHMA CONTEXT ENGINE
// ============================================================================

export const formatStoriesForBrahma = (stories, userSession) => {
  return {
    storyData: stories.map(story => ({
      id: story.id,
      demographic: story.demographic,
      pathway: story.pathType,
      outcome: story.outcome,
      timeframe: story.timeframe,
      relevanceScore: calculateRelevanceScore(story, userSession)
    })),
    patterns: wisdomPatterns,
    insights: getStoryInsights(stories),
    recommendations: {
      mostRelevantStory: stories[0]?.id,
      suggestedPatterns: Object.keys(wisdomPatterns.universal).slice(0, 3),
      nextStoryRequest: userSession.explorationCount >= 3 ? 'deeper' : 'broader'
    }
  };
};

const calculateRelevanceScore = (story, userSession) => {
  let score = 0;
  
  // Demographic match
  if (story.demographic.includes(userSession.riskTolerance)) score += 0.4;
  if (story.demographic.includes(userSession.timeline)) score += 0.4;
  
  // Topic alignment
  if (userSession.topics.some(topic => story.category === topic)) score += 0.2;
  
  return Math.min(score, 1.0);
};