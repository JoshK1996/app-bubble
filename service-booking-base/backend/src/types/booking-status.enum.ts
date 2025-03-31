/**
 * BookingStatus Enum
 * Defines the possible states of a service booking
 */
export enum BookingStatus {
  PENDING = 'PENDING',      // Initial state when booking is created
  ACCEPTED = 'ACCEPTED',    // Provider accepted the booking
  REJECTED = 'REJECTED',    // Provider rejected the booking
  CANCELLED = 'CANCELLED',  // Customer cancelled the booking
  COMPLETED = 'COMPLETED',  // Service was provided and completed
  IN_PROGRESS = 'IN_PROGRESS' // Service is currently being provided
} 