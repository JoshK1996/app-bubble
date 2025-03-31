/**
 * Product Schema (Mongoose)
 * Defines the structure for product documents in MongoDB.
 */
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface representing a Product document in MongoDB.
 */
export interface ProductDocument extends Document {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  stock: number;
  category?: Types.ObjectId; // Reference to Category model
  createdAt: Date;
  updatedAt: Date;
}

// Define the Product schema
const productSchema = new Schema<ProductDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    category: {
      type: String, // Storing UUID as String
      ref: 'Category', // Reference to the Category model
    },
  },
  {
    timestamps: true,
    collection: 'products',
  },
);

// Indexing for potential performance improvements on common queries
productSchema.index({ name: 'text', description: 'text' }); // For text search
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

// Create and export the Product model
export const ProductModel = model<ProductDocument>('Product', productSchema); 