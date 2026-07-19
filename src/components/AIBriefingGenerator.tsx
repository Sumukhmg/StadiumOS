/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { FileText, Sparkles, Loader2, Download, RefreshCw, Layers } from "lucide-react";

interface AIBriefingGeneratorProps {
  selectedZoneId: string | null;
  selectedZoneName: string | null;
}

const PERSPECTIVES = [
  { id: "general", label: "Executive Safety Overview", icon: Layers },
  { id: "crowd", label: "Crowd Flow & Transit Plan", icon: FileText },
  { id: "energy", label: "Energy Grid Efficiency", icon: Sparkles },
];

export const AIBriefingGenerator: React.FC<AIBriefingGeneratorProps> = ({
  selectedZoneId,
  selectedZoneName,
}) => {
  const [activePerspective, setActivePerspective] = useState("general");
  const [briefing, setBriefing] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBriefing = async (perspectiveId: string, zoneId: string | null) => {
    setIsLoading(true);
    try {
      const body: any = {};
      if (zoneId) {
        body.zoneId = zoneId;
      } else {
        const perspective = PERSPECTIVES.find(p => p.id === perspectiveId);
        body.perspective = perspective?.label;
      }

      const response = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.briefing) {
        setBriefing(data.briefing);
      }
    } catch (err) {
      console.error("Failed to generate briefing:", err);
      setBriefing("Error compiling briefing report. Check your Gemini API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing(activePerspective, selectedZoneId);
  }, [selectedZoneId, activePerspective]);

  const handleDownloadReport = () => {
    const blob = new Blob([briefing], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stadiumos-briefing-${selectedZoneId || activePerspective}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0a0a0e] border border-white/10 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden" id="briefing-generator-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div>
          <h2 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 uppercase">
            <FileText className="w-4.5 h-4.5 text-blue-400" />
            AI Executive Briefing
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">On-Demand Operational Strategic Summaries</p>
        </div>
        <button
          onClick={() => fetchBriefing(activePerspective, selectedZoneId)}
          disabled={isLoading}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-all hover:scale-105 disabled:opacity-50"
          title="Re-compile briefing"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Selective Perspectives bar */}
      {!selectedZoneId && (
        <div className="flex gap-2 mb-4">
          {PERSPECTIVES.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setActivePerspective(p.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all uppercase tracking-wider ${
                  activePerspective === p.id
                    ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border-blue-500/50 text-white"
                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedZoneId && (
        <div className="bg-blue-950/20 border border-blue-900/35 rounded-lg p-2.5 mb-4 text-xs flex justify-between items-center text-zinc-300">
          <span>Active Scope Focus: <strong>{selectedZoneName}</strong></span>
          <button
            onClick={() => setActivePerspective("general")}
            className="text-[10px] text-blue-400 font-mono hover:underline uppercase"
          >
            Clear Focus
          </button>
        </div>
      )}

      {/* Briefing Text Area */}
      <div className="flex-1 min-h-[220px] bg-[#050507]/60 rounded-xl border border-white/5 p-5 overflow-y-auto max-h-[380px] leading-relaxed font-sans text-xs text-zinc-300 select-text">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2.5 text-blue-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-mono text-[9px] uppercase tracking-widest">Orchestrating Telemetry with Gemini...</span>
          </div>
        ) : (
          <div className="markdown-body prose prose-invert max-w-none space-y-3 prose-headings:font-semibold prose-headings:text-white prose-p:leading-relaxed prose-strong:text-blue-400">
            <Markdown>{briefing}</Markdown>
          </div>
        )}
      </div>

      {/* Download Action button */}
      {!isLoading && briefing && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleDownloadReport}
            className="bg-white/5 hover:bg-white/10 text-zinc-200 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT DISPATCH TEXT</span>
          </button>
        </div>
      )}
    </div>
  );
};
