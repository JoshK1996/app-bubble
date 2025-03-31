import { LatLngExpression } from 'leaflet';
import { CurrentWeather, WeatherForecast, FlightSuitability } from '../utils/weatherApi';
import { MapLocation } from './mapTypes';
import { Equipment } from './equipmentTypes';
import { Pilot } from './pilotTypes';
import { Client } from './clientTypes';

/**
 * Mission form data interface
 */
export interface MissionFormData {
  id?: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: MapLocation | null;
  client: Client | null;
  pilot: Pilot | null;
  equipment: Equipment[];
  notes: string;
  tasks: MissionTask[];
  coordinates?: {
    lat: number;
    lon: number;
  };
  weatherData?: {
    current: CurrentWeather;
    forecast: WeatherForecast[];
  };
  flightSafety?: FlightSuitability;
  mapLocations?: MapLocation[];
  mainLocation?: MapLocation;
  flightPath?: LatLngExpression[];
  status?: MissionStatus;
  attachments?: File[];
  riskAssessmentCompleted?: boolean;
  checklistItems?: ChecklistItem[];
  checklistCompleted?: boolean;
  waypoints?: MapLocation[];
}

/**
 * Mission status enum
 */
export enum MissionStatus {
  PLANNED = 'PLANNED',
  BRIEFING = 'BRIEFING',
  PREFLIGHT = 'PREFLIGHT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Checklist item interface
 */
export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
  category: 'equipment' | 'safety' | 'regulatory' | 'environment' | 'mission';
}

/**
 * Mission client interface
 */
export interface MissionClient {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

/**
 * Mission pilot interface
 */
export interface MissionPilot {
  id: number;
  name: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  ratings?: string[];
  hoursTotalFlight?: number;
}

/**
 * Task interface
 */
export interface MissionTask {
  id: string;
  text: string;
  completed: boolean;
  assignedTo?: number; // Pilot ID
  location?: MapLocation;
  priority: 'Low' | 'Medium' | 'High';
}

/**
 * Mission flight log interface
 */
export interface MissionFlightLog {
  id: string;
  missionId: string;
  pilotId: number;
  equipmentId: number;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  maxAltitude: number; // meters
  maxDistance: number; // meters
  batteryUsed: number; // percentage
  incidents: string[];
  weatherConditions: {
    temperature: number;
    windSpeed: number;
    precipitation: boolean;
    visibility: number;
  };
  notes: string;
}

/**
 * Mission payload data interface
 */
export interface MissionPayloadData {
  id: string;
  missionId: string;
  type: 'Photo' | 'Video' | 'Survey' | 'Thermal' | 'Multispectral';
  fileCount: number;
  totalSize: number; // MB
  storagePath: string;
  processedPath?: string;
  deliveredToClient: boolean;
}

export default {
  MissionStatus
}; 