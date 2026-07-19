# 🏟️ StadiumOS

> **"The AI Operating System for FIFA World Cup 2026."**  
> *A cutting-edge, production-ready full-stack Multi-Agent stadium operations coordinator designed to predict, simulate, and resolve live operational friction.*

---

## 🚀 Concept Overview
StadiumOS is an autonomous operational brain for stadium infrastructure. Rather than acting as a simple chatbot, StadiumOS leverages a **Multi-Agent Coordination Model** powered by **Gemini 2.5 (using `@google/genai` on the server)** to unify 13 specialized operational agents. It acts as an elite command deck during high-tension, high-occupancy FIFA 2026 matches, coordinating security, crowd control, medical units, grid power, and weather logistics.

---

## 🛠️ The Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Recharts
- **Backend**: Node.js, Express, tsx (for TS dev execution), esbuild (for production-optimized bundles)
- **AI Engine**: Gemini 2.5 (`gemini-3.5-flash` for high-speed reasoning, executive briefs, and SOP generation)
- **Data Model**: Real-time reactive telemetry digital twin, with background sensor drift simulations and full-stack API integration.

---

## ⚙️ Architecture & Data Ingress

```
                        ┌────────────────────────┐
                        │    Stadium Command     │ (React 19 Front-End)
                        └───────────┬────────────┘
                                    │ Live REST Telemetry, Web-Interactions
                                    ▼
                        ┌────────────────────────┐
                        │   Express Full-Stack   │ (server.ts / Node Engine)
                        └───────────┬────────────┘
                                    │
           ┌────────────────────────┼────────────────────────┐
           ▼                        ▼                        ▼
┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
│ 13 Neural Agents   │   │ What-If Simulator  │   │  Briefing Engine   │
│ (State Managers)   │   │  (Cascade Models)  │   │  (SOP Generator)   │
└──────────┬─────────┘   └──────────┬─────────┘   └──────────┬─────────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    ▼ Lazy Load
                        ┌────────────────────────┐
                        │   @google/genai SDK    │
                        └───────────┬────────────┘
                                    ▼
                        ┌────────────────────────┐
                        │  Gemini 3.5 Cognitive  │ (Server-Side Secure)
                        └────────────────────────┘
```

StadiumOS models operation centers as a tightly integrated network:
- **Digital Twin**: Live interactive SVG blueprint of MetLife Stadium. Updates every 8 seconds with dynamic telemetry (current attendee counts, thermal ranges, power demand load). Hovering sectors displays quick stats, and clicking a zone requests a localized AI briefing.
- **Agent Matrix Bento**: Tracks all 13 agents, revealing their current operational status, live thoughts, action dispatches, and capacity meters.
- **Predictive Analytics Sandbox**: Powered by Recharts to chart inflow rates and energy draws. It embeds a **"What-If" Simulation Sandbox** to run extreme weather, transit, crowd, or power grid scenarios directly through Gemini, returning structured cascading risks, recommended SOPs, and agent tasks.
- **Live Incident Board**: Tracks active and mitigated alerts, showing full timeline logs, assigned responders, and tasks. It also features a **"Report Incident" form** that updates agent status dynamically, complete with Explainable AI reasoning.
- **Voice Operations**: Simulates natural-language voice/text commands parsed in real-time by the Master Orchestrator.

---

## 🏃 Setup & Launch

### 1. Configure Secrets
Ensure you have set the `GEMINI_API_KEY` inside your environment or your workspace's secrets panel.
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 2. Development Mode
Run the full-stack development environment:
```bash
npm run dev
```
This boots the Express backend on **port 3000** and mounts the Vite dev middleware to compile and serve front-end files seamlessly on the fly.

### 3. Production Build & Execution
Compile and bundle the React client and TypeScript backend:
```bash
npm run build
npm start
```
This executes Vite to compile assets, then leverages `esbuild` to compile `server.ts` into a self-contained, high-performance CommonJS file at `dist/server.cjs` and launches it with raw Node, bypassing any ESM import runtime issues.

---

## 🛡️ Security & Integrity

- **API Safety**: Standardized on full-stack architecture. Under no circumstances is the Gemini API key exposed to client browser bundles. All requests are securely proxied via the server.
- **Fallback Simulation Modality**: If no Gemini API key is configured, StadiumOS gracefully shifts into high-fidelity offline simulation mode, so you always get a functional, zero-crash operational dashboard demonstration.
