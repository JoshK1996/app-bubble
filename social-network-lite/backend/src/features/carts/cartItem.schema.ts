/**
 * CartItem Schema (Mongoose)
 * Defines the structure for items within a cart in MongoDB.
 */
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface representing a CartItem document in MongoDB.
 */
export interface CartItemDocument extends Document {
  _id: string;
  cart: string; // Reference to the Cart
  product: string; // Reference to the Product
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define the CartItem schema
const cartItemSchema = new Schema<CartItemDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    cart: {
      type: String,
      ref: 'Cart',
      required: true,
    },
    product: {
      type: String,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1, // Must have at least one item
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: 'cart_items',
  },
);

// Ensure a unique combination of cart and product
cartItemSchema.index({ cart: 1, product: 1 }, { unique: true });

// Create and export the CartItem model
export const CartItemModel = model<CartItemDocument>(
  'CartItem',
  cartItemSchema,
); 