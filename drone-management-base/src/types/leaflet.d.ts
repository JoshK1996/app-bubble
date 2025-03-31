declare module 'leaflet' {
  export type LatLngTuple = [number, number];
  export type LatLngExpression = LatLng | LatLngTuple | { lat: number; lng: number };
  
  export class LatLng {
    constructor(lat: number, lng: number, alt?: number);
    lat: number;
    lng: number;
    alt?: number;
    equals(otherLatLng: LatLng, maxMargin?: number): boolean;
    toString(): string;
    distanceTo(otherLatLng: LatLng): number;
    wrap(): LatLng;
    toBounds(sizeInMeters: number): LatLngBounds;
  }

  export class LatLngBounds {
    constructor(southWest: LatLngExpression, northEast: LatLngExpression);
    extend(latlng: LatLngExpression): this;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
    getNorth(): number;
    getSouth(): number;
    getEast(): number;
    getWest(): number;
    getCenter(): LatLng;
    contains(latlng: LatLngExpression): boolean;
    intersects(bounds: LatLngBounds): boolean;
    overlaps(bounds: LatLngBounds): boolean;
    toBBoxString(): string;
    equals(bounds: LatLngBounds): boolean;
    isValid(): boolean;
  }

  export interface MapOptions {
    preferCanvas?: boolean;
    attributionControl?: boolean;
    zoomControl?: boolean;
    closePopupOnClick?: boolean;
    zoomSnap?: number;
    zoomDelta?: number;
    trackResize?: boolean;
    boxZoom?: boolean;
    doubleClickZoom?: boolean | string;
    dragging?: boolean;
    crs?: any;
    center?: LatLngExpression;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    layers?: any[];
    maxBounds?: LatLngBounds;
    renderer?: any;
    inertia?: boolean;
    inertiaDeceleration?: number;
    inertiaMaxSpeed?: number;
    easeLinearity?: number;
    worldCopyJump?: boolean;
    maxBoundsViscosity?: number;
    keyboard?: boolean;
    keyboardPanDelta?: number;
    scrollWheelZoom?: boolean | string;
    wheelDebounceTime?: number;
    wheelPxPerZoomLevel?: number;
    tap?: boolean;
    tapTolerance?: number;
    touchZoom?: boolean | string;
    bounceAtZoomLimits?: boolean;
  }

  export class Map {
    constructor(element: string | HTMLElement, options?: MapOptions);
    setView(center: LatLngExpression, zoom?: number, options?: any): this;
    setZoom(zoom: number, options?: any): this;
    zoomIn(delta?: number, options?: any): this;
    zoomOut(delta?: number, options?: any): this;
    setZoomAround(position: LatLngExpression, zoom: number, options?: any): this;
    fitBounds(bounds: LatLngBounds, options?: any): this;
    flyTo(latLng: LatLngExpression, zoom?: number, options?: any): this;
    flyToBounds(bounds: LatLngBounds, options?: any): this;
    panTo(latLng: LatLngExpression, options?: any): this;
    panBy(offset: [number, number], options?: any): this;
    getCenter(): LatLng;
    getZoom(): number;
    getBounds(): LatLngBounds;
    getMinZoom(): number;
    getMaxZoom(): number;
    getBoundsZoom(bounds: LatLngBounds, inside?: boolean): number;
    getSize(): Point;
    getPixelBounds(): Bounds;
    getPixelOrigin(): Point;
    getPixelWorldBounds(zoom?: number): Bounds;
    on(type: string, listener: (event: any) => void): this;
    off(type: string, listener?: (event: any) => void): this;
    removeLayer(layer: any): this;
    addLayer(layer: any): this;
  }

  export class Point {
    constructor(x: number, y: number, round?: boolean);
    x: number;
    y: number;
  }

  export class Bounds {
    constructor(a: Point, b: Point);
    extend(point: Point): this;
    getCenter(round?: boolean): Point;
    getBottomLeft(): Point;
    getTopRight(): Point;
    getSize(): Point;
    contains(bounds: Bounds): boolean;
    intersects(bounds: Bounds): boolean;
    overlaps(bounds: Bounds): boolean;
  }

  export interface IconOptions {
    iconUrl?: string;
    iconRetinaUrl?: string;
    iconSize?: Point | [number, number];
    iconAnchor?: Point | [number, number];
    popupAnchor?: Point | [number, number];
    shadowUrl?: string;
    shadowRetinaUrl?: string;
    shadowSize?: Point | [number, number];
    shadowAnchor?: Point | [number, number];
    className?: string;
  }

  export class Icon {
    constructor(options: IconOptions);
    createIcon(oldIcon?: HTMLElement): HTMLElement;
    createShadow(oldIcon?: HTMLElement): HTMLElement;
  }

  export class DivIcon extends Icon {
    constructor(options?: any);
  }

  export interface PathOptions {
    stroke?: boolean;
    color?: string;
    weight?: number;
    opacity?: number;
    lineCap?: string;
    lineJoin?: string;
    dashArray?: string;
    dashOffset?: string;
    fill?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    fillRule?: string;
    className?: string;
  }

  export interface LeafletMouseEvent {
    latlng: LatLng;
    layerPoint: Point;
    containerPoint: Point;
    originalEvent: MouseEvent;
  }
} 