/**
 * User Mongoose Schema for MongoDB
 * 
 * This module defines the User schema and model for MongoDB using Mongoose.
 * It includes user authentication details, role information, and relationships with other models.
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Enum for user roles
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

/**
 * Interface defining the structure of a User document in MongoDB
 */
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for User model
 * Defines the fields, validation rules, and indexes for the User collection
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
    toJSON: {
      // Transform the returned object to remove sensitive information
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

// Create an index on the email field for faster lookups
UserSchema.index({ email: 1 });

/**
 * User model for MongoDB using the defined schema
 * This is exported to be used in various services for CRUD operations
 */
export const UserModel = mongoose.model<IUser>('User', UserSchema); 