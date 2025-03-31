import { LatLngExpression } from 'leaflet';

/**
 * Map location interface for mission planning
 */
export interface MapLocation {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  description?: string;
  radius?: number;
  notes?: string;
}

/**
 * Map bounds interface
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Map layer type for displaying different map views
 */
export type MapLayerType = 'standard' | 'satellite' | 'terrain' | 'hybrid' | 'street';

/**
 * Map marker with additional metadata
 */
export interface MapMarker extends MapLocation {
  icon?: string;
  color?: string;
  visible?: boolean;
  draggable?: boolean;
}

/**
 * Flight zone definition for geofencing
 */
export interface FlightZone {
  id: string;
  name: string;
  type: 'allowed' | 'restricted' | 'warning';
  bounds: MapBounds | LatLngExpression[];
  description?: string;
  maxAltitude?: number; // meters
  startTime?: string;
  endTime?: string;
  active: boolean;
}

export default {
  MapLayerType: ['standard', 'satellite', 'terrain', 'hybrid', 'street']
}; 