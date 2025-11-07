import { recordSageStance, extractTopicTag } from "../sageMemoryEngine.js"; // Existing import
import { audit } from "../../kernel/memoryKernel.js";
import { MemoryKind, createACFMemory } from "./types.js";

export function upsertMemory(acfMemPartial) {
  const acfMem = createACFMemory(acfMemPartial);
  const kindPrefix = `[Kind: ${acfMem.kind}]`; // Prefix for existing schema

  // Map to sageMemoryEngine format (non-breaking)
  const entry = recordSageStance({
    TopicTag: acfMem.topic,
    SageStance: `${kindPrefix}\n${acfMem.content}`, // Encode kind in stance
    FullTranscript: "",
    EmotionState: acfMem.context?.emotion || "",
    UserOutcomeScore: acfMem.weight || 0
  });

  audit("acf_mem_upsert", { kind: acfMem.kind, id: entry.MemoryID || acfMem.id });
  return { ...entry, ...acfMem }; // Merge for ACF view
}

export function getByTopic(topic, options = { kinds: [], limit: 20 }) {
  const rows = []; // TODO: Hook into existing queryMemoriesByTopic or _debugGetAll from sageMemoryEngine
  // For v0.9, assume you add queryMemoriesByTopic to sageMemoryEngine.js (see modifications below)
  // Filter by topic lowercase
  const t = topic.toLowerCase();
  const filtered = rows.filter(r => (r.TopicTag || "").toLowerCase() === t);
  // Parse kind from SageStance prefix if options.kinds specified
  const withKinds = filtered.map(r => {
    const match = r.SageStance.match(/\[Kind: (.*?)\]/);
    return { ...r, parsedKind: match ? match[1] : MemoryKind.Fleeting };
  }).filter(r => !options.kinds.length || options.kinds.includes(r.parsedKind));

  return withKinds.slice(-options.limit).reverse();
}

export function decayFleeting(now = Date.now(), horizonSec = 3 * 24 * 3600) {
  // Future: Scan and remove Fleeting via TTL encoded in content or updatedAt
  // For v0.9, log only
  audit("acf_decay_run", { horizonSec });
}
