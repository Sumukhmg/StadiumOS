/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AgentState, AgentRole } from "../types";
import { Shield, Brain, Sparkles, AlertCircle, Play, CheckCircle, Activity, Heart, Settings, Bus, Coffee, Accessibility, CloudSun, Zap, Video, Trash2, ShieldAlert } from "lucide-react";

interface AgentStatusGridProps {
  agents: AgentState[];
  onCommandTrigger: (command: string) => void;
}

const AGENT_ICONS: Record<AgentRole, React.ComponentType<any>> = {
  master: Sparkles,
  security: Shield,
  crowd: Activity,
  medical: Heart,
  maintenance: Settings,
  transport: Bus,
  vendor: Coffee,
  accessibility: Accessibility,
  weather: CloudSun,
  energy: Zap,
  broadcast: Video,
  cleaning: Trash2,
  incident: ShieldAlert,
};

export const AgentStatusGrid: React.FC<AgentStatusGridProps> = ({ agents, onCommandTrigger }) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentState | null>(null);
  const [customActionPrompt, setCustomActionPrompt] = useState("");

  const getStatusColor = (status: AgentState["status"]) => {
    switch (status) {
      case "idle":
        return "bg-white/5 text-zinc-400 border-white/10";
      case "analyzing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse";
      case "responding":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "alert":
        return "bg-red-500/10 text-red-400 border-red-500/30 critical-glow";
    }
  };

  const getCapacityColor = (cap: number) => {
    if (cap > 90) return "bg-green-500";
    if (cap > 75) return "bg-amber-500";
    return "bg-red-500";
  };

  const triggerDirectAction = (agent: AgentState) => {
    if (!customActionPrompt.trim()) return;
    onCommandTrigger(`Direct the ${agent.name} to: ${customActionPrompt}`);
    setCustomActionPrompt("");
    setSelectedAgent(null);
  };

  return (
    <div className="flex flex-col h-full" id="agents-grid-container">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 uppercase">
            <Brain className="w-4.5 h-4.5 text-blue-400" />
            AI Operating Agents Matrix
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">13 Autonomous Coordinated Neural Nodes</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 overflow-y-auto max-h-[640px] pr-1">
        {agents.map((agent) => {
          const Icon = AGENT_ICONS[agent.id] || Brain;
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedAgent(agent);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Select ${agent.name}`}
              className={`bg-[#0a0a0e] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedAgent?.id === agent.id ? "border-blue-500 shadow-lg shadow-blue-500/5" : "border-white/10"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-1.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#050507] border border-white/5 text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white truncate max-w-[100px]">{agent.name}</span>
                  </div>
                  <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded-full capitalize ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>

                {/* Thought Snip */}
                <p className="text-[11px] text-zinc-300 leading-normal font-sans line-clamp-2 h-8 mb-3">
                  "{agent.latestThought}"
                </p>
              </div>

              {/* Capacity Progress */}
              <div className="border-t border-white/5 pt-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1">
                  <span>CAPACITY</span>
                  <span className="text-zinc-300 font-bold">{agent.operationalCapacity}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${getCapacityColor(agent.operationalCapacity)}`}
                    style={{ width: `${agent.operationalCapacity}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill-down Modal overlay inside component */}
      {selectedAgent && (
        <div className="absolute inset-0 bg-[#050507]/90 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-center items-center z-20">
          <div className="bg-[#0a0a0e] border border-white/10 w-full max-w-md rounded-xl p-5 relative shadow-2xl">
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-mono text-[10px] uppercase tracking-wider font-bold"
            >
              [ESC] CLOSE
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-950/20 border border-blue-900/35 text-blue-400">
                {React.createElement(AGENT_ICONS[selectedAgent.id] || Brain, { className: "w-5 h-5" })}
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">{selectedAgent.name}</h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Role: {selectedAgent.id} agent node</p>
              </div>
            </div>

            <div className="space-y-3.5 mb-5 font-mono text-xs">
              <div className="bg-[#050507]/60 p-3 rounded-lg border border-white/5">
                <div className="text-blue-400 font-semibold mb-1 flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5" /> NEURAL REASONING STATS
                </div>
                <p className="text-zinc-200 leading-relaxed italic font-sans">"{selectedAgent.latestThought}"</p>
              </div>

              <div className="bg-[#050507]/60 p-3 rounded-lg border border-white/5">
                <div className="text-green-500 font-semibold mb-1 flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5" /> ACTIVE DIRECT DISPATCH
                </div>
                <p className="text-zinc-200 leading-relaxed font-sans">{selectedAgent.latestAction}</p>
              </div>
            </div>

            {/* Direct dispatch interface */}
            <div className="border-t border-white/5 pt-4">
              <label className="block text-[10px] font-mono text-zinc-500 mb-2 uppercase tracking-widest">DISPATCH DIRECT COMMAND</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`e.g., Deploy additional teams to Stand A...`}
                  value={customActionPrompt}
                  onChange={(e) => setCustomActionPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      triggerDirectAction(selectedAgent);
                    }
                  }}
                  className="flex-1 bg-[#050507] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => triggerDirectAction(selectedAgent)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-105"
                >
                  <Play className="w-3 h-3 fill-white" /> Run
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
