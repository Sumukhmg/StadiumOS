/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { StadiumZone } from "../types";
import { Shield, Users, Thermometer, Zap, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface DigitalTwinProps {
  zones: StadiumZone[];
  onZoneSelect: (zoneId: string) => void;
  selectedZoneId: string | null;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ zones, onZoneSelect, selectedZoneId }) => {
  const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);

  // Helper to resolve density colors for the SVG overlay
  const getDensityColor = (density: number) => {
    if (density > 90) return "rgba(239, 68, 68, 0.4)"; // Red
    if (density > 75) return "rgba(245, 158, 11, 0.35)"; // Orange/Yellow
    return "rgba(16, 185, 129, 0.2)"; // Green
  };

  const getDensityStroke = (density: number) => {
    if (density > 90) return "#ef4444";
    if (density > 75) return "#f59e0b";
    return "#10b981";
  };

  const getZoneAnimation = (zoneId: string, defaultClasses: string) => {
    const density = zones.find((z) => z.id === zoneId)?.crowdDensity || 0;
    return density > 90 ? `${defaultClasses} svg-critical-glow` : defaultClasses;
  };

  const selectedZone = zones.find((z) => z.id === selectedZoneId);
  const hoveredZone = zones.find((z) => z.id === hoveredZoneId);

  return (
    <div className="bg-[#0a0a0e] border border-white/10 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden" id="digital-twin-container">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 uppercase">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            MetLife Stadium Twin
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Live Telemetry CAD View</p>
        </div>
        <span className="text-[9px] font-mono bg-white/5 text-zinc-300 px-2.5 py-1 rounded border border-white/10 uppercase tracking-widest">
          GRID REFRESH: OK
        </span>
      </div>

      {/* SVG Container */}
      <div className="flex-1 flex items-center justify-center min-h-[320px] relative bg-[#050507]/60 rounded-xl border border-white/5 overflow-hidden p-4">
        <svg
          viewBox="0 0 600 400"
          className="w-full max-w-[500px] h-auto drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring Bounds */}
          <rect x="10" y="10" width="580" height="380" rx="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="5,5" />

          {/* Transit Hub (Top Left) */}
          <g
            className={getZoneAnimation("transit_hub", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("transit_hub")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("transit_hub")}
            onMouseEnter={() => setHoveredZoneId("transit_hub")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select Transit Hub Zone"
          >
            <rect
              x="30"
              y="30"
              width="120"
              height="70"
              rx="10"
              fill={getDensityColor(zones.find((z) => z.id === "transit_hub")?.crowdDensity || 0)}
              stroke={selectedZoneId === "transit_hub" ? "#3b82f6" : getDensityStroke(zones.find((z) => z.id === "transit_hub")?.crowdDensity || 0)}
              strokeWidth={selectedZoneId === "transit_hub" ? "3" : "1.5"}
            />
            <text x="90" y="70" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono pointer-events-none">
              TRANSIT TERMINAL
            </text>
          </g>

          {/* VIP Lounges (Bottom Right) */}
          <g
            className={getZoneAnimation("vip_lounge", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("vip_lounge")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("vip_lounge")}
            onMouseEnter={() => setHoveredZoneId("vip_lounge")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select VIP Lounges Zone"
          >
            <rect
              x="450"
              y="300"
              width="120"
              height="70"
              rx="10"
              fill={getDensityColor(zones.find((z) => z.id === "vip_lounge")?.crowdDensity || 0)}
              stroke={selectedZoneId === "vip_lounge" ? "#3b82f6" : getDensityStroke(zones.find((z) => z.id === "vip_lounge")?.crowdDensity || 0)}
              strokeWidth={selectedZoneId === "vip_lounge" ? "3" : "1.5"}
            />
            <text x="510" y="340" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono pointer-events-none">
              VIP PRESIDENT'S SUITES
            </text>
          </g>

          {/* Outer Gate C Perimeter (North Entrance - Top Center) */}
          <g
            className={getZoneAnimation("gate_c", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("gate_c")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("gate_c")}
            onMouseEnter={() => setHoveredZoneId("gate_c")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select Gate C Perimeter Zone"
          >
            <path
              d="M 220 30 L 380 30 L 380 70 L 220 70 Z"
              fill={getDensityColor(zones.find((z) => z.id === "gate_c")?.crowdDensity || 0)}
              stroke={selectedZoneId === "gate_c" ? "#3b82f6" : getDensityStroke(zones.find((z) => z.id === "gate_c")?.crowdDensity || 0)}
              strokeWidth={selectedZoneId === "gate_c" ? "3" : "1.5"}
            />
            <text x="300" y="55" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle" className="font-mono pointer-events-none">
              GATE C - METRO INGRESS
            </text>
          </g>

          {/* Main Stadium Outer Bowl (Concourses) */}
          {/* Concourse East */}
          <path
            d="M 140 200 A 160 160 0 0 1 460 200 L 410 200 A 110 110 0 0 0 190 200 Z"
            fill={getDensityColor(zones.find((z) => z.id === "concourse_a")?.crowdDensity || 0)}
            stroke={selectedZoneId === "concourse_a" ? "#3b82f6" : getDensityStroke(zones.find((z) => z.id === "concourse_a")?.crowdDensity || 0)}
            strokeWidth={selectedZoneId === "concourse_a" ? "2.5" : "1.5"}
            className={getZoneAnimation("concourse_a", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("concourse_a")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("concourse_a")}
            onMouseEnter={() => setHoveredZoneId("concourse_a")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select Concourse East"
          />

          {/* Concourse West */}
          <path
            d="M 140 200 A 160 160 0 0 0 460 200 L 410 200 A 110 110 0 0 1 190 200 Z"
            fill={getDensityColor(zones.find((z) => z.id === "concourse_b")?.crowdDensity || 0)}
            stroke={selectedZoneId === "concourse_b" ? "#3b82f6" : getDensityStroke(zones.find((z) => z.id === "concourse_b")?.crowdDensity || 0)}
            strokeWidth={selectedZoneId === "concourse_b" ? "2.5" : "1.5"}
            className={getZoneAnimation("concourse_b", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("concourse_b")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("concourse_b")}
            onMouseEnter={() => setHoveredZoneId("concourse_b")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select Concourse West"
          />

          {/* Stand A (Lower Deck Ring) */}
          <ellipse
            cx="300"
            y="200"
            rx="110"
            ry="75"
            fill={getDensityColor(zones.find((z) => z.id === "stand_a")?.crowdDensity || 0)}
            stroke={selectedZoneId === "stand_a" ? "#3b82f6" : getDensityStroke(zones.find((z) => z.id === "stand_a")?.crowdDensity || 0)}
            strokeWidth={selectedZoneId === "stand_a" ? "3" : "1.5"}
            className={getZoneAnimation("stand_a", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("stand_a")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("stand_a")}
            onMouseEnter={() => setHoveredZoneId("stand_a")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select Stand A"
          />

          {/* Stand B (Upper Deck Ring) */}
          <ellipse
            cx="300"
            y="200"
            rx="140"
            ry="95"
            fill="none"
            stroke={selectedZoneId === "stand_b" ? "#3b82f6" : getDensityStroke(zones.find((z) => z.id === "stand_b")?.crowdDensity || 0)}
            strokeWidth={selectedZoneId === "stand_b" ? "3" : "1"}
            strokeDasharray="4,4"
            className={getZoneAnimation("stand_b", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("stand_b")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("stand_b")}
            onMouseEnter={() => setHoveredZoneId("stand_b")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select Stand B"
          />

          {/* Center Pitch (Field of Play) */}
          <g
            className={getZoneAnimation("pitch", "cursor-pointer transition-all duration-300")}
            onClick={() => onZoneSelect("pitch")}
            onKeyDown={(e) => e.key === "Enter" && onZoneSelect("pitch")}
            onMouseEnter={() => setHoveredZoneId("pitch")}
            onMouseLeave={() => setHoveredZoneId(null)}
            role="button"
            tabIndex={0}
            aria-label="Select Pitch Zone"
          >
            {/* Field Green Overlay */}
            <ellipse
              cx="300"
              y="200"
              rx="75"
              ry="50"
              fill={getDensityColor(zones.find((z) => z.id === "pitch")?.crowdDensity || 0)}
              stroke={selectedZoneId === "pitch" ? "#3b82f6" : "#22c55e"}
              strokeWidth={selectedZoneId === "pitch" ? "3" : "2"}
            />
            {/* Soccer Pitch Markings */}
            <line x1="300" y1="150" x2="300" y2="250" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <circle cx="300" cy="200" r="15" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </g>

          {/* Labels Overlay */}
          <text x="300" y="203" fill="#ffffff" opacity="0.8" fontSize="10" fontWeight="bold" textAnchor="middle" pointerEvents="none" className="font-mono">
            PITCH
          </text>
          <text x="300" y="285" fill="#94a3b8" fontSize="9" textAnchor="middle" pointerEvents="none" className="font-mono">
            SEATING RINGS (STAND A & B)
          </text>
        </svg>

        {/* Live Legend */}
        <div className="absolute bottom-3 left-3 flex flex-col gap-1 text-[10px] bg-[#050507]/90 px-2.5 py-2 rounded-lg border border-white/10 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-green-500/30 border border-green-500" />
            <span className="text-zinc-400">&lt; 70% Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-amber-500/30 border border-amber-500" />
            <span className="text-zinc-400">70-90% Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-red-500/30 border border-red-500 animate-pulse" />
            <span className="text-zinc-400">&gt; 90% Bottleneck</span>
          </div>
        </div>

        {/* Hover / Tooltip overlay */}
        {(hoveredZone || selectedZone) && (
          <div className="absolute top-3 right-3 bg-[#0a0a0e]/95 border border-white/10 p-3 rounded-lg text-xs font-mono w-[180px] pointer-events-none transition-all duration-300 shadow-xl">
            <div className="font-semibold text-white border-b border-white/5 pb-1 mb-1.5 flex items-center justify-between">
              <span className="uppercase text-[10px] font-bold text-zinc-300">{(hoveredZone || selectedZone)?.name.split(" ")[0]}</span>
              {(hoveredZone || selectedZone)?.status === "critical" ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-bounce" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              )}
            </div>
            <div className="flex items-center justify-between text-zinc-300 mb-0.5">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold flex items-center gap-1"><Users className="w-3 h-3" /> Crowd:</span>
              <span className="font-bold text-white">{(hoveredZone || selectedZone)?.crowdDensity}%</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300 mb-0.5">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold flex items-center gap-1"><Thermometer className="w-3 h-3" /> Temp:</span>
              <span className="text-white">{(hoveredZone || selectedZone)?.temperature}°C</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500 text-[10px] uppercase font-semibold flex items-center gap-1"><Zap className="w-3 h-3" /> Grid Load:</span>
              <span className="text-blue-400">{(hoveredZone || selectedZone)?.energyLoad} kW</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          <strong>Interactive Digital Twin:</strong> Click any highlighted sector of the MetLife Stadium mesh to command the 
          <strong> Master Orchestrator Agent</strong> to generate an immediate, real-time AI security & crowd briefing.
        </p>
      </div>
    </div>
  );
};
