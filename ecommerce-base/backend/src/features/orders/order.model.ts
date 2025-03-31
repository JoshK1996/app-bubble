/**
 * Order Model
 * Defines the schema for orders in the database
 */
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@src/types/role.enum';

/**
 * Enum defining possible order statuses
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItemDocument extends Document {
  _id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  subtotal: number;
}

export interface OrderDocument extends Document {
  _id: string;
  userId: string;
  orderNumber: string;
  items: OrderItemDocument[];
  totalPrice: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  };
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  notes?: string;
  updatedAt: Date;
  createdAt: Date;
}

const orderItemSchema = new Schema<OrderItemDocument>({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  imageUrl: {
    type: String,
    default: '',
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const shippingAddressSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
  },
  addressLine2: {
    type: String,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  state: {
    type: String,
    required: [true, 'State/Province is required'],
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
  },
  phoneNumber: {
    type: String,
  },
});

const orderSchema = new Schema<OrderDocument>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'CREDIT_CARD', // Default to credit card for simplicity
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PENDING',
    },
    notes: {
      type: String,
    }
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

// Create index on order status for efficient querying
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Pre-calculate subtotal for each item before saving
orderSchema.pre('save', function (next) {
  this.items.forEach(item => {
    item.subtotal = item.price * item.quantity;
  });
  next();
});

export const OrderModel = mongoose.model<OrderDocument>('Order', orderSchema); 