import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export interface CreateTagDto {
  name: string;
}

export interface UpdateTagDto {
  name?: string;
}

/**
 * Create a new tag
 */
export const createTag = async (userId: string, data: CreateTagDto) => {
  try {
    const { name } = data;
    
    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });
    
    // Create tag
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
      },
    });
    
    return tag;
  } catch (error) {
    logger.error('Error creating tag:', error);
    throw error;
  }
};

/**
 * Get all tags
 */
export const getAllTags = async () => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    
    return tags;
  } catch (error) {
    logger.error('Error getting tags:', error);
    throw error;
  }
};

/**
 * Get tag by ID or slug
 */
export const getTagByIdOrSlug = async (idOrSlug: string) => {
  try {
    const tag = await prisma.tag.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
      },
    });
    
    return tag;
  } catch (error) {
    logger.error('Error getting tag:', error);
    throw error;
  }
};

/**
 * Update a tag
 */
export const updateTag = async (tagId: string, userId: string, userRole: string, data: UpdateTagDto) => {
  try {
    const { name } = data;
    
    // Check if user is admin
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: Only admins can update tags');
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    
    // Update tag
    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: updateData,
    });
    
    return updatedTag;
  } catch (error) {
    logger.error('Error updating tag:', error);
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (tagId: string, userId: string, userRole: string) => {
  try {
    // Check if user is admin
    if (userRole !== 'ADMIN') {
      throw new Error('Forbidden: Only admins can delete tags');
    }
    
    // Check if tag is being used by any posts
    const postCount = await prisma.tagOnPost.count({
      where: {
        tagId,
      },
    });
    
    if (postCount > 0) {
      throw new Error(`Cannot delete tag: Used by ${postCount} posts`);
    }
    
    // Delete tag
    await prisma.tag.delete({
      where: { id: tagId },
    });
    
    return true;
  } catch (error) {
    logger.error('Error deleting tag:', error);
    throw error;
  }
};

/**
 * Get tags with post count
 */
export const getTagsWithPostCount = async () => {
  try {
    const tags = await prisma.tag.findMany({
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
    
    return tags.map(tag => ({
      ...tag,
      postCount: tag._count.posts,
      _count: undefined,
    }));
  } catch (error) {
    logger.error('Error getting tags with post count:', error);
    throw error;
  }
}; 