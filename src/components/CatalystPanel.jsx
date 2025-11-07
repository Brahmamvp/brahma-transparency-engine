import React, { useEffect } from "react";
import { audit } from "../kernel/memoryKernel.js";
import { Zap, Rocket, Target, CheckCircle2 } from "lucide-react";

/**
 * CatalystPanel
 * Action layer for the Catalyst persona.
 * Synthesizes insights into small, low-risk next steps.
 */
const CatalystPanel = ({ theme }) => {
  useEffect(() => {
    audit("catalyst_panel_opened", { ts: new Date().toISOString() });
  }, []);

  const actions = [
    {
      icon: <Rocket size={20} />,
      title: "Launch Small",
      desc: "Catalyst proposes one small, reversible experiment to test momentum.",
    },
    {
      icon: <Target size={20} />,
      title: "Clarify Objective",
      desc: "Rephrase your goal to ensure it's actionable and measurable.",
    },
    {
      icon: <Zap size={20} />,
      title: "Energy Check",
      desc: "Identifying what feels alive right now to guide your next step.",
    },
    {
      icon: <CheckCircle2 size={20} />,
      title: "Commit & Reflect",
      desc: "Commit lightly, track the emotional response, and learn quickly.",
    },
  ];

  return (
    <div
      className={`w-full h-full overflow-y-auto p-8 ${theme?.glass || "bg-white/40 backdrop-blur-md"} border border-white/60 rounded-xl shadow-inner`}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-gray-800">Catalyst</h1>
        <p className="text-gray-600">Turning insight into gentle motion</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {actions.map((a, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-white/50 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 text-amber-700 font-medium">
              {a.icon}
              <span>{a.title}</span>
            </div>
            <p className="text-sm text-gray-600">{a.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-gray-500 text-sm">
          Catalyst translates clarity into compassionate action — always reversible.
        </p>
      </div>
    </div>
  );
};

export default CatalystPanel;