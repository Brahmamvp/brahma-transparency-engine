import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Heart, Zap, Music, Shield, Star, Save, Play, Download, Upload, User, MessageCircle, Sliders, Eye, Building, Lock, AlertTriangle, FileCheck, Users, TrendingUp, Globe } from 'lucide-react';

const AgentSilhouette = ({
  personality = { logical: 0.5, directive: 0.5, playful: 0.5 },
  role = "assistant",
  isActive = false,
  savedAgents = []
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  const warmth = 1 - personality.logical;
  const energy = personality.playful;
  const authority = personality.directive;

  const hue = warmth > 0.5 ? 45 + (warmth - 0.5) * 30 : 200 + (0.5 - warmth) * 60;
  const saturation = 40 + energy * 30;
  const lightness = 50 + authority * 20;

  const pulseSpeed = energy * 2 + 0.5;
  const glowIntensity = authority * 0.6 + 0.3;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 0.1) % (Math.PI * 2));
    }, 100 / pulseSpeed);

    return () => clearInterval(interval);
  }, [pulseSpeed]);

  const pose = authority > 0.7 ? "assertive" : authority < 0.3 ? "gentle" : "balanced";

  const shadowAgents = savedAgents.slice(-3).map((agent, index) => {
    const shadowWarmth = 1 - agent.personality.logical;
    const shadowEnergy = agent.personality.playful;
    const shadowAuthority = agent.personality.directive;

    const shadowHue = shadowWarmth > 0.5 ? 45 + (shadowWarmth - 0.5) * 30 : 200 + (0.5 - shadowWarmth) * 60;
    const shadowSaturation = 20 + shadowEnergy * 15;
    const shadowLightness = 40 + shadowAuthority * 15;

    return {
      ...agent,
      hue: shadowHue,
      saturation: shadowSaturation,
      lightness: shadowLightness,
      pose: shadowAuthority > 0.7 ? "assertive" : shadowAuthority < 0.3 ? "gentle" : "balanced",
      depth: index + 1
    };
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {shadowAgents.map((shadowAgent, index) => {
        const opacity = 0.15 - (index * 0.03);
        const scale = 0.95 - (index * 0.05);
        const offsetX = (index + 1) * 8;
        const offsetY = (index + 1) * 6;

        return (
          <svg
            key={`shadow-${index}`}
            viewBox="0 0 200 280"
            className="w-48 h-64 absolute z-0"
            style={{
              opacity,
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
              filter: `blur(${index + 1}px)`
            }}
          >
            <ellipse
              cx="100"
              cy="50"
              rx="25"
              ry="30"
              fill={`hsl(${shadowAgent.hue}, ${shadowAgent.saturation}%, ${shadowAgent.lightness}%)`}
              fillOpacity={0.4}
            />
            
            <path
              d={
                shadowAgent.pose === "assertive"
                  ? "M 75 80 Q 100 75 125 80 L 120 180 Q 100 185 80 180 Z"
                  : shadowAgent.pose === "gentle"
                  ? "M 78 82 Q 100 78 122 82 L 118 180 Q 100 183 82 180 Z"
                  : "M 76 81 Q 100 76 124 81 L 119 180 Q 100 184 81 180 Z"
              }
              fill={`hsl(${shadowAgent.hue}, ${shadowAgent.saturation}%, ${shadowAgent.lightness}%)`}
              fillOpacity={0.3}
            />
            
            <ellipse
              cx="60"
              cy={shadowAgent.pose === "assertive" ? "110" : "120"}
              rx="12"
              ry="35"
              fill={`hsl(${shadowAgent.hue}, ${shadowAgent.saturation}%, ${shadowAgent.lightness}%)`}
              fillOpacity={0.25}
              transform={`rotate(${shadowAgent.pose === "assertive" ? "-20" : "-10"} 60 ${shadowAgent.pose === "assertive" ? "110" : "120"})`}
            />
            <ellipse
              cx="140"
              cy={shadowAgent.pose === "assertive" ? "110" : "120"}
              rx="12"
              ry="35"
              fill={`hsl(${shadowAgent.hue}, ${shadowAgent.saturation}%, ${shadowAgent.lightness}%)`}
              fillOpacity={0.25}
              transform={`rotate(${shadowAgent.pose === "assertive" ? "20" : "10"} 140 ${shadowAgent.pose === "assertive" ? "110" : "120"})`}
            />
          </svg>
        );
      })}
      
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-30 animate-pulse z-5"
        style={{
          background: `radial-gradient(circle, hsl(${hue}, ${saturation}%, ${lightness}%) 0%, transparent 70%)`,
          transform: `scale(${1 + Math.sin(animationPhase) * 0.1})`
        }}
      />
      
      <svg
        viewBox="0 0 200 280"
        className="w-48 h-64 relative z-10"
        style={{
          filter: `drop-shadow(0 0 ${glowIntensity * 20}px hsl(${hue}, ${saturation}%, ${lightness}%))`
        }}
      >
        <ellipse
          cx="100"
          cy="50"
          rx="25"
          ry="30"
          fill={`hsl(${hue}, ${saturation}%, ${lightness}%)`}
          fillOpacity={0.3 + Math.sin(animationPhase) * 0.1}
          className="backdrop-blur-md"
        />
        
        <path
          d={
            pose === "assertive"
              ? "M 75 80 Q 100 75 125 80 L 120 180 Q 100 185 80 180 Z"
              : pose === "gentle"
              ? "M 78 82 Q 100 78 122 82 L 118 180 Q 100 183 82 180 Z"
              : "M 76 81 Q 100 76 124 81 L 119 180 Q 100 184 81 180 Z"
          }
          fill={`hsl(${hue}, ${saturation}%, ${lightness}%)`}
          fillOpacity={0.25 + Math.sin(animationPhase * 1.2) * 0.08}
          className="backdrop-blur-sm"
        />
        
        <ellipse
          cx="60"
          cy={authority > 0.6 ? "110" : "120"}
          rx="12"
          ry="35"
          fill={`hsl(${hue}, ${saturation}%, ${lightness}%)`}
          fillOpacity={0.2 + Math.sin(animationPhase * 0.8) * 0.06}
          transform={`rotate(${authority > 0.6 ? "-20" : "-10"} 60 ${authority > 0.6 ? "110" : "120"})`}
        />
        <ellipse
          cx="140"
          cy={authority > 0.6 ? "110" : "120"}
          rx="12"
          ry="35"
          fill={`hsl(${hue}, ${saturation}%, ${lightness}%)`}
          fillOpacity={0.2 + Math.sin(animationPhase * 0.9) * 0.06}
          transform={`rotate(${authority > 0.6 ? "20" : "10"} 140 ${authority > 0.6 ? "110" : "120"})`}
        />
        
        {isActive && (
          <circle
            cx="100"
            cy="50"
            r="35"
            fill="none"
            stroke={`hsl(${hue}, ${saturation}%, ${lightness}%)`}
            strokeWidth="2"
            strokeOpacity={0.4 + Math.sin(animationPhase * 3) * 0.3}
            className="animate-pulse"
          />
        )}
        
        {energy > 0.7 && (
          <g>
            {[...Array(3)].map((_, i) => (
              <circle
                key={i}
                cx={90 + i * 10}
                cy="30"
                r="2"
                fill={`hsl(${hue + 30}, 70%, 70%)`}
                fillOpacity={0.6 + Math.sin(animationPhase * 4 + i) * 0.3}
              />
            ))}
          </g>
        )}
      </svg>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
          <span className="text-xs font-medium text-white/80 capitalize">{role}</span>
        </div>
      </div>
      
      <div
        className="absolute inset-0 rounded-full border border-white/10"
        style={{
          transform: `scale(${1 + Math.sin(animationPhase * 0.5) * 0.05})`,
          opacity: 0.3 + Math.sin(animationPhase * 0.5) * 0.2
        }}
      />
    </div>
  );
};

export default AgentSilhouette;
