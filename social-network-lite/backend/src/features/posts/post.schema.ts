/**
 * Post schema definition for MongoDB using Mongoose
 * Represents user posts in the social network
 */
import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../users/user.schema';

/**
 * Post document interface defines the shape of a Post document in MongoDB
 */
export interface IPost extends Document {
  content: string;
  user: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Post schema for MongoDB using Mongoose
 */
const PostSchema: Schema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false, // Don't include the __v field
  },
);

// Create and export the Post model
export const PostModel = mongoose.model<IPost>('Post', PostSchema);
