"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowService = void 0;
/**
 * Follow Service
 * Handles business logic for follow relationships between users
 */
const database_1 = require("../../config/database");
const follow_schema_1 = require("./follow.schema");
const user_schema_1 = require("../users/user.schema");
/**
 * Service for managing follow relationships
 */
class FollowService {
    /**
     * Follow a user
     * @param followerId User ID who is following
     * @param followingId User ID to be followed
     * @returns Follow relationship information
     * @throws Error if user tries to follow themselves or already follows the user
     */
    async followUser(followerId, followingId) {
        // Check if followerId and followingId are the same
        if (followerId === followingId) {
            throw new Error('You cannot follow yourself');
        }
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        // Check if the follow relationship already exists
        let existingFollow;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            existingFollow = await database_1.prisma.follow.findFirst({
                where: {
                    followerId,
                    followingId,
                },
            });
        }
        else {
            existingFollow = await follow_schema_1.FollowModel.findOne({
                follower: followerId,
                following: followingId,
            }).exec();
        }
        if (existingFollow) {
            throw new Error('You are already following this user');
        }
        // Check if the user to follow exists
        let userToFollow;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            userToFollow = await database_1.prisma.user.findUnique({
                where: { id: followingId },
            });
        }
        else {
            userToFollow = await user_schema_1.UserModel.findById(followingId).exec();
        }
        if (!userToFollow) {
            throw new Error('User to follow not found');
        }
        // Create follow relationship
        let follow;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            follow = await database_1.prisma.follow.create({
                data: {
                    followerId,
                    followingId,
                },
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                    following: {
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
            const newFollow = new follow_schema_1.FollowModel({
                follower: followerId,
                following: followingId,
            });
            follow = await newFollow.save();
            // Populate user info separately
            await follow.populate([
                { path: 'follower', select: 'id username fullName avatarUrl' },
                { path: 'following', select: 'id username fullName avatarUrl' },
            ]);
        }
        return this.formatFollowResponse(follow);
    }
    /**
     * Unfollow a user
     * @param followerId User ID who is unfollowing
     * @param followingId User ID to be unfollowed
     * @throws Error if follow relationship doesn't exist
     */
    async unfollowUser(followerId, followingId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        // Check if the follow relationship exists
        let follow;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            follow = await database_1.prisma.follow.findFirst({
                where: {
                    followerId,
                    followingId,
                },
            });
        }
        else {
            follow = await follow_schema_1.FollowModel.findOne({
                follower: followerId,
                following: followingId,
            }).exec();
        }
        if (!follow) {
            throw new Error('You are not following this user');
        }
        // Delete follow relationship
        if (dbType === database_1.DatabaseType.POSTGRES) {
            await database_1.prisma.follow.delete({
                where: { id: follow.id },
            });
        }
        else {
            // Check if it's a MongoDB document with _id
            if ('_id' in follow) {
                await follow_schema_1.FollowModel.findByIdAndDelete(follow._id).exec();
            }
            else {
                throw new Error('Invalid follow record structure');
            }
        }
    }
    /**
     * Get users that a specific user is following
     * @param userId User ID to get following list for
     * @returns List of followed users
     */
    async getFollowing(userId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let following;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            following = await database_1.prisma.follow.findMany({
                where: { followerId: userId },
                include: {
                    following: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            return following.map((follow) => ({
                id: follow.following.id,
                username: follow.following.username,
                fullName: follow.following.fullName,
                avatarUrl: follow.following.avatarUrl,
                isFollowing: true, // Since this is a list of users they are following
            }));
        }
        following = await follow_schema_1.FollowModel.find({ follower: userId })
            .populate('following', 'id username fullName avatarUrl')
            .exec();
        return following.map((follow) => {
            const followingUser = follow.following; // Using any for simplicity
            return {
                id: followingUser._id.toString(),
                username: followingUser.username,
                fullName: followingUser.fullName,
                avatarUrl: followingUser.avatarUrl,
                isFollowing: true, // Since this is a list of users they are following
            };
        });
    }
    /**
     * Get users who follow a specific user
     * @param userId User ID to get followers list for
     * @param currentUserId Optional current user ID to check following status
     * @returns List of followers
     */
    async getFollowers(userId, currentUserId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let followers;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            followers = await database_1.prisma.follow.findMany({
                where: { followingId: userId },
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            fullName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            const userList = followers.map((follow) => ({
                id: follow.follower.id,
                username: follow.follower.username,
                fullName: follow.follower.fullName,
                avatarUrl: follow.follower.avatarUrl,
            }));
            // If currentUserId is provided, check which users the current user is following
            if (currentUserId) {
                const followingMap = new Map();
                const currentUserFollowing = await database_1.prisma.follow.findMany({
                    where: { followerId: currentUserId },
                    select: { followingId: true },
                });
                currentUserFollowing.forEach((follow) => {
                    followingMap.set(follow.followingId, true);
                });
                // Add isFollowing flag
                return userList.map((user) => ({
                    ...user,
                    isFollowing: followingMap.has(user.id),
                }));
            }
            return userList;
        }
        followers = await follow_schema_1.FollowModel.find({ following: userId })
            .populate('follower', 'id username fullName avatarUrl')
            .exec();
        const userList = followers.map((follow) => {
            const followerUser = follow.follower; // Using any for simplicity
            return {
                id: followerUser._id.toString(),
                username: followerUser.username,
                fullName: followerUser.fullName,
                avatarUrl: followerUser.avatarUrl,
            };
        });
        // If currentUserId is provided, check which users the current user is following
        if (currentUserId) {
            const followingMap = new Map();
            const currentUserFollowing = await follow_schema_1.FollowModel.find({
                follower: currentUserId,
            }).exec();
            currentUserFollowing.forEach((follow) => {
                // Check if following is present and convert to string
                if (follow.following) {
                    followingMap.set(follow.following.toString(), true);
                }
            });
            // Add isFollowing flag
            return userList.map((user) => ({
                ...user,
                isFollowing: followingMap.has(user.id),
            }));
        }
        return userList;
    }
    /**
     * Check if a user follows another user
     * @param followerId User ID who might be following
     * @param followingId User ID who might be followed
     * @returns True if follower follows following, false otherwise
     */
    async checkFollowStatus(followerId, followingId) {
        // Determine which database to use
        const dbType = (0, database_1.getDatabaseType)();
        let follow;
        if (dbType === database_1.DatabaseType.POSTGRES) {
            follow = await database_1.prisma.follow.findFirst({
                where: {
                    followerId,
                    followingId,
                },
            });
        }
        else {
            follow = await follow_schema_1.FollowModel.findOne({
                follower: followerId,
                following: followingId,
            }).exec();
        }
        return !!follow;
    }
    /**
     * Format follow response to standardize between Prisma and Mongoose
     * @param follow Follow object from database
     * @returns Standardized follow response
     */
    formatFollowResponse(follow) {
        // Handle differences between Prisma and Mongoose objects
        const dbType = (0, database_1.getDatabaseType)();
        if (dbType === database_1.DatabaseType.POSTGRES) {
            // Prisma object structure
            return {
                id: follow.id,
                followerId: follow.followerId,
                followingId: follow.followingId,
                createdAt: follow.createdAt,
                follower: follow.follower
                    ? {
                        id: follow.follower.id,
                        username: follow.follower.username,
                        fullName: follow.follower.fullName,
                        avatarUrl: follow.follower.avatarUrl,
                    }
                    : undefined,
                following: follow.following
                    ? {
                        id: follow.following.id,
                        username: follow.following.username,
                        fullName: follow.following.fullName,
                        avatarUrl: follow.following.avatarUrl,
                    }
                    : undefined,
            };
        }
        // Mongoose object structure (needs conversion)
        const followObj = follow.toObject ? follow.toObject() : follow;
        return {
            id: followObj._id.toString(),
            followerId: followObj.follower._id
                ? followObj.follower._id.toString()
                : followObj.follower.toString(),
            followingId: followObj.following._id
                ? followObj.following._id.toString()
                : followObj.following.toString(),
            createdAt: followObj.createdAt,
            follower: followObj.follower && followObj.follower.username
                ? {
                    id: followObj.follower._id.toString(),
                    username: followObj.follower.username,
                    fullName: followObj.follower.fullName,
                    avatarUrl: followObj.follower.avatarUrl,
                }
                : undefined,
            following: followObj.following && followObj.following.username
                ? {
                    id: followObj.following._id.toString(),
                    username: followObj.following.username,
                    fullName: followObj.following.fullName,
                    avatarUrl: followObj.following.avatarUrl,
                }
                : undefined,
        };
    }
}
exports.FollowService = FollowService;
//# sourceMappingURL=follow.service.js.map