import React from 'react';

const PrivacyBadge = ({ hasLifetimePrivacy = false }) => (
  <div className="fixed top-4 right-4 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 z-40">
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 ${hasLifetimePrivacy ? 'bg-emerald-400' : 'bg-green-400'} rounded-full animate-pulse`}></div>
      <span className="text-xs text-white font-medium">
        {hasLifetimePrivacy ? 'Privacy: Lifetime Protected 🔒' : 'Privacy: Local Only'}
      </span>
    </div>
  </div>
);

export default PrivacyBadge;
