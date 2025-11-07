import React, { useState } from 'react';
import { Users, Building, Lock } from 'lucide-react';

const AgentPortfolio = ({ agents = [], onSelectAgent, onDeleteAgent, className = "" }) => {
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredAgents = agents.filter(agent => {
    if (filterBy === 'personal') return !agent.enterprise?.businessUnit;
    if (filterBy === 'enterprise') return agent.enterprise?.businessUnit;
    if (filterBy === 'high-risk') return ['high', 'critical'].includes(agent.enterprise?.riskClassification);
    return true;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'risk') {
      const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      return (riskOrder[b.enterprise?.riskClassification] || 0) - (riskOrder[a.enterprise?.riskClassification] || 0);
    }
    if (sortBy === 'role') return a.role.localeCompare(b.role);
    return (b.id || 0) - (a.id || 0);
  });

  const getRiskBadge = (agent) => {
    const risk = agent.enterprise?.riskClassification;
    if (!risk || risk === 'low') return null;
    
    const colors = {
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${colors[risk]}`}>
        {risk.toUpperCase()}
      </span>
    );
  };

  const getComplianceBadges = (agent) => {
    const frameworks = agent.enterprise?.complianceFrameworks || [];
    if (frameworks.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {frameworks.slice(0, 3).map(framework => (
          <span key={framework} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded border border-blue-200">
            {framework}
          </span>
        ))}
        {frameworks.length > 3 && (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
            +{frameworks.length - 3} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
          <Users size={20} />
          Agent Portfolio ({agents.length})
        </h3>
        
        <div className="flex gap-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="all">All Agents</option>
            <option value="personal">Personal</option>
            <option value="enterprise">Enterprise</option>
            <option value="high-risk">High Risk</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name</option>
            <option value="risk">Risk Level</option>
            <option value="role">Role</option>
          </select>
        </div>
      </div>
      
      {sortedAgents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4 text-4xl">🤖</div>
          <div>
            {agents.length === 0 ? 'No agents created yet' : `No agents match the ${filterBy} filter`}
          </div>
          <div className="text-sm mt-1">
            {agents.length === 0 ? 'Create your first agent to get started' : 'Try adjusting your filters'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAgents.map((agent, i) => (
            <div
              key={agent.id || i}
              className="bg-white/30 backdrop-blur-md border border-white/30 rounded-xl p-4 hover:bg-white/40 transition-all cursor-pointer"
              onClick={() => onSelectAgent(agent)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{agent.name}</h4>
                    {getRiskBadge(agent)}
                    {agent.coAuthor && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded border border-purple-200">
                        + {agent.coAuthor}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 capitalize flex items-center gap-2">
                    <span>{agent.role.replace('-', ' ')}</span>
                    {agent.enterprise?.businessUnit && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building size={12} />
                          {agent.enterprise.businessUnit}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAgent(i);
                  }}
                  className="text-red-400 hover:text-red-600 transition-colors ml-2"
                >
                  ×
                </button>
              </div>
              
              <div className="text-xs text-gray-500 mb-3 line-clamp-2">
                {agent.corePrompt}
              </div>

              {agent.enterprise?.dataClassification && (
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <Lock size={12} />
                  <span>Data: {agent.enterprise.dataClassification}</span>
                  {agent.enterprise.approvalRequired && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600">Approval Required</span>
                    </>
                  )}
                </div>
              )}

              {getComplianceBadges(agent)}

              {agent.ethics?.intent && (
                <div className="mt-3 p-2 bg-white/20 rounded-lg">
                  <div className="text-xs text-gray-600">Intent: {agent.ethics.intent}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentPortfolio;
