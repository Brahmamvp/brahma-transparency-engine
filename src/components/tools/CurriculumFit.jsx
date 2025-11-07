import React, { useEffect, useMemo, useState } from "react";
import { X, FileText, Target, Download, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";

/** Match program/course coverage to a target job/skills (on-device) */
export default function CurriculumFit({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [job, setJob] = useState(() => localStorage.getItem("brahma_cf_job") || "");
  const [courses, setCourses] = useState(() => localStorage.getItem("brahma_cf_courses") || "");
  const [extraSkills, setExtraSkills] = useState(() => localStorage.getItem("brahma_cf_extra") || "python, sql, cloud, security");
  const [minWeight, setMinWeight] = useState(() => Number(localStorage.getItem("brahma_cf_minw") || 1));

  useEffect(()=>{ try { localStorage.setItem("brahma_cf_job", job); } catch{} }, [job]);
  useEffect(()=>{ try { localStorage.setItem("brahma_cf_courses", courses); } catch{} }, [courses]);
  useEffect(()=>{ try { localStorage.setItem("brahma_cf_extra", extraSkills); } catch{} }, [extraSkills]);
  useEffect(()=>{ try { localStorage.setItem("brahma_cf_minw", String(minWeight)); } catch{} }, [minWeight]);

  const { skills, matched, missing, coverage } = useMemo(() => {
    const target = extractSkills(job + " " + extraSkills);
    const offered = extractSkills(courses, /*isCourseList*/true);
    const { map: tmap } = countMap(target);
    const { set: oset } = countMap(offered);
    const above = Object.entries(tmap).filter(([k,w]) => w >= minWeight).map(([k]) => k);

    const matched = above.filter((k) => hasSynonym(k, oset));
    const missing = above.filter((k) => !hasSynonym(k, oset));
    const coverage = above.length ? Math.round((matched.length / above.length) * 100) : 0;

    return { skills: above, matched, missing, coverage };
  }, [job, courses, extraSkills, minWeight]);

  const reset = () => {
    setJob(""); setCourses(""); setExtraSkills("python, sql, cloud, security"); setMinWeight(1);
  };

  const exportJSON = () => {
    const payload = {
      type: "Brahma-CurriculumFit",
      timestamp: new Date().toISOString(),
      inputs: { job, courses, extraSkills, minWeight },
      outputs: { skills, matched, missing, coverage }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `brahma-curriculum-fit-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-5xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-300" />
            <h2 className="text-lg font-semibold text-white">Curriculum Fit</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        {/* content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Area label="Target role / job description">
              <textarea
                value={job}
                onChange={(e)=>setJob(e.target.value)}
                placeholder="Paste a job description or role requirements…"
                className="w-full h-40 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </Area>
            <Area label="Extra target skills (comma-separated)">
              <input
                value={extraSkills}
                onChange={(e)=>setExtraSkills(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </Area>
            <Area label="Minimum importance to count (1-4)">
              <input
                type="number" min={1} max={4} step={1}
                value={minWeight}
                onChange={(e)=>setMinWeight(Number(e.target.value))}
                className="w-28 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </Area>

            <div className="flex gap-3">
              <button onClick={exportJSON} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={reset} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-300" /> Program courses / modules
              </h4>
              <textarea
                value={courses}
                onChange={(e)=>setCourses(e.target.value)}
                placeholder="List or paste your course titles and brief descriptions…"
                className="w-full h-28 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <p className="mt-2 text-[11px] text-gray-300">
                Tip: include short descriptions (e.g., "Advanced SQL for Analytics" or "ML Ops: CI/CD, Docker, Cloud").
              </p>
            </div>

            <KPIBar coverage={coverage} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ListCard title="Matched skills" icon={<CheckCircle className="w-4 h-4 text-emerald-300" />} items={matched} empty="No matches yet." />
              <ListCard title="Missing skills" icon={<AlertTriangle className="w-4 h-4 text-rose-300" />} items={missing} empty="Nothing missing 🎉" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function Area({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-300 mb-1">{label}</div>
      {children}
    </div>
  );
}

function KPIBar({ coverage }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white">Coverage</div>
        <div className="text-sm text-purple-100">{coverage}%</div>
      </div>
      <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-purple-400" style={{ width: `${coverage}%` }} />
      </div>
      <div className="text-[11px] text-gray-300 mt-2">
        Based on keyword overlap / synonyms; raise the importance threshold to focus on critical skills only.
      </div>
    </div>
  );
}

function ListCard({ title, icon, items, empty }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="text-sm font-medium text-white mb-2 flex items-center gap-2">{icon}{title}</div>
      {items.length ? (
        <ul className="text-xs text-gray-200 grid grid-cols-2 gap-2">
          {items.map((s) => (
            <li key={s} className="bg-white/10 rounded-md px-2 py-1">{s}</li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-gray-400">{empty}</div>
      )}
    </div>
  );
}

// very lightweight keyword extraction with synonyms
function extractSkills(text, isCourseList = false) {
  const t = (text || "").toLowerCase();
  // keep letters, digits, +, #, . and spaces
  const tokens = t.replace(/[^\w\s\+\#\.]/g, " ").split(/\s+/).filter(Boolean);

  // collapse common multi-words for better matching
  const joinPairs = [
    ["machine", "learning", "machine learning"],
    ["project", "management", "project management"],
    ["data", "analysis", "data analysis"],
    ["data", "engineering", "data engineering"],
    ["cloud", "computing", "cloud computing"],
    ["artificial", "intelligence", "artificial intelligence"],
    ["natural", "language", "natural language"],
  ];
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    const two = tokens[i] + " " + (tokens[i + 1] || "");
    const replaced = joinPairs.find(([a, b]) => two === `${a} ${b}`);
    if (replaced) {
      out.push(replaced[2]); i++;
    } else {
      out.push(tokens[i]);
    }
  }

  // optionally weight courses a bit higher by repeating tokens
  return isCourseList ? out.concat(out) : out;
}

function countMap(arr) {
  const map = {};
  const set = new Set();
  for (const t of arr) { map[t] = (map[t] || 0) + 1; set.add(t); }
  return { map, set };
}

const SYNONYMS = {
  js: ["javascript"],
  javascript: ["js"],
  ts: ["typescript"],
  python: ["py"],
  sql: ["postgres", "mysql", "sqlite"],
  cloud: ["aws", "azure", "gcp", "cloud computing"],
  ml: ["machine learning", "mlops", "ml ops"],
  "machine learning": ["ml", "mlops", "ml ops"],
  nlp: ["natural language processing", "nlp"],
  "natural language": ["nlp", "natural language processing"],
  ops: ["devops", "mlops"],
  pm: ["product management", "project management"],
  "project management": ["pm"],
  docker: ["containers"],
  security: ["infosec", "cybersecurity"],
};

function hasSynonym(word, offeredSet) {
  if (offeredSet.has(word)) return true;
  const syns = SYNONYMS[word] || [];
  return syns.some((s) => offeredSet.has(s));
}

function safeParse(s){ try { return JSON.parse(s); } catch { return null; } }
