// Tone blending per Catalyst blueprint: gentle if anxious/drained, partner if curious high, crisp otherwise.
export const toneBlend = ({ base, emotion = "calm", curiosity = 0.5 }) => {
  const soft = (t) => `Gentle note — ${t}`;
  const partner = (t) => `We can try this: ${t}`;
  const crisp = (t) => `Next step: ${t}`;
  if (emotion === "anxious" || emotion === "drained") return soft(base);
  if (curiosity >= 0.7) return partner(base);
  return crisp(base);
};