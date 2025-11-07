// src/components/onboarding/OnboardingFlow.jsx
import React, { useState } from "react";
import SageIntro from "./SageIntro.jsx";
import SageNamingRitual from "./SageNamingRitual.jsx";
import AvatarSelector from "./AvatarSelector.jsx";
import OnboardingStatus from "./OnboardingStatus.jsx";

const OnboardingFlow = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [sageData, setSageData] = useState({
    name: "",
    form: "orb",
    emotion: "peaceful",
    season: "",
    memory: "",
    intention: ""
  });

  const next = (updates) => {
    setSageData((prev) => ({ ...prev, ...updates }));
    setStep((s) => s + 1);
  };

  const finish = (updates) => {
    const finalData = { ...sageData, ...updates, createdAt: new Date().toISOString() };
    localStorage.setItem("brahma_sage", JSON.stringify(finalData));
    localStorage.setItem("onboardingComplete", "true");
    onComplete(finalData);
  };

  const steps = [
    <SageIntro key="intro" onNext={next} />,
    <SageNamingRitual key="naming" onNext={next} />,
    <AvatarSelector key="avatar" onNext={next} />,
    <div key="season" className="flex flex-col items-center text-white space-y-6">
      <h2 className="text-2xl">What season of life are you moving through?</h2>
      <div className="grid grid-cols-2 gap-4">
        {["Spring – New growth", "Summer – In full bloom", "Autumn – Harvesting", "Winter – Rest & reflection"].map((season) => (
          <button
            key={season}
            onClick={() => next({ season })}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            {season}
          </button>
        ))}
      </div>
    </div>,
    <div key="memory" className="flex flex-col items-center text-white space-y-6">
      <h2 className="text-2xl">How should I remember our conversations?</h2>
      <div className="grid grid-cols-1 gap-3 max-w-md">
        {[
          { id: "sacred", label: "Sacred Memory – Remember all" },
          { id: "selective", label: "Selective – Insights only" },
          { id: "flow", label: "Flow State – Start fresh each time" }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => next({ memory: m.id })}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>,
    <div key="intention" className="flex flex-col items-center text-white space-y-6">
      <h2 className="text-2xl">What would be most helpful right now?</h2>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        {["Clarity on decisions", "Someone to witness", "Space to reflect", "Open exploration"].map((intention) => (
          <button
            key={intention}
            onClick={() => finish({ intention })}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition"
          >
            {intention}
          </button>
        ))}
      </div>
    </div>
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-6">
      <OnboardingStatus currentStep={step} totalSteps={steps.length} />
      <div className="w-full max-w-2xl">{steps[step]}</div>
    </div>
  );
};

export default OnboardingFlow;