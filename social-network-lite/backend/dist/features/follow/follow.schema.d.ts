/**
 * Follow schema definition for MongoDB using Mongoose
 * Represents follow relationships between users in the social network
 */
import mongoose, { Document } from 'mongoose';
import { IUser } from '../users/user.schema';
/**
 * Follow document interface defines the shape of a Follow document in MongoDB
 */
export interface IFollow extends Document {
    follower: IUser['_id'];
    following: IUser['_id'];
    createdAt: Date;
}
export declare const FollowModel: mongoose.Model<IFollow, {}, {}, {}, mongoose.Document<unknown, {}, IFollow> & IFollow & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
