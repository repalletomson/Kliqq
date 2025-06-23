import {
  createPost,
  getFeedPosts,
  addLike,
  removeLike,
  addComment,
  deletePost,
  savePost,
  unsavePost,
} from '../../../(apis)/post';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
  storage: {
    from: jest.fn(() => ({
      remove: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
};

jest.mock('../../../config/supabaseConfig', () => ({
  supabase: mockSupabase,
}));

// Mock TUS upload
jest.mock('../../../(apis)/tusUpload', () => ({
  uploadMultipleImagesWithTUS: jest.fn(),
}));

// Mock streak functions
jest.mock('../../../(apis)/streaks', () => ({
  incrementUserStreak: jest.fn(),
  updateUserActivityStreak: jest.fn(),
}));

describe('Posts API Integration', () => {
  let mockUser;
  let mockFromChain;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUser = {
      uid: 'user-123',
      full_name: 'Test User',
      profile_image: 'https://example.com/avatar.jpg',
    };

    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Setup mock chain for Supabase queries
    mockFromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };

    mockSupabase.from.mockReturnValue(mockFromChain);
  });

  describe('createPost', () => {
    it('should create post successfully without images', async () => {
      const mockPost = {
        id: 'post-123',
        content: 'Test post content',
        user_id: 'user-123',
        created_at: '2024-01-01T12:00:00Z',
      };

      mockFromChain.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      const postData = {
        content: 'Test post content',
      };

      const result = await createPost(postData, [], mockUser);

      expect(mockFromChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          content: 'Test post content',
          images: [],
          like_count: 0,
          comment_count: 0,
        })
      );

      expect(result).toEqual(expect.objectContaining({
        id: 'post-123',
        content: 'Test post content',
      }));
    });

    it('should create post with images', async () => {
      const { uploadMultipleImagesWithTUS } = require('../../../(apis)/tusUpload');
      uploadMultipleImagesWithTUS.mockResolvedValue([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);

      const mockPost = {
        id: 'post-123',
        content: 'Test post with images',
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      };

      mockFromChain.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      const postData = { content: 'Test post with images' };
      const mediaFiles = [{ uri: 'file://image1.jpg' }, { uri: 'file://image2.jpg' }];

      const result = await createPost(postData, mediaFiles, mockUser);

      expect(uploadMultipleImagesWithTUS).toHaveBeenCalledWith(mediaFiles, 'user-123');
      expect(mockFromChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        })
      );
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      await expect(createPost({ content: 'Test' }, [], mockUser))
        .rejects.toThrow('User not authenticated');
    });

    it('should handle database errors', async () => {
      mockFromChain.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(createPost({ content: 'Test' }, [], mockUser))
        .rejects.toThrow();
    });
  });

  describe('getFeedPosts', () => {
    it('should fetch posts successfully', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          content: 'First post',
          users: {
            full_name: 'John Doe',
            profile_image: 'https://example.com/john.jpg',
            username: 'johndoe',
          },
        },
        {
          id: 'post-2',
          content: 'Second post',
          users: {
            full_name: 'Jane Smith',
            profile_image: 'https://example.com/jane.jpg',
            username: 'janesmith',
          },
        },
      ];

      mockFromChain.order.mockResolvedValue({
        data: mockPosts,
        error: null,
      });

      const result = await getFeedPosts();

      expect(mockSupabase.from).toHaveBeenCalledWith('posts');
      expect(mockFromChain.select).toHaveBeenCalledWith(
        expect.stringContaining('users:user_id')
      );
      expect(mockFromChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockPosts);
    });

    it('should handle empty feed', async () => {
      mockFromChain.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await getFeedPosts();
      expect(result).toEqual([]);
    });

    it('should handle fetch errors gracefully', async () => {
      mockFromChain.order.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      const result = await getFeedPosts();
      expect(result).toEqual([]);
    });
  });

  describe('addLike', () => {
    it('should add like successfully', async () => {
      const mockLike = {
        id: 'like-123',
        post_id: 'post-123',
        user_id: 'user-123',
      };

      mockFromChain.single.mockResolvedValue({
        data: mockLike,
        error: null,
      });

      // Mock hasUserLiked to return false (not liked yet)
      mockFromChain.limit = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await addLike('post-123', mockUser);

      expect(mockFromChain.insert).toHaveBeenCalledWith({
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: expect.any(String),
      });

      expect(result).toEqual(mockLike);
    });

    it('should not add duplicate likes', async () => {
      // Mock hasUserLiked to return true (already liked)
      mockFromChain.limit = jest.fn().mockResolvedValue({
        data: [{ id: 'existing-like' }],
        error: null,
      });

      const result = await addLike('post-123', mockUser);
      expect(result).toBeNull();
      expect(mockFromChain.insert).not.toHaveBeenCalled();
    });

    it('should handle invalid post ID', async () => {
      const result = await addLike('invalid-uuid', mockUser);
      expect(result).toBeNull();
    });
  });

  describe('removeLike', () => {
    it('should remove like successfully', async () => {
      mockFromChain.delete.mockResolvedValue({
        error: null,
      });

      const result = await removeLike('post-123', mockUser);

      expect(mockFromChain.delete).toHaveBeenCalled();
      expect(mockFromChain.eq).toHaveBeenCalledWith('post_id', 'post-123');
      expect(mockFromChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(result).toBe(true);
    });

    it('should handle removal errors', async () => {
      mockFromChain.delete.mockResolvedValue({
        error: { message: 'Delete failed' },
      });

      await expect(removeLike('post-123', mockUser)).rejects.toThrow();
    });
  });

  describe('addComment', () => {
    it('should add comment successfully', async () => {
      const mockComment = {
        id: 'comment-123',
        post_id: 'post-123',
        user_id: 'user-123',
        content: 'Test comment',
      };

      mockFromChain.single.mockResolvedValue({
        data: mockComment,
        error: null,
      });

      const commentData = { content: 'Test comment' };
      const result = await addComment('post-123', commentData, mockUser);

      expect(mockFromChain.insert).toHaveBeenCalledWith({
        post_id: 'post-123',
        user_id: 'user-123',
        content: 'Test comment',
        created_at: expect.any(String),
      });

      expect(result).toEqual(mockComment);
    });

    it('should handle missing parameters', async () => {
      const result = await addComment(null, null, null);
      expect(result).toBeNull();
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      const mockPost = {
        user_id: 'user-123',
        images: ['https://example.com/image1.jpg'],
      };

      mockFromChain.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      mockFromChain.delete.mockResolvedValue({
        error: null,
      });

      const result = await deletePost('post-123', 'user-123');

      expect(mockFromChain.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should not allow deleting others posts', async () => {
      const mockPost = {
        user_id: 'other-user',
        images: [],
      };

      mockFromChain.single.mockResolvedValue({
        data: mockPost,
        error: null,
      });

      await expect(deletePost('post-123', 'user-123'))
        .rejects.toThrow('Unauthorized: You can only delete your own posts');
    });

    it('should handle non-existent posts', async () => {
      mockFromChain.single.mockResolvedValue({
        data: null,
        error: { message: 'Post not found' },
      });

      await expect(deletePost('non-existent', 'user-123')).rejects.toThrow();
    });
  });

  describe('savePost', () => {
    it('should save post successfully', async () => {
      const mockSave = {
        id: 'save-123',
        post_id: 'post-123',
        user_id: 'user-123',
      };

      // Mock hasUserSaved to return false
      mockFromChain.limit = jest.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockFromChain.single.mockResolvedValue({
        data: mockSave,
        error: null,
      });

      const result = await savePost('post-123', 'user-123');

      expect(mockFromChain.insert).toHaveBeenCalledWith({
        post_id: 'post-123',
        user_id: 'user-123',
        created_at: expect.any(String),
      });

      expect(result).toEqual(mockSave);
    });

    it('should not save already saved posts', async () => {
      // Mock hasUserSaved to return true
      mockFromChain.limit = jest.fn().mockResolvedValue({
        data: [{ id: 'existing-save' }],
        error: null,
      });

      const result = await savePost('post-123', 'user-123');
      expect(result).toBeNull();
    });
  });

  describe('unsavePost', () => {
    it('should unsave post successfully', async () => {
      mockFromChain.delete.mockResolvedValue({
        error: null,
      });

      const result = await unsavePost('post-123', 'user-123');

      expect(mockFromChain.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      mockFromChain.single.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 1000)
        )
      );

      await expect(createPost({ content: 'Test' }, [], mockUser))
        .rejects.toThrow();
    });

    it('should handle malformed responses', async () => {
      mockFromChain.single.mockResolvedValue({
        data: undefined,
        error: null,
      });

      const result = await createPost({ content: 'Test' }, [], mockUser);
      expect(result).toBeDefined();
    });
  });
}); 