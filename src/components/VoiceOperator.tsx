/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mic, Send, RefreshCw, Sparkles, Loader2, Volume2 } from "lucide-react";

interface VoiceOperatorProps {
  onCommandTrigger: (command: string) => void;
  isLoading: boolean;
  latestResponse: string | null;
}

const PRESET_VOICE_COMMANDS = [
  "Instruct transport agent to double post-game shuttle train frequency.",
  "Dispatch medical team and rapid response agent to section 112 Row M.",
  "Security agent: deploy perimeter camera checks at turnstiles of Gate C.",
  "Energy agent: optimize cooling parameters in Concourse West immediately.",
];

export const VoiceOperator: React.FC<VoiceOperatorProps> = ({
  onCommandTrigger,
  isLoading,
  latestResponse,
}) => {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    onCommandTrigger(command);
    setCommand("");
  };

  const simulateSpeechInput = () => {
    setIsListening(true);
    const randomPreset = PRESET_VOICE_COMMANDS[Math.floor(Math.random() * PRESET_VOICE_COMMANDS.length)];
    
    setTimeout(() => {
      setCommand(randomPreset);
      setIsListening(false);
    }, 1800);
  };

  return (
    <div className="bg-[#0a0a0e] border border-white/10 rounded-2xl p-6 flex flex-col h-full relative overflow-hidden" id="voice-operator-container">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-sm font-bold tracking-widest text-white flex items-center gap-2 uppercase">
          <Volume2 className="w-4.5 h-4.5 text-blue-400" />
          AI Voice & Command Console
        </h2>
        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">Natural Language Operational Command Parsing</p>
      </div>

      {/* Voice input mic simulator */}
      <div className="bg-[#050507]/60 rounded-xl border border-white/5 p-5 flex flex-col items-center justify-center gap-3.5 mb-4 relative overflow-hidden">
        {/* Animated rings if listening */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-24 h-24 rounded-full border border-blue-500/40 animate-ping absolute" />
            <span className="w-16 h-16 rounded-full border border-cyan-500/30 animate-pulse absolute" />
          </div>
        )}

        <button
          onClick={simulateSpeechInput}
          disabled={isListening || isLoading}
          className={`p-4 rounded-full border transition-all duration-300 relative z-10 ${
            isListening
              ? "bg-red-600/30 border-red-500 text-red-400 animate-pulse scale-105"
              : "bg-blue-950/50 border-blue-900/55 text-blue-400 hover:bg-blue-900/50 hover:scale-105"
          }`}
        >
          <Mic className="w-6 h-6" />
        </button>

        <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
          {isListening ? "LISTENING TO VOICE INPUT..." : "CLICK TO SIMULATE VOICE SPEECH COMMAND"}
        </span>
      </div>

      {/* Manual Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Type an operations instruction... e.g. Dispatch cleaning to Concourse East food stands"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={isLoading || isListening}
          className="flex-1 bg-[#050507] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !command.trim() || isListening}
          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 disabled:bg-white/5 text-white rounded-xl px-4 flex items-center justify-center font-bold text-xs border border-blue-500/30 transition-all"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
        </button>
      </form>

      {/* Preset Macros */}
      <div className="mb-4">
        <span className="block text-[9px] font-mono text-zinc-500 mb-2 uppercase tracking-widest">QUICK DISPATCH MACROS</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_VOICE_COMMANDS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onCommandTrigger(preset)}
              disabled={isLoading || isListening}
              className="text-[10px] text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1.5 rounded-lg text-left truncate max-w-full font-sans transition-all"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Master AI Response Terminal */}
      <div className="flex-1 bg-[#050507]/60 rounded-xl border border-white/5 p-4 font-mono text-[11px] overflow-y-auto max-h-[160px]">
        <div className="text-blue-400 font-bold mb-1.5 flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> MASTER ORCHESTRATOR TELEMETRY REPLY
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-zinc-400 py-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>ORCHESTRATOR PARSING NEURAL PATHS...</span>
          </div>
        ) : latestResponse ? (
          <p className="text-zinc-200 leading-relaxed font-sans">{latestResponse}</p>
        ) : (
          <p className="text-zinc-500 italic font-sans">No instructions dispatched yet in this watch cycle.</p>
        )}
      </div>
    </div>
  );
};
