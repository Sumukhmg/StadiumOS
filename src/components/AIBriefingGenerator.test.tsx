import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AIBriefingGenerator } from './AIBriefingGenerator';
import { vi } from 'vitest';

describe('AIBriefingGenerator Component', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ briefing: 'Mock Briefing' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the initial state', async () => {
    await act(async () => {
      render(<AIBriefingGenerator selectedZoneId={null} selectedZoneName={null} />);
    });
    expect(screen.getByText('AI Executive Briefing')).toBeInTheDocument();
    expect(await screen.findByText('Mock Briefing')).toBeInTheDocument();
  });

  it('renders with a selected zone', async () => {
    await act(async () => {
      render(<AIBriefingGenerator selectedZoneId="gate_c" selectedZoneName="Gate C" />);
    });
    expect(screen.getByText('Gate C')).toBeInTheDocument();
    expect(await screen.findByText('Mock Briefing')).toBeInTheDocument();
  });

  it('can download report', async () => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    const createObjectUrlMock = vi.fn().mockReturnValue('blob:http://localhost/mock');
    const revokeObjectUrlMock = vi.fn();
    global.URL.createObjectURL = createObjectUrlMock;
    global.URL.revokeObjectURL = revokeObjectUrlMock;

    await act(async () => {
      render(<AIBriefingGenerator selectedZoneId="gate_c" selectedZoneName="Gate C" />);
    });
    expect(await screen.findByText('Mock Briefing')).toBeInTheDocument();
    
    // Find the download button using text
    const downloadBtn = screen.getByText('EXPORT DISPATCH TEXT');
    await act(async () => {
      fireEvent.click(downloadBtn);
    });

    expect(createObjectUrlMock).toHaveBeenCalled();
  });

  it('changes perspective', async () => {
    await act(async () => {
      render(<AIBriefingGenerator selectedZoneId={null} selectedZoneName={null} />);
    });
    expect(await screen.findByText('Mock Briefing')).toBeInTheDocument();
    
    // Click on a perspective button
    const crowdFlowBtn = screen.getByText('Crowd');
    await act(async () => {
      fireEvent.click(crowdFlowBtn);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
