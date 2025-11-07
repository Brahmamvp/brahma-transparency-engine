
import React from 'react';

export default function GlassPanel({ children, className = "", strong = false }) {
  return (
    <div className={`${strong ? 'glassmorphism-strong' : 'glassmorphism'} rounded-2xl ${className}`}>
      {children}
    </div>
  );
}