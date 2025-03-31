/**
 * Follow schema definition for MongoDB using Mongoose
 * Represents follow relationships between users in the social network
 */
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../users/user.schema';

/**
 * Follow document interface defines the shape of a Follow document in MongoDB
 */
export interface IFollow extends Document {
  follower: IUser['_id'];
  following: IUser['_id'];
  createdAt: Date;
}

/**
 * Follow schema for MongoDB using Mongoose
 */
const FollowSchema: Schema = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt field
    versionKey: false, // Don't include the __v field
  },
);

// Create a unique compound index to prevent duplicate follows
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Create and export the Follow model
export const FollowModel = mongoose.model<IFollow>('Follow', FollowSchema);
