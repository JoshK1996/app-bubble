export interface FollowResponse {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
    follower?: {
        id: string;
        username: string;
        fullName: string;
        avatarUrl?: string;
    };
    following?: {
        id: string;
        username: string;
        fullName: string;
        avatarUrl?: string;
    };
}
export interface UserListResponse {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string | null;
    isFollowing?: boolean;
}
/**
 * Service for managing follow relationships
 */
export declare class FollowService {
    /**
     * Follow a user
     * @param followerId User ID who is following
     * @param followingId User ID to be followed
     * @returns Follow relationship information
     * @throws Error if user tries to follow themselves or already follows the user
     */
    followUser(followerId: string, followingId: string): Promise<FollowResponse>;
    /**
     * Unfollow a user
     * @param followerId User ID who is unfollowing
     * @param followingId User ID to be unfollowed
     * @throws Error if follow relationship doesn't exist
     */
    unfollowUser(followerId: string, followingId: string): Promise<void>;
    /**
     * Get users that a specific user is following
     * @param userId User ID to get following list for
     * @returns List of followed users
     */
    getFollowing(userId: string): Promise<UserListResponse[]>;
    /**
     * Get users who follow a specific user
     * @param userId User ID to get followers list for
     * @param currentUserId Optional current user ID to check following status
     * @returns List of followers
     */
    getFollowers(userId: string, currentUserId?: string): Promise<UserListResponse[]>;
    /**
     * Check if a user follows another user
     * @param followerId User ID who might be following
     * @param followingId User ID who might be followed
     * @returns True if follower follows following, false otherwise
     */
    checkFollowStatus(followerId: string, followingId: string): Promise<boolean>;
    /**
     * Format follow response to standardize between Prisma and Mongoose
     * @param follow Follow object from database
     * @returns Standardized follow response
     */
    private formatFollowResponse;
}
