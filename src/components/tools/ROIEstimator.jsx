import React, { useEffect, useMemo, useState } from "react";
import { X, DollarSign, TrendingUp, Calendar, Download, RefreshCw } from "lucide-react";

/** On-device degree ROI model (NPV & payback) */
export default function ROIEstimator({ isOpen, onClose, seed }) {
  if (!isOpen) return null;

  // -------- Inputs (persisted) --------
  const [inputs, setInputs] = useState(() => {
    const saved = safeParse(localStorage.getItem("brahma_roi_v1"));
    return {
      // income
      currentSalary: saved?.currentSalary ?? 90000,
      expectedSalary: saved?.expectedSalary ?? 125000,
      successProb: saved?.successProb ?? 0.75, // chance new salary materializes

      // costs / timing
      tuition: saved?.tuition ?? 30000,
      livingCosts: saved?.livingCosts ?? 15000,
      durationYears: saved?.durationYears ?? 1, // 1 year program
      partTimeIncome: saved?.partTimeIncome ?? 15000,

      // growth & finance
      baseGrowth: saved?.baseGrowth ?? 0.03, // baseline annual raise
      newGrowth: saved?.newGrowth ?? 0.05,   // post-degree annual raise
      discountRate: saved?.discountRate ?? 0.07,
      horizonYears: saved?.horizonYears ?? 10, // analysis window
    };
  });

  // Seed from a selected option if provided
  useEffect(() => {
    if (!seed) return;
    const costNum = pullCurrency(seed.cost);
    if (costNum > 0) {
      setInputs((p) => ({ ...p, tuition: costNum }));
    }
  }, [seed]);

  useEffect(() => {
    try { localStorage.setItem("brahma_roi_v1", JSON.stringify(inputs)); } catch {}
  }, [inputs]);

  // -------- Calculations --------
  const results = useMemo(() => computeROI(inputs), [inputs]);

  const reset = () => {
    localStorage.removeItem("brahma_roi_v1");
    setInputs({
      currentSalary: 90000,
      expectedSalary: 125000,
      successProb: 0.75,
      tuition: 30000,
      livingCosts: 15000,
      durationYears: 1,
      partTimeIncome: 15000,
      baseGrowth: 0.03,
      newGrowth: 0.05,
      discountRate: 0.07,
      horizonYears: 10,
    });
  };

  const exportJSON = () => {
    const payload = {
      type: "Brahma-ROI-Estimator",
      timestamp: new Date().toISOString(),
      inputs,
      results,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `brahma-roi-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-5xl">
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-300" />
            <h2 className="text-lg font-semibold text-white">ROI Estimator</h2>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        {/* content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-4">
            <Section title="Income">
              <NumberField label="Current salary" value={inputs.currentSalary} onChange={(v)=>setInputs({...inputs, currentSalary:v})} prefix="$" />
              <NumberField label="Expected post-degree salary" value={inputs.expectedSalary} onChange={(v)=>setInputs({...inputs, expectedSalary:v})} prefix="$" />
              <SliderField label="Success probability" value={inputs.successProb} min={0} max={1} step={0.05}
                onChange={(v)=>setInputs({...inputs, successProb:v})} format={(v)=>`${Math.round(v*100)}%`} />
            </Section>

            <Section title="Costs & timing">
              <NumberField label="Tuition (total)" value={inputs.tuition} onChange={(v)=>setInputs({...inputs, tuition:v})} prefix="$" />
              <NumberField label="Living costs during study (total)" value={inputs.livingCosts} onChange={(v)=>setInputs({...inputs, livingCosts:v})} prefix="$" />
              <NumberField label="Program length (years)" value={inputs.durationYears} onChange={(v)=>setInputs({...inputs, durationYears:v})} min={0.25} step={0.25} icon={<Calendar className="w-4 h-4" />} />
              <NumberField label="Part-time income during study (per year)" value={inputs.partTimeIncome} onChange={(v)=>setInputs({...inputs, partTimeIncome:v})} prefix="$" />
            </Section>

            <Section title="Growth & finance">
              <SliderField label="Baseline annual raise" value={inputs.baseGrowth} min={0} max={0.15} step={0.005}
                onChange={(v)=>setInputs({...inputs, baseGrowth:v})} format={(v)=>`${Math.round(v*100)}%`} />
              <SliderField label="Post-degree annual raise" value={inputs.newGrowth} min={0} max={0.15} step={0.005}
                onChange={(v)=>setInputs({...inputs, newGrowth:v})} format={(v)=>`${Math.round(v*100)}%`} />
              <SliderField label="Discount rate" value={inputs.discountRate} min={0} max={0.2} step={0.005}
                onChange={(v)=>setInputs({...inputs, discountRate:v})} format={(v)=>`${Math.round(v*100)}%`} />
              <NumberField label="Horizon (years)" value={inputs.horizonYears} onChange={(v)=>setInputs({...inputs, horizonYears:v})} min={5} max={20} />
            </Section>

            <div className="flex gap-3 pt-2">
              <button onClick={reset} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
              <button onClick={exportJSON} className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-3 space-y-4">
            <KPIRow items={[
              { label: "NPV (vs staying)", value: money(results.npv), accent: "text-emerald-300" },
              { label: "Payback year", value: results.paybackYear ?? "—", accent: "text-blue-300" },
              { label: "Cumulative Δ at horizon", value: money(results.cumDeltaAtHorizon), accent: "text-pink-300" },
            ]} />

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-300" /> Year-by-year deltas</h4>
              <div className="grid grid-cols-6 text-xs text-gray-300 border-b border-white/10 pb-1">
                <span>Year</span><span className="text-right">Base</span><span className="text-right">Study/New</span><span className="text-right">Δ</span><span className="text-right">Disc. Δ</span><span className="text-right">Cum. Δ</span>
              </div>
              <div className="max-h-64 overflow-y-auto text-xs">
                {results.rows.map((r) => (
                  <div key={r.year} className="grid grid-cols-6 py-1 border-b border-white/5">
                    <span className="text-gray-400">Y{r.year}</span>
                    <span className="text-right">{money(r.base)}</span>
                    <span className="text-right">{money(r.edu)}</span>
                    <span className={`text-right ${r.delta>=0?"text-emerald-300":"text-rose-300"}`}>{money(r.delta)}</span>
                    <span className="text-right">{money(r.discDelta)}</span>
                    <span className={`text-right ${r.cumDelta>=0?"text-emerald-200":"text-rose-200"}`}>{money(r.cumDelta)}</span>
                  </div>
                ))}
              </div>
              {results.paybackYear && (
                <div className="mt-3 text-xs text-gray-300">
                  Break-even occurs in <span className="text-white font-medium">Year {results.paybackYear}</span>.
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
              <p className="text-sm text-purple-100">
                Tip: raise <span className="font-medium">success probability</span> conservatively unless you have strong evidence (placement data, portfolio, internships).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */
function computeROI({
  currentSalary, expectedSalary, successProb,
  tuition, livingCosts, durationYears, partTimeIncome,
  baseGrowth, newGrowth, discountRate, horizonYears,
}) {
  const D = Math.max(0, durationYears);
  const H = Math.max(1, Math.round(horizonYears));
  const totalStudyCostPerYear = (tuition + livingCosts) / Math.max(1, D);

  const rows = [];
  let cumDelta = 0;
  let npv = 0;
  let paybackYear = null;

  for (let t = 1; t <= H; t++) {
    const base = currentSalary * Math.pow(1 + baseGrowth, t - 1);

    let eduIncome;
    if (t <= D) {
      // study period: part-time income minus costs
      eduIncome = (partTimeIncome * Math.pow(1 + baseGrowth, t - 1)) - totalStudyCostPerYear;
    } else {
      // post-degree: expected outcome blended with baseline as fallback
      const postNew = expectedSalary * Math.pow(1 + newGrowth, t - D - 1);
      const blended = successProb * postNew + (1 - successProb) * base; // fallback ~ base
      eduIncome = blended;
    }

    const delta = eduIncome - base;
    cumDelta += delta;
    const discDelta = delta / Math.pow(1 + discountRate, t);
    npv += discDelta;

    if (paybackYear === null && cumDelta >= 0) {
      paybackYear = t;
    }

    rows.push({ year: t, base, edu: eduIncome, delta, discDelta, cumDelta });
  }

  return {
    rows,
    npv,
    paybackYear,
    cumDeltaAtHorizon: cumDelta,
  };
}

function NumberField({ label, value, onChange, prefix, min, max, step=1, icon }) {
  return (
    <label className="block">
      <span className="block text-xs text-gray-300 mb-1">{label}</span>
      <div className="relative">
        {icon ? <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div> : null}
        <input
          type="number"
          value={value}
          min={min} max={max} step={step}
          onChange={(e)=>onChange(Number(e.target.value))}
          className={`w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/50 ${icon?"pl-9":""}`}
        />
        {prefix && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{prefix}</div>}
      </div>
    </label>
  );
}

function SliderField({ label, value, onChange, min=0, max=1, step=0.01, format=(v)=>v.toFixed(2) }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-300">{label}</span>
        <span className="text-xs text-gray-200">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e)=>onChange(Number(e.target.value))}
        className="w-full accent-purple-400"
      />
    </label>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-medium text-white mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function KPIRow({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((k, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="text-xs text-gray-300 mb-1">{k.label}</div>
          <div className={`text-xl font-semibold ${k.accent}`}>{k.value}</div>
        </div>
      ))}
    </div>
  );
}

function money(n) {
  if (isNaN(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
function pullCurrency(str) {
  if (!str) return 0;
  const m = String(str).replace(/[, ]/g, "").match(/-?\$?(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : 0;
}
