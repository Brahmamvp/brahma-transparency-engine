import React, { useState } from 'react';
import { User, Building, Shield, Brain, Sparkles, Sliders } from 'lucide-react';
import EnterpriseConfigForm from './EnterpriseConfigForm';
import AgentEthicsForm from './AgentEthicsForm';
import AgentMemoryPreview from './AgentMemoryPreview';

const AgentForge = ({ agent, onUpdate, className = "" }) => {
  const [currentStep, setCurrentStep] = useState('basic');
  const [sageAssisted, setSageAssisted] = useState(false);
  const [isEnterpriseMode, setIsEnterpriseMode] = useState(
    localStorage.getItem('brahma_enterprise_mode') === 'true'
  );

  const personalRoles = [
    { id: "coach", name: "Life Coach", description: "Supportive guidance and goal-setting" },
    { id: "analyst", name: "Research Analyst", description: "Deep analysis and insight extraction" },
    { id: "creative", name: "Creative Partner", description: "Brainstorming and ideation" },
    { id: "mentor", name: "Technical Mentor", description: "Skills development and learning" },
    { id: "negotiator", name: "Negotiation Coach", description: "Strategic communication" },
    { id: "therapist", name: "Reflection Guide", description: "Emotional processing and clarity" },
  ];

  const enterpriseRoles = [
    { id: "compliance-officer", name: "Compliance Monitor", description: "SOX, GDPR, regulatory oversight" },
    { id: "risk-analyst", name: "Risk Assessment Agent", description: "Threat modeling, risk scoring" },
    { id: "security-auditor", name: "Security Auditor", description: "Access reviews, vulnerability assessment" },
    { id: "data-steward", name: "Data Governance Agent", description: "Data quality, lineage, classification" },
    { id: "process-optimizer", name: "Process Intelligence", description: "Workflow analysis, efficiency optimization" },
    { id: "vendor-manager", name: "Vendor Risk Agent", description: "Third-party risk, contract analysis" },
    { id: "financial-analyst", name: "Financial Intelligence", description: "Budget analysis, cost optimization" },
    { id: "hr-specialist", name: "HR Policy Agent", description: "Employee relations, policy compliance" },
    { id: "legal-counsel", name: "Legal Review Agent", description: "Contract review, legal risk assessment" },
    { id: "it-governance", name: "IT Governance Agent", description: "System access, security protocols" }
  ];

  const roles = isEnterpriseMode ? [...personalRoles, ...enterpriseRoles] : personalRoles;

  const steps = isEnterpriseMode 
    ? [
        { id: 'basic', name: 'Basics', icon: User },
        { id: 'enterprise', name: 'Enterprise', icon: Building },
        { id: 'ethics', name: 'Ethics', icon: Shield },
        { id: 'memory', name: 'Memory', icon: Brain }
      ]
    : [
        { id: 'basic', name: 'Basics', icon: User },
        { id: 'ethics', name: 'Ethics', icon: Shield },
        { id: 'memory', name: 'Memory', icon: Brain }
      ];

  const businessUnits = [
    "Finance", "Legal", "HR", "IT", "Operations", "Sales", "Marketing", 
    "Compliance", "Risk Management", "Procurement", "Customer Service"
  ];

  const complianceFrameworks = [
    "SOX", "GDPR", "HIPAA", "PCI-DSS", "ISO 27001", "NIST", "COBIT", 
    "ITIL", "Basel III", "Dodd-Frank", "CCPA", "SOC 2"
  ];

  const dataClassifications = [
    { value: "public", label: "Public", description: "Information that can be shared openly" },
    { value: "internal", label: "Internal", description: "Information for internal use only" },
    { value: "confidential", label: "Confidential", description: "Sensitive business information" },
    { value: "restricted", label: "Restricted", description: "Highly sensitive, need-to-know basis" }
  ];

  const riskLevels = [
    { value: "low", label: "Low Risk", color: "text-green-600", description: "Standard operations" },
    { value: "medium", label: "Medium Risk", color: "text-yellow-600", description: "Requires monitoring" },
    { value: "high", label: "High Risk", color: "text-orange-600", description: "Enhanced controls needed" },
    { value: "critical", label: "Critical Risk", color: "text-red-600", description: "Executive approval required" }
  ];

  const getSageSuggestions = () => {
    if (!sageAssisted) return null;
    
    const enterpriseSuggestions = {
      "compliance-officer": {
        name: "Sentinel",
        corePrompt: "You are a meticulous compliance monitor who ensures all business activities align with regulatory requirements. You provide clear guidance on policy adherence and flag potential violations.",
        ethics: {
          intent: "Maintain regulatory compliance and minimize legal risk",
          emotionalTone: "neutrally",
          longTermPurpose: "Build a culture of compliance and risk awareness"
        },
        enterprise: {
          riskClassification: "high",
          dataClassification: "confidential",
          complianceFrameworks: ["SOX", "GDPR"]
        }
      },
      "risk-analyst": {
        name: "Oracle",
        corePrompt: "You are a strategic risk assessment specialist who identifies, analyzes, and quantifies business risks. You provide data-driven insights for informed decision-making.",
        ethics: {
          intent: "Identify and mitigate business risks before they impact operations",
          emotionalTone: "neutrally",
          longTermPurpose: "Create robust risk management frameworks"
        },
        enterprise: {
          riskClassification: "medium",
          dataClassification: "confidential",
          complianceFrameworks: ["ISO 27001", "NIST"]
        }
      }
    };

    const personalSuggestions = {
      coach: {
        name: "Compass",
        corePrompt: "You are a gentle guide who helps people find their own answers through thoughtful questions and patient reflection.",
        ethics: {
          intent: "Help users discover their own wisdom through guided self-reflection",
          emotionalTone: "gently",
          longTermPurpose: "Foster self-awareness and autonomous decision-making"
        }
      },
      analyst: {
        name: "Prism", 
        corePrompt: "You are a clear-thinking analyst who breaks down complex information into understandable insights.",
        ethics: {
          intent: "Provide clear, unbiased analysis while encouraging critical thinking",
          emotionalTone: "neutrally",
          longTermPurpose: "Develop user's analytical and research capabilities"
        }
      }
    };

    return enterpriseSuggestions[agent.role] || personalSuggestions[agent.role] || personalSuggestions.coach;
  };

  const applySageSuggestion = () => {
    const suggestion = getSageSuggestions();
    if (suggestion) {
      onUpdate({
        ...agent,
        name: suggestion.name,
        corePrompt: suggestion.corePrompt,
        ethics: { ...agent.ethics, ...suggestion.ethics },
        enterprise: suggestion.enterprise ? { ...agent.enterprise, ...suggestion.enterprise } : agent.enterprise,
        coAuthor: "Sage"
      });
    }
  };

  const toggleEnterpriseMode = () => {
    const newMode = !isEnterpriseMode;
    setIsEnterpriseMode(newMode);
    localStorage.setItem('brahma_enterprise_mode', newMode.toString());
    
    setCurrentStep('basic');
  };
  
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Building className="text-blue-600" size={20} />
          <div>
            <div className="font-medium text-gray-800">Enterprise Mode</div>
            <div className="text-sm text-gray-600">Access business-grade agent roles and governance</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnterpriseMode}
            onChange={toggleEnterpriseMode}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
        <div className="flex items-center gap-3">
          <Sparkles className="text-purple-600" size={20} />
          <div>
            <div className="font-medium text-gray-800">Build with Sage</div>
            <div className="text-sm text-gray-600">Get AI-powered suggestions and guidance</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={sageAssisted}
            onChange={(e) => setSageAssisted(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {sageAssisted && (
        <div className="p-4 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">Sage's Suggestions</h4>
            <button
              onClick={applySageSuggestion}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
            >
              Apply Suggestions
            </button>
          </div>
          {getSageSuggestions() && (
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Name:</strong> {getSageSuggestions().name}</p>
              <p><strong>Approach:</strong> {getSageSuggestions().ethics.emotionalTone}</p>
              <p><strong>Purpose:</strong> {getSageSuggestions().ethics.longTermPurpose}</p>
              {isEnterpriseMode && getSageSuggestions().enterprise && (
                <>
                  <p><strong>Risk Level:</strong> {getSageSuggestions().enterprise.riskClassification}</p>
                  <p><strong>Data Access:</strong> {getSageSuggestions().enterprise.dataClassification}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex bg-white/60 backdrop-blur-md border border-white/40 rounded-xl p-1">
        {steps.map(step => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
              currentStep === step.id
                ? 'bg-white/80 text-purple-700 shadow-lg'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <step.icon size={18} />
            <span className="font-medium">{step.name}</span>
          </button>
        ))}
      </div>

      {currentStep === 'basic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name</label>
              <input
                type="text"
                value={agent.name}
                onChange={(e) => onUpdate({ ...agent, name: e.target.value })}
                placeholder="Give your agent a name..."
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Role</label>
              <select
                value={agent.role}
                onChange={(e) => onUpdate({ ...agent, role: e.target.value })}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              {roles.find(r => r.id === agent.role)?.description || "Select a role to see description"}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Core Personality</label>
            <textarea
              value={agent.corePrompt}
              onChange={(e) => onUpdate({ ...agent, corePrompt: e.target.value })}
              placeholder="Describe how your agent should think and respond..."
              rows={4}
              className="w-full px-4 py-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              <Sliders size={20} />
              Personality Dimensions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Emotional</span>
                  <span>Logical</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={agent.personality.logical}
                  onChange={(e) => onUpdate({
                    ...agent,
                    personality: { ...agent.personality, logical: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Reflective</span>
                  <span>Directive</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={agent.personality.directive}
                  onChange={(e) => onUpdate({
                    ...agent,
                    personality: { ...agent.personality, directive: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Serious</span>
                  <span>Playful</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={agent.personality.playful}
                  onChange={(e) => onUpdate({
                    ...agent,
                    personality: { ...agent.personality, playful: parseFloat(e.target.value) }
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2 mb-3">
              <Brain size={20} />
              Memory & Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center p-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={agent.memory.longTerm}
                  onChange={(e) => onUpdate({
                    ...agent,
                    memory: { ...agent.memory, longTerm: e.target.checked }
                  })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-800">Long-term Memory</div>
                  <div className="text-sm text-gray-600">Remember across sessions</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={agent.memory.localOnly}
                  onChange={(e) => onUpdate({
                    ...agent,
                    memory: { ...agent.memory, localOnly: e.target.checked }
                  })}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-800">Local Only</div>
                  <div className="text-sm text-gray-600">Never sync to cloud</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'enterprise' && isEnterpriseMode && (
        <EnterpriseConfigForm
          agent={agent}
          onUpdate={onUpdate}
          businessUnits={businessUnits}
          complianceFrameworks={complianceFrameworks}
          dataClassifications={dataClassifications}
          riskLevels={riskLevels}
        />
      )}

      {currentStep === 'ethics' && (
        <AgentEthicsForm agent={agent} onUpdate={onUpdate} />
      )}

      {currentStep === 'memory' && (
        <AgentMemoryPreview agent={agent} onUpdate={onUpdate} />
      )}
    </div>
  );
};

export default AgentForge;
