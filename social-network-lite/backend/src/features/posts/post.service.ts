/**
 * Post Service
 * Handles business logic for posts in the social network
 */
import { DatabaseType, getDatabaseType, prisma, inMemoryStore } from '../../config/database';
import { PostModel } from './post.schema';
import { FollowService } from '../follow/follow.service';

// Define interfaces for request and response data
export interface CreatePostRequest {
  content: string;
  userId: string;
}

export interface UpdatePostRequest {
  content: string;
}

export interface PostResponse {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
  };
}

/**
 * Service for managing posts
 */
export class PostService {
  private followService: FollowService;

  constructor() {
    this.followService = new FollowService();
  }

  /**
   * Create a new post
   * @param postData Post creation data
   * @returns Created post information
   */
  async createPost(postData: CreatePostRequest): Promise<PostResponse> {
    const { content, userId } = postData;

    // Determine which database to use
    const dbType = getDatabaseType();

    let post;
    if (dbType === DatabaseType.POSTGRES) {
      // Create post in PostgreSQL using Prisma
      post = await prisma.post.create({
        data: {
          content,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else if (dbType === DatabaseType.MONGO) {
      // Create post in MongoDB using Mongoose
      const newPost = new PostModel({
        content,
        user: userId,
      });
      post = await newPost.save();

      // Populate user info separately since we didn't include it in the save operation
      await post.populate('user', 'id username fullName avatarUrl');
    } else {
      // In-memory store
      const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      post = {
        id,
        content,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: inMemoryStore.users.get(userId)
      };
      
      // Store in the in-memory posts map
      if (!inMemoryStore.posts) {
        inMemoryStore.posts = new Map();
      }
      inMemoryStore.posts.set(id, post);
    }

    return this.formatPostResponse(post);
  }

  /**
   * Get a post by ID
   * @param postId Post ID to retrieve
   * @returns Post information
   * @throws Error if post is not found
   */
  async getPostById(postId: string): Promise<PostResponse> {
    // Determine which database to use
    const dbType = getDatabaseType();

    let post;
    if (dbType === DatabaseType.POSTGRES) {
      post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else if (dbType === DatabaseType.MONGO) {
      post = await PostModel.findById(postId)
        .populate('user', 'id username fullName avatarUrl')
        .exec();
    } else {
      // In-memory store
      post = inMemoryStore.posts?.get(postId);
    }

    if (!post) {
      throw new Error('Post not found');
    }

    return this.formatPostResponse(post);
  }

  /**
   * Get all posts for a user
   * @param userId User ID to retrieve posts for
   * @returns Array of posts
   */
  async getUserPosts(userId: string): Promise<PostResponse[]> {
    // Determine which database to use
    const dbType = getDatabaseType();

    let posts;
    if (dbType === DatabaseType.POSTGRES) {
      posts = await prisma.post.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (dbType === DatabaseType.MONGO) {
      posts = await PostModel.find({ user: userId })
        .populate('user', 'id username fullName avatarUrl')
        .sort({ createdAt: -1 })
        .exec();
    } else {
      // In-memory store
      if (!inMemoryStore.posts) {
        return [];
      }
      
      posts = Array.from(inMemoryStore.posts.values())
        .filter(post => post.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return posts.map((post) => this.formatPostResponse(post));
  }

  /**
   * Get feed posts (posts from users that the current user follows)
   * @param userId Current user ID
   * @returns Array of posts for feed
   */
  async getFeedPosts(userId: string): Promise<PostResponse[]> {
    // Determine which database to use
    const dbType = getDatabaseType();

    let posts;
    if (dbType === DatabaseType.POSTGRES) {
      // Get posts from users that the current user follows using Prisma
      posts = await prisma.post.findMany({
        where: {
          user: {
            followers: {
              some: {
                followerId: userId,
              },
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (dbType === DatabaseType.MONGO) {
      // For MongoDB, we need a more complex query using aggregation
      // First, find all users that the current user follows
      const followedUsers = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });

      const followingIds = followedUsers.map((follow) => follow.followingId);

      // Then find posts from those users
      posts = await PostModel.find({ user: { $in: followingIds } })
        .populate('user', 'id username fullName avatarUrl')
        .sort({ createdAt: -1 })
        .exec();
    } else {
      // In-memory store
      // First, get the list of users that the current user follows
      const following = await this.followService.getFollowing(userId);
      const followingIds = following.map(user => user.id);
      
      if (!inMemoryStore.posts) {
        return [];
      }

      // Then get posts from those users
      posts = Array.from(inMemoryStore.posts.values())
        .filter(post => followingIds.includes(post.userId))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return posts.map((post) => this.formatPostResponse(post));
  }

  /**
   * Update a post
   * @param postId Post ID to update
   * @param userId User ID performing the update (for authorization)
   * @param updateData Update data
   * @returns Updated post information
   * @throws Error if post is not found or user is not authorized
   */
  async updatePost(
    postId: string,
    userId: string,
    updateData: UpdatePostRequest,
  ): Promise<PostResponse> {
    // Determine which database to use
    const dbType = getDatabaseType();

    // First verify the post exists and belongs to the user
    let post;
    if (dbType === DatabaseType.POSTGRES) {
      post = await prisma.post.findUnique({
        where: { id: postId },
      });
    } else if (dbType === DatabaseType.MONGO) {
      post = await PostModel.findById(postId).exec();
    } else {
      // In-memory store
      post = inMemoryStore.posts?.get(postId);
    }

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if the post belongs to the user
    let postUserId;
    if (dbType === DatabaseType.POSTGRES) {
      postUserId = 'userId' in post ? post.userId : undefined;
    } else if (dbType === DatabaseType.MONGO) {
      postUserId = 'user' in post && post.user ? post.user.toString() : undefined;
    } else {
      // In-memory store
      postUserId = post.userId;
    }
    
    if (postUserId !== userId) {
      throw new Error('Not authorized to update this post');
    }

    // Update the post
    let updatedPost;
    if (dbType === DatabaseType.POSTGRES) {
      updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { content: updateData.content },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });
    } else if (dbType === DatabaseType.MONGO) {
      updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { content: updateData.content },
        { new: true }, // Return the updated document
      )
        .populate('user', 'id username fullName avatarUrl')
        .exec();
    } else {
      // In-memory store
      const existingPost = inMemoryStore.posts?.get(postId);
      if (existingPost) {
        updatedPost = {
          ...existingPost,
          content: updateData.content,
          updatedAt: new Date()
        };
        inMemoryStore.posts?.set(postId, updatedPost);
      }
    }

    return this.formatPostResponse(updatedPost);
  }

  /**
   * Delete a post
   * @param postId Post ID to delete
   * @param userId User ID performing the deletion (for authorization)
   * @throws Error if post is not found or user is not authorized
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    // Determine which database to use
    const dbType = getDatabaseType();

    // First verify the post exists and belongs to the user
    let post;
    if (dbType === DatabaseType.POSTGRES) {
      post = await prisma.post.findUnique({
        where: { id: postId },
      });
    } else if (dbType === DatabaseType.MONGO) {
      post = await PostModel.findById(postId).exec();
    } else {
      // In-memory store
      post = inMemoryStore.posts?.get(postId);
    }

    if (!post) {
      throw new Error('Post not found');
    }

    // Check if the post belongs to the user
    let postUserId;
    if (dbType === DatabaseType.POSTGRES) {
      postUserId = 'userId' in post ? post.userId : undefined;
    } else if (dbType === DatabaseType.MONGO) {
      postUserId = 'user' in post && post.user ? post.user.toString() : undefined;
    } else {
      // In-memory store
      postUserId = post.userId;
    }
    
    if (postUserId !== userId) {
      throw new Error('Not authorized to delete this post');
    }

    // Delete the post
    if (dbType === DatabaseType.POSTGRES) {
      await prisma.post.delete({
        where: { id: postId },
      });
    } else if (dbType === DatabaseType.MONGO) {
      await PostModel.findByIdAndDelete(postId).exec();
    } else {
      // In-memory store
      inMemoryStore.posts?.delete(postId);
    }
  }

  /**
   * Format post response to standardize between Prisma and Mongoose
   * @param post Post object from database
   * @returns Standardized post response
   */
  private formatPostResponse(post: any): PostResponse {
    // Handle differences between Prisma and Mongoose objects
    const dbType = getDatabaseType();

    if (dbType === DatabaseType.POSTGRES) {
      // Prisma object structure
      return {
        id: post.id,
        content: post.content,
        userId: post.userId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user
          ? {
            id: post.user.id,
            username: post.user.username,
            fullName: post.user.fullName,
            avatarUrl: post.user.avatarUrl,
          }
          : undefined,
      };
    } else if (dbType === DatabaseType.MONGO) {
      // Mongoose object structure (needs conversion)
      const postObj = post.toObject ? post.toObject() : post;

      return {
        id: postObj._id.toString(),
        content: postObj.content,
        userId: postObj.user._id
          ? postObj.user._id.toString()
          : postObj.user.toString(),
        createdAt: postObj.createdAt,
        updatedAt: postObj.updatedAt,
        user:
            postObj.user && postObj.user.username
              ? {
                id: postObj.user._id.toString(),
                username: postObj.user.username,
                fullName: postObj.user.fullName,
                avatarUrl: postObj.user.avatarUrl,
              }
              : undefined,
      };
    } else {
      // In-memory structure
      return {
        id: post.id,
        content: post.content,
        userId: post.userId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user
          ? {
            id: post.user.id,
            username: post.user.username,
            fullName: post.user.fullName,
            avatarUrl: post.user.avatarUrl,
          }
          : undefined,
      };
    }
  }
}
