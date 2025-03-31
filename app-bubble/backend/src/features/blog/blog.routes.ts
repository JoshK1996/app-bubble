import { Router } from 'express';
import * as postController from './post.controller';
import * as categoryController from './category.controller';
import * as tagController from './tag.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes (no authentication required)
/**
 * @swagger
 * /api/blog/posts:
 *   get:
 *     summary: Get all published posts
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of published posts
 */
router.get('/posts', postController.getPosts);

/**
 * @swagger
 * /api/blog/posts/{postIdOrSlug}:
 *   get:
 *     summary: Get a published post by ID or slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: postIdOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/posts/:postIdOrSlug', postController.getPost);

/**
 * @swagger
 * /api/blog/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', categoryController.getCategories);

/**
 * @swagger
 * /api/blog/categories/with-count:
 *   get:
 *     summary: Get all categories with post count
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: List of categories with post count
 */
router.get('/categories/with-count', categoryController.getCategoriesWithPostCount);

/**
 * @swagger
 * /api/blog/categories/{idOrSlug}:
 *   get:
 *     summary: Get a category by ID or slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get('/categories/:idOrSlug', categoryController.getCategory);

/**
 * @swagger
 * /api/blog/tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: List of tags
 */
router.get('/tags', tagController.getTags);

/**
 * @swagger
 * /api/blog/tags/with-count:
 *   get:
 *     summary: Get all tags with post count
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: List of tags with post count
 */
router.get('/tags/with-count', tagController.getTagsWithPostCount);

/**
 * @swagger
 * /api/blog/tags/{idOrSlug}:
 *   get:
 *     summary: Get a tag by ID or slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag details
 *       404:
 *         description: Tag not found
 */
router.get('/tags/:idOrSlug', tagController.getTag);

// Protected routes (authentication required)
/**
 * @swagger
 * /api/blog/admin/posts:
 *   get:
 *     summary: Get all posts (including drafts) for admin/author
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of posts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient privileges
 */
router.get('/admin/posts', authenticate, postController.getAllPosts);

/**
 * @swagger
 * /api/blog/admin/posts/{postIdOrSlug}:
 *   get:
 *     summary: Get a post by ID or slug (including drafts) for admin/author
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postIdOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient privileges
 *       404:
 *         description: Post not found
 */
router.get('/admin/posts/:postIdOrSlug', authenticate, postController.getPostAdmin);

/**
 * @swagger
 * /api/blog/admin/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED]
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Post created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient privileges
 */
router.post('/admin/posts', authenticate, postController.createPost);

/**
 * @swagger
 * /api/blog/admin/posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED]
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Post updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient privileges
 *       404:
 *         description: Post not found
 */
router.put('/admin/posts/:postId', authenticate, postController.updatePost);

/**
 * @swagger
 * /api/blog/admin/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Post deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient privileges
 *       404:
 *         description: Post not found
 */
router.delete('/admin/posts/:postId', authenticate, postController.deletePost);

/**
 * @swagger
 * /api/blog/admin/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin privileges required
 */
router.post('/admin/categories', authenticate, categoryController.createCategory);

/**
 * @swagger
 * /api/blog/admin/categories/{categoryId}:
 *   put:
 *     summary: Update a category
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Category not found
 */
router.put('/admin/categories/:categoryId', authenticate, categoryController.updateCategory);

/**
 * @swagger
 * /api/blog/admin/categories/{categoryId}:
 *   delete:
 *     summary: Delete a category
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
 *       400:
 *         description: Bad request - Category has associated posts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Category not found
 */
router.delete('/admin/categories/:categoryId', authenticate, categoryController.deleteCategory);

/**
 * @swagger
 * /api/blog/admin/tags:
 *   post:
 *     summary: Create a new tag
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin privileges required
 */
router.post('/admin/tags', authenticate, tagController.createTag);

/**
 * @swagger
 * /api/blog/admin/tags/{tagId}:
 *   put:
 *     summary: Update a tag
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tag updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Tag not found
 */
router.put('/admin/tags/:tagId', authenticate, tagController.updateTag);

/**
 * @swagger
 * /api/blog/admin/tags/{tagId}:
 *   delete:
 *     summary: Delete a tag
 *     tags: [Blog - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Tag deleted
 *       400:
 *         description: Bad request - Tag has associated posts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin privileges required
 *       404:
 *         description: Tag not found
 */
router.delete('/admin/tags/:tagId', authenticate, tagController.deleteTag);

export default router; 