/**
 * Cart Schema (Mongoose)
 * Defines the structure for cart documents in MongoDB.
 */
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface representing a Cart document in MongoDB.
 */
export interface CartDocument extends Document {
  _id: string;
  user: string; // Reference to the User who owns the cart (using User's string _id)
  items: string[]; // Array of CartItem _id references (populated later)
  createdAt: Date;
  updatedAt: Date;
}

// Define the Cart schema
const cartSchema = new Schema<CartDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user: {
      type: String,
      ref: 'User',
      required: true,
      unique: true, // Each user has only one cart
    },
    // items are managed via CartItem model referencing this Cart
  },
  {
    timestamps: true,
    collection: 'carts',
  },
);

// Create and export the Cart model
export const CartModel = model<CartDocument>('Cart', cartSchema); 