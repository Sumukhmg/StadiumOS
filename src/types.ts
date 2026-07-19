/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgentRole =
  | "master"
  | "security"
  | "crowd"
  | "medical"
  | "maintenance"
  | "transport"
  | "vendor"
  | "accessibility"
  | "weather"
  | "energy"
  | "broadcast"
  | "cleaning"
  | "incident";

export interface AgentState {
  id: AgentRole;
  name: string;
  status: "idle" | "analyzing" | "responding" | "alert";
  operationalCapacity: number; // 0-100
  latestThought: string;
  latestAction: string;
  communicationTarget?: string;
  timestamp: string;
}

export interface StadiumZone {
  id: string;
  name: string;
  crowdDensity: number; // 0-100
  temperature: number; // Celsius
  energyLoad: number; // kW
  status: "normal" | "warning" | "critical";
  capacity: number;
  currentCount: number;
}

export interface Incident {
  id: string;
  title: string;
  category: "security" | "crowd" | "medical" | "maintenance" | "transport" | "operational";
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  status: "reported" | "assessing" | "active" | "mitigated" | "resolved";
  reportedAt: string;
  resolvedAt?: string;
  assignedAgents: AgentRole[];
  timeline: {
    time: string;
    event: string;
    agent?: AgentRole;
  }[];
  sop: string[];
  tasks: {
    id: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    assignedTo: AgentRole;
  }[];
  explainableAIReasoning?: string;
}

export interface SimulationResult {
  scenario: string;
  severity: "low" | "medium" | "high" | "critical";
  predictions: string[];
  suggestedSOP: string[];
  cascadingRisks: {
    system: string;
    likelihood: "low" | "medium" | "high";
    impact: string;
  }[];
  recommendedActions: {
    agent: AgentRole;
    action: string;
    priority: "low" | "medium" | "high";
  }[];
}

export interface TelemetryData {
  time: string;
  crowdFlowRate: number; // people/min
  energyDemand: number; // kW
  incidentRate: number;
  transportEfficiency: number; // %
}
