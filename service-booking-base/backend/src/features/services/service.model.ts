/**
 * Service Model
 * Defines the schema for services in the MongoDB database
 */
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface defining the structure of a Service document
 */
export interface ServiceDocument extends Document {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  location?: string;
  imageUrl?: string;
  isActive: boolean;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Services
 */
const serviceSchema = new Schema<ServiceDocument>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: Number,
      required: [true, 'Service duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      index: true,
    },
    location: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    providerId: {
      type: String,
      required: [true, 'Provider ID is required'],
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'services',
  }
);

// Create indexes for common queries
serviceSchema.index({ providerId: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ isActive: 1 });

// Export the Service model
export const ServiceModel = mongoose.model<ServiceDocument>('Service', serviceSchema); 