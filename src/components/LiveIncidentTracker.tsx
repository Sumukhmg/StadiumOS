/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Incident, AgentRole } from "../types";
import { AlertTriangle, Clock, MapPin, CheckCircle, ChevronDown, ChevronUp, Plus, UserCheck, ShieldAlert, Sparkles, HelpCircle, Timer } from "lucide-react";

interface LiveIncidentTrackerProps {
  incidents: Incident[];
  onIncidentCreate: (incident: any) => void;
  onResolveIncident: (id: string) => void;
  onCompleteTask: (incidentId: string, taskId: string) => void;
}

const IncidentDuration: React.FC<{ reportedAt: string; resolvedAt?: string; status: Incident["status"] }> = ({ reportedAt, resolvedAt, status }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (status === "resolved") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  const start = new Date(reportedAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : now;
  const durationMs = Math.max(0, end - start);
  
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  
  return (
    <div className="flex items-center gap-3 text-[10px] font-mono mt-4 mb-2">
      <div className="flex flex-col items-center">
        <span className="text-zinc-500 font-bold uppercase">Created</span>
        <span className="text-cyan-400">{new Date(reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      
      <div className="flex-1 flex items-center gap-2">
        <div className="h-px bg-white/10 flex-1 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#050507] px-2 flex items-center gap-1.5 text-zinc-300 border border-white/10 rounded-full">
            <Timer className="w-3 h-3 text-amber-400" />
            {minutes}m {seconds}s
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-zinc-500 font-bold uppercase">{status === "resolved" ? "Resolved" : "Active"}</span>
        <span className={status === "resolved" ? "text-emerald-400" : "text-amber-400 animate-pulse"}>
          {status === "resolved" && resolvedAt ? new Date(resolvedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "ONGOING"}
        </span>
      </div>
    </div>
  );
};

export const LiveIncidentTracker: React.FC<LiveIncidentTrackerProps> = ({
  incidents,
  onIncidentCreate,
  onResolveIncident,
  onCompleteTask,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New incident form fields
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<Incident["category"]>("security");
  const [severity, setSeverity] = useState<Incident["severity"]>("medium");

  const getSeverityStyle = (sev: Incident["severity"]) => {
    switch (sev) {
      case "critical":
        return "bg-red-500/20 text-red-400 border border-red-500/50 critical-glow";
      case "high":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/45";
      case "medium":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/30";
      case "low":
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  const getStatusStyle = (status: Incident["status"]) => {
    switch (status) {
      case "active":
        return "bg-red-500/10 text-red-400 border border-red-500/30";
      case "mitigated":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/30";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    onIncidentCreate({
      title,
      location,
      category,
      severity,
    });

    // Reset Form
    setTitle("");
    setLocation("");
    setCategory("security");
    setSeverity("medium");
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#0a0a0e] border border-white/10 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden" id="incident-tracker-container">
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 uppercase">
            <ShieldAlert className="w-4.5 h-4.5 text-red-400" />
            Live Incident Logs
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Tactical Multi-Agent Deployment Dispatcher</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>REPORT ALERT</span>
        </button>
      </div>

      {/* New Incident Form Option */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-[#050507]/90 p-4 rounded-xl border border-white/10 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">INCIDENT TITLE</label>
              <input
                type="text"
                placeholder="e.g. Broken Glass Stand A Row 4"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">LOCATION / SECTOR</label>
              <input
                type="text"
                placeholder="e.g. Section 112 aisle"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 mb-1">TACTICAL CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Incident["category"])}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="security">Security</option>
                <option value="crowd">Crowd Management</option>
                <option value="medical">Medical Emergency</option>
                <option value="maintenance">Maintenance</option>
                <option value="transport">Transport</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 mb-1">SEVERITY INDEX</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Incident["severity"])}
                className="w-full bg-[#0a0a0e] border border-white/10 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[11px] text-zinc-400 hover:text-white font-mono px-2 py-1 uppercase tracking-wider font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded text-[11px] font-bold uppercase tracking-wider px-4 py-2 hover:scale-105 transition-all"
            >
              Dispatch Agent Taskforce
            </button>
          </div>
        </form>
      )}

      {/* Incidents List */}
      <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 space-y-3">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-slate-500 text-center text-xs">
            <HelpCircle className="w-8 h-8 mb-2 opacity-55" />
            <span>All zones reporting nominal status. No active incidents.</span>
          </div>
        ) : (
          incidents.map((incident) => {
            const isExpanded = expandedId === incident.id;
            return (
              <div
                key={incident.id}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  incident.severity === "critical"
                    ? "critical-bg-flash"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5 text-zinc-400 mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white leading-relaxed flex items-center gap-2">
                        {incident.title}
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${getSeverityStyle(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </h3>
                      <div className="flex items-center gap-3.5 mt-1 text-[10px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" /> {incident.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" /> {new Date(incident.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border capitalize ${getStatusStyle(incident.status)}`}>
                      {incident.status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 bg-[#050507]/60 text-[11px] font-mono space-y-4">
                    {/* Duration Timeline Tracker */}
                    <IncidentDuration reportedAt={incident.reportedAt} resolvedAt={incident.resolvedAt} status={incident.status} />

                    {/* Explainable AI block */}
                    {incident.explainableAIReasoning && (
                      <div className="bg-blue-950/20 border border-blue-900/35 p-3 rounded-lg">
                        <div className="text-blue-400 font-bold mb-1 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" /> STADIUMOS EXPLAINABLE AI ANALYSIS (XAI)
                        </div>
                        <p className="text-zinc-300 font-sans leading-relaxed">
                          {incident.explainableAIReasoning}
                        </p>
                      </div>
                    )}

                    {/* SOP & Active Tasks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* SOP steps */}
                      <div>
                        <span className="text-emerald-400 font-bold block mb-1.5">TACTICAL SOP CHECKLIST</span>
                        <ul className="space-y-1 text-slate-300 list-inside list-decimal font-sans">
                          {incident.sop.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Active Tasks list */}
                      <div>
                        <span className="text-blue-400 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">AUTONOMOUS DISPATCH TASKS</span>
                        <div className="space-y-1.5">
                          {incident.tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => task.status !== "completed" && onCompleteTask(incident.id, task.id)}
                              className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-all ${
                                task.status === "completed"
                                  ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-300"
                                  : "bg-[#050507] border-white/10 hover:border-white/20 text-zinc-300"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${task.status === "completed" ? "bg-emerald-500" : "bg-cyan-400 animate-pulse"}`} />
                                <span className="font-sans text-[11px]">{task.description}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-mono border border-white/5">
                                  {task.assignedTo}
                                </span>
                                {task.status !== "completed" && (
                                  <UserCheck className="w-3.5 h-3.5 text-cyan-400 hover:scale-110" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="border-t border-white/5 pt-3">
                      <span className="text-zinc-500 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">SOP ACTION LOG</span>
                      <div className="space-y-1 pl-1 border-l border-white/10">
                        {incident.timeline.map((event, i) => (
                          <div key={i} className="flex items-start gap-2 text-[10px] leading-relaxed relative pl-3.5 py-0.5">
                            <span className="absolute left-[-4.5px] top-[7px] w-2 h-2 rounded-full bg-[#050507] border border-white/10" />
                            <span className="text-blue-400 font-bold shrink-0">{event.time}</span>
                            {event.agent && (
                              <span className="text-zinc-400 capitalize shrink-0 font-bold">[{event.agent}]</span>
                            )}
                            <span className="text-zinc-300 font-sans">{event.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resolve button action */}
                    {incident.status !== "resolved" && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => onResolveIncident(incident.id)}
                          className="bg-gradient-to-r from-emerald-600 to-green-500 hover:scale-105 text-white font-bold tracking-wider uppercase font-mono rounded-lg text-[10px] px-4 py-2 flex items-center gap-1.5 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> RESOLVE INCIDENT
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
