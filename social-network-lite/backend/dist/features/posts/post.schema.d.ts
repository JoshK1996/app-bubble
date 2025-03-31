/**
 * Post schema definition for MongoDB using Mongoose
 * Represents user posts in the social network
 */
import mongoose, { Document } from 'mongoose';
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
export declare const PostModel: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost> & IPost & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
