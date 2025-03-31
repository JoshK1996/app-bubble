"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
/**
 * Post Service
 * Handles business logic for posts in the social network
 */
const database_1 = require("../../config/database");
const post_schema_1 = require("./post.schema");
/**
 * Service for managing posts
 */
class PostService {
    /**
     * Create a new post
     * @param postData Post creation data
     * @returns Created post information
     */
    async createPost(postData) {
        const { content, userId } = postData;
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let post;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            // Create post in PostgreSQL using Prisma
            post = await database_1.prisma.post.create({
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
        }
        else {
            // Create post in MongoDB using Mongoose
            const newPost = new post_schema_1.PostModel({
                content,
                user: userId,
            });
            post = await newPost.save();
            // Populate user info separately since we didn't include it in the save operation
            await post.populate('user', 'id username fullName avatarUrl');
        }
        return this.formatPostResponse(post);
    }
    /**
     * Get a post by ID
     * @param postId Post ID to retrieve
     * @returns Post information
     * @throws Error if post is not found
     */
    async getPostById(postId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let post;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            post = await database_1.prisma.post.findUnique({
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
        }
        else {
            post = await post_schema_1.PostModel.findById(postId)
                .populate('user', 'id username fullName avatarUrl')
                .exec();
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
    async getUserPosts(userId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let posts;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            posts = await database_1.prisma.post.findMany({
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
        }
        else {
            posts = await post_schema_1.PostModel.find({ user: userId })
                .populate('user', 'id username fullName avatarUrl')
                .sort({ createdAt: -1 })
                .exec();
        }
        return posts.map((post) => this.formatPostResponse(post));
    }
    /**
     * Get feed posts (posts from users that the current user follows)
     * @param userId Current user ID
     * @returns Array of posts for feed
     */
    async getFeedPosts(userId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let posts;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            // Get posts from users that the current user follows using Prisma
            posts = await database_1.prisma.post.findMany({
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
        }
        else {
            // For MongoDB, we need a more complex query using aggregation
            // First, find all users that the current user follows
            const followedUsers = await database_1.prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true },
            });
            const followingIds = followedUsers.map((follow) => follow.followingId);
            // Then find posts from those users
            posts = await post_schema_1.PostModel.find({ user: { $in: followingIds } })
                .populate('user', 'id username fullName avatarUrl')
                .sort({ createdAt: -1 })
                .exec();
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
    async updatePost(postId, userId, updateData) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        // First verify the post exists and belongs to the user
        let post;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            post = await database_1.prisma.post.findUnique({
                where: { id: postId },
            });
        }
        else {
            post = await post_schema_1.PostModel.findById(postId).exec();
        }
        if (!post) {
            throw new Error('Post not found');
        }
        // Check if the post belongs to the user
        let postUserId;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            postUserId = 'userId' in post ? post.userId : undefined;
        }
        else {
            postUserId = 'user' in post && post.user ? post.user.toString() : undefined;
        }
        if (postUserId !== userId) {
            throw new Error('Not authorized to update this post');
        }
        // Update the post
        let updatedPost;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            updatedPost = await database_1.prisma.post.update({
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
        }
        else {
            updatedPost = await post_schema_1.PostModel.findByIdAndUpdate(postId, { content: updateData.content }, { new: true })
                .populate('user', 'id username fullName avatarUrl')
                .exec();
        }
        return this.formatPostResponse(updatedPost);
    }
    /**
     * Delete a post
     * @param postId Post ID to delete
     * @param userId User ID performing the deletion (for authorization)
     * @throws Error if post is not found or user is not authorized
     */
    async deletePost(postId, userId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        // First verify the post exists and belongs to the user
        let post;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            post = await database_1.prisma.post.findUnique({
                where: { id: postId },
            });
        }
        else {
            post = await post_schema_1.PostModel.findById(postId).exec();
        }
        if (!post) {
            throw new Error('Post not found');
        }
        // Check if the post belongs to the user
        let postUserId;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            postUserId = 'userId' in post ? post.userId : undefined;
        }
        else {
            postUserId = 'user' in post && post.user ? post.user.toString() : undefined;
        }
        if (postUserId !== userId) {
            throw new Error('Not authorized to delete this post');
        }
        // Delete the post
        if (dbType === database_1.DatabaseType.POSTGRES) {
            await database_1.prisma.post.delete({
                where: { id: postId },
            });
        }
        else {
            await post_schema_1.PostModel.findByIdAndDelete(postId).exec();
        }
    }
    /**
     * Format post response to standardize between Prisma and Mongoose
     * @param post Post object from database
     * @returns Standardized post response
     */
    formatPostResponse(post) {
        // Handle differences between Prisma and Mongoose objects
        const dbType = (0, database_1.getDatabaseType)();
        if (dbType === database_1.DatabaseType.POSTGRES) {
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
        }
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
            user: postObj.user && postObj.user.username
                ? {
                    id: postObj.user._id.toString(),
                    username: postObj.user.username,
                    fullName: postObj.user.fullName,
                    avatarUrl: postObj.user.avatarUrl,
                }
                : undefined,
        };
    }
}
exports.PostService = PostService;
//# sourceMappingURL=post.service.js.map