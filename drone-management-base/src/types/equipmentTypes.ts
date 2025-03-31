export interface Equipment {
  id: string;
  name: string;
  type: string; // e.g., 'drone', 'sensor', 'battery'
  serialNumber?: string;
  // Add other relevant equipment properties
}

// Mock data function
export const createMockEquipment = (count: number): Equipment[] => {
  const equipment: Equipment[] = [];
  for (let i = 1; i <= count; i++) {
    equipment.push({
      id: `equip-${i}`,
      name: `Equipment ${i}`,
      type: i % 2 === 0 ? 'drone' : 'sensor',
      serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    });
  }
  return equipment;
}; 