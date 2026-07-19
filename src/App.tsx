/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { StadiumZone, AgentState, Incident, TelemetryData } from "./types";
import { DigitalTwin } from "./components/DigitalTwin";
import { AgentStatusGrid } from "./components/AgentStatusGrid";
import { PredictiveAnalytics } from "./components/PredictiveAnalytics";
import { LiveIncidentTracker } from "./components/LiveIncidentTracker";
import { VoiceOperator } from "./components/VoiceOperator";
import { AIBriefingGenerator } from "./components/AIBriefingGenerator";
import { Shield, Users, Radio, Cpu, RefreshCw, Layers, Calendar, Clock, Volume2, Globe } from "lucide-react";

export default function App() {
  const [zones, setZones] = useState<StadiumZone[]>([]);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandResponse, setCommandResponse] = useState<string | null>(null);

  // Time tracker
  const [currentTime, setCurrentTime] = useState(new Date("2026-07-19T01:21:01-07:00"));

  // Fetch current state from full-stack server
  const fetchState = async () => {
    try {
      const response = await fetch("/api/state");
      const data = await response.json();
      setZones(data.zones);
      setAgents(data.agents);
      setIncidents(data.incidents);
      setTelemetry(data.telemetry);
    } catch (err) {
      console.error("Failed to fetch stadium state:", err);
    }
  };

  // Set up polling
  useEffect(() => {
    fetchState();
    const interval = setInterval(() => {
      fetchState();
      // Tick clock forward slightly
      setCurrentTime(prev => new Date(prev.getTime() + 5000));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle direct custom or voice command dispatches
  const handleCommand = async (commandText: string) => {
    setCommandLoading(true);
    setCommandResponse(null);
    try {
      const response = await fetch("/api/agent/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: commandText }),
      });
      const data = await response.json();
      if (data.response) {
        setCommandResponse(data.response);
        if (data.agentUpdates) {
          setAgents(data.agentUpdates);
        }
        // Refresh incidents and zones as they might have been triggered
        fetchState();
      }
    } catch (err) {
      console.error("Failed to run agent command:", err);
      setCommandResponse("Execution failed. Unable to coordinate response.");
    } finally {
      setCommandLoading(false);
    }
  };

  // Report new incident via form
  const handleIncidentCreate = async (newIncidentData: {
    title: string;
    location: string;
    category: Incident["category"];
    severity: Incident["severity"];
  }) => {
    try {
      const response = await fetch("/api/incidents/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncidentData),
      });
      const data = await response.json();
      if (data.success) {
        // Refresh state to reflect the reported incident
        fetchState();
      }
    } catch (err) {
      console.error("Failed to create incident:", err);
    }
  };

  // Resolve incident (optimistic update + log update)
  const handleResolveIncident = (id: string) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === id) {
          return {
            ...inc,
            status: "resolved",
            timeline: [
              ...inc.timeline,
              { time: new Date().toLocaleTimeString(), event: "Incident declared resolved by operations command supervisor.", agent: "master" }
            ],
            tasks: inc.tasks.map(t => ({ ...t, status: "completed" }))
          };
        }
        return inc;
      })
    );
  };

  // Complete specific subtask optimistically
  const handleCompleteTask = (incidentId: string, taskId: string) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            tasks: inc.tasks.map(t => {
              if (t.id === taskId) {
                return { ...t, status: "completed" };
              }
              return t;
            }),
            timeline: [
              ...inc.timeline,
              { time: new Date().toLocaleTimeString(), event: `Task completed: "${inc.tasks.find(tk => tk.id === taskId)?.description}"`, agent: "incident" }
            ]
          };
        }
        return inc;
      })
    );
  };

  // Reset core state
  const handleResetState = async () => {
    try {
      const response = await fetch("/api/state/reset", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        fetchState();
        setSelectedZoneId(null);
        setCommandResponse(null);
      }
    } catch (err) {
      console.error("State reset failed:", err);
    }
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  // Total stadium attendance
  const currentAttendance = zones
    .filter(z => ["stand_a", "stand_b", "vip_lounge"].includes(z.id))
    .reduce((acc, z) => acc + z.currentCount, 0);

  const totalCapacity = zones
    .filter(z => ["stand_a", "stand_b", "vip_lounge"].includes(z.id))
    .reduce((acc, z) => acc + z.capacity, 0);

  const averageDensity = Math.round((currentAttendance / totalCapacity) * 100);

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e0] flex flex-col font-sans overflow-x-hidden antialiased p-4 sm:p-6" id="stadiumos-root">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111116_0%,_#050507_100%)] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-400/5 blur-[150px] rounded-full pointer-events-none" />

      {/* HEADER BAR */}
      <header className="bg-[#0a0a0e]/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:px-6 sm:py-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/10">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-widest text-white font-sans uppercase">
                Stadium<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-extrabold">OS</span>
              </h1>
              <span className="text-[10px] font-mono bg-white/5 text-zinc-300 px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider">
                v2026.1
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter italic">
              The Multi-Agent Operational Intelligence Deck for FIFA World Cup 2026™
            </p>
          </div>
        </div>

        {/* Global Match telemetry */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono bg-[#0a0a0e]/80 px-5 py-2.5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <Globe className="text-blue-400 w-4 h-4" />
            <div>
              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">FIFA VENUE MATCH</span>
              <span className="text-white font-semibold">USA vs ARG (QF)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <Clock className="text-cyan-400 w-4 h-4" />
            <div>
              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">GAME PERIOD</span>
              <span className="text-white font-semibold">78' (2nd Half)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <Users className="text-emerald-400 w-4 h-4" />
            <div>
              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">ATTENDANCE</span>
              <span className="text-white font-semibold">{currentAttendance.toLocaleString()} / {totalCapacity.toLocaleString()} ({averageDensity}%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="text-amber-400 w-4 h-4" />
            <div>
              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">OPERATIONAL TIME</span>
              <span className="text-white font-semibold">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetState}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-zinc-300 hover:text-white transition-all hover:scale-105"
            title="Reset Digital Twin State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 flex-1 items-stretch">
        {/* LEFT COLUMN: DIGITAL TWIN & AI BRIEFINGS (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1">
            <DigitalTwin
              zones={zones}
              onZoneSelect={setSelectedZoneId}
              selectedZoneId={selectedZoneId}
            />
          </div>
          <div className="flex-1">
            <AIBriefingGenerator
              selectedZoneId={selectedZoneId}
              selectedZoneName={selectedZone ? selectedZone.name : null}
            />
          </div>
        </div>

        {/* MIDDLE COLUMN: INCIDENTS, SPEECH DISPATCHER & PREDICTIVES (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1">
            <LiveIncidentTracker
              incidents={incidents}
              onIncidentCreate={handleIncidentCreate}
              onResolveIncident={handleResolveIncident}
              onCompleteTask={handleCompleteTask}
            />
          </div>
          <div className="flex-1">
            <VoiceOperator
              onCommandTrigger={handleCommand}
              isLoading={commandLoading}
              latestResponse={commandResponse}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: AI AGENT BENTO MATRIX & CAPACITY MONITORING (lg:col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1">
            <AgentStatusGrid
              agents={agents}
              onCommandTrigger={handleCommand}
            />
          </div>
          <div className="flex-1">
            <PredictiveAnalytics
              telemetry={telemetry}
            />
          </div>
        </div>
      </main>

      {/* FOOTER METRICS BAR */}
      <footer className="mt-6 glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-slate-500 relative z-10 gap-3">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>STADIUMOS CLOUD INTEGRITY STATUS: <strong className="text-slate-300">ACTIVE PROD INGRESS (OK)</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>PRIMARY ENGINE: <strong className="text-indigo-400 font-semibold">GEMINI 2.5 COGNITIVE CORE</strong></span>
          <span className="hidden md:inline text-slate-800">|</span>
          <span>LOCATION CONTEXT: <strong className="text-slate-300">METLIFE STADIUM (EAST RUTHERFORD, NJ)</strong></span>
        </div>
      </footer>
    </div>
  );
}
