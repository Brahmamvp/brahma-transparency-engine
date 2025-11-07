import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Eye, Star, Save, Download, Upload } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import AgentSilhouette from './AgentSilhouette';
import AgentForge from './AgentForge';
import AgentPreview from './AgentPreview';
import AgentPortfolio from './AgentPortfolio';

const AgentStudio = ({ theme = "cosmic" }) => {
  const [currentTab, setCurrentTab] = useState('forge');
  const [agent, setAgent] = useState({
    name: "Nova",
    role: "coach",
    corePrompt: "You are a supportive life coach who helps people explore their decisions with warmth and wisdom. You ask thoughtful questions and provide gentle guidance.",
    personality: {
      logical: 0.3,
      directive: 0.4,
      playful: 0.6
    },
    memory: {
      longTerm: true,
      localOnly: true
    },
    ethics: {
      intent: "",
      redLines: [],
      emotionalTone: "gently",
      longTermPurpose: ""
    },
    enterprise: {
      businessUnit: "",
      costCenter: "",
      approvalRequired: false,
      riskClassification: "low",
      complianceFrameworks: [],
      dataClassification: "internal",
      operationalLimits: {
        maxInteractions: 1000,
        allowedDomains: [],
        escalationThresholds: {}
      },
      deploymentScope: "personal"
    },
    auditTrail: [],
    boundaries: {
      safeWords: [],
      roleLimits: [],
      expirationDate: ""
    }
  });
  
  const [savedAgents, setSavedAgents] = useState(() => {
    try {
      const saved = localStorage.getItem('brahma_agents');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const themes = {
    light: {
      name: "Aurora",
      icon: "☀️",
      background: "bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50",
      glass: "bg-white/40 backdrop-blur-xl border-white/30",
      text: {
        primary: "text-gray-900",
        secondary: "text-gray-600",
        muted: "text-gray-500",
      },
      accent: "from-purple-500 to-pink-500",
      nav: "bg-white/60 backdrop-blur-xl border-white/40",
      particle: "light",
    },
    dark: {
      name: "Midnight",
      icon: "🌙",
      background: "bg-gradient-to-br from-gray-900 via-purple-900 to-black",
      glass: "bg-white/10 backdrop-blur-xl border-white/20",
      text: {
        primary: "text-white",
        secondary: "text-gray-300",
        muted: "text-gray-400",
      },
      accent: "from-blue-400 via-purple-400 to-pink-400",
      nav: "bg-black/40 backdrop-blur-xl border-white/10",
      particle: "dark",
    },
    cosmic: {
      name: "Cosmic",
      icon: "🌌",
      background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
      glass: "bg-white/10 backdrop-blur-xl border-purple-300/20",
      text: {
        primary: "text-white",
        secondary: "text-purple-100",
        muted: "text-purple-200",
      },
      accent: "from-cyan-400 via-purple-400 to-pink-400",
      nav: "bg-purple-900/40 backdrop-blur-xl border-purple-300/10",
      particle: "dark",
    }
  };

  const currentTheme = themes[theme] || themes.cosmic;
  
  const tabs = [
    { id: 'forge', name: 'Forge', icon: Sparkles, description: 'Design and build' },
    { id: 'preview', name: 'Preview', icon: Eye, description: 'Test and refine' },
    { id: 'portfolio', name: 'Portfolio', icon: Star, description: 'Manage agents' }
  ];
  
  const saveAgent = () => {
    const agentWithAudit = {
      ...agent,
      id: Date.now(),
      auditTrail: [
        ...agent.auditTrail,
        {
          timestamp: new Date().toISOString(),
          action: "agent_created",
          result: "saved_to_portfolio"
        }
      ]
    };
    
    const newAgents = [...savedAgents, agentWithAudit];
    setSavedAgents(newAgents);
    try {
      localStorage.setItem('brahma_agents', JSON.stringify(newAgents));
    } catch (e) {
      console.error('Failed to save agent:', e);
    }
    
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg animate-fade-in-down';
    toast.innerHTML = `${agent.name} saved to portfolio${agent.coAuthor ? ` (co-authored with ${agent.coAuthor})` : ''}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };
  
  const exportAgent = () => {
    const dataStr = JSON.stringify(agent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${agent.name.toLowerCase().replace(/\s+/g, '-')}.brahma-agent`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const importAgent = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        setAgent(imported);
        setCurrentTab('forge');
      } catch (error) {
        alert('Failed to import agent file');
      }
    };
    reader.readAsText(file);
  };
  
  const selectAgent = (selectedAgent) => {
    setAgent(selectedAgent);
    setCurrentTab('forge');
  };
  
  const deleteAgent = (index) => {
    const newAgents = savedAgents.filter((_, i) => i !== index);
    setSavedAgents(newAgents);
    localStorage.setItem('brahma_agents', JSON.stringify(newAgents));
  };

  useEffect(() => {
    window.BRAHMA_NAVIGATE_TO_AGENT_STUDIO = () => {
      setCurrentTab('forge');
    };
    
    return () => {
      delete window.BRAHMA_NAVIGATE_TO_AGENT_STUDIO;
    };
  }, []);
  
  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.text.primary} relative overflow-hidden`}>
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParticleBackground theme={currentTheme.particle} />
      </div>

      <div className="fixed top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse z-0"></div>
      <div className="fixed bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse z-0"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent mb-3`}>
            Agent Studio
          </h1>
          <p className={`${currentTheme.text.secondary} text-lg`}>
            Author an intelligence shaped by your values, refined by your experience
          </p>
        </div>
        
        <div className="flex justify-center mb-8">
          <div className={`${currentTheme.glass} rounded-xl p-1 flex border`}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                  currentTab === tab.id
                    ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg`
                    : `${currentTheme.text.secondary} hover:${currentTheme.text.primary}`
                }`}
              >
                <tab.icon size={20} />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-xs opacity-70">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:sticky lg:top-8 h-fit">
            <div className={`${currentTheme.glass} rounded-xl p-6 text-center border relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-pink-500/10 rounded-xl"></div>
              
              <h3 className={`text-lg font-medium ${currentTheme.text.primary} mb-4 relative z-10`}>Visual Identity</h3>
              
              <div className="relative z-10">
                <AgentSilhouette 
                  personality={agent.personality}
                  role={agent.role}
                  isActive={isPreviewActive && currentTab === 'preview'}
                  savedAgents={savedAgents}
                  theme={currentTheme}
                />
              </div>
              
              <div className="mt-4 text-center relative z-10">
                <div className={`text-sm ${currentTheme.text.muted} mb-2`}>Soul Name</div>
                <div className={`text-lg font-medium bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}>
                  {agent.name}
                </div>
                {savedAgents.length > 0 && (
                  <div className={`text-xs ${currentTheme.text.muted} mt-2`}>
                    Standing with {savedAgents.length} other{savedAgents.length === 1 ? '' : 's'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={saveAgent}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${currentTheme.accent} text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300`}
              >
                <Save size={18} />
                Save to Portfolio
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={exportAgent}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 ${currentTheme.glass} border rounded-xl hover:bg-white/20 transition-all`}
                >
                  <Download size={16} />
                  Export
                </button>
                
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 ${currentTheme.glass} border rounded-xl hover:bg-white/20 transition-all cursor-pointer`}>
                  <Upload size={16} />
                  Import
                  <input
                    type="file"
                    accept=".brahma-agent,.json"
                    onChange={importAgent}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className={`${currentTheme.glass} rounded-xl p-6 border relative overflow-hidden`}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
              
              {currentTab === 'forge' && (
                <AgentForge agent={agent} onUpdate={setAgent} theme={currentTheme} />
              )}
              
              {currentTab === 'preview' && (
                <AgentPreview 
                  agent={agent} 
                  onActivate={setIsPreviewActive}
                  theme={currentTheme}
                />
              )}
              
              {currentTab === 'portfolio' && (
                <AgentPortfolio
                  agents={savedAgents}
                  onSelectAgent={selectAgent}
                  onDeleteAgent={deleteAgent}
                  theme={currentTheme}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className={`text-center text-xs ${currentTheme.text.muted} mt-12`}>
          <p>© 2025 Brahma • Agent Studio v1.0</p>
          <p className="mt-1">Your agents are yours — local-first, privacy-preserving intelligence</p>
        </div>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(to right, #8b5cf6, #ec4899);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AgentStudio;
