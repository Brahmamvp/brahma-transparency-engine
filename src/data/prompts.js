// /src/data/prompts.js
export const decisionPrompts = {
  career: {
    keywords: ['career', 'job', 'work', 'professional'],
    responses: [
      "I hear you're thinking about career paths. What's drawing you toward this change?",
      "Career transitions can feel big. What matters most to you in your next role?",
      "Let's explore this together. What aspects of work energize you?"
    ],
    deepDive: [
      "What does success in this path look like for you personally?",
      "How does this align with where you see yourself in 5 years?",
      "What concerns you most about making this transition?"
    ]
  },
  financial: {
    keywords: ['money', 'finance', 'cost', 'expensive', 'salary', 'income'],
    responses: [
      "Money is definitely part of the picture. What feels most important to you about the financial aspect?",
      "Let's look at this from a few angles. What's your comfort level with the investment?",
      "Financial decisions can feel heavy. What would make this feel more manageable?"
    ],
    deepDive: [
      "Beyond the upfront cost, what financial outcomes are you hoping for?",
      "How does this investment fit into your broader financial picture?",
      "What would need to be true for this to feel financially comfortable?"
    ]
  },
  emotional: {
    keywords: ['scared', 'afraid', 'nervous', 'anxiety', 'excited', 'worried'],
    responses: [
      "It makes sense that this feels uncertain. What specifically feels most concerning?",
      "Those feelings are completely valid. What would help you feel more grounded as you think about this?",
      "Uncertainty can be uncomfortable. What support do you have as you work through this?"
    ],
    deepDive: [
      "When you imagine yourself taking this step, what comes up for you?",
      "What would you need to feel more confident about this direction?",
      "How do you typically navigate big decisions when emotions are mixed?"
    ]
  },
  family: {
    keywords: ['family', 'partner', 'spouse', 'kids', 'children', 'relationship'],
    responses: [
      "Family considerations add another layer. How are they feeling about this potential change?",
      "It sounds like this affects more than just you. What conversations have you had with them?",
      "Family dynamics matter. What would make this work for everyone involved?"
    ],
    deepDive: [
      "How do you balance your own growth with family stability?",
      "What support would your family need during this transition?",
      "How might this change strengthen your relationships long-term?"
    ]
  }
};