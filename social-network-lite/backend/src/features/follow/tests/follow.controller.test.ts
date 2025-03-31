/**
 * Test suite for FollowController
 */
import request from 'supertest';
import express, { Express } from 'express';
import { FollowController } from '../follow.controller';
import { FollowService } from '../follow.service';
import { v4 as uuidv4 } from 'uuid';

// Mock the follow service
jest.mock('../follow.service');

describe('FollowController', () => {
  let app: Express;
  let followController: FollowController;
  let mockFollowService: jest.Mocked<FollowService>;

  const user1Id = uuidv4();
  const user2Id = uuidv4();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a mock instance of FollowService
    mockFollowService = new FollowService() as jest.Mocked<FollowService>;
    
    // Create controller
    followController = new FollowController();
    
    // Replace the follow service in the controller with our mock
    (followController as any).followService = mockFollowService;

    // Setup Express app with only the follow routes
    app = express();
    app.use(express.json());
    
    // Mock auth middleware - this simulates the behavior of auth.middleware.ts
    app.use((req, res, next) => {
      req.user = {
        userId: user1Id,
        username: 'testuser'
      };
      next();
    });

    // Register routes with the correct param names
    app.post('/api/follow/:userId', (req, res) => followController.followUser(req, res));
    app.delete('/api/follow/:userId', (req, res) => followController.unfollowUser(req, res));
    app.get('/api/follow/:userId/status', (req, res) => followController.checkFollowStatus(req, res));
    app.get('/api/follow/:userId/followers', (req, res) => followController.getFollowers(req, res));
    app.get('/api/follow/:userId/following', (req, res) => followController.getFollowing(req, res));
  });

  describe('POST /api/follow/:userId', () => {
    it('should return 201 and the created follow relationship', async () => {
      const mockFollow = {
        id: uuidv4(),
        followerId: user1Id,
        followingId: user2Id,
        createdAt: new Date().toISOString(), // Use string format to match JSON response
      };

      mockFollowService.followUser = jest.fn().mockResolvedValue(mockFollow);

      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockFollow);
      expect(mockFollowService.followUser).toHaveBeenCalledWith(user1Id, user2Id);
    });

    it('should return 400 when trying to follow self', async () => {
      mockFollowService.followUser = jest.fn().mockRejectedValue(new Error('You cannot follow yourself'));

      const response = await request(app)
        .post(`/api/follow/${user1Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'You cannot follow yourself');
    });

    it('should return 409 when already following', async () => {
      mockFollowService.followUser = jest.fn().mockRejectedValue(new Error('You are already following this user'));

      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'You are already following this user');
    });

    it('should return 404 when user to follow does not exist', async () => {
      mockFollowService.followUser = jest.fn().mockRejectedValue(new Error('User to follow not found'));

      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'User to follow not found');
    });

    it('should return 400 for unexpected errors', async () => {
      mockFollowService.followUser = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('DELETE /api/follow/:userId', () => {
    it('should return 204 after successful unfollow', async () => {
      mockFollowService.unfollowUser = jest.fn().mockResolvedValue({ message: 'Successfully unfollowed user' });

      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(204);
      expect(mockFollowService.unfollowUser).toHaveBeenCalledWith(user1Id, user2Id);
    });

    it('should return 404 when trying to unfollow user not being followed', async () => {
      mockFollowService.unfollowUser = jest.fn().mockRejectedValue(new Error('You are not following this user'));

      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'You are not following this user');
    });

    it('should return 400 for unexpected errors', async () => {
      mockFollowService.unfollowUser = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('GET /api/follow/:userId/status', () => {
    it('should return follow status', async () => {
      mockFollowService.checkFollowStatus = jest.fn().mockResolvedValue({ isFollowing: true });

      const response = await request(app)
        .get(`/api/follow/${user2Id}/status`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isFollowing: true });
      expect(mockFollowService.checkFollowStatus).toHaveBeenCalledWith(user1Id, user2Id);
    });

    it('should return 400 for unexpected errors', async () => {
      mockFollowService.checkFollowStatus = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/follow/${user2Id}/status`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('GET /api/follow/:userId/followers', () => {
    it('should return list of followers', async () => {
      const mockFollowers = [
        { id: user1Id, username: 'user1' },
        { id: uuidv4(), username: 'anotheruser' },
      ];

      mockFollowService.getFollowers = jest.fn().mockResolvedValue(mockFollowers);

      const response = await request(app)
        .get(`/api/follow/${user2Id}/followers`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFollowers);
      expect(mockFollowService.getFollowers).toHaveBeenCalledWith(user2Id);
    });

    it('should return empty array when no followers', async () => {
      mockFollowService.getFollowers = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/follow/${user2Id}/followers`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 400 for unexpected errors', async () => {
      mockFollowService.getFollowers = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/follow/${user2Id}/followers`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });

  describe('GET /api/follow/:userId/following', () => {
    it('should return list of users being followed', async () => {
      const mockFollowing = [
        { id: user2Id, username: 'user2' },
        { id: uuidv4(), username: 'anotheruser' },
      ];

      mockFollowService.getFollowing = jest.fn().mockResolvedValue(mockFollowing);

      const response = await request(app)
        .get(`/api/follow/${user1Id}/following`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockFollowing);
      expect(mockFollowService.getFollowing).toHaveBeenCalledWith(user1Id);
    });

    it('should return empty array when not following anyone', async () => {
      mockFollowService.getFollowing = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get(`/api/follow/${user1Id}/following`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 400 for unexpected errors', async () => {
      mockFollowService.getFollowing = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/follow/${user1Id}/following`)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Database error');
    });
  });
}); 