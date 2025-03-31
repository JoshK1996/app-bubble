import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import { logger } from '../../utils/logger';

// Extend PrismaClient with proper type information
interface CustomPrismaClient extends PrismaClient {
  post: any;
  categoryOnPost: any;
  tagOnPost: any;
  category: any;
  tag: any;
}

const prisma = new PrismaClient() as CustomPrismaClient;

// Define interface types for the CategoryOnPost and TagOnPost relations
interface CategoryRelation {
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface TagRelation {
  tag: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Define Post type with relations
interface PostWithRelations {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  authorId: string;
  author: {
    id: string;
    name: string;
    email?: string;
  };
  categories: CategoryRelation[];
  tags: TagRelation[];
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt?: string;
  status?: string; // 'DRAFT' or 'PUBLISHED'
  categoryIds?: string[];
  tagIds?: string[];
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: string; // 'DRAFT' or 'PUBLISHED'
  categoryIds?: string[];
  tagIds?: string[];
}

export interface PostQuery {
  search?: string;
  categoryId?: string;
  tagId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Create a new post
 */
export const createPost = async (userId: string, data: CreatePostDto) => {
  try {
    const { title, content, excerpt, status = 'DRAFT', categoryIds = [], tagIds = [] } = data;
    
    // Generate slug from title
    const slug = slugify(title, { lower: true, strict: true });
    
    // Prepare category connections
    const categories = categoryIds.map(categoryId => ({
      category: {
        connect: { id: categoryId }
      }
    }));
    
    // Prepare tag connections
    const tags = tagIds.map(tagId => ({
      tag: {
        connect: { id: tagId }
      }
    }));
    
    // Create post with connected categories and tags
    const post = await prisma.$transaction(async (tx) => {
      // First create the post
      const newPost = await tx.post.create({
        data: {
          title,
          slug,
          content,
          excerpt: excerpt || content.substring(0, 160),
          status,
          authorId: userId,
          publishedAt: status === 'PUBLISHED' ? new Date() : null,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Then create the category relationships
      for (const categoryId of categoryIds) {
        await tx.categoryOnPost.create({
          data: {
            postId: newPost.id,
            categoryId,
          }
        });
      }

      // And the tag relationships
      for (const tagId of tagIds) {
        await tx.tagOnPost.create({
          data: {
            postId: newPost.id,
            tagId,
          }
        });
      }

      // Now get the complete post with relationships
      return await tx.post.findUnique({
        where: { id: newPost.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });
    
    if (!post) {
      throw new Error('Failed to create post');
    }
    
    // Transform the response to make it more friendly
    const transformedPost = {
      ...post,
      categories: post.categories.map((c: CategoryRelation) => c.category),
      tags: post.tags.map((t: TagRelation) => t.tag),
    };
    
    return transformedPost;
  } catch (error) {
    logger.error('Error creating post:', error);
    throw error;
  }
};

/**
 * Get all published posts with optional filtering
 */
export const getPublishedPosts = async (query: PostQuery) => {
  try {
    const { 
      search, 
      categoryId, 
      tagId, 
      page = 1, 
      limit = 10 
    } = query;
    
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {
      status: 'PUBLISHED',
    };
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }
    
    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }
    
    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }
    
    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);
    
    // Transform the posts to make them more friendly
    const transformedPosts = posts.map((post: PostWithRelations) => ({
      ...post,
      categories: post.categories.map((c: CategoryRelation) => c.category),
      tags: post.tags.map((t: TagRelation) => t.tag),
    }));
    
    return {
      posts: transformedPosts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting published posts:', error);
    throw error;
  }
};

/**
 * Get a single published post by ID or slug
 */
export const getPublishedPost = async (idOrSlug: string) => {
  try {
    const post = await prisma.post.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
        status: 'PUBLISHED',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    
    if (!post) return null;
    
    // Transform the post to make it more friendly
    const transformedPost = {
      ...post,
      categories: post.categories.map((c: CategoryRelation) => c.category),
      tags: post.tags.map((t: TagRelation) => t.tag),
    };
    
    return transformedPost;
  } catch (error) {
    logger.error('Error getting published post:', error);
    throw error;
  }
};

/**
 * Get all posts (including drafts) with optional filtering
 * For admin/author use
 */
export const getAllPosts = async (userId: string, userRole: string, query: PostQuery) => {
  try {
    const { 
      search, 
      categoryId, 
      tagId, 
      status,
      page = 1, 
      limit = 10 
    } = query;
    
    const skip = (page - 1) * limit;
    
    // Build filter conditions
    const where: any = {};
    
    // If not admin, only show own posts
    if (userRole !== 'ADMIN') {
      where.authorId = userId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }
    
    if (categoryId) {
      where.categories = {
        some: {
          categoryId,
        },
      };
    }
    
    if (tagId) {
      where.tags = {
        some: {
          tagId,
        },
      };
    }
    
    // Get posts with pagination
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);
    
    // Transform the posts to make them more friendly
    const transformedPosts = posts.map((post: PostWithRelations) => ({
      ...post,
      categories: post.categories.map((c: CategoryRelation) => c.category),
      tags: post.tags.map((t: TagRelation) => t.tag),
    }));
    
    return {
      posts: transformedPosts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all posts:', error);
    throw error;
  }
};

/**
 * Get a single post by ID or slug (including drafts)
 * For admin/author use
 */
export const getPostById = async (userId: string, userRole: string, idOrSlug: string) => {
  try {
    const where: any = {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    };
    
    // If not admin, only show own posts
    if (userRole !== 'ADMIN') {
      where.authorId = userId;
    }
    
    const post = await prisma.post.findFirst({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    
    if (!post) return null;
    
    // Transform the post to make it more friendly
    const transformedPost = {
      ...post,
      categories: post.categories.map((c: CategoryRelation) => c.category),
      tags: post.tags.map((t: TagRelation) => t.tag),
    };
    
    return transformedPost;
  } catch (error) {
    logger.error('Error getting post by ID:', error);
    throw error;
  }
};

/**
 * Update a post
 */
export const updatePost = async (postId: string, userId: string, userRole: string, data: UpdatePostDto) => {
  try {
    const { title, content, excerpt, status, categoryIds, tagIds } = data;
    
    // Check if post exists and if user has permission to update it
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
    
    if (!post) {
      return null;
    }
    
    // Check if user is the author or admin
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Forbidden: Insufficient permissions to update this post');
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title, { lower: true, strict: true });
    }
    
    if (content) {
      updateData.content = content;
    }
    
    if (excerpt) {
      updateData.excerpt = excerpt;
    } else if (content && !post.excerpt) {
      updateData.excerpt = content.substring(0, 160);
    }
    
    if (status) {
      updateData.status = status;
      // If publishing for the first time, set publishedAt
      if (status === 'PUBLISHED' && post.status !== 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    
    // Execute all operations in a transaction
    const updatedPost = await prisma.$transaction(async (tx) => {
      // First, update the post
      await tx.post.update({
        where: { id: postId },
        data: updateData,
      });
      
      // Handle category updates if provided
      if (categoryIds) {
        const currentCategoryIds = post.categories.map((c: CategoryRelation) => c.category.id);
        
        // Categories to remove
        const categoriesToRemove = currentCategoryIds.filter(id => !categoryIds.includes(id));
        if (categoriesToRemove.length > 0) {
          await tx.categoryOnPost.deleteMany({
            where: {
              postId,
              categoryId: {
                in: categoriesToRemove,
              },
            },
          });
        }
        
        // Categories to add
        const categoriesToAdd = categoryIds.filter(id => !currentCategoryIds.includes(id));
        for (const categoryId of categoriesToAdd) {
          await tx.categoryOnPost.create({
            data: {
              postId,
              categoryId,
            },
          });
        }
      }
      
      // Handle tag updates if provided
      if (tagIds) {
        const currentTagIds = post.tags.map((t: TagRelation) => t.tag.id);
        
        // Tags to remove
        const tagsToRemove = currentTagIds.filter(id => !tagIds.includes(id));
        if (tagsToRemove.length > 0) {
          await tx.tagOnPost.deleteMany({
            where: {
              postId,
              tagId: {
                in: tagsToRemove,
              },
            },
          });
        }
        
        // Tags to add
        const tagsToAdd = tagIds.filter(id => !currentTagIds.includes(id));
        for (const tagId of tagsToAdd) {
          await tx.tagOnPost.create({
            data: {
              postId,
              tagId,
            },
          });
        }
      }
      
      // Get the updated post
      return await tx.post.findUnique({
        where: { id: postId },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });
    
    if (!updatedPost) {
      throw new Error('Failed to update post');
    }
    
    // Transform the response to make it more friendly
    const transformedPost = {
      ...updatedPost,
      categories: updatedPost.categories.map((c: CategoryRelation) => c.category),
      tags: updatedPost.tags.map((t: TagRelation) => t.tag),
    };
    
    return transformedPost;
  } catch (error) {
    logger.error('Error updating post:', error);
    throw error;
  }
};

/**
 * Delete a post
 */
export const deletePost = async (postId: string, userId: string, userRole: string) => {
  try {
    // Check if post exists and if user has permission to delete it
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      return null;
    }
    
    // Check if user is the author or admin
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error('Forbidden: Insufficient permissions to delete this post');
    }
    
    // Delete post - related CategoryOnPost and TagOnPost records will be deleted automatically due to cascade
    await prisma.post.delete({
      where: { id: postId },
    });
    
    return true;
  } catch (error) {
    logger.error('Error deleting post:', error);
    throw error;
  }
};

/**
 * Check if user can manage a post
 */
export const canManagePost = async (postId: string, userId: string, userRole: string) => {
  try {
    // Admins can manage all posts
    if (userRole === 'ADMIN') {
      return true;
    }
    
    // Authors can only manage their own posts
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    
    if (!post) {
      return false;
    }
    
    return post.authorId === userId;
  } catch (error) {
    logger.error('Error checking post management permissions:', error);
    throw error;
  }
}; 