/**
 * OrderItem Schema (Mongoose)
 * Defines the structure for items within an order in MongoDB.
 */
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface representing an OrderItem document in MongoDB.
 */
export interface OrderItemDocument extends Document {
  _id: string;
  order: string; // Reference to the Order
  product: string; // Reference to the Product
  quantity: number;
  priceAtPurchase: number; // Price of the product when the order was placed
  createdAt: Date;
  updatedAt: Date;
}

// Define the OrderItem schema
const orderItemSchema = new Schema<OrderItemDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    order: {
      type: String,
      ref: 'Order',
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
      min: 1,
      default: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'order_items',
  },
);

// Indexing for potential performance improvements
orderItemSchema.index({ order: 1 });
orderItemSchema.index({ product: 1 });

// Create and export the OrderItem model
export const OrderItemModel = model<OrderItemDocument>(
  'OrderItem',
  orderItemSchema,
); 