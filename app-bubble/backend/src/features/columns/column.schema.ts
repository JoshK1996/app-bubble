/**
 * Column Mongoose Schema for MongoDB
 * 
 * This module defines the Column schema and model for MongoDB using Mongoose.
 * It represents status columns within a board (e.g., "To Do", "In Progress", "Done").
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface defining the structure of a Column document in MongoDB
 */
export interface IColumn extends Document {
  title: string;
  order: number; // Position of the column in the board
  boardId: mongoose.Types.ObjectId; // Reference to the Board this column belongs to
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Column model
 * Defines the fields, validation rules, and indexes for the Column collection
 */
const ColumnSchema = new Schema<IColumn>(
  {
    title: {
      type: String,
      required: [true, 'Column title is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Column order is required'],
      min: [0, 'Column order must be a non-negative number'],
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board ID is required'],
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  },
);

// Create indexes for faster lookups
ColumnSchema.index({ boardId: 1, order: 1 }, { unique: true }); // Ensure unique order within a board
ColumnSchema.index({ boardId: 1 }); // For querying all columns of a board

/**
 * Column model for MongoDB using the defined schema
 * This is exported to be used in various services for CRUD operations
 */
export const ColumnModel = mongoose.model<IColumn>('Column', ColumnSchema); 