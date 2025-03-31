/**
 * Board Mongoose Schema for MongoDB
 * 
 * This module defines the Board schema and model for MongoDB using Mongoose.
 * It represents projects or collections of tasks with columns and relationships to users.
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface defining the structure of a Board document in MongoDB
 */
export interface IBoard extends Document {
  title: string;
  description?: string;
  createdById: mongoose.Types.ObjectId; // Reference to User who created the board
  ownerId: mongoose.Types.ObjectId; // Reference to User who owns the board
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Board model
 * Defines the fields, validation rules, and indexes for the Board collection
 */
const BoardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  },
);

// Create indexes for faster lookups
BoardSchema.index({ ownerId: 1 });
BoardSchema.index({ createdById: 1 });
BoardSchema.index({ createdAt: -1 }); // For sorting by most recent

/**
 * Board model for MongoDB using the defined schema
 * This is exported to be used in various services for CRUD operations
 */
export const BoardModel = mongoose.model<IBoard>('Board', BoardSchema); 