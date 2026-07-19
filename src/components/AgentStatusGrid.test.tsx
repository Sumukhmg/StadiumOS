import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AgentStatusGrid } from './AgentStatusGrid';
import { AgentState } from '../types';

describe('AgentStatusGrid Component', () => {
  const mockAgents: AgentState[] = [
    {
      id: 'crowd',
      name: 'Crowd Manager',
      status: 'idle',
      operationalCapacity: 80,
      latestThought: 'Monitoring gates',
      latestAction: 'None',
      timestamp: '2026-07-19T10:00:00Z',
    },
    {
      id: 'security',
      name: 'Security Unit',
      status: 'responding',
      operationalCapacity: 40,
      latestThought: 'Investigating gate C',
      latestAction: 'Dispatched patrol',
      timestamp: '2026-07-19T10:05:00Z',
    },
  ];

  it('renders the grid header and agents', () => {
    render(<AgentStatusGrid agents={mockAgents} onCommandTrigger={() => {}} />);
    expect(screen.getByText('Crowd Manager')).toBeInTheDocument();
    expect(screen.getByText('Security Unit')).toBeInTheDocument();
  });

  it('allows selecting an agent and triggering a command', () => {
    const handleCommandTrigger = vi.fn();
    render(<AgentStatusGrid agents={mockAgents} onCommandTrigger={handleCommandTrigger} />);
    
    // Select the crowd agent
    const crowdAgentBtn = screen.getByLabelText('Select Crowd Manager');
    fireEvent.click(crowdAgentBtn);
    
    // Check if the detailed view opened
    expect(screen.getByText('DISPATCH DIRECT COMMAND')).toBeInTheDocument();
    
    // Type a command
    const input = screen.getByPlaceholderText(/e.g., Deploy additional teams/i);
    fireEvent.change(input, { target: { value: 'Deploy to Gate A' } });
    
    // Click deploy
    const deployBtn = screen.getByText('Run');
    fireEvent.click(deployBtn);
    
    expect(handleCommandTrigger).toHaveBeenCalledWith('Direct the Crowd Manager to: Deploy to Gate A');
  });
});
