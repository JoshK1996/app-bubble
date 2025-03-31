import { Request, Response } from 'express';
import * as categoryService from './category.service';
import { logger } from '../../utils/logger';

/**
 * Get all categories
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json(categories);
  } catch (error) {
    logger.error('Error getting categories:', error);
    return res.status(500).json({ message: 'Failed to get categories' });
  }
};

/**
 * Get categories with post count
 */
export const getCategoriesWithPostCount = async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getCategoriesWithPostCount();
    return res.status(200).json(categories);
  } catch (error) {
    logger.error('Error getting categories with post count:', error);
    return res.status(500).json({ message: 'Failed to get categories with post count' });
  }
};

/**
 * Get category by ID or slug
 */
export const getCategory = async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const category = await categoryService.getCategoryByIdOrSlug(idOrSlug);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    return res.status(200).json(category);
  } catch (error) {
    logger.error('Error getting category:', error);
    return res.status(500).json({ message: 'Failed to get category' });
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const category = await categoryService.createCategory(userId, { name, description });
    return res.status(201).json(category);
  } catch (error) {
    logger.error('Error creating category:', error);
    return res.status(500).json({ message: 'Failed to create category' });
  }
};

/**
 * Update a category
 */
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      userId,
      userRole,
      { name, description }
    );
    
    return res.status(200).json(updatedCategory);
  } catch (error: any) {
    logger.error('Error updating category:', error);
    
    if (error.message && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Failed to update category' });
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }
    
    // @ts-ignore - req.user comes from authenticate middleware
    const userId = req.user?.id;
    // @ts-ignore
    const userRole = req.user?.role || '';
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    await categoryService.deleteCategory(categoryId, userId, userRole);
    return res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting category:', error);
    
    if (error.message && error.message.includes('Forbidden')) {
      return res.status(403).json({ message: error.message });
    }
    
    if (error.message && error.message.includes('Cannot delete category')) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Failed to delete category' });
  }
}; 