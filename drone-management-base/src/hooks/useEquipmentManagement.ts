import { useState, useEffect, useCallback } from 'react';
import { 
  Equipment,
  EquipmentStatus,
  EquipmentType,
  MaintenanceItem
} from '../components/Equipment';

// Define interfaces for use in this hook
interface MaintenanceRecord {
  id: number;
  equipmentId: number;
  equipmentName: string;
  type: string; // Maps to maintenanceType in MaintenanceItem
  description: string;
  date: string; // Maps to dueDate in MaintenanceItem
  status: string;
  technician: string; // Maps to assignedTo in MaintenanceItem
  cost: number;
  partsReplaced: string[];
  notes: string;
}

// Define types for the MaintenanceStatus and MaintenanceType
type MaintenanceStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
type MaintenanceType = 'Regular' | 'Emergency' | 'Inspection' | 'Component Replacement' | 'Calibration';

// Define the flight log interface if not already imported
interface FlightLog {
  id: number;
  equipmentId: number;
  equipmentName: string;
  date: string;
  duration: number; // in minutes
  pilot: string;
  location: string;
  purpose: string;
  notes: string;
  missionId?: number;
  missionName?: string;
}

// Define usage metrics interface
interface EquipmentUsageMetrics {
  totalFlightHours: number;
  missionsCompleted: number;
  batteryCharges: number;
  distanceFlown: number; // in km
  averageFlightTime: number; // in minutes
  maintenanceRatio: number; // maintenance hours / flight hours
  upcomingMaintenance: {
    date: string;
    type: string;
    description: string;
  }[];
}

// Interface for the hook result
interface UseEquipmentManagementResult {
  // Equipment state
  equipmentList: Equipment[];
  loading: boolean;
  error: string | null;
  
  // Maintenance records
  maintenanceRecords: MaintenanceRecord[];
  
  // Flight logs
  flightLogs: FlightLog[];
  
  // Usage metrics
  usageMetrics: Record<number, EquipmentUsageMetrics>;
  
  // Selected equipment state
  selectedEquipment: Equipment | null;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  
  // Dialog states
  isEquipmentFormOpen: boolean;
  isMaintenanceSchedulerOpen: boolean;
  isFlightLogFormOpen: boolean;
  isEquipmentDetailsOpen: boolean;
  
  // Dialog visibility handlers
  openEquipmentForm: (equipment?: Equipment) => void;
  closeEquipmentForm: () => void;
  openMaintenanceScheduler: (equipment?: Equipment) => void;
  closeMaintenanceScheduler: () => void;
  openFlightLogForm: (equipment?: Equipment) => void;
  closeFlightLogForm: () => void;
  openEquipmentDetails: (equipment: Equipment) => void;
  closeEquipmentDetails: () => void;
  
  // CRUD operations
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (id: number, equipment: Omit<Equipment, 'id'>) => void;
  deleteEquipment: (id: number) => void;
  
  // Maintenance operations
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
  updateMaintenanceRecord: (id: number, record: Omit<MaintenanceRecord, 'id'>) => void;
  deleteMaintenanceRecord: (id: number) => void;
  
  // Flight log operations
  addFlightLog: (log: Omit<FlightLog, 'id'>) => void;
  updateFlightLog: (id: number, log: Omit<FlightLog, 'id'>) => void;
  deleteFlightLog: (id: number) => void;
  
  // Filtering and sorting
  filterEquipment: (filter: {
    status?: EquipmentStatus[];
    type?: EquipmentType[];
    search?: string;
  }) => Equipment[];
  
  // Dashboard data
  getDashboardData: () => {
    statusCounts: Record<EquipmentStatus, number>;
    typeCounts: Record<EquipmentType, number>;
    upcomingMaintenance: Equipment[];
    readinessPercentage: number;
  };
}

// Helper functions to convert between types
const convertToMaintenanceRecord = (item: MaintenanceItem): MaintenanceRecord => ({
  id: item.id,
  equipmentId: item.equipmentId,
  equipmentName: item.equipmentName,
  type: item.maintenanceType,
  description: item.description,
  date: item.dueDate.toISOString().split('T')[0],
  status: item.status,
  technician: item.assignedTo,
  cost: item.estimatedHours * 100, // Just a placeholder formula
  partsReplaced: item.partsRequired || [],
  notes: item.notes
});

const convertToMaintenanceItem = (record: Omit<MaintenanceRecord, 'id'>): Omit<MaintenanceItem, 'id'> => ({
  equipmentId: record.equipmentId,
  equipmentName: record.equipmentName,
  maintenanceType: record.type,
  description: record.description,
  dueDate: new Date(record.date),
  status: record.status as MaintenanceItem['status'],
  priority: 'Medium',
  assignedTo: record.technician,
  estimatedHours: record.cost / 100, // Simplified conversion
  notes: record.notes,
  partsRequired: record.partsReplaced,
  createdDate: new Date()
});

const useEquipmentManagement = (): UseEquipmentManagementResult => {
  // Equipment state
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Maintenance records state
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  
  // Flight logs state
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
  
  // Usage metrics state
  const [usageMetrics, setUsageMetrics] = useState<Record<number, EquipmentUsageMetrics>>({});
  
  // Selected equipment state for dialogs
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  // Dialog visibility states
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState<boolean>(false);
  const [isMaintenanceSchedulerOpen, setIsMaintenanceSchedulerOpen] = useState<boolean>(false);
  const [isFlightLogFormOpen, setIsFlightLogFormOpen] = useState<boolean>(false);
  const [isEquipmentDetailsOpen, setIsEquipmentDetailsOpen] = useState<boolean>(false);
  
  // Fetch equipment data (simulated - replace with actual API calls)
  useEffect(() => {
    // Simulating API call with timeout
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulated API response delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // This is where you would typically fetch data from your backend
        // For now, we'll use placeholder data similar to the existing sample data
        
        // Sample equipment data
        const equipment: Equipment[] = [
          {
            id: 1,
            name: "Phantom Pro X",
            type: "Drone",
            model: "DJI Phantom 4 Pro",
            serialNumber: "PH4P-12345-A",
            purchaseDate: "2024-01-15",
            status: "Ready",
            lastMaintenance: "2025-02-10",
            nextMaintenance: "2025-05-10",
            flightHours: 120,
            notes: "Primary drone for real estate photography",
            image: "https://example.com/drone1.jpg"
          },
          {
            id: 2,
            name: "SkyView Max",
            type: "Drone",
            model: "Autel EVO II Pro",
            serialNumber: "AEV2-54321-B",
            purchaseDate: "2024-02-20",
            status: "In Maintenance",
            lastMaintenance: "2025-03-05",
            nextMaintenance: "2025-03-15",
            flightHours: 85,
            notes: "Undergoing calibration due to drift issues",
          },
          {
            id: 3,
            name: "Surveyor One",
            type: "Drone",
            model: "DJI Mavic 3 Enterprise",
            serialNumber: "M3E-67890-C",
            purchaseDate: "2024-02-01",
            status: "In Use",
            lastMaintenance: "2025-02-25",
            nextMaintenance: "2025-05-25",
            flightHours: 150,
            notes: "Currently deployed for City Infrastructure project",
          },
          {
            id: 4,
            name: "Pro Zoom Camera",
            type: "Camera",
            model: "Hasselblad L2D-20c",
            serialNumber: "HSL-78901-D",
            purchaseDate: "2024-01-10",
            status: "Ready",
            lastMaintenance: "2025-03-01",
            nextMaintenance: "2025-06-01",
            flightHours: 0,
            notes: "High-end camera for detailed photography",
          },
          {
            id: 5,
            name: "Long-Range Battery",
            type: "Battery",
            model: "DJI Intelligent Flight Battery",
            serialNumber: "DIB-89012-E",
            purchaseDate: "2024-03-05",
            status: "Needs Attention",
            lastMaintenance: "2025-03-10",
            nextMaintenance: "2025-04-10",
            flightHours: 0,
            notes: "Showing reduced capacity, needs testing",
          }
        ];
        
        // Sample maintenance records
        const maintenance: MaintenanceRecord[] = [
          {
            id: 1,
            equipmentId: 1,
            equipmentName: "Phantom Pro X",
            date: "2025-02-10",
            type: "Routine",
            status: "Completed",
            description: "Regular maintenance and propeller replacement",
            technician: "John Smith",
            cost: 120,
            partsReplaced: ["Propellers", "Motor covers"],
            notes: "All propellers replaced due to minor damage. Motor covers cleaned and resealed."
          },
          {
            id: 2,
            equipmentId: 2,
            equipmentName: "SkyView Max",
            date: "2025-03-05",
            type: "Repair",
            status: "In Progress",
            description: "Fixing drift issues in flight controller",
            technician: "Sarah Johnson",
            cost: 250,
            partsReplaced: ["IMU sensor"],
            notes: "IMU sensor showing calibration issues. Replaced with newer model for improved stability."
          },
          {
            id: 3,
            equipmentId: 3,
            equipmentName: "Surveyor One",
            date: "2025-02-25",
            type: "Inspection",
            status: "Completed",
            description: "Pre-deployment inspection",
            technician: "John Smith",
            cost: 75,
            partsReplaced: [],
            notes: "Full inspection completed. All systems operating within normal parameters."
          },
          {
            id: 4,
            equipmentId: 5,
            equipmentName: "Long-Range Battery",
            date: "2025-03-10",
            type: "Inspection",
            status: "Completed",
            description: "Battery capacity testing",
            technician: "Mike Thompson",
            cost: 50,
            partsReplaced: [],
            notes: "Battery retains 92% of original capacity. Still within operational parameters."
          }
        ];
        
        // Sample flight logs
        const logs: FlightLog[] = [
          {
            id: 1,
            equipmentId: 1,
            equipmentName: "Phantom Pro X",
            date: "2025-03-01",
            duration: 45,
            pilot: "Jane Davis",
            location: "Riverside Park",
            purpose: "Real estate photography",
            notes: "Captured 20 properties, good weather conditions",
            missionId: 5,
            missionName: "Downtown Properties Survey"
          },
          {
            id: 2,
            equipmentId: 3,
            equipmentName: "Surveyor One",
            date: "2025-03-05",
            duration: 120,
            pilot: "Mike Thompson",
            location: "North District",
            purpose: "Infrastructure mapping",
            notes: "Completed 80% of planned area, battery changes required",
            missionId: 3,
            missionName: "City Infrastructure Mapping"
          },
          {
            id: 3,
            equipmentId: 1,
            equipmentName: "Phantom Pro X",
            date: "2025-02-20",
            duration: 30,
            pilot: "Jane Davis",
            location: "Greenview Estate",
            purpose: "Real estate photography",
            notes: "Captured 5 luxury properties",
            missionId: 4,
            missionName: "Luxury Properties Collection"
          }
        ];
        
        // Sample usage metrics
        const metrics: Record<number, EquipmentUsageMetrics> = {
          1: {
            totalFlightHours: 120,
            missionsCompleted: 42,
            batteryCharges: 85,
            distanceFlown: 315.5,
            averageFlightTime: 28.5,
            maintenanceRatio: 0.05,
            upcomingMaintenance: [
              {
                date: "2025-05-10",
                type: "Routine",
                description: "Scheduled quarterly maintenance"
              }
            ]
          },
          2: {
            totalFlightHours: 85,
            missionsCompleted: 31,
            batteryCharges: 62,
            distanceFlown: 210.3,
            averageFlightTime: 25.2,
            maintenanceRatio: 0.08,
            upcomingMaintenance: [
              {
                date: "2025-03-15",
                type: "Repair",
                description: "Complete drift issue repair"
              },
              {
                date: "2025-06-01",
                type: "Calibration",
                description: "Camera gimbal calibration"
              }
            ]
          },
          3: {
            totalFlightHours: 150,
            missionsCompleted: 55,
            batteryCharges: 120,
            distanceFlown: 425.8,
            averageFlightTime: 32.7,
            maintenanceRatio: 0.04,
            upcomingMaintenance: [
              {
                date: "2025-05-25",
                type: "Routine",
                description: "Quarterly maintenance and inspection"
              }
            ]
          }
        };
        
        setEquipmentList(equipment);
        setMaintenanceRecords(maintenance);
        setFlightLogs(logs);
        setUsageMetrics(metrics);
        setError(null);
      } catch (err) {
        setError('Failed to fetch equipment data. Please try again later.');
        console.error('Error fetching equipment data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Dialog handlers
  const openEquipmentForm = useCallback((equipment?: Equipment) => {
    setSelectedEquipment(equipment || null);
    setIsEquipmentFormOpen(true);
  }, []);
  
  const closeEquipmentForm = useCallback(() => {
    setIsEquipmentFormOpen(false);
    setSelectedEquipment(null);
  }, []);
  
  const openMaintenanceScheduler = useCallback((equipment?: Equipment) => {
    setSelectedEquipment(equipment || null);
    setIsMaintenanceSchedulerOpen(true);
  }, []);
  
  const closeMaintenanceScheduler = useCallback(() => {
    setIsMaintenanceSchedulerOpen(false);
    setSelectedEquipment(null);
  }, []);
  
  const openFlightLogForm = useCallback((equipment?: Equipment) => {
    setSelectedEquipment(equipment || null);
    setIsFlightLogFormOpen(true);
  }, []);
  
  const closeFlightLogForm = useCallback(() => {
    setIsFlightLogFormOpen(false);
    setSelectedEquipment(null);
  }, []);
  
  const openEquipmentDetails = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsEquipmentDetailsOpen(true);
  }, []);
  
  const closeEquipmentDetails = useCallback(() => {
    setIsEquipmentDetailsOpen(false);
    setSelectedEquipment(null);
  }, []);
  
  // CRUD Operations for Equipment
  const addEquipment = useCallback((equipment: Omit<Equipment, 'id'>) => {
    setEquipmentList(prev => {
      // Generate a new ID based on the current list
      const newId = prev.length > 0 
        ? Math.max(...prev.map(e => e.id)) + 1 
        : 1;
      
      return [...prev, { ...equipment, id: newId }];
    });
  }, []);
  
  const updateEquipment = useCallback((id: number, equipment: Omit<Equipment, 'id'>) => {
    setEquipmentList(prev => 
      prev.map(item => (item.id === id ? { ...equipment, id } : item))
    );
  }, []);
  
  const deleteEquipment = useCallback((id: number) => {
    setEquipmentList(prev => prev.filter(item => item.id !== id));
    // Also remove associated maintenance records and flight logs
    setMaintenanceRecords(prev => prev.filter(record => record.equipmentId !== id));
    setFlightLogs(prev => prev.filter(log => log.equipmentId !== id));
    // Remove from usage metrics
    setUsageMetrics(prev => {
      const newMetrics = { ...prev };
      delete newMetrics[id];
      return newMetrics;
    });
  }, []);
  
  // Maintenance Operations
  const addMaintenanceRecord = useCallback((record: Omit<MaintenanceRecord, 'id'>) => {
    setMaintenanceRecords(prev => {
      const newId = prev.length > 0 
        ? Math.max(...prev.map(r => r.id)) + 1 
        : 1;
      
      return [...prev, { ...record, id: newId }];
    });
    
    // Update equipment's last maintenance and next maintenance dates
    // Based on the type of maintenance and whether it's completed
    if (record.status === 'Completed') {
      setEquipmentList(prev => prev.map(item => {
        if (item.id === record.equipmentId) {
          return {
            ...item,
            lastMaintenance: record.date,
            // For completed records, we might want to calculate a new next maintenance date
            // This is a simplified approach - actual calculation might be more complex
            nextMaintenance: new Date(
              new Date(record.date).getTime() + 90 * 24 * 60 * 60 * 1000
            ).toISOString()
          };
        }
        return item;
      }));
    }
  }, []);
  
  const updateMaintenanceRecord = useCallback((id: number, record: Omit<MaintenanceRecord, 'id'>) => {
    setMaintenanceRecords(prev => 
      prev.map(item => (item.id === id ? { ...record, id } : item))
    );
    
    // Similar to addMaintenanceRecord, update equipment if status is Completed
    if (record.status === 'Completed') {
      setEquipmentList(prev => prev.map(item => {
        if (item.id === record.equipmentId) {
          return {
            ...item,
            lastMaintenance: record.date,
            // Update next maintenance date based on maintenance type
            nextMaintenance: new Date(
              new Date(record.date).getTime() + 90 * 24 * 60 * 60 * 1000
            ).toISOString()
          };
        }
        return item;
      }));
    }
  }, []);
  
  const deleteMaintenanceRecord = useCallback((id: number) => {
    setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
  }, []);
  
  // Flight Log Operations
  const addFlightLog = useCallback((log: Omit<FlightLog, 'id'>) => {
    setFlightLogs(prev => {
      const newId = prev.length > 0 
        ? Math.max(...prev.map(l => l.id)) + 1 
        : 1;
      
      return [...prev, { ...log, id: newId }];
    });
    
    // Update equipment's flight hours
    setEquipmentList(prev => prev.map(item => {
      if (item.id === log.equipmentId) {
        // Convert duration from minutes to hours and add to current flight hours
        const additionalHours = log.duration / 60;
        return {
          ...item,
          flightHours: item.flightHours + additionalHours
        };
      }
      return item;
    }));
    
    // Update usage metrics if they exist for this equipment
    setUsageMetrics(prev => {
      if (!prev[log.equipmentId]) return prev;
      
      const metrics = { ...prev[log.equipmentId] };
      const durationHours = log.duration / 60;
      
      // Update metrics
      metrics.totalFlightHours += durationHours;
      metrics.missionsCompleted += 1;
      // Assuming a flight uses one battery charge
      metrics.batteryCharges += 1;
      // Simplified distance calculation (would be more accurate with actual data)
      metrics.distanceFlown += durationHours * 10; // rough estimate
      
      // Recalculate average flight time
      const totalFlights = prev[log.equipmentId].missionsCompleted + 1;
      metrics.averageFlightTime = 
        ((prev[log.equipmentId].averageFlightTime * prev[log.equipmentId].missionsCompleted) + log.duration) / 
        totalFlights;
      
      return { 
        ...prev, 
        [log.equipmentId]: metrics 
      };
    });
  }, []);
  
  const updateFlightLog = useCallback((id: number, log: Omit<FlightLog, 'id'>) => {
    // First get the old log to calculate flight hour differences
    const oldLog = flightLogs.find(l => l.id === id);
    
    if (!oldLog) return;
    
    setFlightLogs(prev => 
      prev.map(item => (item.id === id ? { ...log, id } : item))
    );
    
    // Calculate the difference in hours
    const oldDurationHours = oldLog.duration / 60;
    const newDurationHours = log.duration / 60;
    const hoursDifference = newDurationHours - oldDurationHours;
    
    // Update equipment flight hours
    setEquipmentList(prev => prev.map(item => {
      if (item.id === log.equipmentId) {
        return {
          ...item,
          flightHours: item.flightHours + hoursDifference
        };
      }
      return item;
    }));
    
    // Update usage metrics
    // This is a simplified update - a complete implementation would need to
    // recalculate all derived values like average time properly
    setUsageMetrics(prev => {
      if (!prev[log.equipmentId]) return prev;
      
      return {
        ...prev,
        [log.equipmentId]: {
          ...prev[log.equipmentId],
          totalFlightHours: prev[log.equipmentId].totalFlightHours + hoursDifference,
          // Other metrics would need more complex updates in a real implementation
        }
      };
    });
  }, [flightLogs]);
  
  const deleteFlightLog = useCallback((id: number) => {
    // Get the log before deletion to adjust flight hours
    const logToDelete = flightLogs.find(log => log.id === id);
    
    if (!logToDelete) return;
    
    // Calculate hours to subtract
    const hoursToSubtract = logToDelete.duration / 60;
    
    // Remove the log
    setFlightLogs(prev => prev.filter(log => log.id !== id));
    
    // Update equipment flight hours
    setEquipmentList(prev => prev.map(item => {
      if (item.id === logToDelete.equipmentId) {
        return {
          ...item,
          flightHours: Math.max(0, item.flightHours - hoursToSubtract)
        };
      }
      return item;
    }));
    
    // Update usage metrics
    // This is a simplified update
    setUsageMetrics(prev => {
      if (!prev[logToDelete.equipmentId]) return prev;
      
      return {
        ...prev,
        [logToDelete.equipmentId]: {
          ...prev[logToDelete.equipmentId],
          totalFlightHours: Math.max(0, prev[logToDelete.equipmentId].totalFlightHours - hoursToSubtract),
          missionsCompleted: Math.max(0, prev[logToDelete.equipmentId].missionsCompleted - 1),
          // Other metrics would need more complex updates
        }
      };
    });
  }, [flightLogs]);
  
  // Filtering function
  const filterEquipment = useCallback((filter: {
    status?: EquipmentStatus[];
    type?: EquipmentType[];
    search?: string;
  }) => {
    return equipmentList.filter(equipment => {
      // Filter by status if provided
      if (filter.status && filter.status.length > 0) {
        if (!filter.status.includes(equipment.status)) {
          return false;
        }
      }
      
      // Filter by type if provided
      if (filter.type && filter.type.length > 0) {
        if (!filter.type.includes(equipment.type)) {
          return false;
        }
      }
      
      // Filter by search text if provided
      if (filter.search && filter.search.trim() !== '') {
        const searchLower = filter.search.toLowerCase();
        return (
          equipment.name.toLowerCase().includes(searchLower) ||
          equipment.model.toLowerCase().includes(searchLower) ||
          equipment.serialNumber.toLowerCase().includes(searchLower) ||
          equipment.notes.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }, [equipmentList]);
  
  // Dashboard data calculation
  const getDashboardData = useCallback(() => {
    // Initialize status counts
    const statusCounts: Record<EquipmentStatus, number> = {
      'Ready': 0,
      'In Maintenance': 0,
      'Grounded': 0,
      'In Use': 0,
      'Needs Attention': 0
    };
    
    // Initialize type counts
    const typeCounts: Record<EquipmentType, number> = {
      'Drone': 0,
      'Camera': 0,
      'Battery': 0,
      'Propeller': 0,
      'Controller': 0,
      'Sensor': 0
    };
    
    // Count equipment by status and type
    equipmentList.forEach(equipment => {
      statusCounts[equipment.status]++;
      typeCounts[equipment.type]++;
    });
    
    // Find equipment needing maintenance soon (within 14 days)
    const now = new Date();
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const upcomingMaintenance = equipmentList.filter(equipment => {
      const maintenanceDate = new Date(equipment.nextMaintenance);
      return maintenanceDate > now && maintenanceDate <= twoWeeksLater;
    }).sort((a, b) => 
      new Date(a.nextMaintenance).getTime() - new Date(b.nextMaintenance).getTime()
    );
    
    // Calculate readiness percentage (Ready vs. total)
    const readyCount = statusCounts['Ready'];
    const totalCount = equipmentList.length;
    const readinessPercentage = totalCount > 0 ? (readyCount / totalCount) * 100 : 0;
    
    return {
      statusCounts,
      typeCounts,
      upcomingMaintenance,
      readinessPercentage
    };
  }, [equipmentList]);
  
  return {
    // Equipment state
    equipmentList,
    loading,
    error,
    
    // Maintenance records
    maintenanceRecords,
    
    // Flight logs
    flightLogs,
    
    // Usage metrics
    usageMetrics,
    
    // Selected equipment state
    selectedEquipment,
    setSelectedEquipment,
    
    // Dialog states
    isEquipmentFormOpen,
    isMaintenanceSchedulerOpen,
    isFlightLogFormOpen,
    isEquipmentDetailsOpen,
    
    // Dialog visibility handlers
    openEquipmentForm,
    closeEquipmentForm,
    openMaintenanceScheduler,
    closeMaintenanceScheduler,
    openFlightLogForm,
    closeFlightLogForm,
    openEquipmentDetails,
    closeEquipmentDetails,
    
    // CRUD operations
    addEquipment,
    updateEquipment,
    deleteEquipment,
    
    // Maintenance operations
    addMaintenanceRecord,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    
    // Flight log operations
    addFlightLog,
    updateFlightLog,
    deleteFlightLog,
    
    // Filtering and sorting
    filterEquipment,
    
    // Dashboard data
    getDashboardData
  };
};

export default useEquipmentManagement; 