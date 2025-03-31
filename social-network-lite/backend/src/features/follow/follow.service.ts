/**
 * Follow Service
 * Handles business logic related to following and unfollowing users.
 */
import { Prisma, PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import config from '../../config/config';
import { AppError } from '../../utils/AppError';
import { FollowModel, IFollow } from './follow.schema';
import { logger } from '../../config/logger';
import { StatusCodes } from 'http-status-codes';

// --- In-Memory Store (for development/testing) ---
interface InMemoryFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}
let inMemoryFollows: InMemoryFollow[] = [];
let nextFollowId = 1;
// -----------------------------------------------

// Database setup
const dbType = config.databaseType;
let prisma: PrismaClient | undefined;
if (dbType === 'postgres') {
  prisma = new PrismaClient();
}

// Define a type for the populated follow document from Mongoose
interface PopulatedFollow extends IFollow {
    follower: { _id: string; username: string; fullName?: string; avatarUrl?: string };
    following: { _id: string; username: string; fullName?: string; avatarUrl?: string };
}

// Define interface for selected user data returned by getFollowing/getFollowers
interface SelectedUser {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
}

export class FollowService {

  /**
   * Creates a follow relationship between two users.
   * @param followerId - The ID of the user initiating the follow.
   * @param followingId - The ID of the user being followed.
   * @returns The created follow relationship details.
   * @throws {AppError} If users are the same, already following, or on DB error.
   */
  async followUser(followerId: string, followingId: string): Promise<any> {
    logger.info(`Attempting follow: User ${followerId} -> User ${followingId}`);

    if (followerId === followingId) {
      throw new AppError('Users cannot follow themselves.', StatusCodes.BAD_REQUEST);
    }

    try {
      if (dbType === 'postgres' && prisma) {
        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId, followingId } },
        });
        if (existingFollow) {
          throw new AppError('Already following this user.', StatusCodes.CONFLICT);
        }
        // Create follow record
        const newFollow = await prisma.follow.create({
          data: { followerId, followingId },
          include: { follower: { select: { username: true } }, following: { select: { username: true } } },
        });
        logger.info(`PostgreSQL: User ${followerId} successfully followed ${followingId}.`);
        return newFollow;
      } else if (dbType === 'mongo') {
        // Check if already following
        const existingFollow = await FollowModel.findOne({ follower: followerId, following: followingId });
        if (existingFollow) {
          throw new AppError('Already following this user.', StatusCodes.CONFLICT);
        }
        // Create and then populate
        let newFollow: any; // Use any temporarily to avoid complex type error
        try {
          newFollow = await FollowModel.create({ follower: followerId, following: followingId });
          // Use populate without strict generic type for now
          await newFollow.populate([
            { path: 'follower', select: 'username' },
            { path: 'following', select: 'username' },
          ]);
        } catch (creationOrPopulationError) {
          logger.error('MongoDB: Error during follow creation or population', { error: creationOrPopulationError });
          throw new AppError('Failed to create or populate follow relationship.', StatusCodes.INTERNAL_SERVER_ERROR);
        }

        if (!newFollow?._id) { // Check _id exists
          logger.error('MongoDB: Follow document null or missing _id after creation attempt');
          throw new AppError('Failed to retrieve created follow record.', StatusCodes.INTERNAL_SERVER_ERROR);
        }

        logger.info(`MongoDB: User ${followerId} successfully followed ${followingId}. ID: ${newFollow._id}`);
        // Use toObject() to return a plain JS object if needed by consumers
        return newFollow.toObject ? newFollow.toObject() : newFollow; 
      } else if (dbType === 'memory') {
        const existing = inMemoryFollows.find(f => f.followerId === followerId && f.followingId === followingId);
        if (existing) {
            throw new AppError('Already following this user.', StatusCodes.CONFLICT);
        }
        const newFollow: InMemoryFollow = {
            id: (nextFollowId++).toString(),
            followerId,
            followingId,
            createdAt: new Date(),
        };
        inMemoryFollows.push(newFollow);
        logger.info(`In-Memory: User ${followerId} successfully followed ${followingId}.`);
        return { ...newFollow, follower: { username: `user_${followerId}`}, following: { username: `user_${followingId}`} };
      } else {
        throw new AppError('Database type not supported or configured.', 500);
      }
    } catch (error: any) {
      if (error instanceof AppError) throw error; 
      if ((dbType === 'postgres' && error.code === 'P2002') || (dbType === 'mongo' && error.code === 11000)) {
        logger.warn(`Follow relationship ${followerId} -> ${followingId} already exists (caught by DB constraint).`);
        throw new AppError('Already following this user.', StatusCodes.CONFLICT);
      }
      logger.error(`Error following user: ${error.message}`, { followerId, followingId, error });
      throw new AppError('Failed to follow user due to a server error.', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Removes a follow relationship between two users.
   * @param followerId - The ID of the user initiating the unfollow.
   * @param followingId - The ID of the user being unfollowed.
   * @returns {Promise<boolean>} True if unfollow was successful, false if not following.
   * @throws {AppError} If users are the same or on DB error.
   */
  async unfollowUser(followerId: string, followingId: string): Promise<boolean> {
    logger.info(`Attempting unfollow: User ${followerId} -> User ${followingId}`);

    if (followerId === followingId) {
        throw new AppError('Users cannot unfollow themselves.', StatusCodes.BAD_REQUEST);
    }

    try {
      let deleted = false;
      if (dbType === 'postgres' && prisma) {
        const result = await prisma.follow.deleteMany({
          where: { followerId, followingId },
        });
        deleted = result.count > 0;
      } else if (dbType === 'mongo') {
        const result = await FollowModel.deleteOne({ follower: followerId, following: followingId });
        deleted = result.deletedCount > 0;
      } else if (dbType === 'memory') {
        const initialLength = inMemoryFollows.length;
        inMemoryFollows = inMemoryFollows.filter(f => !(f.followerId === followerId && f.followingId === followingId));
        deleted = inMemoryFollows.length < initialLength;
      } else {
        throw new AppError('Database type not supported or configured.', 500);
      }

      if (deleted) {
        logger.info(`Successfully unfollowed: User ${followerId} stopped following ${followingId}.`);
        return true;
      } else {
        logger.warn(`Unfollow attempt failed: User ${followerId} was not following ${followingId}.`);
        return false;
      }
    } catch (error: any) {
        logger.error(`Error unfollowing user: ${error.message}`, { followerId, followingId, error });
        throw new AppError('Failed to unfollow user due to a server error.', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Checks if a user is following another user.
   * @param followerId - The potential follower.
   * @param followingId - The potential user being followed.
   * @returns {Promise<boolean>} True if followerId is following followingId, false otherwise.
   */
    async checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
        logger.debug(`Checking follow status: ${followerId} -> ${followingId}`);
        try {
            if (dbType === 'postgres' && prisma) {
                const follow = await prisma.follow.findUnique({
                    where: { followerId_followingId: { followerId, followingId } },
                });
                return !!follow;
            } else if (dbType === 'mongo') {
                const follow = await FollowModel.findOne({ follower: followerId, following: followingId });
                return !!follow;
            } else if (dbType === 'memory') {
                return inMemoryFollows.some(f => f.followerId === followerId && f.followingId === followingId);
            } else {
                throw new AppError('Database type not supported or configured.', 500);
            }
        } catch (error: any) {
            logger.error('Error checking follow status', { followerId, followingId, error });
            throw new AppError('Failed to check follow status.', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

  /**
   * Retrieves the list of users that a given user is following.
   * @param userId - The ID of the user whose following list is requested.
   * @returns A list of users being followed.
   */
  async getFollowing(userId: string): Promise<(SelectedUser | null)[]> {
    logger.debug(`Fetching users followed by ${userId}`);
    try {
      if (dbType === 'postgres' && prisma) {
        const followingRelations = await prisma.follow.findMany({
          where: { followerId: userId },
          select: { following: { select: { id: true, username: true, fullName: true, avatarUrl: true } } }, 
        });
        // Use any temporarily to bypass strict type check for map
        return followingRelations.map((f: any) => f.following);
      } else if (dbType === 'mongo') {
        const followingDocs = await FollowModel.find({ follower: userId })
          .populate('following', 'username fullName avatarUrl') // Keep populate simpler
          .lean(); // Use lean() for plain JS objects
        
        // Use any temporarily for doc type
        return followingDocs.map((doc: any): SelectedUser | null => {
          const followingUser = doc.following;
          if (!followingUser?._id) return null; // Handle cases where population might fail
          return {
            id: followingUser._id.toString(), 
            username: followingUser.username,
            fullName: followingUser.fullName || null,
            avatarUrl: followingUser.avatarUrl || null,
          };
        }); // Removed the filter
      } else if (dbType === 'memory') {
        const followingIds = inMemoryFollows.filter(f => f.followerId === userId).map(f => f.followingId);
        return followingIds.map(id => ({ id, username: `user_${id}`, fullName: `User ${id}`, avatarUrl: null })) as SelectedUser[];
      } else {
        throw new AppError('Database type not supported or configured.', 500);
      }
    } catch (error: any) {
      logger.error('Error fetching following list', { userId, error });
      throw new AppError('Failed to retrieve following list.', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves the list of users who are following a given user.
   * @param userId - The ID of the user whose followers list is requested.
   * @returns A list of followers.
   */
  async getFollowers(userId: string): Promise<(SelectedUser | null)[]> {
     logger.debug(`Fetching followers of ${userId}`);
    try {
      if (dbType === 'postgres' && prisma) {
        const followerRelations = await prisma.follow.findMany({
          where: { followingId: userId },
          select: { follower: { select: { id: true, username: true, fullName: true, avatarUrl: true } } }, 
        });
         // Use any temporarily to bypass strict type check for map
        return followerRelations.map((f: any) => f.follower);
      } else if (dbType === 'mongo') {
        const followerDocs = await FollowModel.find({ following: userId })
          .populate('follower', 'username fullName avatarUrl') // Keep populate simpler
          .lean(); // Use lean() for plain JS objects
        
        // Use any temporarily for doc type
        return followerDocs.map((doc: any): SelectedUser | null => {
          const followerUser = doc.follower;
          if (!followerUser?._id) return null; // Handle cases where population might fail
          return {
            id: followerUser._id.toString(),
            username: followerUser.username,
            fullName: followerUser.fullName || null,
            avatarUrl: followerUser.avatarUrl || null,
          };
        }); // Removed the filter
      } else if (dbType === 'memory') {
        const followerIds = inMemoryFollows.filter(f => f.followingId === userId).map(f => f.followerId);
        return followerIds.map(id => ({ id, username: `user_${id}`, fullName: `User ${id}`, avatarUrl: null })) as SelectedUser[];
      } else {
        throw new AppError('Database type not supported or configured.', 500);
      }
    } catch (error: any) {
        logger.error('Error fetching followers list', { userId, error });
        throw new AppError('Failed to retrieve followers list.', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
