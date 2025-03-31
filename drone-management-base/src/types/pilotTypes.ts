export interface Pilot {
  id: string;
  name: string;
  licenseNumber: string;
  // Add other relevant pilot properties
}

// Mock data function
export const createMockPilots = (count: number): Pilot[] => {
  const pilots: Pilot[] = [];
  for (let i = 1; i <= count; i++) {
    pilots.push({
      id: `pilot-${i}`,
      name: `Pilot ${i}`,
      licenseNumber: `LIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    });
  }
  return pilots;
}; 