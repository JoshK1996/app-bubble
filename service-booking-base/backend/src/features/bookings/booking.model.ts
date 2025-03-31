/**
 * Booking Model
 * Defines the schema for bookings in the MongoDB database
 */
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { BookingStatus } from '@src/types/booking-status.enum';

/**
 * Interface defining the structure of a Booking document
 */
export interface BookingDocument extends Document {
  _id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: Date;
  scheduledTime: string;
  notes?: string;
  totalPrice: number;
  paymentStatus?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Bookings
 */
const bookingSchema = new Schema<BookingDocument>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    customerId: {
      type: String,
      required: [true, 'Customer ID is required'],
      ref: 'User',
    },
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
      ref: 'User',
    },
    serviceId: {
      type: String,
      required: [true, 'Service ID is required'],
      ref: 'Service',
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
    },
    notes: {
      type: String,
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    paymentStatus: {
      type: String,
      default: 'PENDING',
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'bookings',
  }
);

// Create indexes for common queries
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });

// Export the Booking model
export const BookingModel = mongoose.model<BookingDocument>('Booking', bookingSchema); 