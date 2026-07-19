# 🏟️ StadiumOS

> **"The AI Operating System for Event Operations & Crowd Control."**  
> *A cutting-edge, production-ready full-stack Multi-Agent stadium operations coordinator designed to predict, simulate, and resolve live operational friction.*

---

## 🎯 Chosen Vertical: Event Operations & Crowd Management

StadiumOS targets the highly complex vertical of **Event Operations and Crowd Control** (specifically tailored for mega-events like the FIFA World Cup). Managing a stadium with 80,000+ attendees involves orchestrating security, medical response, transport, crowd flow, and utilities. StadiumOS centralizes these domains using AI agents, moving from reactive incident response to proactive simulation and mitigation.

---

## 🧠 Approach and Logic

The core logic revolves around a **Multi-Agent Coordination Model**. Instead of a single monolithic AI, the system simulates 13 specialized operational agents (e.g., Security, Crowd Control, Medical, Weather, Transport). 

- **State Management**: A centralized Node.js backend maintains the "Stadium State," continuously generating telemetry (crowd density, energy demand).
- **Agentic Workflows**: When an incident is logged (or simulated via the "What-If" engine), the Master Orchestrator routes tasks to specific sub-agents. Each agent updates its internal "thought" process and "action" state.
- **LLM Integration**: We utilize **Gemini (via `@google/genai`)** on the server side to process complex simulation requests, generate Standard Operating Procedures (SOPs), and provide contextual summaries of stadium zones.
- **Explainable AI (XAI)**: Every incident includes a generated explanation of *why* the incident occurred (e.g., "Hardware malfunction combined with +18% passenger influx"), building trust with human operators.

---

## ⚙️ How the Solution Works

1. **Digital Twin (Real-Time SVG Map)**: A live interactive SVG blueprint of the stadium updates dynamically. Zones glow amber or red if their crowd density exceeds critical thresholds (90%+).
2. **Telemetry Dashboard**: Tracks crowd flow and energy demand over time using React-Recharts.
3. **Agent Matrix**: A grid displaying the real-time status (idle, responding), operational capacity, and latest thoughts/actions of all 13 specialized agents.
4. **Live Incident Tracker**: Tracks active alerts, complete with a timeline of events, assigned agents, and a visual progress timeline showing the duration between incident creation and resolution.
5. **What-If Simulation Engine**: Users can input hypothetical scenarios (e.g., "Category 3 hurricane approaching during halftime"). The backend sends this to Gemini, which generates cascading risks, assigns tasks to agents, and outlines an SOP.
6. **Backend Infrastructure**: An Express.js server handles API routes (`/api/state`, `/api/simulate`) and mounts Vite middleware for local development.

---

## 🧐 Assumptions Made

- **Sensor Network Availability**: The system assumes the stadium is equipped with a high-fidelity IoT sensor network (CCTV crowd counting, RFID turnstiles, thermal sensors) to provide the telemetry data.
- **Connectivity**: Assumes a stable, high-bandwidth connection between the operational command center and the cloud backend.
- **Agent Authority**: Assumes that AI agents have the authority to automatically dispatch certain resources (e.g., redirecting digital signage, altering turnstile flow), while human operators retain override capabilities.
- **Mock Data for Preview**: In this demonstration environment, live sensor data is simulated through an internal loop in the Node.js backend.

---

## ♿ Accessibility Features (Inclusive & Usable Design)

StadiumOS incorporates accessible design principles to ensure usability for all operators, including those in high-stress, fast-paced environments or with visual impairments:

- **High Contrast UI**: Uses a dark theme with high-contrast text (e.g., bright cyan, amber, emerald) against deep slate backgrounds, reducing eye strain and ensuring readability.
- **Color-Blind Friendly Indicators**: Incident severities and zone densities do not rely solely on color. They use recognizable icons (Lucide React), descriptive text labels, and structural layout cues (e.g., flashing borders and pulsating SVGs).
- **Semantic HTML & Keyboard Navigation**: Uses semantic elements and interactive elements are focusable.
- **Legibility**: Uses a combination of highly legible sans-serif fonts (Inter) for standard text and monospaced fonts (JetBrains Mono) for numerical data and timestamps, preventing misreading of critical telemetry.

---

## 🏗️ Code Quality (Structure, Readability, Maintainability)

- **Modular Architecture**: The codebase is strictly divided into logical domains. React components are isolated in `src/components/`, types are centralized in `src/types.ts`, and server logic is contained in `server.ts`.
- **TypeScript Strictness**: Interfaces and enums are used extensively (`AgentRole`, `Incident`, `Zone`) to ensure type safety across the full stack, preventing runtime errors.
- **Readability**: Code is well-commented, utilizing clear, descriptive variable names (e.g., `operationalCapacity`, `explainableAIReasoning`).
- **Separation of Concerns**: The frontend strictly handles presentation and UI state, while the backend handles simulation logic, state management, and LLM communication.

---

## 🔒 Security (Safe and Responsible Implementation)

- **Server-Side API Execution**: **Crucially, the `GEMINI_API_KEY` is never exposed to the client.** All interactions with the Gemini LLM occur exclusively on the Express backend (`server.ts`). The frontend proxies requests via `/api/simulate`.
- **Graceful Degradation**: If the Gemini API key is missing or invalid, the backend intercepts the failure and returns a structured mock response. This prevents the application from crashing and maintains operational continuity.
- **No Direct DOM Manipulation**: React is used strictly for declarative rendering, preventing XSS vulnerabilities associated with manual DOM injection.

---

## ⚡ Efficiency (Optimal Use of Resources)

- **Vite & Esbuild**: Development uses Vite middleware for lightning-fast HMR. For production (`npm run build`), `esbuild` bundles the backend into a single, highly optimized `dist/server.cjs` file, minimizing disk I/O and cold-start times.
- **Debounced Rendering**: Expensive re-renders (like SVG map updates and chart animations) are optimized. Telemetry loops are managed efficiently on the server to prevent client-side CPU blocking.
- **Tailwind CSS**: Utility classes are compiled ahead of time, ensuring only the exact CSS used in the application is shipped to the client, reducing payload size.

---

## 🧪 Testing (Validation of Functionality)

- **Type Checking & Linting**: The `npm run lint` script runs `tsc --noEmit`, statically analyzing the entire codebase to catch type mismatches, missing properties, and invalid imports before runtime.
- **Build Verification**: The deployment pipeline ensures that `npm run build` completes successfully, verifying that both the React SPA and the Express backend compile without errors.
- **Resilience Testing**: The UI components are built to handle missing or undefined data gracefully (e.g., optional chaining `.?` and fallback UI states) to ensure the command center dashboard never white-screens during a live event.
