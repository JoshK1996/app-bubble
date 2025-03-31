/**
 * User Model (MongoDB)
 */
import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@src/types/role.enum';

// User interface (without Document specific properties)
export interface User {
  email: string;
  username: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

// Document interface - extend Document while including User properties
export interface UserDocument extends User, Document {
  _id: string; // Override Document's _id with string type
}

// User schema for Mongoose
const userSchema = new Schema<UserDocument>(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username must be less than 20 characters long'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password by default in query results
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.CUSTOMER,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: 'users', // Explicitly name the collection
  }
);

// Indexes for frequently queried fields
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

// Hide password and __v fields from JSON responses
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Create and export the User model
export const UserModel = mongoose.model<UserDocument>('User', userSchema); 