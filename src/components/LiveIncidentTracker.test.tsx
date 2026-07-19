import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LiveIncidentTracker } from './LiveIncidentTracker';
import { Incident } from '../types';

describe('LiveIncidentTracker Component', () => {
  const mockIncidents: Incident[] = [
    {
      id: 'INC-001',
      title: 'Queue at Gate C',
      category: 'crowd',
      severity: 'high',
      location: 'Gate C',
      status: 'active',
      reportedAt: '2026-07-19T10:00:00Z',
      assignedAgents: ['crowd', 'security'],
      timeline: [],
      tasks: [],
      sop: ["Deploy staff"],
    }
  ];

  it('renders the incident tracker header and incidents', () => {
    render(<LiveIncidentTracker incidents={mockIncidents} onIncidentCreate={() => {}} onResolveIncident={() => {}} onCompleteTask={() => {}} />);
    expect(screen.getByText('Queue at Gate C')).toBeInTheDocument();
    expect(screen.getByText('Gate C')).toBeInTheDocument();
  });

  it('opens new incident form', () => {
    render(<LiveIncidentTracker incidents={mockIncidents} onIncidentCreate={() => {}} onResolveIncident={() => {}} onCompleteTask={() => {}} />);
    const reportBtn = screen.getByText('REPORT ALERT');
    fireEvent.click(reportBtn);
    expect(screen.getByText('INCIDENT TITLE')).toBeInTheDocument();
  });

  it('submits a new incident form', () => {
    const handleCreate = vi.fn();
    render(<LiveIncidentTracker incidents={mockIncidents} onIncidentCreate={handleCreate} onResolveIncident={() => {}} onCompleteTask={() => {}} />);
    
    fireEvent.click(screen.getByText('REPORT ALERT'));
    
    const titleInput = screen.getByPlaceholderText(/e.g. Broken Glass/i);
    fireEvent.change(titleInput, { target: { value: 'New Test Incident' } });
    
    const locationInput = screen.getByPlaceholderText(/e.g. Section 112/i);
    fireEvent.change(locationInput, { target: { value: 'Sector 4' } });
    
    // Form submit button
    const submitBtn = screen.getByText('Dispatch Agent Taskforce');
    fireEvent.click(submitBtn);
    
    expect(handleCreate).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Test Incident',
      location: 'Sector 4'
    }));
  });

  it('expands incident details when clicked', () => {
    render(<LiveIncidentTracker incidents={mockIncidents} onIncidentCreate={() => {}} onResolveIncident={() => {}} onCompleteTask={() => {}} />);
    
    const incidentCard = screen.getByText('Queue at Gate C');
    fireEvent.click(incidentCard);
    
    expect(screen.getByText('TACTICAL SOP CHECKLIST')).toBeInTheDocument();
    expect(screen.getByText('Deploy staff')).toBeInTheDocument();
  });

  it('completes a task', () => {
    const handleCompleteTask = vi.fn();
    const incidentWithTasks: Incident[] = [
      {
        ...mockIncidents[0],
        tasks: [{ id: 'TASK-1', description: 'Deploy teams', status: 'pending', assignedTo: 'security' }]
      }
    ];
    render(<LiveIncidentTracker incidents={incidentWithTasks} onIncidentCreate={() => {}} onResolveIncident={() => {}} onCompleteTask={handleCompleteTask} />);
    
    // Expand
    fireEvent.click(screen.getByText('Queue at Gate C'));
    
    const taskItem = screen.getByText('Deploy teams');
    fireEvent.click(taskItem);
    
    expect(handleCompleteTask).toHaveBeenCalledWith('INC-001', 'TASK-1');
  });

  it('shows empty state when no incidents exist', () => {
    render(<LiveIncidentTracker incidents={[]} onIncidentCreate={() => {}} onResolveIncident={() => {}} onCompleteTask={() => {}} />);
    expect(screen.getByText(/All zones reporting nominal status. No active incidents./i)).toBeInTheDocument();
  });

  it('cancels new incident form', () => {
    render(<LiveIncidentTracker incidents={mockIncidents} onIncidentCreate={() => {}} onResolveIncident={() => {}} onCompleteTask={() => {}} />);
    fireEvent.click(screen.getByText('REPORT ALERT'));
    
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    
    expect(screen.queryByPlaceholderText(/e.g. Broken Glass/i)).not.toBeInTheDocument();
  });

  it('resolves an incident', () => {
    const handleResolve = vi.fn();
    render(<LiveIncidentTracker incidents={mockIncidents} onIncidentCreate={() => {}} onResolveIncident={handleResolve} onCompleteTask={() => {}} />);
    
    // Expand
    fireEvent.click(screen.getByText('Queue at Gate C'));
    
    // Resolve
    const resolveBtn = screen.getByText('RESOLVE INCIDENT');
    fireEvent.click(resolveBtn);
    
    expect(handleResolve).toHaveBeenCalledWith('INC-001');
  });
});
