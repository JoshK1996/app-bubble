import { Request, Response } from 'express';
import * as postService from './post.service';
import { logger } from '../../utils/logger';

/**
 * Get all published posts
 */
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { search, categoryId, tagId, page, limit } = req.query;
    
    const result = await postService.getPublishedPosts({
      search: search as string,
      categoryId: categoryId as string,
      tagId: tagId as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error getting published posts:', error);
    return res.status(500).json({ message: 'Failed to retrieve posts' });
  }
};

/**
 * Get a single published post by ID or slug
 */
export const getPost = async (req: Request, res: Response) => {
  try {
    const { postIdOrSlug } = req.params;
    
    const post = await postService.getPublishedPost(postIdOrSlug);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    return res.status(200).json(post);
  } catch (error) {
    logger.error('Error getting post:', error);
    return res.status(500).json({ message: 'Failed to retrieve post' });
  }
};

/**
 * Get all posts (including drafts) for admin/author
 */
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { search, categoryId, tagId, status, page, limit } = req.query;
    
    // Check if user has sufficient role (ADMIN or AUTHOR)
    if (userRole !== 'ADMIN' && userRole !== 'AUTHOR') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const result = await postService.getAllPosts(userId, userRole, {
      search: search as string,
      categoryId: categoryId as string,
      tagId: tagId as string,
      status: status as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error getting all posts:', error);
    return res.status(500).json({ message: 'Failed to retrieve posts' });
  }
};

/**
 * Get a single post by ID or slug (including drafts) for admin/author
 */
export const getPostAdmin = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { postIdOrSlug } = req.params;
    
    // Check if user has sufficient role (ADMIN or AUTHOR)
    if (userRole !== 'ADMIN' && userRole !== 'AUTHOR') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    const post = await postService.getPostById(userId, userRole, postIdOrSlug);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    return res.status(200).json(post);
  } catch (error) {
    logger.error('Error getting post by ID:', error);
    return res.status(500).json({ message: 'Failed to retrieve post' });
  }
};

/**
 * Create a new post
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Check if user has sufficient role (ADMIN or AUTHOR)
    if (userRole !== 'ADMIN' && userRole !== 'AUTHOR') {
      return res.status(403).json({ message: 'Insufficient permissions to create a post' });
    }
    
    const post = await postService.createPost(userId, req.body);
    
    return res.status(201).json(post);
  } catch (error) {
    logger.error('Error creating post:', error);
    return res.status(500).json({ message: 'Failed to create post' });
  }
};

/**
 * Update a post
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { postId } = req.params;
    
    // Check if user has sufficient role (ADMIN or AUTHOR)
    if (userRole !== 'ADMIN' && userRole !== 'AUTHOR') {
      return res.status(403).json({ message: 'Insufficient permissions to update a post' });
    }
    
    const post = await postService.updatePost(postId, userId, userRole, req.body);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    return res.status(200).json(post);
  } catch (error: any) {
    if (error.message && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    
    logger.error('Error updating post:', error);
    return res.status(500).json({ message: 'Failed to update post' });
  }
};

/**
 * Delete a post
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { postId } = req.params;
    
    // Check if user has sufficient role (ADMIN or AUTHOR)
    if (userRole !== 'ADMIN' && userRole !== 'AUTHOR') {
      return res.status(403).json({ message: 'Insufficient permissions to delete a post' });
    }
    
    const result = await postService.deletePost(postId, userId, userRole);
    
    if (result === null) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    return res.status(204).send();
  } catch (error: any) {
    if (error.message && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    
    logger.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Failed to delete post' });
  }
}; 