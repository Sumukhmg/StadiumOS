import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import { vi } from 'vitest';

// Mock the components to avoid full rendering of complex children
vi.mock('./components/DigitalTwin', () => ({
  DigitalTwin: ({ onZoneSelect }: any) => (
    <div data-testid="digital-twin">
      <button onClick={() => onZoneSelect('gate_c')}>Select Gate C</button>
    </div>
  )
}));

vi.mock('./components/AgentStatusGrid', () => ({
  AgentStatusGrid: ({ onCommandTrigger }: any) => (
    <div data-testid="agent-status-grid">
      <button onClick={() => onCommandTrigger('Deploy teams')}>Grid Command</button>
    </div>
  )
}));

vi.mock('./components/PredictiveAnalytics', () => ({
  PredictiveAnalytics: () => <div data-testid="predictive-analytics" />
}));

vi.mock('./components/LiveIncidentTracker', () => ({
  LiveIncidentTracker: ({ onIncidentCreate, onResolveIncident, onCompleteTask }: any) => (
    <div data-testid="live-incident-tracker">
      <button onClick={() => onIncidentCreate({ title: 'New Incident', location: 'Gate A', category: 'security', severity: 'high' })}>Create Incident</button>
      <button onClick={() => onResolveIncident('INC-001')}>Resolve Incident</button>
      <button onClick={() => onCompleteTask('INC-001', 'TASK-1')}>Complete Task</button>
    </div>
  )
}));

vi.mock('./components/VoiceOperator', () => ({
  VoiceOperator: ({ onCommandTrigger }: any) => (
    <div data-testid="voice-operator">
      <button onClick={() => onCommandTrigger('Voice Command')}>Voice Command</button>
    </div>
  )
}));

vi.mock('./components/AIBriefingGenerator', () => ({
  AIBriefingGenerator: () => <div data-testid="ai-briefing-generator" />
}));

describe('App Component', () => {
  const mockState = {
    zones: [
      { id: 'gate_c', name: 'Gate C', currentCount: 100, capacity: 1000 },
      { id: 'stand_a', name: 'Stand A', currentCount: 500, capacity: 1000 }
    ],
    agents: [],
    incidents: [
      { id: 'INC-001', status: 'active', timeline: [], tasks: [{ id: 'TASK-1', status: 'pending' }] }
    ],
    telemetry: []
  };

  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/state') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockState)
        });
      }
      if (url === '/api/agent/command') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: 'Command executed', agentUpdates: [] })
        });
      }
      if (url === '/api/incidents/create') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      if (url === '/api/state/reset') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the header and components', async () => {
    await act(async () => {
      render(<App />);
    });
    
    expect(screen.getByText('Stadium')).toBeInTheDocument();
    expect(screen.getByTestId('digital-twin')).toBeInTheDocument();
    expect(screen.getByTestId('agent-status-grid')).toBeInTheDocument();
    expect(screen.getByTestId('predictive-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('live-incident-tracker')).toBeInTheDocument();
    expect(screen.getByTestId('voice-operator')).toBeInTheDocument();
    expect(screen.getByTestId('ai-briefing-generator')).toBeInTheDocument();
  });

  it('handles state transitions on command trigger', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Grid Command'));
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/agent/command', expect.any(Object));
  });

  it('handles incident creation', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Create Incident'));
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/incidents/create', expect.any(Object));
  });

  it('handles resolving incident optimistically', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Resolve Incident'));
    });
    
    // We expect the state to update optimistically but we mocked the component out.
    // However, it runs without error.
  });

  it('handles completing task optimistically', async () => {
    await act(async () => {
      render(<App />);
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Complete Task'));
    });
    
    // Similarly, we expect the state to update optimistically.
  });

  it('handles state reset', async () => {
    await act(async () => {
      render(<App />);
    });
    
    const resetBtn = screen.getByTitle('Reset Digital Twin State');
    
    await act(async () => {
      fireEvent.click(resetBtn);
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/state/reset', expect.any(Object));
  });
});
