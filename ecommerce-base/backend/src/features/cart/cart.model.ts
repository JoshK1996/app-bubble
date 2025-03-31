/**
 * Cart Model
 * Defines the schema for cart in the database
 */
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface CartItemDocument extends Document {
  _id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

export interface CartDocument extends Document {
  _id: string;
  userId: string;
  items: CartItemDocument[];
  totalPrice: number;
  updatedAt: Date;
  createdAt: Date;
}

const cartItemSchema = new Schema<CartItemDocument>({
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
});

const cartSchema = new Schema<CartDocument>(
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
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'carts',
  }
);

// Virtual method to calculate total price
cartSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalPrice = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  } else {
    this.totalPrice = 0;
  }
  next();
});

export const CartModel = mongoose.model<CartDocument>('Cart', cartSchema); 