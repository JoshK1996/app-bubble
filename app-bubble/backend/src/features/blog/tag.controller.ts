import { Request, Response } from 'express';
import * as tagService from './tag.service';
import { logger } from '../../utils/logger';

/**
 * Get all tags
 */
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await tagService.getAllTags();
    return res.status(200).json(tags);
  } catch (error) {
    logger.error('Error getting tags:', error);
    return res.status(500).json({ message: 'Failed to get tags' });
  }
};

/**
 * Get tags with post count
 */
export const getTagsWithPostCount = async (req: Request, res: Response) => {
  try {
    const tags = await tagService.getTagsWithPostCount();
    return res.status(200).json(tags);
  } catch (error) {
    logger.error('Error getting tags with post count:', error);
    return res.status(500).json({ message: 'Failed to get tags with post count' });
  }
};

/**
 * Get tag by ID or slug
 */
export const getTag = async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const tag = await tagService.getTagByIdOrSlug(idOrSlug);
    
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    
    return res.status(200).json(tag);
  } catch (error) {
    logger.error('Error getting tag:', error);
    return res.status(500).json({ message: 'Failed to get tag' });
  }
};

/**
 * Create a new tag
 */
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Tag name is required' });
    }
    
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const tag = await tagService.createTag(userId, { name });
    return res.status(201).json(tag);
  } catch (error) {
    logger.error('Error creating tag:', error);
    return res.status(500).json({ message: 'Failed to create tag' });
  }
};

/**
 * Update a tag
 */
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { tagId } = req.params;
    const { name } = req.body;
    
    if (!tagId) {
      return res.status(400).json({ message: 'Tag ID is required' });
    }
    
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const updatedTag = await tagService.updateTag(
      tagId,
      userId,
      userRole,
      { name }
    );
    
    return res.status(200).json(updatedTag);
  } catch (error: any) {
    logger.error('Error updating tag:', error);
    
    if (error.message && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Failed to update tag' });
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { tagId } = req.params;
    
    if (!tagId) {
      return res.status(400).json({ message: 'Tag ID is required' });
    }
    
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    await tagService.deleteTag(tagId, userId, userRole);
    return res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting tag:', error);
    
    if (error.message && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message && error.message.includes('Cannot delete tag')) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Failed to delete tag' });
  }
}; 