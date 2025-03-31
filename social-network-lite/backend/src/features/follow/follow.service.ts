/**
 * Follow Service
 * Handles business logic for follow relationships between users
 */
import { DatabaseType, getDatabaseType, prisma, inMemoryStore } from '../../config/database';
import { FollowModel } from './follow.schema';
import { UserModel } from '../users/user.schema';
import { v4 as uuidv4 } from 'uuid';

// Define interfaces for request and response data
interface FollowRequest {
  followerId: string;
  followingId: string;
}

interface FollowResponse {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: any;
  following?: any;
}

// Define additional interfaces for follow data structures
interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  following?: any;
  follower?: any;
  createdAt: Date;
}

interface FollowStatus {
  isFollowing: boolean;
}

export class FollowService {
  /**
   * Create a follow relationship
   * @param followerId The ID of the user who is following
   * @param followingId The ID of the user being followed
   * @returns The created follow relationship
   */
  async followUser(
    followerId: string,
    followingId: string,
  ): Promise<FollowResponse> {
    // Determine which database to use
    const dbType = getDatabaseType();

    // Validate user IDs
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }

    // Check if follow relationship already exists
    let existingFollow;
    if (dbType === DatabaseType.POSTGRES) {
      existingFollow = await prisma.follow.findFirst({
        where: {
          followerId,
          followingId,
        },
      });
    } else if (dbType === DatabaseType.MONGO) {
      existingFollow = await FollowModel.findOne({
        follower: followerId,
        following: followingId,
      }).exec();
    } else {
      // In-memory store
      const follows = Array.from(inMemoryStore.follows.values());
      existingFollow = follows.find(f => 
        f.followerId === followerId && f.followingId === followingId
      );
    }

    if (existingFollow) {
      throw new Error('You are already following this user');
    }

    // Check if user to follow exists
    let userToFollow;
    if (dbType === DatabaseType.POSTGRES) {
      userToFollow = await prisma.user.findUnique({
        where: { id: followingId },
      });
    } else if (dbType === DatabaseType.MONGO) {
      userToFollow = await UserModel.findById(followingId).exec();
    } else {
      // In-memory store
      userToFollow = inMemoryStore.users.get(followingId);
    }

    if (!userToFollow && dbType !== DatabaseType.MEMORY) {
      throw new Error('User to follow not found');
    }

    // Create follow relationship
    let follow: FollowResponse;
    if (dbType === DatabaseType.POSTGRES) {
      follow = await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
        include: {
          follower: {
            select: {
              username: true,
            },
          },
          following: {
            select: {
              username: true,
            },
          },
        },
      }) as FollowResponse;
    } else if (dbType === DatabaseType.MONGO) {
      // Create a new follow document
      const newFollow: any = await FollowModel.create({
        follower: followerId,
        following: followingId,
      });
      
      // Now populate the document
      try {
        await newFollow.populate('follower', 'username');
        await newFollow.populate('following', 'username');
      } catch (error) {
        console.warn('Failed to populate follow document:', error);
      }
      
      // Convert to our response type
      follow = {
        id: newFollow._id.toString(),
        followerId,
        followingId,
        createdAt: newFollow.createdAt || new Date(),
        follower: newFollow.follower,
        following: newFollow.following
      };
    } else {
      // In-memory store
      const followId = uuidv4();
      follow = {
        id: followId,
        followerId,
        followingId,
        createdAt: new Date(),
        follower: inMemoryStore.users.get(followerId),
        following: inMemoryStore.users.get(followingId)
      };
      inMemoryStore.follows.set(followId, follow);
    }

    return follow;
  }

  /**
   * Remove a follow relationship
   * @param followerId The ID of the user who is unfollowing
   * @param followingId The ID of the user being unfollowed
   * @returns A message confirming the unfollow
   */
  async unfollowUser(followerId: string, followingId: string): Promise<{ message: string }> {
    // Determine which database to use
    const dbType = getDatabaseType();

    // Find the follow relationship
    let follow: any;
    if (dbType === DatabaseType.POSTGRES) {
      follow = await prisma.follow.findFirst({
        where: {
          followerId,
          followingId,
        },
      });
    } else if (dbType === DatabaseType.MONGO) {
      follow = await FollowModel.findOne({
        follower: followerId,
        following: followingId,
      }).exec();
    } else {
      // In-memory store
      const follows = Array.from(inMemoryStore.follows.values());
      const followId = follows.find(f => 
        f.followerId === followerId && f.followingId === followingId
      )?.id;
      
      if (followId) {
        follow = inMemoryStore.follows.get(followId);
      }
    }

    if (!follow) {
      throw new Error('You are not following this user');
    }

    // Delete the follow relationship
    if (dbType === DatabaseType.POSTGRES) {
      await prisma.follow.delete({
        where: {
          id: follow.id,
        },
      });
    } else if (dbType === DatabaseType.MONGO) {
      await FollowModel.findByIdAndDelete(follow._id).exec();
    } else {
      // In-memory store
      inMemoryStore.follows.delete(follow.id);
    }

    return { message: 'Successfully unfollowed user' };
  }

  /**
   * Get users followed by a user
   * @param userId The ID of the user
   * @returns List of users that the specified user is following
   */
  async getFollowing(userId: string): Promise<any[]> {
    // Determine which database to use
    const dbType = getDatabaseType();
    
    let following = [];
    
    if (dbType === DatabaseType.POSTGRES) {
      const follows = await prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        include: {
          following: true,
        },
      });
      
      following = follows.map((follow: any) => follow.following);
    } else if (dbType === DatabaseType.MONGO) {
      const follows = await FollowModel.find({ follower: userId })
        .populate('following')
        .exec();
      
      following = follows.map((follow: any) => follow.following);
    } else {
      // In-memory store
      const follows = Array.from(inMemoryStore.follows.values());
      const followingIds = follows
        .filter((follow: Follow) => follow.followerId === userId)
        .map((follow: Follow) => follow.followingId);
      
      following = followingIds.map(id => inMemoryStore.users.get(id)).filter(Boolean);
    }
    
    return following;
  }

  /**
   * Get users who follow a user
   * @param userId The ID of the user
   * @returns List of users who follow the specified user
   */
  async getFollowers(userId: string): Promise<any[]> {
    // Determine which database to use
    const dbType = getDatabaseType();
    
    let followers = [];
    
    if (dbType === DatabaseType.POSTGRES) {
      const follows = await prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        include: {
          follower: true,
        },
      });
      
      followers = follows.map((follow: any) => follow.follower);
    } else if (dbType === DatabaseType.MONGO) {
      const follows = await FollowModel.find({ following: userId })
        .populate('follower')
        .exec();
      
      followers = follows.map((follow: any) => follow.follower);
    } else {
      // In-memory store
      const follows = Array.from(inMemoryStore.follows.values());
      const followerIds = follows
        .filter((follow: Follow) => follow.followingId === userId)
        .map((follow: Follow) => follow.followerId);
      
      followers = followerIds.map(id => inMemoryStore.users.get(id)).filter(Boolean);
    }
    
    return followers;
  }

  /**
   * Check if a user follows another user
   * @param followerId The ID of the user who might be following
   * @param followingId The ID of the user who might be followed
   * @returns Boolean indicating whether the follow relationship exists
   */
  async checkFollowStatus(
    followerId: string,
    followingId: string,
  ): Promise<FollowStatus> {
    // Determine which database to use
    const dbType = getDatabaseType();
    
    let isFollowing = false;
    
    if (dbType === DatabaseType.POSTGRES) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId,
          followingId,
        },
      });
      
      isFollowing = !!follow;
    } else if (dbType === DatabaseType.MONGO) {
      const follow = await FollowModel.findOne({
        follower: followerId,
        following: followingId,
      }).exec();
      
      isFollowing = !!follow;
    } else {
      // In-memory store
      const follows = Array.from(inMemoryStore.follows.values());
      isFollowing = follows.some(
        (follow: Follow) => follow.followerId === followerId && follow.followingId === followingId
      );
    }
    
    return { isFollowing };
  }
}
