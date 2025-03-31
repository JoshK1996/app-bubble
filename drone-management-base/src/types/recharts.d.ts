declare module 'recharts' {
  import { ReactNode, ComponentType, Component } from 'react';

  export interface ChartProps {
    width?: number;
    height?: number;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }

  export interface AxisProps {
    dataKey?: string;
    xAxisId?: string | number;
    yAxisId?: string | number;
    width?: number;
    height?: number;
    orientation?: 'top' | 'bottom' | 'left' | 'right';
    type?: 'number' | 'category';
    allowDecimals?: boolean;
    allowDataOverflow?: boolean;
    domain?: [number | string, number | string] | 'auto' | 'dataMin' | 'dataMax';
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    tick?: boolean | ReactNode | ComponentType | object;
    tickLine?: boolean | object;
    axisLine?: boolean | object;
    label?: string | number | ReactNode | object;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    tickFormatter?: (value: any) => string;
  }

  export class LineChart extends Component<ChartProps> {}
  export class BarChart extends Component<ChartProps> {}
  export class AreaChart extends Component<ChartProps> {}
  export class PieChart extends Component<ChartProps> {}
  export class RadarChart extends Component<ChartProps> {}
  export class ScatterChart extends Component<ChartProps> {}
  export class ComposedChart extends Component<ChartProps> {}

  export interface LineProps {
    dataKey: string;
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    stroke?: string;
    strokeWidth?: number;
    dot?: boolean | object | ReactNode | ComponentType;
    activeDot?: boolean | object | ReactNode | ComponentType;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none';
    connectNulls?: boolean;
    fill?: string;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    id?: string;
  }

  export class Line extends Component<LineProps> {}
  
  export interface BarProps {
    dataKey: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none';
    barSize?: number;
    maxBarSize?: number;
    minPointSize?: number;
    background?: boolean | ReactNode | ComponentType;
    stackId?: string | number;
    id?: string;
  }

  export class Bar extends Component<BarProps> {}

  export interface AreaProps {
    dataKey: string;
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
    stackId?: string | number;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none';
    connectNulls?: boolean;
    activeDot?: boolean | object | ReactNode | ComponentType;
    id?: string;
  }

  export class Area extends Component<AreaProps> {}

  export interface XAxisProps extends AxisProps {}
  export interface YAxisProps extends AxisProps {}

  export class XAxis extends Component<XAxisProps> {}
  export class YAxis extends Component<YAxisProps> {}

  export interface CartesianGridProps {
    horizontal?: boolean;
    vertical?: boolean;
    horizontalPoints?: number[];
    verticalPoints?: number[];
    stroke?: string;
    strokeDasharray?: string;
  }

  export class CartesianGrid extends Component<CartesianGridProps> {}

  export interface TooltipProps {
    content?: ReactNode | ComponentType<any>;
    cursor?: boolean | object | ReactNode;
    offset?: number;
    position?: {
      x?: number;
      y?: number;
    };
    wrapperStyle?: object;
    itemStyle?: object;
    labelStyle?: object;
    isAnimationActive?: boolean;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    formatter?: (value: any, name: string, props: any) => ReactNode;
    labelFormatter?: (label: any) => ReactNode;
  }

  export class Tooltip extends Component<TooltipProps> {}

  export interface LegendProps {
    width?: number;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    iconSize?: number;
    iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    payload?: Array<{
      value: string;
      type: string;
      id?: string;
      color?: string;
    }>;
    formatter?: (value: string, entry: any, index: number) => ReactNode;
    onClick?: (e: any) => void;
    onMouseEnter?: (e: any) => void;
    onMouseLeave?: (e: any) => void;
  }

  export class Legend extends Component<LegendProps> {}

  export interface ResponsiveContainerProps {
    aspect?: number;
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    children?: ReactNode;
    debounce?: number;
  }

  export class ResponsiveContainer extends Component<ResponsiveContainerProps> {}

  export interface ScatterProps {
    data?: Array<{ x: number; y: number; z?: number; [key: string]: any }>;
    shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye' | ReactNode;
    fill?: string;
    stroke?: string;
    line?: boolean | object | ReactNode | ComponentType;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none';
    lineType?: 'fitting' | 'joint';
    lineJointType?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    name?: string;
    xAxisId?: string | number;
    yAxisId?: string | number;
    zAxisId?: string | number;
    dataKey?: string;
  }

  export class Scatter extends Component<ScatterProps> {}

  export interface PieProps {
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    minAngle?: number;
    paddingAngle?: number;
    nameKey?: string;
    dataKey?: string;
    valueKey?: string;
    data?: Array<{ name?: string; value?: number | [number, number]; [key: string]: any }>;
    fill?: string;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none';
    label?: boolean | ReactNode | ComponentType<any> | object;
    labelLine?: boolean | object | ReactNode | ComponentType;
    activeIndex?: number[];
    activeShape?: object | ReactNode | ComponentType;
    children?: ReactNode;
  }

  export class Pie extends Component<PieProps> {}

  export interface CellProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    key?: string | number;
  }

  export class Cell extends Component<CellProps> {}

  export interface RadarProps {
    dataKey: string;
    stroke?: string;
    fill?: string;
    fillOpacity?: number;
    name?: string;
    legendType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye' | 'none';
    dot?: boolean | object | ReactNode | ComponentType;
    activeDot?: boolean | object | ReactNode | ComponentType;
    isAnimationActive?: boolean;
    animationBegin?: number;
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  }

  export class Radar extends Component<RadarProps> {}

  export interface PolarAngleAxisProps {
    dataKey?: string;
    cx?: number;
    cy?: number;
    radius?: number;
    axisLine?: boolean | object;
    axisLineType?: string;
    tickLine?: boolean | object;
    tick?: boolean | ReactNode | ComponentType | object;
    stroke?: string;
    orientation?: 'inner' | 'outer';
    tickFormatter?: (value: any) => string;
  }

  export class PolarAngleAxis extends Component<PolarAngleAxisProps> {}

  export interface PolarRadiusAxisProps {
    angle?: number;
    cx?: number;
    cy?: number;
    domain?: [number, number] | 'auto' | 'dataMin' | 'dataMax';
    label?: string | number | ReactNode | ComponentType<any>;
    orientation?: 'left' | 'right' | 'middle';
    axisLine?: boolean | object;
    tick?: boolean | ReactNode | ComponentType | object;
    tickFormatter?: (value: any) => string;
    tickCount?: number;
    scale?: 'auto' | 'linear' | 'pow' | 'sqrt' | 'log' | 'identity' | 'time' | 'band' | 'point' | 'ordinal' | 'quantile' | 'quantize' | 'utc' | 'sequential' | 'threshold';
    type?: 'number' | 'category';
  }

  export class PolarRadiusAxis extends Component<PolarRadiusAxisProps> {}

  export interface PolarGridProps {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    polarAngles?: number[];
    polarRadius?: number[];
    gridType?: 'polygon' | 'circle';
  }

  export class PolarGrid extends Component<PolarGridProps> {}

  export interface ReferenceLineProps {
    xAxisId?: string | number;
    yAxisId?: string | number;
    x?: number | string;
    y?: number | string;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    label?: string | number | ReactNode | ComponentType<any>;
    isFront?: boolean;
  }

  export class ReferenceLine extends Component<ReferenceLineProps> {}

  export interface ReferenceAreaProps {
    xAxisId?: string | number;
    yAxisId?: string | number;
    x1?: number | string;
    x2?: number | string;
    y1?: number | string;
    y2?: number | string;
    stroke?: string;
    strokeOpacity?: number;
    strokeWidth?: number;
    fill?: string;
    fillOpacity?: number;
    isFront?: boolean;
    alwaysShow?: boolean;
    ifOverflow?: 'hidden' | 'visible' | 'discard' | 'extendDomain';
  }

  export class ReferenceArea extends Component<ReferenceAreaProps> {}

  export interface BrushProps {
    dataKey?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    data?: any[];
    travellerWidth?: number;
    startIndex?: number;
    endIndex?: number;
    onChange?: (args: { startIndex: number; endIndex: number }) => void;
  }

  export class Brush extends Component<BrushProps> {}

  export interface PieLabelRenderProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
    [key: string]: any;
  }
} 