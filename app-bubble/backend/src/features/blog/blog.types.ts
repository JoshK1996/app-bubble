/**
 * Types for the blog module
 */

// User roles for blog
export enum BlogRole {
  ADMIN = 'ADMIN',
  AUTHOR = 'AUTHOR',
  READER = 'READER'
}

// Post status
export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

// Request DTOs
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  categoryIds?: string[];
  tagIds?: string[];
  status?: PostStatus;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  status?: PostStatus;
  categoryIds?: string[];
  tagIds?: string[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest {
  name: string;
}

// Response DTOs
export interface PostDTO {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  author: {
    id: string;
    name: string;
  };
  categories: CategoryDTO[];
  tags: TagDTO[];
}

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface TagDTO {
  id: string;
  name: string;
  slug: string;
}

// Query parameters
export interface PostQueryParams {
  search?: string;
  categoryId?: string;
  tagId?: string;
  status?: PostStatus;
  authorId?: string;
  page?: number;
  limit?: number;
}

/**
 * Interface for blog user
 */
export interface BlogUser {
  id: string;
  name: string;
  email: string;
  role: BlogRole;
}

/**
 * Interface for creating a category
 */
export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

/**
 * Interface for updating a category
 */
export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
}

/**
 * Interface for creating a tag
 */
export interface CreateTagDTO {
  name: string;
}

/**
 * Interface for updating a tag
 */
export interface UpdateTagDTO {
  name: string;
}

/**
 * Interface for extending Express Request
 */
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
    }
  }
} 