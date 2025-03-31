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
export declare class PostService {
    /**
     * Create a new post
     * @param postData Post creation data
     * @returns Created post information
     */
    createPost(postData: CreatePostRequest): Promise<PostResponse>;
    /**
     * Get a post by ID
     * @param postId Post ID to retrieve
     * @returns Post information
     * @throws Error if post is not found
     */
    getPostById(postId: string): Promise<PostResponse>;
    /**
     * Get all posts for a user
     * @param userId User ID to retrieve posts for
     * @returns Array of posts
     */
    getUserPosts(userId: string): Promise<PostResponse[]>;
    /**
     * Get feed posts (posts from users that the current user follows)
     * @param userId Current user ID
     * @returns Array of posts for feed
     */
    getFeedPosts(userId: string): Promise<PostResponse[]>;
    /**
     * Update a post
     * @param postId Post ID to update
     * @param userId User ID performing the update (for authorization)
     * @param updateData Update data
     * @returns Updated post information
     * @throws Error if post is not found or user is not authorized
     */
    updatePost(postId: string, userId: string, updateData: UpdatePostRequest): Promise<PostResponse>;
    /**
     * Delete a post
     * @param postId Post ID to delete
     * @param userId User ID performing the deletion (for authorization)
     * @throws Error if post is not found or user is not authorized
     */
    deletePost(postId: string, userId: string): Promise<void>;
    /**
     * Format post response to standardize between Prisma and Mongoose
     * @param post Post object from database
     * @returns Standardized post response
     */
    private formatPostResponse;
}
