import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import type { LatLngTuple } from 'leaflet';

interface Waypoint {
  position: LatLngTuple;
  [key: string]: any;
}

// A simple hook to render a static flight path line between waypoints
export const useFlightPath = (waypoints: Waypoint[], color: string) => {
  const map = useMap();
  
  useEffect(() => {
    let pathLayer: any = null;
    
    if (waypoints.length > 1) {
      const positions = waypoints.map(wp => wp.position);
      
      // Create a simple polyline to show the planned path
      // @ts-ignore -- The polyline method exists at runtime in the Leaflet library even though the TypeScript types don't recognize it
      pathLayer = L.polyline(positions, {
        color,
        weight: 3,
        dashArray: '5,5'
      });
      
      if (pathLayer) {
        pathLayer.addTo(map);
      }
    }
    
    // Clean up when component unmounts or waypoints change
    return () => {
      if (pathLayer) {
        map.removeLayer(pathLayer);
      }
    };
  }, [waypoints, color, map]);
  
  return null;
}; 