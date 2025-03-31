import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

/**
 * Create a new category
 */
export const createCategory = async (userId: string, data: CreateCategoryDto) => {
  try {
    const { name, description } = data;
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
    });
    
    return category;
  } catch (error) {
    logger.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return categories;
  } catch (error) {
    logger.error('Error getting categories:', error);
    throw error;
  }
};

/**
 * Get category by ID or slug
 */
export const getCategoryByIdOrSlug = async (idOrSlug: string) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
    });
    
    return category;
  } catch (error) {
    logger.error('Error getting category:', error);
    throw error;
  }
};

/**
 * Update a category
 */
export const updateCategory = async (categoryId: string, userId: string, userRole: string, data: UpdateCategoryDto) => {
  try {
    const { name, description } = data;
    
    // Check if user is admin
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: Only admins can update categories');
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });
    
    return updatedCategory;
  } catch (error) {
    logger.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId: string, userId: string, userRole: string) => {
  try {
    // Check if user is admin
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: Only admins can delete categories');
    }
    
    // Check if category is being used by any posts
    const postCount = await prisma.categoryOnPost.count({
      where: {
        categoryId,
      },
    });
    
    if (postCount > 0) {
      throw new Error(`Cannot delete category: Used by ${postCount} posts`);
    }
    
    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });
    
    return true;
  } catch (error) {
    logger.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Get categories with post count
 */
export const getCategoriesWithPostCount = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
    
    return categories.map(category => ({
      ...category,
      postCount: category._count.posts,
      _count: undefined,
    }));
  } catch (error) {
    logger.error('Error getting categories with post count:', error);
    throw error;
  }
}; 