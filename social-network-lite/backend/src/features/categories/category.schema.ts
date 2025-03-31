/**
 * Category Schema (Mongoose)
 * Defines the structure for category documents in MongoDB.
 */
import { Schema, model, Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface representing a Category document in MongoDB.
 */
export interface CategoryDocument extends Document {
  _id: string; // Use string type for UUID compatibility
  name: string;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Category schema
const categorySchema = new Schema<CategoryDocument>(
  {
    _id: {
      type: String,
      default: uuidv4, // Generate UUID for _id
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allow multiple documents without a slug
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    collection: 'categories', // Optional: Explicitly set collection name
  },
);

// Create and export the Category model
export const CategoryModel = model<CategoryDocument>('Category', categorySchema); 