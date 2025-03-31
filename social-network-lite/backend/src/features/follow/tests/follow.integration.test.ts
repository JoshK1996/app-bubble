/**
 * Integration tests for Follow API routes
 */
import request from 'supertest';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { inMemoryStore, DatabaseType } from '../../../config/database';
import followRoutes from '../follow.routes';

// Mock the database configuration to use in-memory database for testing
jest.mock('../../../config/database', () => {
  const originalModule = jest.requireActual('../../../config/database');
  return {
    ...originalModule,
    getDatabaseType: jest.fn().mockReturnValue(originalModule.DatabaseType.MEMORY),
    inMemoryStore: {
      follows: new Map(),
      users: new Map(),
    },
  };
});

describe('Follow API - Integration Tests', () => {
  const app = express();
  const user1Id = uuidv4();
  const user2Id = uuidv4();
  
  // Setup express app and routes
  beforeAll(() => {
    app.use(express.json());
    
    // Mock auth middleware for testing
    app.use((req: any, res: any, next: any) => {
      req.user = {
        userId: user1Id,
        username: 'testuser',
        role: 'USER'
      };
      next();
    });
    
    // Register follow routes
    app.use('/api', followRoutes);
    
    // Add a test endpoint to retrieve all follows for verification
    app.get('/api/test/follows', (req, res) => {
      const follows = Array.from(inMemoryStore.follows.values());
      res.status(200).json(follows);
    });
  });
  
  beforeEach(() => {
    // Clear in-memory store before each test
    inMemoryStore.follows.clear();
    inMemoryStore.users.clear();
    
    // Add test users to the store
    inMemoryStore.users.set(user1Id, { id: user1Id, username: 'user1' });
    inMemoryStore.users.set(user2Id, { id: user2Id, username: 'user2' });
  });
  
  describe('POST /api/follow/:id', () => {
    it('should create a follow relationship', async () => {
      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('followerId', user1Id);
      expect(response.body).toHaveProperty('followingId', user2Id);
      
      // Verify follow was added to the store
      const follows = Array.from(inMemoryStore.follows.values());
      expect(follows.length).toBe(1);
      expect(follows[0].followerId).toBe(user1Id);
      expect(follows[0].followingId).toBe(user2Id);
    });
    
    it('should return 400 when trying to follow self', async () => {
      const response = await request(app)
        .post(`/api/follow/${user1Id}`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'You cannot follow yourself');
      
      // Verify no follow was added
      expect(inMemoryStore.follows.size).toBe(0);
    });
    
    it('should return 400 when already following user', async () => {
      // First follow request
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      // Second follow request should fail
      const response = await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'You are already following this user');
      
      // Verify only one follow relationship exists
      expect(inMemoryStore.follows.size).toBe(1);
    });
  });
  
  describe('DELETE /api/follow/:id', () => {
    it('should remove a follow relationship', async () => {
      // First create a follow relationship
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      // Verify it was created
      expect(inMemoryStore.follows.size).toBe(1);
      
      // Now unfollow
      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(204);
      
      // Verify follow was removed
      expect(inMemoryStore.follows.size).toBe(0);
    });
    
    it('should return 404 when trying to unfollow a user not being followed', async () => {
      const response = await request(app)
        .delete(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'You are not following this user');
    });
  });
  
  describe('GET /api/follow/:id/status', () => {
    it('should return correct follow status', async () => {
      // Check when not following
      let response = await request(app)
        .get(`/api/follow/${user2Id}/status`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isFollowing: false });
      
      // Create follow relationship
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      // Check when following
      response = await request(app)
        .get(`/api/follow/${user2Id}/status`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ isFollowing: true });
    });
  });
  
  describe('GET /api/follow/:id/followers', () => {
    it('should return list of followers', async () => {
      // Create a follow relationship
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      // Get user2's followers
      const response = await request(app)
        .get(`/api/follow/${user2Id}/followers`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', user1Id);
      expect(response.body[0]).toHaveProperty('username', 'user1');
    });
    
    it('should return empty array when user has no followers', async () => {
      const response = await request(app)
        .get(`/api/follow/${user2Id}/followers`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
  
  describe('GET /api/follow/:id/following', () => {
    it('should return list of users being followed', async () => {
      // Create a follow relationship
      await request(app)
        .post(`/api/follow/${user2Id}`)
        .set('Content-Type', 'application/json');
      
      // Get user1's following
      const response = await request(app)
        .get(`/api/follow/${user1Id}/following`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('id', user2Id);
      expect(response.body[0]).toHaveProperty('username', 'user2');
    });
    
    it('should return empty array when user is not following anyone', async () => {
      const response = await request(app)
        .get(`/api/follow/${user1Id}/following`)
        .set('Content-Type', 'application/json');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });
}); 