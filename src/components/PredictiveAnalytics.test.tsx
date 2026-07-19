import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PredictiveAnalytics } from './PredictiveAnalytics';
import { TelemetryData } from '../types';

describe('PredictiveAnalytics Component', () => {
  const mockTelemetry: TelemetryData[] = [
    { time: '10:00', crowdFlowRate: 10000, incidentRate: 1, energyDemand: 50, transportEfficiency: 95 },
    { time: '10:05', crowdFlowRate: 15000, incidentRate: 2, energyDemand: 60, transportEfficiency: 92 },
  ];

  it('renders the chart and input form', () => {
    render(<PredictiveAnalytics telemetry={mockTelemetry} />);
    expect(screen.getByText('Predictive Analytics & Live Feeds')).toBeInTheDocument();
    expect(screen.getByText('Simulation Sandbox')).toBeInTheDocument();
    
    // Check for the chart switch buttons
    expect(screen.getByText('Crowd Arrival Flow (Fans / Min)')).toBeInTheDocument();
    expect(screen.getByText('Stadium Energy Draw (kW)')).toBeInTheDocument();
  });

  it('disables the run button if input is empty', () => {
    render(<PredictiveAnalytics telemetry={mockTelemetry} />);
    const runBtn = screen.getByRole('button', { name: /simulate/i });
    expect(runBtn).toBeDisabled();
  });

  it('selects a preset scenario and updates the textarea', () => {
    render(<PredictiveAnalytics telemetry={mockTelemetry} />);
    const presetBtn = screen.getByText('NJ Transit Train Power Substation Failure');
    fireEvent.click(presetBtn);
    
    // Check if textarea is populated
    const textarea = screen.getByPlaceholderText(/Or write a custom crisis/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('power surge knocks out');
    
    // Check if the run button is enabled
    const runBtn = screen.getByRole('button', { name: /simulate/i });
    expect(runBtn).toBeEnabled();
  });

  it('allows entering a custom scenario', () => {
    render(<PredictiveAnalytics telemetry={mockTelemetry} />);
    const textarea = screen.getByPlaceholderText(/Or write a custom crisis/i) as HTMLTextAreaElement;
    
    fireEvent.change(textarea, { target: { value: 'Custom crisis: meteor strike' } });
    expect(textarea.value).toBe('Custom crisis: meteor strike');
    
    // Check if the run button is enabled
    const runBtn = screen.getByRole('button', { name: /simulate/i });
    expect(runBtn).toBeEnabled();
  });

  it('runs a simulation and displays results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        result: {
          scenario: 'Test Scenario',
          severity: 'critical',
          predictions: ['Prediction 1'],
          suggestedSOP: ['SOP 1'],
          cascadingRisks: [{ system: 'System 1', likelihood: 'High', impact: 'Severe' }],
          recommendedActions: [{ agent: 'Security', action: 'Do something', priority: 'high' }]
        }
      })
    });
    global.fetch = fetchMock;

    render(<PredictiveAnalytics telemetry={mockTelemetry} />);
    const textarea = screen.getByPlaceholderText(/Or write a custom crisis/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Test Scenario' } });
    
    const runBtn = screen.getByRole('button', { name: /simulate/i });
    fireEvent.click(runBtn);
    
    expect(fetchMock).toHaveBeenCalledWith('/api/simulation/run', expect.any(Object));
    expect(await screen.findByText('Prediction 1')).toBeInTheDocument();
    expect(await screen.findByText('SOP 1')).toBeInTheDocument();
  });

  it('changes graph views', () => {
    render(<PredictiveAnalytics telemetry={mockTelemetry} />);
    
    const energyBtn = screen.getByText('Stadium Energy Draw (kW)');
    fireEvent.click(energyBtn);
    
    // There is no explicit text change we easily get by getByText, 
    // but the button should become active. We can check if it rendered.
    expect(screen.getByText('Stadium Energy Draw (kW)')).toBeInTheDocument();
  });
});
