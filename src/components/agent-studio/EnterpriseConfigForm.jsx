import React from 'react';
import { Building, FileCheck, AlertTriangle } from 'lucide-react';

const EnterpriseConfigForm = ({ 
  agent, 
  onUpdate, 
  businessUnits, 
  complianceFrameworks, 
  dataClassifications, 
  riskLevels,
  className = "" 
}) => {
  const enterpriseData = agent.enterprise || {
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
    deploymentScope: "department"
  };

  const handleEnterpriseUpdate = (field, value) => {
    const updated = { ...enterpriseData, [field]: value };
    onUpdate({
      ...agent,
      enterprise: updated
    });
  };

  const handleOperationalLimitUpdate = (field, value) => {
    const updated = {
      ...enterpriseData,
      operationalLimits: {
        ...enterpriseData.operationalLimits,
        [field]: value
      }
    };
    onUpdate({
      ...agent,
      enterprise: updated
    });
  };

  const handleComplianceToggle = (framework) => {
    const current = enterpriseData.complianceFrameworks || [];
    const updated = current.includes(framework)
      ? current.filter(f => f !== framework)
      : [...current, framework];
    
    handleEnterpriseUpdate('complianceFrameworks', updated);
  };

  const currentRisk = riskLevels.find(r => r.value === enterpriseData.riskClassification);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Building className="text-blue-600" size={24} />
        <div>
          <h3 className="text-xl font-medium text-gray-800">Enterprise Configuration</h3>
          <p className="text-sm text-gray-600">Configure business context and governance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Business Unit</label>
          <select
            value={enterpriseData.businessUnit}
            onChange={(e) => handleEnterpriseUpdate('businessUnit', e.target.value)}
            className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            <option value="">Select Business Unit</option>
            {businessUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cost Center</label>
          <input
            type="text"
            value={enterpriseData.costCenter}
            onChange={(e) => handleEnterpriseUpdate('costCenter', e.target.value)}
            placeholder="e.g., CC-IT-001"
            className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Risk Classification</label>
          <select
            value={enterpriseData.riskClassification}
            onChange={(e) => handleEnterpriseUpdate('riskClassification', e.target.value)}
            className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            {riskLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          {currentRisk && (
            <p className={`text-xs mt-1 ${currentRisk.color}`}>{currentRisk.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data Classification</label>
          <select
            value={enterpriseData.dataClassification}
            onChange={(e) => handleEnterpriseUpdate('dataClassification', e.target.value)}
            className="w-full px-4 py-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          >
            {dataClassifications.map(classification => (
              <option key={classification.value} value={classification.value}>
                {classification.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">
            {dataClassifications.find(d => d.value === enterpriseData.dataClassification)?.description}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Compliance Frameworks
        </label>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {complianceFrameworks.map(framework => (
            <label key={framework} className="flex items-center p-3 bg-white/30 backdrop-blur-md border border-white/30 rounded-lg cursor-pointer hover:bg-white/40 transition-colors">
              <input
                type="checkbox"
                checked={enterpriseData.complianceFrameworks?.includes(framework) || false}
                onChange={() => handleComplianceToggle(framework)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{framework}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <FileCheck size={18} className="text-amber-600" />
          Governance & Approval
        </h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={enterpriseData.approvalRequired}
              onChange={(e) => handleEnterpriseUpdate('approvalRequired', e.target.checked)}
              className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-gray-800">Require Management Approval</div>
              <div className="text-sm text-gray-600">Agent deployment must be approved by manager</div>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Daily Interactions</label>
              <input
                type="number"
                value={enterpriseData.operationalLimits?.maxInteractions || 1000}
                onChange={(e) => handleOperationalLimitUpdate('maxInteractions', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deployment Scope</label>
              <select
                value={enterpriseData.deploymentScope}
                onChange={(e) => handleEnterpriseUpdate('deploymentScope', e.target.value)}
                className="w-full px-3 py-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              >
                <option value="personal">Personal Use Only</option>
                <option value="team">Team Access</option>
                <option value="department">Department Wide</option>
                <option value="enterprise">Enterprise Wide</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {(enterpriseData.riskClassification === 'high' || enterpriseData.riskClassification === 'critical') && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h4 className="font-medium text-red-800">High Risk Agent</h4>
          </div>
          <p className="text-sm text-red-700">
            This agent has been classified as {enterpriseData.riskClassification} risk. 
            {enterpriseData.riskClassification === 'critical' 
              ? ' Executive approval and enhanced monitoring will be required.'
              : ' Additional oversight and audit logging will be applied.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EnterpriseConfigForm;
