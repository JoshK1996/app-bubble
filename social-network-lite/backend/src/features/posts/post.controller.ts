/**
 * Post Controller
 * Handles HTTP requests related to posts in the social network
 */
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CreatePostRequest, PostService, UpdatePostRequest } from './post.service';

/**
 * Controller for handling post-related HTTP requests
 */
export class PostController {
  private postService: PostService;

  /**
   * Initialize the controller with its dependencies
   */
  constructor() {
    this.postService = new PostService();
  }

  /**
   * Handle post creation
   * @param req Express request object
   * @param res Express response object
   */
  createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Extract post data from request body
      const postData: CreatePostRequest = {
        content: req.body.content,
        userId: req.user.userId,
      };

      // Create post
      const result = await this.postService.createPost(postData);

      // Return success response
      res.status(201).json(result);
    } catch (error) {
      // Handle service errors
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };

  /**
   * Handle getting a post by ID
   * @param req Express request object
   * @param res Express response object
   */
  getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id;

      // Get post
      const post = await this.postService.getPostById(postId);

      // Return success response
      res.status(200).json(post);
    } catch (error) {
      // Handle not found or other errors
      if (error instanceof Error && error.message === 'Post not found') {
        res.status(404).json({ message: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };

  /**
   * Handle getting posts for a user
   * @param req Express request object
   * @param res Express response object
   */
  getUserPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;

      // Get user posts
      const posts = await this.postService.getUserPosts(userId);

      // Return success response
      res.status(200).json(posts);
    } catch (error) {
      // Handle service errors
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };

  /**
   * Handle getting feed posts (posts from followed users)
   * @param req Express request object
   * @param res Express response object
   */
  getFeedPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      // Get feed posts
      const posts = await this.postService.getFeedPosts(req.user.userId);

      // Return success response
      res.status(200).json(posts);
    } catch (error) {
      // Handle service errors
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };

  /**
   * Handle updating a post
   * @param req Express request object
   * @param res Express response object
   */
  updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const postId = req.params.id;
      const userId = req.user.userId;

      // Extract update data from request body
      const updateData: UpdatePostRequest = {
        content: req.body.content,
      };

      // Update post
      const updatedPost = await this.postService.updatePost(postId, userId, updateData);

      // Return success response
      res.status(200).json(updatedPost);
    } catch (error) {
      // Handle authorization, not found, or other errors
      if (error instanceof Error && error.message === 'Post not found') {
        res.status(404).json({ message: error.message });
      } else if (error instanceof Error && error.message === 'Not authorized to update this post') {
        res.status(403).json({ message: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };

  /**
   * Handle deleting a post
   * @param req Express request object
   * @param res Express response object
   */
  deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const postId = req.params.id;
      const userId = req.user.userId;

      // Delete post
      await this.postService.deletePost(postId, userId);

      // Return success response
      res.status(204).end();
    } catch (error) {
      // Handle authorization, not found, or other errors
      if (error instanceof Error && error.message === 'Post not found') {
        res.status(404).json({ message: error.message });
      } else if (error instanceof Error && error.message === 'Not authorized to delete this post') {
        res.status(403).json({ message: error.message });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  };
} 