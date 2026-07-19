/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { AgentState, StadiumZone, Incident, SimulationResult, TelemetryData } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// ----------------------------------------------------
// CORE IN-MEMORY STATE FOR STADIUMOS (FIFA World Cup 2026)
// MetLife Stadium Venue Profile (New York/New Jersey)
// ----------------------------------------------------

let zones: StadiumZone[] = [
  { id: "pitch", name: "Field of Play (Pitch)", crowdDensity: 12, temperature: 24.2, energyLoad: 450, status: "normal", capacity: 500, currentCount: 60 },
  { id: "stand_a", name: "Lower Stand A (General Seating)", crowdDensity: 88, temperature: 25.1, energyLoad: 210, status: "warning", capacity: 22000, currentCount: 19360 },
  { id: "stand_b", name: "Upper Stand B (General Seating)", crowdDensity: 74, temperature: 24.8, energyLoad: 180, status: "normal", capacity: 28000, currentCount: 20720 },
  { id: "concourse_a", name: "Concourse East (F&B Concessions)", crowdDensity: 92, temperature: 26.5, energyLoad: 310, status: "warning", capacity: 12000, currentCount: 11040 },
  { id: "concourse_b", name: "Concourse West (F&B Concessions)", crowdDensity: 65, temperature: 23.9, energyLoad: 280, status: "normal", capacity: 12000, currentCount: 7800 },
  { id: "gate_c", name: "Gate C (North Perimeter Entrance)", crowdDensity: 96, temperature: 27.0, energyLoad: 80, status: "critical", capacity: 8000, currentCount: 7680 },
  { id: "transit_hub", name: "Stadium Transit Station & Bus Rail", crowdDensity: 82, temperature: 25.4, energyLoad: 120, status: "normal", capacity: 15000, currentCount: 12300 },
  { id: "vip_lounge", name: "FIFA President's Club & Suites", crowdDensity: 45, temperature: 21.0, energyLoad: 190, status: "normal", capacity: 1500, currentCount: 675 },
];

let agents: AgentState[] = [
  {
    id: "master",
    name: "Master AI Orchestrator",
    status: "idle",
    operationalCapacity: 100,
    latestThought: "System telemetry verified. Operating constraints within standard World Cup safety profile.",
    latestAction: "Monitoring all operations agents. Standard status checking.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "security",
    name: "Security Agent",
    status: "idle",
    operationalCapacity: 98,
    latestThought: "Analyzing bag-check turnstile processing speeds at outer rings. Gate C is lagging.",
    latestAction: "Recommending additional canine screening unit shift to Gate C perimeter.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "crowd",
    name: "Crowd Control Agent",
    status: "responding",
    operationalCapacity: 92,
    latestThought: "Concourse East density exceeds 90%. Egress routes must be expanded before half-time.",
    latestAction: "Opening secondary flow gates 12-14 to redistribute concourse traffic.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "medical",
    name: "Medical Emergency Agent",
    status: "idle",
    operationalCapacity: 100,
    latestThought: "Stand A lower deck reporting slightly elevated ambient temperature. Monitoring for heat incidents.",
    latestAction: "Pre-positioning mobile medical cart near vomitory A12.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "maintenance",
    name: "Maintenance Agent",
    status: "idle",
    operationalCapacity: 95,
    latestThought: "Turnstile 14B at Gate C reporting occasional mechanical delay.",
    latestAction: "Dispatched technician to check RFID scanner calibration at Turnstile 14B.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "transport",
    name: "Transport & Logistics Agent",
    status: "idle",
    operationalCapacity: 94,
    latestThought: "Train arrivals scheduled for every 4 minutes. Ingress flow is matching projected rate.",
    latestAction: "Communicating with Transit Authority to standby for additional post-match shuttle assets.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "vendor",
    name: "Vendor Management Agent",
    status: "idle",
    operationalCapacity: 97,
    latestThought: "Hot dog and hydration units reporting high volume in East Concourse. POS terminals functioning smoothly.",
    latestAction: "Notified cleaning services of higher garbage density around Zone A concessions.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "accessibility",
    name: "ADA & Accessibility Agent",
    status: "idle",
    operationalCapacity: 100,
    latestThought: "Elevator 4 working at peak load. VIP shuttle demand for senior patrons is being managed.",
    latestAction: "Dispatched dedicated volunteer escort to assist family at Gate D seating ramp.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "weather",
    name: "Meteorology Agent",
    status: "idle",
    operationalCapacity: 100,
    latestThought: "Current clear sky, 27°C. Humidity is 52%. Zero lightning probability in the next 120 minutes.",
    latestAction: "Broadcasting weather telemetry updates to Energy and Medical agents.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "energy",
    name: "Grid & Energy Agent",
    status: "idle",
    operationalCapacity: 96,
    latestThought: "Chiller water temperatures optimized. Stadium HVAC running at 82% capacity to save energy.",
    latestAction: "Capping ancillary display board illumination levels to minimize peak demand spikes.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "broadcast",
    name: "Broadcast & Media Agent",
    status: "idle",
    operationalCapacity: 100,
    latestThought: "Live 4K streams active to 142 countries. No frame drops or media lounge network bottlenecks.",
    latestAction: "Calibrating pitchside fiber relay loops for ultra-low latency.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "cleaning",
    name: "Sanitation & Cleaning Agent",
    status: "idle",
    operationalCapacity: 91,
    latestThought: "Restroom hygiene metrics holding above 90%. Liquid spills reported at section 108.",
    latestAction: "Assigned Cleaning Crew 4 to Section 108 concourse entrance for immediate mop-up.",
    timestamp: new Date().toISOString(),
  },
  {
    id: "incident",
    name: "Incident Response Agent",
    status: "responding",
    operationalCapacity: 100,
    latestThought: "Gate C entrance bottle-neck identified as primary operational friction point.",
    latestAction: "Directing extra stewarding support from lower density Gate A.",
    timestamp: new Date().toISOString(),
  }
];

let incidents: Incident[] = [
  {
    id: "INC-2026-001",
    title: "Gate C Entrance Crowding Bottleneck",
    category: "crowd",
    severity: "high",
    location: "Gate C (North Perimeter Entrance)",
    status: "active",
    reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    assignedAgents: ["master", "crowd", "security", "incident"],
    timeline: [
      { time: "01:00:00", event: "Visual AI camera registers queuing density above 4.2 persons/sqm at Gate C", agent: "crowd" },
      { time: "01:02:15", event: "Ticket scanning system registers Turnstile 14B intermittent mechanical failures", agent: "maintenance" },
      { time: "01:05:00", event: "Master Orchestrator initiates coordination protocol C-4", agent: "master" },
      { time: "01:10:30", event: "Crowd control agents re-route arriving rail passengers towards Gate B to reduce influx", agent: "crowd" },
    ],
    sop: [
      "Deploy localized loudspeaker notices guiding fans to Gate B.",
      "Dispatch maintenance team to Turnstile 14B.",
      "Re-allocate security stewards to handle perimeter funneling.",
    ],
    tasks: [
      { id: "T-01", description: "Repair turnstile 14B RFID reader", status: "in-progress", assignedTo: "maintenance" },
      { id: "T-02", description: "Open secondary flow gates to concourse", status: "completed", assignedTo: "crowd" },
      { id: "T-03", description: "Position extra stewards at train station escalators to pace arrivals", status: "pending", assignedTo: "transport" },
    ],
    explainableAIReasoning: "The congestion at Gate C was triggered by a combination of high train passenger arrival density (+18% above nominal forecasts) and a hardware malfunction on turnstile RFID readers, which slowed exit-to-stand rates.",
  },
  {
    id: "INC-2026-002",
    title: "Dehydration Incident stand A10",
    category: "medical",
    severity: "medium",
    location: "Lower Stand A - Section 112",
    status: "mitigated",
    reportedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    assignedAgents: ["medical", "cleaning"],
    timeline: [
      { time: "00:45:00", event: "Fan alerts nearest steward regarding a collapsed individual in Row M", agent: "medical" },
      { time: "00:48:30", event: "Mobile Medical Unit 3 arrives on scene, administering intravenous rehydration", agent: "medical" },
      { time: "00:52:00", event: "Spill cleaning team sanitizes aisle and row seats", agent: "cleaning" },
    ],
    sop: [
      "Steward secures direct access line for medical response cart.",
      "First aid team stabilizes the patient.",
      "Check patient status, evacuate to first aid base if required.",
    ],
    tasks: [
      { id: "T-04", description: "Administer first-aid checklist", status: "completed", assignedTo: "medical" },
      { id: "T-05", description: "Clean seating aisle row M", status: "completed", assignedTo: "cleaning" },
    ],
    explainableAIReasoning: "Localized temperature rose to 26.5°C in Section 112 with poor cross-ventilation, leading to heat exhaustion in an elderly spectator.",
  }
];

// Generate dynamic historical telemetry
function getTelemetry(): TelemetryData[] {
  const data: TelemetryData[] = [];
  const now = new Date();
  for (let i = 12; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 30 * 60 * 1000);
    const mins = t.getHours() * 60 + t.getMinutes();
    // Simulate game progress
    let crowdFlow = 150 + Math.sin(mins / 200) * 80 + Math.random() * 20;
    let energy = 1800 + Math.sin(mins / 100) * 400 + Math.random() * 50;
    let transEfficiency = 85 + Math.cos(mins / 300) * 10 + Math.random() * 4;
    let incRate = Math.random() > 0.7 ? 1 : 0;

    data.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      crowdFlowRate: Math.max(10, Math.floor(crowdFlow)),
      energyDemand: Math.max(500, Math.floor(energy)),
      transportEfficiency: Math.min(100, Math.max(40, Math.floor(transEfficiency))),
      incidentRate: incRate,
    });
  }
  return data;
}

// ----------------------------------------------------
// DYNAMIC TELEMETRY FLUCTUATIONS (Simulation loop)
// ----------------------------------------------------
setInterval(() => {
  // Slowly shift crowd counts, temperature, and grid load to mimic a live operating stadium
  zones = zones.map((zone) => {
    const change = Math.floor(Math.random() * 21) - 10;
    const tempChange = (Math.random() * 0.4 - 0.2);
    const energyChange = Math.floor(Math.random() * 15) - 7;

    const newCount = Math.min(zone.capacity, Math.max(10, zone.currentCount + change));
    const crowdDensity = Math.floor((newCount / zone.capacity) * 100);

    let status = zone.status;
    if (crowdDensity > 95) status = "critical";
    else if (crowdDensity > 85) status = "warning";
    else status = "normal";

    return {
      ...zone,
      currentCount: newCount,
      crowdDensity,
      temperature: parseFloat((zone.temperature + tempChange).toFixed(1)),
      energyLoad: Math.max(20, zone.energyLoad + energyChange),
      status,
    };
  });
}, 8000);

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

app.get("/api/state", (req, res) => {
  res.json({
    zones,
    agents,
    incidents,
    telemetry: getTelemetry(),
  });
});

app.post("/api/incidents/create", (req, res) => {
  const { title, category, severity, location } = req.body;
  if (!title || !category || !severity || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const id = `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
  const newIncident: Incident = {
    id,
    title,
    category,
    severity,
    location,
    status: "active",
    reportedAt: new Date().toISOString(),
    assignedAgents: ["master", category, "incident"],
    timeline: [
      { time: new Date().toLocaleTimeString(), event: `Incident flagged at ${location} by digital twin sensor network.`, agent: category },
      { time: new Date().toLocaleTimeString(), event: `Master AI Orchestrator delegated task to tactical teams.`, agent: "master" }
    ],
    sop: [
      `Dispatch rapid responders to ${location}.`,
      `Notify local ${category} supervisor.`,
      `Monitor telemetry in adjacent concourses.`
    ],
    tasks: [
      { id: `T-${Math.floor(10 + Math.random() * 89)}`, description: `Verify perimeter visual sensors at ${location}`, status: "pending", assignedTo: category },
      { id: `T-${Math.floor(10 + Math.random() * 89)}`, description: `Clear emergency access route to ${location}`, status: "pending", assignedTo: "incident" }
    ],
    explainableAIReasoning: `Detected unusual visual density drop paired with local temperature fluctuation at ${location}. Recommending rapid human agent visual verification.`
  };

  incidents.unshift(newIncident);

  // Update agent status to responding
  agents = agents.map((agent) => {
    if (agent.id === category || agent.id === "master" || agent.id === "incident") {
      return {
        ...agent,
        status: "responding",
        latestThought: `Managing high-priority alert ${id} at ${location}. Allocating active assets.`,
        latestAction: `Drafting initial SOP sequence and updating dashboard telemetry.`,
        timestamp: new Date().toISOString()
      };
    }
    return agent;
  });

  res.json({ success: true, incident: newIncident });
});

app.post("/api/state/reset", (req, res) => {
  incidents = incidents.slice(0, 2);
  agents = agents.map((agent) => ({
    ...agent,
    status: "idle",
    operationalCapacity: 95 + Math.floor(Math.random() * 6),
    latestThought: "Operating parameters standard. Telemetry within normal limits.",
    latestAction: "Monitoring stadium systems and updating digital twin.",
    timestamp: new Date().toISOString()
  }));
  res.json({ success: true, message: "State reset to default FIFA World Cup profile." });
});

// ----------------------------------------------------
// GEMINI-POWERED: REAL-TIME COMMAND & AGENT QUERY
// ----------------------------------------------------
app.post("/api/agent/command", async (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: "Command string is required" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Graceful offline fallback simulation
    const simulatedResponse = `[Simulated Master AI] Executing instruction: "${command}". Handled by Security & Crowd Control agents. Automated patrol deployed to section.`;
    
    // Simulate updating a specific agent
    agents = agents.map(a => {
      if (a.id === "master") {
        return {
          ...a,
          status: "responding",
          latestThought: `Analyzing user command: "${command}". Initiating standard tactical protocols.`,
          latestAction: `Dispatched command to security and logistics units.`,
          timestamp: new Date().toISOString()
        };
      }
      return a;
    });

    return res.json({
      response: simulatedResponse,
      modelUsed: "Simulation Mode (No API Key)",
      agentUpdates: agents,
    });
  }

  try {
    const prompt = `
      You are the Master AI Orchestrator for StadiumOS, managing operations during FIFA World Cup 2026.
      You have received a direct query/command from stadium operations staff: "${command}".
      
      Current Stadium Status:
      - Active Incidents: ${JSON.stringify(incidents)}
      - Stadium Zones: ${JSON.stringify(zones)}
      
      You must respond in a formal, highly authoritative, technical operating voice (Apple-level aesthetic, crisp and clear, no fluff). 
      Provide:
      1. A professional, clear operational action report explaining exactly what StadiumOS is doing to respond, detailing why.
      2. Choose which of the other 12 agents (security, crowd, medical, maintenance, transport, vendor, accessibility, weather, energy, broadcast, cleaning, incident) should take action.
      3. Supply detailed simulated thoughts (maximum 15 words) and actions for those chosen agents.

      Format your response strictly as JSON that parses perfectly:
      {
        "responseText": "The comprehensive orchestrator action briefing...",
        "assignedAgent": "security | crowd | medical | maintenance | transport | vendor | accessibility | weather | energy | broadcast | cleaning | incident",
        "agentThought": "The updated internal reasoning for that agent...",
        "agentAction": "The updated direct action for that agent..."
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            responseText: { type: Type.STRING },
            assignedAgent: { type: Type.STRING },
            agentThought: { type: Type.STRING },
            agentAction: { type: Type.STRING },
          },
          required: ["responseText", "assignedAgent", "agentThought", "agentAction"],
        }
      }
    });

    const outputText = response.text || "{}";
    const parsed = JSON.parse(outputText.trim());

    // Apply state changes based on Gemini output
    agents = agents.map(a => {
      if (a.id === "master") {
        return {
          ...a,
          status: "responding",
          latestThought: `Processed external operational command. Coordinating security-response loops.`,
          latestAction: parsed.responseText,
          timestamp: new Date().toISOString()
        };
      }
      if (a.id === parsed.assignedAgent) {
        return {
          ...a,
          status: "responding",
          latestThought: parsed.agentThought,
          latestAction: parsed.agentAction,
          timestamp: new Date().toISOString()
        };
      }
      return a;
    });

    res.json({
      response: parsed.responseText,
      modelUsed: "gemini-3.1-flash-lite",
      agentUpdates: agents,
    });

  } catch (error: any) {
    console.warn("Gemini Command Error:", error);
    // Fallback on error
    const simulatedResponse = `[Simulated Master AI] Executing instruction: "${command}". Handled by Security & Crowd Control agents. Automated patrol deployed to section. (API Error Fallback)`;
    
    agents = agents.map(a => {
      if (a.id === "master") {
        return {
          ...a,
          status: "responding",
          latestThought: `Analyzing user command: "${command}". Initiating standard tactical protocols.`,
          latestAction: `Dispatched command to security and logistics units.`,
          timestamp: new Date().toISOString()
        };
      }
      return a;
    });

    res.json({
      response: simulatedResponse,
      modelUsed: "Simulation Mode (API Error Fallback)",
      agentUpdates: agents,
    });
  }
});

// ----------------------------------------------------
// GEMINI-POWERED: WHAT-IF SCENARIO SIMULATION
// ----------------------------------------------------
app.post("/api/simulation/run", async (req, res) => {
  const { scenario } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: "Scenario description is required" });
  }

  const client = getGeminiClient();

  if (!client) {
    // Offline high-quality mockup fallback simulation
    const mockSimulation: SimulationResult = {
      scenario,
      severity: "high",
      predictions: [
        `Ingress at Gate C will slow down by 35%, causing localized crowd surges near concourse East.`,
        `Increased transit dwell times will create passenger backups up to 2.5 kilometers outside MetLife gates.`,
        `Ancillary power demand from ventilation will spike by 15%, exceeding baseline limits.`
      ],
      suggestedSOP: [
        `Implement active train arrivals spacing of 6-minute intervals to meter inflow.`,
        `Deploy auxiliary security stewards at perimeter fence sections to manage queue line integrity.`,
        `Switch concourse HVAC systems to peak-shaving energy profiles.`
      ],
      cascadingRisks: [
        { system: "Crowd Safety", likelihood: "high", impact: "Friction at entry scanners resulting in potential minor crushing risk." },
        { system: "Logistics Grid", likelihood: "medium", impact: "Train system backlog delaying late spectators past match kickoff." },
        { system: "Stadium Power", likelihood: "low", impact: "Fossil fuel generator startup required if secondary chiller malfunctions." }
      ],
      recommendedActions: [
        { agent: "crowd", action: "Deploy physical spacing barricades 50m outside Gate C.", priority: "high" },
        { agent: "transport", action: "Instruct rail operators to pause train departures at secaucus station.", priority: "medium" },
        { agent: "energy", action: "Activate emergency storage battery pack units to cover chiller peaks.", priority: "low" }
      ]
    };

    return res.json({
      result: mockSimulation,
      modelUsed: "Simulation Mode (No API Key)"
    });
  }

  try {
    const prompt = `
      You are the Principal AI Architect of StadiumOS. Simulate a 'what-if' scenario during a highly packed FIFA World Cup 2026 match at MetLife Stadium.
      The scenario provided by the user is: "${scenario}".
      
      Evaluate the consequences across: Security, Crowd control, Transport, Medical, Energy Grid, Weather, Cleanliness, Broadcast.
      Provide highly actionable, technical, and explainable insights.
      
      Format your response strictly as JSON conforming to the following JSON Schema:
      {
        "scenario": "A clean recap of the scenario",
        "severity": "low | medium | high | critical",
        "predictions": [
          "Detailed, specific prediction 1 with numerical metrics if appropriate",
          "Detailed, specific prediction 2...",
          "Detailed, specific prediction 3..."
        ],
        "suggestedSOP": [
          "Step-by-step SOP instruction 1",
          "Step-by-step SOP instruction 2",
          "Step-by-step SOP instruction 3"
        ],
        "cascadingRisks": [
          {
            "system": "System name, e.g., Crowd Management",
            "likelihood": "low | medium | high",
            "impact": "Detailed description of the cascading effect"
          }
        ],
        "recommendedActions": [
          {
            "agent": "security | crowd | medical | maintenance | transport | energy | weather",
            "action": "Immediate tactical action instructions",
            "priority": "low | medium | high"
          }
        ]
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            severity: { type: Type.STRING },
            predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedSOP: { type: Type.ARRAY, items: { type: Type.STRING } },
            cascadingRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  system: { type: Type.STRING },
                  likelihood: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
                required: ["system", "likelihood", "impact"],
              },
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  agent: { type: Type.STRING },
                  action: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
                required: ["agent", "action", "priority"],
              },
            },
          },
          required: ["scenario", "severity", "predictions", "suggestedSOP", "cascadingRisks", "recommendedActions"],
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || "{}");
    res.json({ result, modelUsed: "gemini-3.1-flash-lite" });

  } catch (error: any) {
    console.warn("Gemini Simulation Error:", error);
    const mockSimulation: SimulationResult = {
      scenario,
      severity: "high",
      predictions: [
        `Ingress at Gate C will slow down by 35%, causing localized crowd surges near concourse East.`,
        `Increased transit dwell times will create passenger backups up to 2.5 kilometers outside MetLife gates.`,
        `Ancillary power demand from ventilation will spike by 15%, exceeding baseline limits.`
      ],
      suggestedSOP: [
        `Implement active train arrivals spacing of 6-minute intervals to meter inflow.`,
        `Deploy auxiliary security stewards at perimeter fence sections to manage queue line integrity.`,
        `Switch concourse HVAC systems to peak-shaving energy profiles.`
      ],
      cascadingRisks: [
        { system: "Crowd Safety", likelihood: "high", impact: "Friction at entry scanners resulting in potential minor crushing risk." },
        { system: "Logistics Grid", likelihood: "medium", impact: "Train system backlog delaying late spectators past match kickoff." },
        { system: "Stadium Power", likelihood: "low", impact: "Fossil fuel generator startup required if secondary chiller malfunctions." }
      ],
      recommendedActions: [
        { agent: "crowd", action: "Deploy physical spacing barricades 50m outside Gate C.", priority: "high" },
        { agent: "transport", action: "Instruct rail operators to pause train departures at secaucus station.", priority: "medium" },
        { agent: "energy", action: "Activate emergency storage battery pack units to cover chiller peaks.", priority: "low" }
      ]
    };

    return res.json({
      result: mockSimulation,
      modelUsed: "Simulation Mode (API Error Fallback)"
    });
  }
});

// ----------------------------------------------------
// GEMINI-POWERED: EXECUTIVE OR ZONE BRIEFINGS
// ----------------------------------------------------
app.post("/api/briefing", async (req, res) => {
  const { zoneId, perspective } = req.body;
  
  const client = getGeminiClient();

  let targetText = perspective || "Comprehensive Operations Overview";
  if (zoneId) {
    const zone = zones.find(z => z.id === zoneId);
    if (zone) targetText = `${zone.name} Security, Crowd Density & HVAC Status Briefing`;
  }

  if (!client) {
    const mockBriefing = `
      # EXECUTIVE BRIEFING: ${targetText.toUpperCase()}
      **Timestamp:** ${new Date().toISOString()} | **Scope:** Live Stadium Operations (FIFA World Cup 2026)
      
      ### 1. OPERATIONAL EXECUTIVE SUMMARY
      Stadium systems are operating at peak safety standard. Crowd density is concentrated at **Gate C** and **Concourse East** due to early seat-fill procedures. Automated digital twin feeds are streaming real-time density parameters with zero network lag.
      
      ### 2. RISK ANALYSIS & TACTICAL ASSESSMENTS
      - **Inflow Strain:** Gate C scanning rate is restricted byTurnstile 14B sensor calibrating. Average queue times hold at 14 minutes.
      - **Thermal Ventilation:** Concourse East registers slightly high ambient humidity. Active exhaust ventilation loops are engaged.
      
      ### 3. ACTIONABLE COMMAND RECOMMENDATIONS
      - **Dynamic Funneling:** Re-route stand influx from North Transit Hub toward West Concourses.
      - **Stewarding Pre-Positioning:** Dispatch supplementary guest services staff to lower Stand A.
    `;
    return res.json({ briefing: mockBriefing, modelUsed: "Simulation Mode (No API Key)" });
  }

  try {
    const prompt = `
      You are the Chief Operating Officer of FIFA World Cup 2026 Venue Operations, commanding MetLife Stadium.
      Generate a highly polished, professional, concise, markdown-formatted operational briefing or executive summary.
      
      Target Focus: "${targetText}"
      Current State Data:
      - Zones: ${JSON.stringify(zones)}
      - Active Incidents: ${JSON.stringify(incidents)}
      - Agents Status: ${JSON.stringify(agents)}

      Include the following sections with authoritative, highly precise descriptions (no fluff, use exact metrics from current state where relevant):
      1. EXECUTIVE STATUS SUMMARY
      2. RISK MATRIX & KEY INDICATORS
      3. CRITICAL DECISION RECOMMENDATIONS (SOP Actions)

      Make it clean and suitable for high-level military-grade or high-tech operations dashboard viewing.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    res.json({ briefing: response.text, modelUsed: "gemini-3.1-flash-lite" });

  } catch (error: any) {
    console.warn("Gemini Briefing Error:", error);
    const mockBriefing = `
      # EXECUTIVE BRIEFING: ${targetText.toUpperCase()} (FALLBACK)
      **Timestamp:** ${new Date().toISOString()} | **Scope:** Live Stadium Operations (FIFA World Cup 2026)
      
      ### 1. OPERATIONAL EXECUTIVE SUMMARY
      Stadium systems are operating at peak safety standard. Crowd density is concentrated at **Gate C** and **Concourse East** due to early seat-fill procedures. Automated digital twin feeds are streaming real-time density parameters with zero network lag.
      
      ### 2. RISK ANALYSIS & TACTICAL ASSESSMENTS
      - **Inflow Strain:** Gate C scanning rate is restricted byTurnstile 14B sensor calibrating. Average queue times hold at 14 minutes.
      - **Thermal Ventilation:** Concourse East registers slightly high ambient humidity. Active exhaust ventilation loops are engaged.
      
      ### 3. ACTIONABLE COMMAND RECOMMENDATIONS
      - **Dynamic Funneling:** Re-route stand influx from North Transit Hub toward West Concourses.
      - **Stewarding Pre-Positioning:** Dispatch supplementary guest services staff to lower Stand A.
    `;
    return res.json({ briefing: mockBriefing, modelUsed: "Simulation Mode (API Error Fallback)" });
  }
});

// ----------------------------------------------------
// BOOTSTRAP EXTRAS & STATIC CLIENT HOOKS
// ----------------------------------------------------

async function startServer() {
  // Vite integration for dev vs. prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support React Router or single page app routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\x1b[32m[StadiumOS Engine]\x1b[0m Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
