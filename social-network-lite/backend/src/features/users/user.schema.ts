/**
 * User schema definition for MongoDB using Mongoose
 * Represents users in the social network
 */
import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../../types/role.enum';

/**
 * User document interface defines the shape of a User document in MongoDB
 */
export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  fullName: string;
  bio?: string;
  avatarUrl?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema for MongoDB using Mongoose
 */
const UserSchema: Schema = new Schema(
  {
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
    bio: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Don't include the __v field
  },
);

// Create and export the User model
export const UserModel = mongoose.model<IUser>('User', UserSchema); 