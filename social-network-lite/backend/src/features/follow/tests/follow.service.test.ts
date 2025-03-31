/**
 * Test suite for FollowService
 */
import { FollowService } from '../follow.service';
import { DatabaseType, inMemoryStore } from '../../../config/database';
import { v4 as uuidv4 } from 'uuid';

// Mock the database module
jest.mock('../../../config/database', () => {
  const originalModule = jest.requireActual('../../../config/database');
  return {
    ...originalModule,
    getDatabaseType: jest.fn(),
    prisma: {
      follow: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    },
    inMemoryStore: {
      follows: new Map(),
      users: new Map(),
    },
  };
});

// Mock the mongoose models
jest.mock('../follow.schema', () => ({
  FollowModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
  },
}));

jest.mock('../../users/user.schema', () => ({
  UserModel: {
    findById: jest.fn(),
  },
}));

// Import the mocked modules to use in tests
import { getDatabaseType, prisma } from '../../../config/database';
import { FollowModel } from '../follow.schema';
import { UserModel } from '../../users/user.schema';

describe('FollowService', () => {
  let followService: FollowService;
  const user1Id = uuidv4();
  const user2Id = uuidv4();
  
  beforeEach(() => {
    followService = new FollowService();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Clear in-memory store
    inMemoryStore.follows.clear();
    inMemoryStore.users.clear();
    
    // Setup test users in memory store
    inMemoryStore.users.set(user1Id, { id: user1Id, username: 'user1' });
    inMemoryStore.users.set(user2Id, { id: user2Id, username: 'user2' });
  });
  
  describe('followUser', () => {
    it('should not allow a user to follow themselves', async () => {
      await expect(followService.followUser(user1Id, user1Id)).rejects.toThrow(
        'You cannot follow yourself',
      );
    });
    
    it('should not allow a user to follow someone they already follow', async () => {
      // Mock that the user is already following
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MEMORY);
      const followId = uuidv4();
      inMemoryStore.follows.set(followId, {
        id: followId,
        followerId: user1Id,
        followingId: user2Id,
        createdAt: new Date(),
      });
      
      await expect(followService.followUser(user1Id, user2Id)).rejects.toThrow(
        'You are already following this user',
      );
    });
    
    it('should throw if user to follow does not exist (PostgreSQL)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.POSTGRES);
      
      // Mock that follow doesn't exist
      (prisma.follow.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock that user to follow doesn't exist
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      await expect(followService.followUser(user1Id, 'nonexistent')).rejects.toThrow(
        'User to follow not found',
      );
    });
    
    it('should create a follow relationship (PostgreSQL)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.POSTGRES);
      
      // Mock that follow doesn't exist
      (prisma.follow.findFirst as jest.Mock).mockResolvedValue(null);
      
      // Mock that user to follow exists
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: user2Id,
        username: 'user2',
      });
      
      // Mock successful follow creation
      const createdFollow = {
        id: uuidv4(),
        followerId: user1Id,
        followingId: user2Id,
        createdAt: new Date(),
        follower: { username: 'user1' },
        following: { username: 'user2' },
      };
      (prisma.follow.create as jest.Mock).mockResolvedValue(createdFollow);
      
      const result = await followService.followUser(user1Id, user2Id);
      expect(result).toEqual(createdFollow);
      expect(prisma.follow.create).toHaveBeenCalledWith({
        data: {
          followerId: user1Id,
          followingId: user2Id,
        },
        include: {
          follower: {
            select: {
              username: true,
            },
          },
          following: {
            select: {
              username: true,
            },
          },
        },
      });
    });
    
    it('should create a follow relationship (MongoDB)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MONGO);
      
      // Mock that follow doesn't exist
      (FollowModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      // Mock that user to follow exists
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: user2Id,
          username: 'user2',
        }),
      });
      
      // Mock successful follow creation
      const mockId = uuidv4();
      const newFollow = {
        _id: mockId,
        follower: { username: 'user1' },
        following: { username: 'user2' },
        populate: jest.fn().mockResolvedValue({}),
        createdAt: new Date(),
      };
      (FollowModel.create as jest.Mock).mockResolvedValue(newFollow);
      
      const result = await followService.followUser(user1Id, user2Id);
      expect(result).toHaveProperty('id', mockId.toString());
      expect(result).toHaveProperty('followerId', user1Id);
      expect(result).toHaveProperty('followingId', user2Id);
      expect(FollowModel.create).toHaveBeenCalledWith({
        follower: user1Id,
        following: user2Id,
      });
    });
    
    it('should create a follow relationship (in-memory)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MEMORY);
      
      const result = await followService.followUser(user1Id, user2Id);
      expect(result).toHaveProperty('followerId', user1Id);
      expect(result).toHaveProperty('followingId', user2Id);
      expect(inMemoryStore.follows.size).toBe(1);
    });
  });
  
  describe('unfollowUser', () => {
    it('should throw if follow relationship does not exist', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MEMORY);
      
      await expect(followService.unfollowUser(user1Id, user2Id)).rejects.toThrow(
        'You are not following this user',
      );
    });
    
    it('should remove a follow relationship (PostgreSQL)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.POSTGRES);
      
      const followId = uuidv4();
      // Mock that follow exists
      (prisma.follow.findFirst as jest.Mock).mockResolvedValue({
        id: followId,
        followerId: user1Id,
        followingId: user2Id,
      });
      
      const result = await followService.unfollowUser(user1Id, user2Id);
      expect(result).toEqual({ message: 'Successfully unfollowed user' });
      expect(prisma.follow.delete).toHaveBeenCalledWith({
        where: {
          id: followId,
        },
      });
    });
    
    it('should remove a follow relationship (MongoDB)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MONGO);
      
      const followId = uuidv4();
      // Mock that follow exists
      (FollowModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: followId,
          follower: user1Id,
          following: user2Id,
        }),
      });
      
      (FollowModel.findByIdAndDelete as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });
      
      const result = await followService.unfollowUser(user1Id, user2Id);
      expect(result).toEqual({ message: 'Successfully unfollowed user' });
      expect(FollowModel.findByIdAndDelete).toHaveBeenCalledWith(followId);
    });
    
    it('should remove a follow relationship (in-memory)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MEMORY);
      
      const followId = uuidv4();
      inMemoryStore.follows.set(followId, {
        id: followId,
        followerId: user1Id,
        followingId: user2Id,
        createdAt: new Date(),
      });
      
      const result = await followService.unfollowUser(user1Id, user2Id);
      expect(result).toEqual({ message: 'Successfully unfollowed user' });
      expect(inMemoryStore.follows.size).toBe(0);
    });
  });
  
  describe('getFollowing', () => {
    it('should return users that a user is following (PostgreSQL)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.POSTGRES);
      
      const mockUser = { id: user2Id, username: 'user2' };
      (prisma.follow.findMany as jest.Mock).mockResolvedValue([
        {
          followerId: user1Id,
          followingId: user2Id,
          following: mockUser,
        },
      ]);
      
      const result = await followService.getFollowing(user1Id);
      expect(result).toEqual([mockUser]);
      expect(prisma.follow.findMany).toHaveBeenCalledWith({
        where: {
          followerId: user1Id,
        },
        include: {
          following: true,
        },
      });
    });
    
    it('should return users that a user is following (MongoDB)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MONGO);
      
      const mockUser = { _id: user2Id, username: 'user2' };
      (FollowModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            follower: user1Id,
            following: mockUser,
          },
        ]),
      });
      
      const result = await followService.getFollowing(user1Id);
      expect(result).toEqual([mockUser]);
      expect(FollowModel.find).toHaveBeenCalledWith({ follower: user1Id });
    });
    
    it('should return users that a user is following (in-memory)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MEMORY);
      
      const followId = uuidv4();
      inMemoryStore.follows.set(followId, {
        id: followId,
        followerId: user1Id,
        followingId: user2Id,
        createdAt: new Date(),
      });
      
      const result = await followService.getFollowing(user1Id);
      expect(result).toEqual([{ id: user2Id, username: 'user2' }]);
    });
  });
  
  describe('getFollowers', () => {
    it('should return users who follow a user (PostgreSQL)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.POSTGRES);
      
      const mockUser = { id: user1Id, username: 'user1' };
      (prisma.follow.findMany as jest.Mock).mockResolvedValue([
        {
          followerId: user1Id,
          followingId: user2Id,
          follower: mockUser,
        },
      ]);
      
      const result = await followService.getFollowers(user2Id);
      expect(result).toEqual([mockUser]);
      expect(prisma.follow.findMany).toHaveBeenCalledWith({
        where: {
          followingId: user2Id,
        },
        include: {
          follower: true,
        },
      });
    });
    
    it('should return users who follow a user (MongoDB)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MONGO);
      
      const mockUser = { _id: user1Id, username: 'user1' };
      (FollowModel.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          {
            follower: mockUser,
            following: user2Id,
          },
        ]),
      });
      
      const result = await followService.getFollowers(user2Id);
      expect(result).toEqual([mockUser]);
      expect(FollowModel.find).toHaveBeenCalledWith({ following: user2Id });
    });
    
    it('should return users who follow a user (in-memory)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MEMORY);
      
      const followId = uuidv4();
      inMemoryStore.follows.set(followId, {
        id: followId,
        followerId: user1Id,
        followingId: user2Id,
        createdAt: new Date(),
      });
      
      const result = await followService.getFollowers(user2Id);
      expect(result).toEqual([{ id: user1Id, username: 'user1' }]);
    });
  });
  
  describe('checkFollowStatus', () => {
    it('should return follow status (PostgreSQL)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.POSTGRES);
      
      // Test when following
      (prisma.follow.findFirst as jest.Mock).mockResolvedValue({
        id: uuidv4(),
        followerId: user1Id,
        followingId: user2Id,
      });
      
      let result = await followService.checkFollowStatus(user1Id, user2Id);
      expect(result).toEqual({ isFollowing: true });
      
      // Test when not following
      (prisma.follow.findFirst as jest.Mock).mockResolvedValue(null);
      
      result = await followService.checkFollowStatus(user1Id, user2Id);
      expect(result).toEqual({ isFollowing: false });
    });
    
    it('should return follow status (MongoDB)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MONGO);
      
      // Test when following
      (FollowModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: uuidv4(),
          follower: user1Id,
          following: user2Id,
        }),
      });
      
      let result = await followService.checkFollowStatus(user1Id, user2Id);
      expect(result).toEqual({ isFollowing: true });
      
      // Test when not following
      (FollowModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      
      result = await followService.checkFollowStatus(user1Id, user2Id);
      expect(result).toEqual({ isFollowing: false });
    });
    
    it('should return follow status (in-memory)', async () => {
      (getDatabaseType as jest.Mock).mockReturnValue(DatabaseType.MEMORY);
      
      // Test when not following
      let result = await followService.checkFollowStatus(user1Id, user2Id);
      expect(result).toEqual({ isFollowing: false });
      
      // Test when following
      const followId = uuidv4();
      inMemoryStore.follows.set(followId, {
        id: followId,
        followerId: user1Id,
        followingId: user2Id,
        createdAt: new Date(),
      });
      
      result = await followService.checkFollowStatus(user1Id, user2Id);
      expect(result).toEqual({ isFollowing: true });
    });
  });
}); 