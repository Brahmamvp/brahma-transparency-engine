import React, { useState, useEffect, useMemo } from 'react';
import {
  Building, Users, Shield, TrendingUp, AlertTriangle, CheckCircle,
  Clock, BarChart3, Activity, FileCheck, Heart, Flag, Scale,
  Settings, Filter, Download, RefreshCw, Eye, Lock, Globe,
  Zap, Brain, MessageCircle, Calendar, DollarSign, Target
} from 'lucide-react';

// =============== THEME CONFIGURATION ===============
const themes = {
  cosmic: {
    background: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900",
    glass: "bg-white/10 backdrop-blur-xl border-purple-300/20",
    text: {
      primary: "text-white",
      secondary: "text-purple-100",
      muted: "text-purple-200",
    },
    accent: "from-cyan-400 via-purple-400 to-pink-400",
    nav: "bg-purple-900/40 backdrop-blur-xl border-purple-300/10",
  }
};

// =============== SAMPLE DATA ===============
const sampleAgents = [
  {
    id: 1,
    name: "Compliance Monitor",
    role: "compliance-officer",
    department: "Legal",
    creator: "Sarah Chen",
    created: "2025-01-15",
    lastUsed: "2025-01-19",
    status: "active",
    riskLevel: "high",
    usageCount: 156,
    satisfactionScore: 4.8,
    sector: "healthcare",
    compliance: ["HIPAA", "HITECH"],
    costPerMonth: 2400,
    timeSavedHours: 45
  },
  {
    id: 2,
    name: "Security Auditor",
    role: "security-auditor",
    department: "IT Security",
    creator: "Marcus Williams",
    created: "2025-01-12",
    lastUsed: "2025-01-19",
    status: "active",
    riskLevel: "critical",
    usageCount: 89,
    satisfactionScore: 4.9,
    sector: "government",
    compliance: ["FISMA", "FedRAMP"],
    costPerMonth: 3200,
    timeSavedHours: 67
  },
  {
    id: 3,
    name: "Contract Analyst",
    role: "legal-counsel",
    department: "Legal",
    creator: "Jennifer Park",
    created: "2025-01-10",
    lastUsed: "2025-01-18",
    status: "pending_approval",
    riskLevel: "medium",
    usageCount: 23,
    satisfactionScore: 4.6,
    sector: "enterprise",
    compliance: ["SOX", "GDPR"],
    costPerMonth: 1800,
    timeSavedHours: 12
  },
  {
    id: 4,
    name: "Data Steward",
    role: "data-steward",
    department: "Data & Analytics",
    creator: "Alex Kumar",
    created: "2025-01-08",
    lastUsed: "2025-01-19",
    status: "active",
    riskLevel: "low",
    usageCount: 203,
    satisfactionScore: 4.7,
    sector: "healthcare",
    compliance: ["HIPAA", "GDPR"],
    costPerMonth: 1600,
    timeSavedHours: 89
  }
];

const sampleMetrics = {
  totalAgents: 12,
  activeAgents: 9,
  pendingApproval: 3,
  totalUsers: 147,
  totalInteractions: 2847,
  avgSatisfaction: 4.7,
  totalCostSavings: 89000,
  totalTimeSaved: 213,
  complianceScore: 98.2,
  riskIncidents: 0
};

// =============== SECTOR COMPLIANCE MODULES ===============
const SectorCompliancePanel = ({ sector, agents, theme }) => {
  const sectorConfig = {
    healthcare: {
      icon: <Heart size={20} className="text-red-400" />,
      name: "Healthcare",
      color: "red",
      frameworks: ["HIPAA", "HITECH", "FDA 21 CFR Part 11"],
      requirements: [
        "PHI data must remain local-only",
        "Patient consent required for all interactions",
        "Automatic audit trail for all healthcare data access",
        "Breach notification within 60 days"
      ]
    },
    government: {
      icon: <Flag size={20} className="text-blue-400" />,
      name: "Government",
      color: "blue",
      frameworks: ["FISMA", "FedRAMP", "NIST"],
      requirements: [
        "Multi-factor authentication required",
        "Data classification and handling procedures",
        "Continuous monitoring and incident response",
        "Regular security assessments"
      ]
    },
    enterprise: {
      icon: <Building size={20} className="text-green-400" />,
      name: "Enterprise",
      color: "green",
      frameworks: ["SOX", "GDPR", "ISO 27001"],
      requirements: [
        "Data retention and deletion policies",
        "Privacy by design implementation",
        "Regular compliance audits",
        "Employee privacy training"
      ]
    }
  };

  const config = sectorConfig[sector];
  if (!config) return null;

  const sectorAgents = agents.filter(agent => agent.sector === sector);
  const complianceScore = sectorAgents.length > 0
    ? (sectorAgents.filter(a => a.status === 'active').length / sectorAgents.length) * 100
    : 0;

  return (
    <div className={`${theme.glass} border rounded-xl p-6`}>
      <div className="flex items-center gap-3 mb-4">
        {config.icon}
        <div>
          <h3 className={`font-semibold ${theme.text.primary}`}>{config.name} Compliance</h3>
          <p className={`text-sm ${theme.text.muted}`}>{sectorAgents.length} agents deployed</p>
        </div>
        <div className="ml-auto">
          <div className={`text-2xl font-bold text-${config.color}-400`}>
            {complianceScore.toFixed(0)}%
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`${theme.glass} border rounded-lg p-3`}>
          <div className={`text-sm ${theme.text.muted}`}>Active Agents</div>
          <div className={`text-xl font-bold ${theme.text.primary}`}>
            {sectorAgents.filter(a => a.status === 'active').length}
          </div>
        </div>
        <div className={`${theme.glass} border rounded-lg p-3`}>
          <div className={`text-sm ${theme.text.muted}`}>Compliance Score</div>
          <div className={`text-xl font-bold text-${config.color}-400`}>
            {complianceScore > 90 ? '✓' : '⚠'} {complianceScore.toFixed(0)}%
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className={`font-medium ${theme.text.primary} text-sm`}>Framework Coverage</h4>
        <div className="flex flex-wrap gap-2">
          {config.frameworks.map(framework => (
            <span key={framework} className={`px-2 py-1 text-xs bg-${config.color}-500/20 text-${config.color}-400 rounded border border-${config.color}-500/30`}>
              {framework}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <h4 className={`font-medium ${theme.text.primary} text-sm`}>Key Requirements</h4>
        {config.requirements.slice(0, 2).map((req, index) => (
          <div key={index} className="flex items-start gap-2">
            <CheckCircle size={14} className={`text-${config.color}-400 mt-0.5 flex-shrink-0`} />
            <span className={`text-xs ${theme.text.muted}`}>{req}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============== AGENT PORTFOLIO OVERVIEW ===============
const AgentPortfolioOverview = ({ agents, theme }) => {
  const [filter, setFilter] = useState('all'); // all, active, pending, sector
  const [sortBy, setSortBy] = useState('usage'); // usage, created, satisfaction, risk

  const filteredAgents = useMemo(() => {
    let filtered = agents;
    if (filter !== 'all') {
      if (['healthcare', 'government', 'enterprise'].includes(filter)) {
        filtered = filtered.filter(agent => agent.sector === filter);
      } else {
        filtered = filtered.filter(agent => agent.status === filter);
      }
    }
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'created':
          return new Date(b.created) - new Date(a.created);
        case 'satisfaction':
          return b.satisfactionScore - a.satisfactionScore;
        case 'risk':
          const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        default:
          return 0;
      }
    });
  }, [agents, filter, sortBy]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'pending_approval': return 'text-yellow-400';
      case 'inactive': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getSectorIcon = (sector) => {
    switch (sector) {
      case 'healthcare': return <Heart size={14} className="text-red-400" />;
      case 'government': return <Flag size={14} className="text-blue-400" />;
      case 'enterprise': return <Building size={14} className="text-green-400" />;
      default: return <Globe size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className={`${theme.glass} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${theme.text.primary}`}>Agent Portfolio</h2>
          <p className={`text-sm ${theme.text.muted}`}>{filteredAgents.length} of {agents.length} agents</p>
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-3 py-2 ${theme.glass} border rounded-lg text-sm ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          >
            <option value="all">All Agents</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="healthcare">Healthcare</option>
            <option value="government">Government</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-3 py-2 ${theme.glass} border rounded-lg text-sm ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
          >
            <option value="usage">Sort by Usage</option>
            <option value="created">Sort by Created</option>
            <option value="satisfaction">Sort by Satisfaction</option>
            <option value="risk">Sort by Risk</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        {filteredAgents.map(agent => (
          <div key={agent.id} className={`${theme.glass} border rounded-lg p-4 hover:bg-white/5 transition-colors`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${theme.accent} flex items-center justify-center`}>
                  <span className="text-white font-bold">{agent.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${theme.text.primary}`}>{agent.name}</h3>
                    {getSectorIcon(agent.sector)}
                    <span className={`px-2 py-1 text-xs rounded ${getRiskColor(agent.riskLevel)} bg-white/10`}>
                      {agent.riskLevel.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className={`${theme.text.muted}`}>Department:</span>
                      <div className={`${theme.text.primary}`}>{agent.department}</div>
                    </div>
                    <div>
                      <span className={`${theme.text.muted}`}>Usage:</span>
                      <div className={`${theme.text.primary}`}>{agent.usageCount} interactions</div>
                    </div>
                    <div>
                      <span className={`${theme.text.muted}`}>Satisfaction:</span>
                      <div className={`${theme.text.primary}`}>⭐ {agent.satisfactionScore}/5</div>
                    </div>
                    <div>
                      <span className={`${theme.text.muted}`}>Status:</span>
                      <div className={`${getStatusColor(agent.status)} capitalize`}>
                        {agent.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agent.compliance.map(framework => (
                      <span key={framework} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                        {framework}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className={`text-lg font-bold ${theme.text.primary}`}>
                    ${(agent.costPerMonth).toLocaleString()}
                  </div>
                  <div className={`text-xs ${theme.text.muted}`}>monthly value</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium text-emerald-400`}>
                    +{agent.timeSavedHours}h saved
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============== USAGE ANALYTICS DASHBOARD ===============
const UsageAnalytics = ({ agents, metrics, theme }) => {
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d

  const totalValue = agents.reduce((sum, agent) => sum + agent.costPerMonth, 0);
  const totalTimeSaved = agents.reduce((sum, agent) => sum + agent.timeSavedHours, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${theme.glass} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-emerald-400" />
            <h3 className={`font-medium ${theme.text.primary}`}>Total Value</h3>
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${totalValue.toLocaleString()}
          </div>
          <div className={`text-xs ${theme.text.muted}`}>Monthly business value</div>
        </div>
        <div className={`${theme.glass} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-blue-400" />
            <h3 className={`font-medium ${theme.text.primary}`}>Time Saved</h3>
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {totalTimeSaved}h
          </div>
          <div className={`text-xs ${theme.text.muted}`}>This month</div>
        </div>
        <div className={`${theme.glass} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-purple-400" />
            <h3 className={`font-medium ${theme.text.primary}`}>Active Users</h3>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {metrics.totalUsers}
          </div>
          <div className={`text-xs ${theme.text.muted}`}>Across all departments</div>
        </div>
        <div className={`${theme.glass} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className="text-red-400" />
            <h3 className={`font-medium ${theme.text.primary}`}>Compliance</h3>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {metrics.complianceScore}%
          </div>
          <div className={`text-xs ${theme.text.muted}`}>Compliance score</div>
        </div>
      </div>
      {/* Usage by Department */}
      <div className={`${theme.glass} border rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Usage by Department</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className={`px-3 py-2 ${theme.glass} border rounded-lg text-sm ${theme.text.primary}`}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        <div className="space-y-3">
          {['Legal', 'IT Security', 'Data & Analytics', 'Finance'].map((dept, index) => {
            const usage = [85, 72, 91, 45][index];
            return (
              <div key={dept} className="flex items-center gap-4">
                <div className={`w-24 text-sm ${theme.text.primary}`}>{dept}</div>
                <div className="flex-1 bg-white/10 rounded-full h-2">
                  <div
                    className={`h-2 bg-gradient-to-r ${theme.accent} rounded-full transition-all duration-500`}
                    style={{ width: `${usage}%` }}
                  />
                </div>
                <div className={`w-12 text-sm ${theme.text.primary} text-right`}>{usage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// =============== GOVERNANCE CENTER ===============
const GovernanceCenter = ({ agents, theme }) => {
  const [activeTab, setActiveTab] = useState('approvals'); // approvals, risk, audit

  const pendingApprovals = agents.filter(agent => agent.status === 'pending_approval');
  const highRiskAgents = agents.filter(agent => ['high', 'critical'].includes(agent.riskLevel));

  const tabs = [
    { id: 'approvals', label: 'Pending Approvals', count: pendingApprovals.length, icon: <CheckCircle size={16} /> },
    { id: 'risk', label: 'Risk Management', count: highRiskAgents.length, icon: <AlertTriangle size={16} /> },
    { id: 'audit', label: 'Audit Trail', count: '2.8k', icon: <FileCheck size={16} /> }
  ];

  return (
    <div className={`${theme.glass} border rounded-xl p-6`}>
      <h2 className={`text-xl font-bold ${theme.text.primary} mb-6`}>Governance Center</h2>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all text-sm font-medium ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${theme.accent} text-white shadow-lg`
                : `${theme.text.secondary} hover:${theme.text.primary}`
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {pendingApprovals.length > 0 ? (
            pendingApprovals.map(agent => (
              <div key={agent.id} className={`${theme.glass} border rounded-lg p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${theme.accent} flex items-center justify-center`}>
                      <span className="text-white font-bold">{agent.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className={`font-medium ${theme.text.primary}`}>{agent.name}</h4>
                      <p className={`text-sm ${theme.text.muted}`}>
                        Created by {agent.creator} • {agent.department}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400`}>
                      {agent.riskLevel.toUpperCase()} RISK
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors">
                      Approve
                    </button>
                    <button className={`px-4 py-2 ${theme.glass} border hover:bg-white/20 ${theme.text.primary} rounded-lg text-sm transition-colors`}>
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-8 ${theme.text.muted}`}>
              <CheckCircle size={48} className="mx-auto mb-3 text-emerald-400" />
              <p>No pending approvals</p>
            </div>
          )}
        </div>
      )}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          <div className={`p-4 bg-red-500/10 border border-red-500/30 rounded-lg`}>
            <h4 className="font-medium text-red-400 mb-2">High-Risk Agent Summary</h4>
            <p className="text-sm text-red-300">
              {highRiskAgents.length} agents require enhanced monitoring and audit trails.
            </p>
          </div>
          {highRiskAgents.map(agent => (
            <div key={agent.id} className={`${theme.glass} border rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className="text-red-400" />
                  <div>
                    <h4 className={`font-medium ${theme.text.primary}`}>{agent.name}</h4>
                    <p className={`text-sm ${theme.text.muted}`}>
                      {agent.usageCount} interactions • Last used {agent.lastUsed}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm rounded font-medium ${
                  agent.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {agent.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className={`${theme.glass} border rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`font-medium ${theme.text.primary}`}>Recent Activity</h4>
              <button className={`px-3 py-1 ${theme.glass} border rounded text-sm ${theme.text.primary}`}>
                Export Logs
              </button>
            </div>
            <div className="space-y-3">
              {[
                { action: 'Agent Deployed', agent: 'Compliance Monitor', user: 'Sarah Chen', time: '2 hours ago', type: 'deployment' },
                { action: 'Risk Assessment', agent: 'Security Auditor', user: 'System', time: '4 hours ago', type: 'security' },
                { action: 'Approval Granted', agent: 'Contract Analyst', user: 'Jennifer Park', time: '1 day ago', type: 'approval' },
                { action: 'Data Access', agent: 'Data Steward', user: 'Alex Kumar', time: '2 days ago', type: 'access' }
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'deployment' ? 'bg-emerald-400' :
                      log.type === 'security' ? 'bg-red-400' :
                      log.type === 'approval' ? 'bg-blue-400' : 'bg-purple-400'
                    }`} />
                    <div>
                      <span className={`font-medium ${theme.text.primary}`}>{log.action}</span>
                      <span className={`${theme.text.muted}`}> • {log.agent}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${theme.text.primary}`}>{log.user}</div>
                    <div className={`text-xs ${theme.text.muted}`}>{log.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============== MAIN ENTERPRISE DASHBOARD ===============
const EnterpriseDashboard = ({ theme = "cosmic" }) => {
  const [activeView, setActiveView] = useState('overview'); // overview, portfolio, analytics, governance, sectors
  const [agents] = useState(sampleAgents);
  const [metrics] = useState(sampleMetrics);

  const currentTheme = themes[theme] || themes.cosmic;

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={20} /> },
    { id: 'portfolio', label: 'Agent Portfolio', icon: <Users size={20} /> },
    { id: 'analytics', label: 'Usage Analytics', icon: <TrendingUp size={20} /> },
    { id: 'governance', label: 'Governance', icon: <Shield size={20} /> },
    { id: 'sectors', label: 'Sector Compliance', icon: <Scale size={20} /> }
  ];

  return (
    <div className={`min-h-screen ${currentTheme.background} relative overflow-hidden`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-pink-500/20 to-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
      </div>
      <div className="container mx-auto px-6 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold bg-gradient-to-r ${currentTheme.accent} bg-clip-text text-transparent`}>
                Enterprise Dashboard
              </h1>
              <p className={`${currentTheme.text.secondary} mt-1`}>
                AI Agent governance for healthcare, government, and enterprise
              </p>
            </div>
            <div className="flex gap-3">
              <button className={`px-4 py-2 ${currentTheme.glass} border rounded-lg ${currentTheme.text.primary} hover:bg-white/20 transition-colors flex items-center gap-2`}>
                <Download size={16} />
                Export Report
              </button>
              <button className={`px-4 py-2 ${currentTheme.glass} border rounded-lg ${currentTheme.text.primary} hover:bg-white/20 transition-colors flex items-center gap-2`}>
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex space-x-1 mb-8 bg-white/5 rounded-xl p-1">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all font-medium ${
                activeView === item.id
                  ? `bg-gradient-to-r ${currentTheme.accent} text-white shadow-lg`
                  : `${currentTheme.text.secondary} hover:${currentTheme.text.primary} hover:bg-white/10`
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        {/* Main Content */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            <UsageAnalytics agents={agents} metrics={metrics} theme={currentTheme} />
            <div className="grid lg:grid-cols-3 gap-6">
              <SectorCompliancePanel sector="healthcare" agents={agents} theme={currentTheme} />
              <SectorCompliancePanel sector="government" agents={agents} theme={currentTheme} />
              <SectorCompliancePanel sector="enterprise" agents={agents} theme={currentTheme} />
            </div>
          </div>
        )}
        {activeView === 'portfolio' && (
          <AgentPortfolioOverview agents={agents} theme={currentTheme} />
        )}
        {activeView === 'analytics' && (
          <UsageAnalytics agents={agents} metrics={metrics} theme={currentTheme} />
        )}
        {activeView === 'governance' && (
          <GovernanceCenter agents={agents} theme={currentTheme} />
        )}
        {activeView === 'sectors' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <SectorCompliancePanel sector="healthcare" agents={agents} theme={currentTheme} />
              <SectorCompliancePanel sector="government" agents={agents} theme={currentTheme} />
            </div>
            <div className="space-y-6">
              <SectorCompliancePanel sector="enterprise" agents={agents} theme={currentTheme} />
              {/* Compliance Summary */}
              <div className={`${currentTheme.glass} border rounded-xl p-6`}>
                <h3 className={`font-semibold ${currentTheme.text.primary} mb-4`}>Cross-Sector Compliance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`${currentTheme.text.secondary}`}>HIPAA Compliance</span>
                    <span className="text-emerald-400 font-medium">98.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${currentTheme.text.secondary}`}>FISMA Controls</span>
                    <span className="text-emerald-400 font-medium">96.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${currentTheme.text.secondary}`}>GDPR Compliance</span>
                    <span className="text-emerald-400 font-medium">99.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${currentTheme.text.secondary}`}>SOX Compliance</span>
                    <span className="text-yellow-400 font-medium">94.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Footer */}
        <div className={`text-center text-xs ${currentTheme.text.muted} mt-12 pt-8 border-t border-white/10`}>
          <p>© 2025 Brahma Enterprise • Advanced AI Agent Governance Platform</p>
          <p className="mt-1">Healthcare • Government • Enterprise Ready</p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
