/**
 * Order Schema (Mongoose)
 * Defines the structure for order documents in MongoDB.
 */
import { Schema, model, Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define possible order statuses
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

/**
 * Interface representing an Order document in MongoDB.
 */
export interface OrderDocument extends Document {
  _id: string;
  user: string; // Reference to the User who placed the order
  items: Types.ObjectId[]; // Array of OrderItem references (populated later)
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Order schema
const orderSchema = new Schema<OrderDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    user: {
      type: String,
      ref: 'User',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true,
    },
    // items are managed via OrderItem model referencing this Order
  },
  {
    timestamps: true,
    collection: 'orders',
  },
);

// Indexing for common queries
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Create and export the Order model
export const OrderModel = model<OrderDocument>('Order', orderSchema); 