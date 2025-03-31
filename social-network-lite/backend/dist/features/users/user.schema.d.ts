/**
 * User schema definition for MongoDB using Mongoose
 * Represents users in the social network
 */
import mongoose, { Document } from 'mongoose';
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
export declare const UserModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
