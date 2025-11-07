import React, { useEffect, useState } from "react";
import { X, Clock, Calendar, Download, RefreshCw } from "lucide-react";

/** Plan remaining terms from time & credit load (on-device) */
export default function TimeToCompletion({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [inps, setInps] = useState(() => {
    const saved = safeParse(localStorage.getItem("brahma_ttc_v1"));
    return {
      totalCredits: saved?.totalCredits ?? 36,
      completedCredits: saved?.completedCredits ?? 0,
      creditsPerCourse: saved?.creditsPerCourse ?? 3,
      weeksPerTerm: saved?.weeksPerTerm ?? 16,
      hoursPerWeekAvail: saved?.hoursPerWeekAvail ?? 12,
      studyHoursPerCredit: saved?.studyHoursPerCredit ?? 3, // std. guidance
      difficultyFactor: saved?.difficultyFactor ?? 1.1,     // 1.0-1.5
      startDateISO: saved?.startDateISO ?? new Date().toISOString(),
    };
  });

  useEffect(() => { try { localStorage.setItem("brahma_ttc_v1", JSON.stringify(inps)); } catch {} }, [inps]);

  const remainingCredits = Math.max(0, inps.totalCredits - inps.completedCredits);
  const hoursPerCreditWeek = inps.studyHoursPerCredit * inps.difficultyFactor;
  const creditsCapacityPerWeek = inps.hoursPerWeekAvail / Math.max(1, hoursPerCreditWeek);
  const coursesPerTerm = Math.max(1, Math.round(creditsCapacityPerWeek / inps.creditsPerCourse));
  const creditsPerTerm = coursesPerTerm * inps.creditsPerCourse;
  const termsNeeded = Math.max(1, Math.ceil(remainingCredits / Math.max(1, creditsPerTerm)));

  const finishDate = addWeeks(new Date(inps.startDateISO), termsNeeded * inps.weeksPerTerm);

  const reset = () => {
    localStorage.removeItem("brahma_ttc_v1");
    setInps({
      totalCredits: 36, completedCredits: 0, creditsPerCourse: 3, weeksPerTerm: 16,
      hoursPerWeekAvail: 12, studyHoursPerCredit: 3, difficultyFactor: 1.1,
      startDateISO: new Date().toISOString(),
    });
  };

  const exportJSON = () => {
    const payload = {
      type: "Brahma-TimeToCompletion",
      timestamp: new Date().toISOString(),
      inputs: inps,
      outputs: { remainingCredits, coursesPerTerm, creditsPerTerm, termsNeeded, finishDate: finishDate.toISOString() },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `brahma-ttc-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-3xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-semibold text-white">Time to Completion</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        {/* content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Field label="Total program credits" type="number" value={inps.totalCredits} onChange={(v)=>setInps({...inps,totalCredits:Number(v)})} />
            <Field label="Completed credits" type="number" value={inps.completedCredits} onChange={(v)=>setInps({...inps,completedCredits:Number(v)})} />
            <Field label="Credits per course" type="number" value={inps.creditsPerCourse} onChange={(v)=>setInps({...inps,creditsPerCourse:Number(v)})} />
            <Field label="Weeks per term" type="number" value={inps.weeksPerTerm} onChange={(v)=>setInps({...inps,weeksPerTerm:Number(v)})} />
          </div>

          <div className="space-y-3">
            <Field label="Hours available per week" type="number" value={inps.hoursPerWeekAvail} onChange={(v)=>setInps({...inps,hoursPerWeekAvail:Number(v)})} />
            <Field label="Study hours per credit (guideline)" type="number" step="0.5" value={inps.studyHoursPerCredit} onChange={(v)=>setInps({...inps,studyHoursPerCredit:Number(v)})} />
            <Field label="Difficulty factor (1.0-1.5)" type="number" step="0.1" value={inps.difficultyFactor} onChange={(v)=>setInps({...inps,difficultyFactor:Number(v)})} />
            <Field label="Start date" type="date" value={toDateInput(inps.startDateISO)} onChange={(v)=>setInps({...inps,startDateISO:new Date(v).toISOString()})} icon={<Calendar className="w-4 h-4" />} />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <KPI label="Remaining credits" value={remainingCredits} />
            <KPI label="Courses per term (suggested)" value={coursesPerTerm} />
            <KPI label="Credits per term" value={creditsPerTerm} />
            <KPI label="Terms needed" value={termsNeeded} />
            <KPI label="Projected finish" value={finishDate.toLocaleDateString()} />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button onClick={exportJSON} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={reset} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function Field({ label, type="text", value, onChange, step, icon }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={type}
          step={step}
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          className={`w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 ${icon?"pl-9":""}`}
        />
      </div>
    </label>
  );
}

function KPI({ label, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="text-xs text-gray-300 mb-1">{label}</div>
      <div className="text-xl font-semibold text-blue-200">{String(value)}</div>
    </div>
  );
}

function safeParse(s){ try { return JSON.parse(s); } catch { return null; } }
function addWeeks(date, w){ const d=new Date(date); d.setDate(d.getDate()+w*7); return d; }
function toDateInput(iso){ const d=new Date(iso); return d.toISOString().slice(0,10); }
