/**
 * User Model
 * Defines the schema for users in the MongoDB database
 */
import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '@src/types/role.enum';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface defining the structure of a User document
 */
export interface UserDocument extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  profileImage?: string;
  phoneNumber?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isVerified: boolean;
  averageRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Users
 */
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.CUSTOMER,
    },
    profileImage: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    bio: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Create indexes for common queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Virtual for user's full name
userSchema.virtual('fullName').get(function(this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Export the User model
export const UserModel = mongoose.model<UserDocument>('User', userSchema); 