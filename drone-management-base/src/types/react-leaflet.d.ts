declare module 'react-leaflet' {
  import { ReactNode, Component } from 'react';
  import { LatLngExpression, Icon, DivIcon, LeafletMouseEvent, Map as LeafletMap, LatLngBounds, MapOptions, Marker as LeafletMarker, Popup as LeafletPopup, CircleMarker, PathOptions, LatLng } from 'leaflet';

  export interface MapContainerProps extends MapOptions {
    center: LatLngExpression;
    zoom: number;
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    whenCreated?: (map: LeafletMap) => void;
    whenReady?: () => void;
    bounds?: LatLngBounds;
  }

  export class MapContainer extends Component<MapContainerProps> {}

  export interface TileLayerProps {
    attribution?: string;
    url: string;
    zIndex?: number;
  }

  export class TileLayer extends Component<TileLayerProps> {}

  export interface MarkerProps {
    position: LatLngExpression;
    icon?: any;
    draggable?: boolean;
    eventHandlers?: any;
    opacity?: number;
    zIndexOffset?: number;
    children?: ReactNode;
  }

  export class Marker extends Component<MarkerProps> {}

  export interface PopupProps {
    children?: ReactNode;
    position?: LatLngExpression;
    className?: string;
    maxWidth?: number;
    maxHeight?: number;
    offset?: [number, number];
    autoPan?: boolean;
  }

  export class Popup extends Component<PopupProps> {}

  export interface CircleProps extends PathOptions {
    center: LatLngExpression;
    radius: number;
    pathOptions?: PathOptions;
    children?: ReactNode;
  }

  export class Circle extends Component<CircleProps> {}

  export function useMapEvents(events: Record<string, (...args: any[]) => void>): LeafletMap;
  export function useMap(): LeafletMap;
} 