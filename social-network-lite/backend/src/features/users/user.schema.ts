/**
 * User schema definition for MongoDB using Mongoose
 * Represents users in the e-commerce platform (customers or admins)
 */
import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../../types/role.enum';
import { v4 as uuidv4 } from 'uuid';

/**
 * User document interface defines the shape of a User document in MongoDB
 */
export interface UserDocument extends Document {
  _id: string;
  email: string;
  username: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema for MongoDB using Mongoose
 */
const UserSchema: Schema = new Schema<UserDocument>(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
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
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Don't include the __v field
    collection: 'users',
  },
);

// Create and export the User model
export const UserModel = mongoose.model<UserDocument>('User', UserSchema); 