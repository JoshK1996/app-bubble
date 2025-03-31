/**
 * Review Model
 * Defines the schema for reviews in the MongoDB database
 */
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface defining the structure of a Review document
 */
export interface ReviewDocument extends Document {
  _id: string;
  bookingId: string;
  authorId: string; // Customer who wrote the review
  subjectId: string; // Provider being reviewed
  rating: number; // 1-5 rating
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Reviews
 */
const reviewSchema = new Schema<ReviewDocument>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    bookingId: {
      type: String,
      required: [true, 'Booking ID is required'],
      ref: 'Booking',
      unique: true,
    },
    authorId: {
      type: String,
      required: [true, 'Author ID is required'],
      ref: 'User',
    },
    subjectId: {
      type: String,
      required: [true, 'Subject ID is required'],
      ref: 'User',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'reviews',
  }
);

// Create indexes for common queries
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ authorId: 1 });
reviewSchema.index({ subjectId: 1 });
reviewSchema.index({ rating: 1 });

// Export the Review model
export const ReviewModel = mongoose.model<ReviewDocument>('Review', reviewSchema); 