import { LatLngExpression } from 'leaflet';

/**
 * Extract latitude from a LatLngExpression
 */
export function getLat(position: LatLngExpression): number {
  if (position === null || position === undefined) {
    return 0;
  }
  
  if (Array.isArray(position)) {
    return position[0];
  }
  
  if (typeof position === 'object') {
    if ('lat' in position) {
      return position.lat;
    }
  }
  
  return 0;
}

/**
 * Extract longitude from a LatLngExpression
 */
export function getLng(position: LatLngExpression): number {
  if (position === null || position === undefined) {
    return 0;
  }
  
  if (Array.isArray(position)) {
    return position[1];
  }
  
  if (typeof position === 'object') {
    if ('lng' in position) {
      return position.lng;
    }
  }
  
  return 0;
}

/**
 * Format coordinates as a string
 */
export function formatCoordinates(position: LatLngExpression | null | undefined): string {
  if (!position) return 'N/A';
  
  const lat = getLat(position);
  const lng = getLng(position);
  
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Convert LatLngExpression to array format
 */
export function toLatLngArray(position: LatLngExpression): [number, number] {
  return [getLat(position), getLng(position)];
}

/**
 * Convert LatLngExpression to object format
 */
export function toLatLngObject(position: LatLngExpression): { lat: number, lng: number } {
  return { lat: getLat(position), lng: getLng(position) };
} 