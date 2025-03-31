// Type declarations for libraries
declare module '@mui/lab' {
  import * as React from 'react';

  export interface TimelineProps {
    children?: React.ReactNode;
    position?: 'alternate' | 'left' | 'right';
    className?: string;
    sx?: any;
  }

  export const Timeline: React.FC<TimelineProps>;

  export interface TimelineItemProps {
    children?: React.ReactNode;
    className?: string;
    sx?: any;
  }

  export const TimelineItem: React.FC<TimelineItemProps>;

  export interface TimelineSeparatorProps {
    children?: React.ReactNode;
    className?: string;
    sx?: any;
  }

  export const TimelineSeparator: React.FC<TimelineSeparatorProps>;

  export interface TimelineDotProps {
    children?: React.ReactNode;
    className?: string;
    color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'grey';
    variant?: 'filled' | 'outlined';
    sx?: any;
  }

  export const TimelineDot: React.FC<TimelineDotProps>;

  export interface TimelineConnectorProps {
    className?: string;
    sx?: any;
  }

  export const TimelineConnector: React.FC<TimelineConnectorProps>;

  export interface TimelineContentProps {
    children?: React.ReactNode;
    className?: string;
    sx?: any;
  }

  export const TimelineContent: React.FC<TimelineContentProps>;

  export interface TimelineOppositeContentProps {
    children?: React.ReactNode;
    className?: string;
    color?: string;
    sx?: any;
  }

  export const TimelineOppositeContent: React.FC<TimelineOppositeContentProps>;
} 