import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PostCard from '../../../components/PostCard';
import { useAuth } from '../../../context/authContext';

// Mock the auth context
jest.mock('../../../context/authContext');

// Mock date formatting
jest.mock('../../../utiles/dateFormat', () => ({
  formatMessageTime: jest.fn(() => '2 hours ago'),
}));

// Mock APIs
jest.mock('../../../(apis)/post', () => ({
  addLike: jest.fn(),
  removeLike: jest.fn(),
  hasUserLiked: jest.fn(),
  savePost: jest.fn(),
  unsavePost: jest.fn(),
  hasUserSaved: jest.fn(),
}));

const mockPost = {
  id: 'test-post-1',
  content: 'This is a test post',
  images: ['https://example.com/image1.jpg'],
  userName: 'John Doe',
  username: 'johndoe',
  profile_initials: 'JD',
  userAvatar: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T12:00:00Z',
  like_count: 5,
  comment_count: 3,
  likesCount: 5,
  commentsCount: 3,
  isLiked: false,
  user_id: 'user-123',
};

const mockUser = {
  uid: 'current-user-123',
  fullName: 'Current User',
  profile_initials: 'CU',
};

describe('PostCard', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: mockUser,
    });
    jest.clearAllMocks();
  });

  it('renders post content correctly', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    
    expect(getByText('This is a test post')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('@johndoe')).toBeTruthy();
  });

  it('displays correct like and comment counts', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    
    expect(getByText('5')).toBeTruthy(); // Like count
    expect(getByText('3')).toBeTruthy(); // Comment count
  });

  it('handles like button press', async () => {
    const { addLike } = require('../../../(apis)/post');
    addLike.mockResolvedValue({ success: true });

    const { getByTestId } = render(<PostCard post={mockPost} />);
    const likeButton = getByTestId('like-button');

    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(addLike).toHaveBeenCalledWith(mockPost.id, mockUser);
    });
  });

  it('handles comment button press', () => {
    const mockRouter = {
      push: jest.fn(),
    };
    
    jest.doMock('expo-router', () => ({
      useRouter: () => mockRouter,
    }));

    const { getByTestId } = render(<PostCard post={mockPost} />);
    const commentButton = getByTestId('comment-button');

    fireEvent.press(commentButton);

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/postDetailView/test-post-1',
    });
  });

  it('displays user avatar or initials correctly', () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('handles posts without images', () => {
    const postWithoutImages = { ...mockPost, images: [] };
    const { queryByTestId } = render(<PostCard post={postWithoutImages} />);
    
    expect(queryByTestId('post-images')).toBeFalsy();
  });

  it('handles liked posts correctly', () => {
    const likedPost = { ...mockPost, isLiked: true };
    const { getByTestId } = render(<PostCard post={likedPost} />);
    
    const likeButton = getByTestId('like-button');
    expect(likeButton.props.accessibilityState?.selected).toBe(true);
  });

  it('handles long content with read more', () => {
    const longContent = 'A'.repeat(200);
    const longPost = { ...mockPost, content: longContent };
    
    const { getByText } = render(<PostCard post={longPost} />);
    expect(getByText('Read more')).toBeTruthy();
  });

  it('handles post options menu', () => {
    const { getByTestId } = render(<PostCard post={mockPost} />);
    const optionsButton = getByTestId('post-options');

    fireEvent.press(optionsButton);
    // Add assertions for options modal appearance
  });

  it('handles save post functionality', async () => {
    const { savePost } = require('../../../(apis)/post');
    savePost.mockResolvedValue({ success: true });

    const { getByTestId } = render(<PostCard post={mockPost} />);
    
    // First open options
    const optionsButton = getByTestId('post-options');
    fireEvent.press(optionsButton);

    // Then click save
    const saveButton = getByTestId('save-post');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(savePost).toHaveBeenCalledWith(mockPost.id, mockUser.uid);
    });
  });

  it('handles own post correctly', () => {
    const ownPost = { ...mockPost, user_id: mockUser.uid };
    const { getByTestId } = render(<PostCard post={ownPost} />);
    
    const optionsButton = getByTestId('post-options');
    fireEvent.press(optionsButton);

    // Should show delete option for own posts
    expect(getByTestId('delete-post')).toBeTruthy();
  });
}); 