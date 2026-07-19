/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { TelemetryData, SimulationResult } from "../types";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertTriangle, Play, Sparkles, CheckSquare, Layers, HelpCircle, Loader2 } from "lucide-react";

interface PredictiveAnalyticsProps {
  telemetry: TelemetryData[];
}

const PRESET_SCENARIOS = [
  { id: "transit", title: "NJ Transit Train Power Substation Failure", prompt: "A massive power surge knocks out the main rail substation. Rail cars are stranded 2 miles out. 15,000 arriving fans are currently bottlenecked at Secaucus station." },
  { id: "weather", title: "Saturating Rainstorm & Lightning Threat", prompt: "A fast-moving weather front brings saturating rain and lightning within 5 miles. We must suspend play on the pitch and safely hold 65,000 fans in the covered concourses." },
  { id: "crowd", title: "Stand A Lower Deck Egress Stampede Risk", prompt: "A minor physical dispute at vomiting gate A12 causes a localized panic. Fans are attempting to surge backwards onto the stairs during high-density stand clearance." },
  { id: "grid", title: "HVAC Peak Grid Cutoff Alert", prompt: "The municipal utility requests an immediate 400 kW reduction in energy draw to avoid a local grid brownout. Chiller systems must be trimmed without raising stand temperatures above 26C." }
];

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ telemetry }) => {
  const [selectedPreset, setSelectedPreset] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const runSimulation = async (scenarioText: string) => {
    if (!scenarioText.trim()) return;
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const response = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioText }),
      });
      const data = await response.json();
      if (data.result) {
        setSimulationResult(data.result);
      }
    } catch (err) {
      console.error("Simulation run failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePresetSelect = (id: string) => {
    const p = PRESET_SCENARIOS.find((s) => s.id === id);
    if (p) {
      setSelectedPreset(id);
      setCustomPrompt(p.prompt);
    }
  };

  return (
    <div className="bg-[#0a0a0e] border border-white/10 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden" id="predictive-analytics-container">
      {/* Title Header */}
      <div className="mb-6">
        <h2 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 uppercase">
          <TrendingUp className="w-4.5 h-4.5 text-blue-400" />
          Predictive Analytics & Live Feeds
        </h2>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Continuous Multi-Agent Telemetry Modeling</p>
      </div>

      {/* Telemetry Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Crowd Flow Chart */}
        <div className="bg-[#050507]/60 border border-white/5 rounded-xl p-4 h-[180px] flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Crowd Arrival Flow (Fans / Min)
          </span>
          <div className="w-full h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetry}>
                <defs>
                  <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#71717a" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0a0a0e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace" }} />
                <Area type="monotone" dataKey="crowdFlowRate" stroke="#10b981" fillOpacity={1} fill="url(#colorCrowd)" strokeWidth={1.5} name="Arrival Influx" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Grid Demand Chart */}
        <div className="bg-[#050507]/60 border border-white/5 rounded-xl p-4 h-[180px] flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Stadium Energy Draw (kW)
          </span>
          <div className="w-full h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry}>
                <XAxis dataKey="time" stroke="#71717a" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0a0a0e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "10px", fontFamily: "monospace" }} />
                <Line type="monotone" dataKey="energyDemand" stroke="#3b82f6" strokeWidth={2} dot={false} name="Grid Demand" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* What-If Simulation Console */}
      <div className="border-t border-white/5 pt-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5 mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Simulation Sandbox
          </h3>

          {/* Preset Selectors */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`text-[10px] text-left px-3 py-2 rounded-lg border transition-all duration-300 font-sans uppercase tracking-wide leading-normal ${
                  selectedPreset === preset.id
                    ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border-blue-500/50 text-white font-bold"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {preset.title.split(" & ").join(" & ").split(" - ").join(" - ")}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex gap-2 mb-4">
            <textarea
              placeholder="Or write a custom crisis/scenario... e.g. Light rail breakdown during extreme summer heatwave during standby egress."
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                setSelectedPreset("");
              }}
              rows={2}
              className="flex-1 bg-[#050507] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
            />
            <button
              onClick={() => runSimulation(customPrompt)}
              disabled={isSimulating || !customPrompt.trim()}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 disabled:bg-white/5 text-white rounded-lg px-4 flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-wider border border-blue-500/30 gap-1 transition-all"
            >
              {isSimulating ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>SIMULATE</span>
            </button>
          </div>
        </div>

        {/* Simulation Output Area */}
        <div className="flex-1 min-h-[160px] bg-[#050507]/60 rounded-xl border border-white/5 p-4 font-mono text-[11px] overflow-y-auto max-h-[220px]">
          {isSimulating && (
            <div className="flex flex-col items-center justify-center h-full gap-2.5 text-blue-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="font-mono text-[9px] uppercase tracking-widest">STADIUMOS GENERATING CASCADE MODELS...</span>
            </div>
          )}

          {!isSimulating && !simulationResult && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-1 text-center py-6">
              <HelpCircle className="w-6 h-6" />
              <span className="font-sans text-xs">Select or write a scenario to compile predictive AI impacts.</span>
            </div>
          )}

          {simulationResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                <span className="font-bold text-zinc-300">SCENARIO: {simulationResult.scenario.substring(0, 45)}...</span>
                <span className={`px-2 py-0.5 rounded text-[9px] capitalize ${
                  simulationResult.severity === "critical" || simulationResult.severity === "high"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  SEVERITY: {simulationResult.severity}
                </span>
              </div>

              {/* Predictions */}
              <div>
                <span className="text-amber-400 font-bold block mb-1 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> 1. Cascade Predictions
                </span>
                <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-200 font-sans">
                  {simulationResult.predictions.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              {/* Cascading Risks Grid */}
              <div>
                <span className="text-blue-400 font-bold block mb-1.5 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                  <Layers className="w-3.5 h-3.5" /> 2. System Dependency Impacts
                </span>
                <div className="grid grid-cols-1 gap-1.5 pl-1">
                  {simulationResult.cascadingRisks.map((risk, i) => (
                    <div key={i} className="bg-white/5 p-2 rounded border border-white/5">
                      <div className="flex justify-between font-semibold mb-0.5">
                        <span className="text-zinc-300 font-sans text-xs">{risk.system}</span>
                        <span className={`text-[9px] uppercase ${risk.likelihood === "high" ? "text-red-400" : "text-amber-400"}`}>
                          Prob: {risk.likelihood}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[10px] leading-relaxed font-sans">{risk.impact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable SOP */}
              <div>
                <span className="text-green-500 font-bold block mb-1 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                  <CheckSquare className="w-3.5 h-3.5" /> 3. Stadium SOPs
                </span>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-zinc-200 font-sans">
                  {simulationResult.suggestedSOP.map((sop, i) => (
                    <li key={i}>{sop}</li>
                  ))}
                </ol>
              </div>

              {/* Suggested Immediate Direct Actions */}
              <div>
                <span className="text-blue-400 font-bold block mb-1 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                  <Sparkles className="w-3.5 h-3.5" /> 4. Autonomous Direct Agent Actions
                </span>
                <div className="space-y-1 pl-1">
                  {simulationResult.recommendedActions.map((rec, i) => (
                    <div key={i} className="flex justify-between items-center bg-blue-950/20 px-2 py-1 rounded border border-blue-900/40">
                      <span className="text-blue-300 capitalize font-bold">[{rec.agent}]</span>
                      <span className="text-zinc-200 flex-1 ml-2 truncate font-sans">{rec.action}</span>
                      <span className={`text-[8px] font-bold px-1.5 rounded uppercase ${
                        rec.priority === "high" ? "bg-red-500/20 text-red-400" : "bg-white/5 text-zinc-400"
                      }`}>{rec.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
