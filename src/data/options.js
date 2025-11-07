// src/data/options.js

// helper: sample options for each mode
function getSampleOptions(mode) {
  if (mode === "education") {
    return [
      {
        id: 101,
        title: "CS Master's (18–24 months)",
        description: "Pursue a full-time Computer Science master's to deepen foundations and open research/ML roles.",
        cost: "$45k–$80k tuition + living",
        risk: "Medium",
        considerations: [
          "Opportunity cost (lost salary)",
          "Brand/network of university",
          "Research vs. professional track",
        ],
        notes: "Can target assistantships to offset costs.",
      },
      {
        id: 102,
        title: "Intensive Data/AI Bootcamp (12–24 weeks)",
        description: "Practical, portfolio-driven program aimed at job transition into data/AI roles.",
        cost: "$8k–$18k tuition",
        risk: "Medium",
        considerations: [
          "Employer recognition varies",
          "Strong portfolio needed",
          "Career services quality matters",
        ],
        notes: "Look for outcomes transparency (placement rates).",
      },
      {
        id: 103,
        title: "Micro-credentials while working (6–12 months)",
        description: "Stack certificates (e.g., cloud, security, PM) while staying employed.",
        cost: "$1k–$5k total",
        risk: "Low",
        considerations: [
          "Slower path but less risk",
          "Immediate application on the job",
          "Requires consistent weekly time",
        ],
        notes: "Use employer tuition assistance if available.",
      },
      {
        id: 104,
        title: "Defer 1 year and self-study",
        description: "Build a focused portfolio, internships, and publications before committing to a degree.",
        cost: "Low direct cost",
        risk: "Medium",
        considerations: [
          "Self-discipline required",
          "Unstructured path",
          "Can achieve strong signal with projects",
        ],
        notes: "Pair with mentorship/accountability.",
      },
    ];
  }

  // default: career mode
  return [
    {
      id: 1,
      title: "Take the remote position",
      description: "Accept the fully remote role with better compensation but less team interaction",
      cost: "$2k relocation savings",
      risk: "Medium",
      considerations: [
        "Less face-to-face collaboration",
        "Better work-life balance potential",
        "Higher compensation package",
      ],
      notes: "Company has strong remote culture",
    },
    {
      id: 2,
      title: "Stay in current role",
      description: "Remain with current team and negotiate for better conditions",
      cost: "Opportunity cost of new role",
      risk: "Low",
      considerations: [
        "Familiar environment",
        "Known career progression",
        "May limit growth opportunities",
      ],
      notes: "Current manager is supportive",
    },
  ];
}

export default getSampleOptions;
