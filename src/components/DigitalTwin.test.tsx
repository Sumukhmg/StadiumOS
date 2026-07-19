import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DigitalTwin } from './DigitalTwin';
import { StadiumZone } from '../types';

describe('DigitalTwin Component', () => {
  const mockZones: StadiumZone[] = [
    { id: 'transit_hub', name: 'Transit Hub', crowdDensity: 40, status: 'normal', capacity: 100, currentCount: 40, temperature: 20, energyLoad: 50 },
    { id: 'gate_c', name: 'Gate C', crowdDensity: 95, status: 'critical', capacity: 100, currentCount: 95, temperature: 25, energyLoad: 80 },
    { id: 'vip_lounge', name: 'VIP Lounge', crowdDensity: 80, status: 'warning', capacity: 100, currentCount: 80, temperature: 25, energyLoad: 80 },
    { id: 'concourse_a', name: 'Concourse A', crowdDensity: 50, status: 'normal', capacity: 100, currentCount: 50, temperature: 25, energyLoad: 80 },
    { id: 'concourse_b', name: 'Concourse B', crowdDensity: 60, status: 'normal', capacity: 100, currentCount: 60, temperature: 25, energyLoad: 80 },
    { id: 'stand_a', name: 'Stand A', crowdDensity: 70, status: 'normal', capacity: 100, currentCount: 70, temperature: 25, energyLoad: 80 },
    { id: 'stand_b', name: 'Stand B', crowdDensity: 70, status: 'normal', capacity: 100, currentCount: 70, temperature: 25, energyLoad: 80 },
    { id: 'pitch', name: 'Pitch', crowdDensity: 20, status: 'normal', capacity: 100, currentCount: 20, temperature: 25, energyLoad: 80 },
  ];

  it('renders without crashing and displays critical density properly', () => {
    const { container } = render(
      <DigitalTwin zones={mockZones} selectedZoneId={null} onZoneSelect={() => {}} />
    );
    expect(container).toBeInTheDocument();
    
    // Check if critical glow class is applied for gate_c (density > 90)
    const gateCG = container.querySelector('[aria-label="Select Gate C Perimeter Zone"]');
    expect(gateCG).toHaveClass('svg-critical-glow');
    
    // transit_hub should not have it
    const transitHubG = container.querySelector('[aria-label="Select Transit Hub Zone"]');
    expect(transitHubG).not.toHaveClass('svg-critical-glow');
    
    // Check tooltip rendering with all zones
    const zonesToTest = ['vip_lounge', 'concourse_a', 'concourse_b', 'stand_a', 'stand_b', 'pitch'];
    zonesToTest.forEach(id => {
       const zoneG = container.querySelector(`[aria-label="Select ${mockZones.find(z => z.id === id)?.name}"]`) || container.querySelector(`[aria-label="Select ${id === 'concourse_a' ? 'Concourse East' : id === 'concourse_b' ? 'Concourse West' : id === 'vip_lounge' ? 'VIP Lounges Zone' : id === 'pitch' ? 'Pitch Zone' : id === 'stand_a' ? 'Stand A' : 'Stand B'}"]`);
       expect(zoneG).not.toBeNull();
       fireEvent.mouseEnter(zoneG!);
       
       const expectedText = mockZones.find(z => z.id === id)!.name.split(" ")[0];
       expect(screen.getByText(expectedText)).toBeInTheDocument();
       
       fireEvent.mouseLeave(zoneG!);
    });
  });

  it('handles keyboard navigation (Enter key)', () => {
    const handleZoneSelect = vi.fn();
    const { container } = render(
      <DigitalTwin zones={mockZones} selectedZoneId={null} onZoneSelect={handleZoneSelect} />
    );

    const gateCG = container.querySelector('[aria-label="Select Gate C Perimeter Zone"]');
    expect(gateCG).not.toBeNull();
    if (gateCG) {
      fireEvent.keyDown(gateCG, { key: 'Enter', code: 'Enter', charCode: 13 });
      expect(handleZoneSelect).toHaveBeenCalledWith('gate_c');
    }
  });

  it('handles mouse click on zone', () => {
    const handleZoneSelect = vi.fn();
    const { container } = render(
      <DigitalTwin zones={mockZones} selectedZoneId={null} onZoneSelect={handleZoneSelect} />
    );
    const transitHubG = container.querySelector('[aria-label="Select Transit Hub Zone"]');
    expect(transitHubG).not.toBeNull();
    if (transitHubG) {
      fireEvent.click(transitHubG);
      expect(handleZoneSelect).toHaveBeenCalledWith('transit_hub');
    }
  });
});
