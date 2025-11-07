// Lightweight temporal intelligence helpers (no deps)

export const getCalendarLine = (d = new Date()) => {
  // e.g., "Friday, September 12"
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export const timeGreeting = (d = new Date()) => {
  const h = d.getHours();
  if (h < 6) return "Early thoughts often carry special wisdom.";
  if (h < 12) return "Good morning. What's stirring in your mind today?";
  if (h < 17) return "How has your day been unfolding?";
  if (h < 22) return "Evening reflections have their own quality.";
  return "Late-night contemplations can be profound.";
};

// Simple diff → "3d ago" / "12h ago"
export const timeAgo = (sinceISO) => {
  if (!sinceISO) return "";
  const diffMs = Date.now() - new Date(sinceISO).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// Mode-specific wisdom seeds
const SEEDS = {
  personal: [
    "Sometimes a small choice reveals a big truth. Is there a 'small' decision tugging at you?",
    "Where might you be over-managing outcomes instead of trusting your direction?",
  ],
  professional: [
    "What's the reversible version of this choice you can test safely?",
    "If you had to ship a 70% solution next week, what would it look like?",
  ],
  research: [
    "What minimum evidence would falsify your current view?",
    "What alternative explanation fits the same observations?",
  ],
};

export const getWisdomSeed = (mode = "personal") => {
  const list = SEEDS[mode] || SEEDS.personal;
  return list[Math.floor(Math.random() * list.length)];
};