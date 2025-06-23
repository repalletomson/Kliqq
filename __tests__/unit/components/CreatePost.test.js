import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CreatePost from '../../../components/CreatePost';
import * as ImagePicker from 'expo-image-picker';

// Mock dependencies
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

jest.mock('../../../(apis)/post', () => ({
  createPost: jest.fn(),
}));

jest.mock('../../../context/authContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'user123',
      full_name: 'John Doe',
      email: 'john@example.com',
    },
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  Feather: 'Feather',
}));

jest.mock('../../../utiles/inputValidation', () => ({
  validate: {
    postContent: jest.fn(() => ({ isValid: true, errors: [] })),
  },
  sanitizeInput: {
    text: jest.fn((text) => text),
  },
  securityChecks: {
    hasXSS: jest.fn(() => false),
    hasSQLInjection: jest.fn(() => false),
  },
}));

import { createPost } from '../../../(apis)/post';
import { validate, sanitizeInput, securityChecks } from '../../../utiles/inputValidation';

describe('CreatePost Component', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onPostCreated: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    
    createPost.mockResolvedValue({
      id: 'post123',
      content: 'Test post',
      user_id: 'user123',
    });
  });

  describe('Rendering', () => {
    it('renders create post modal when visible', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      expect(getByTestId('create-post-modal')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const hiddenProps = { ...defaultProps, visible: false };
      const { queryByTestId } = render(<CreatePost {...hiddenProps} />);
      expect(queryByTestId('create-post-modal')).toBeNull();
    });

    it('renders text input for post content', () => {
      const { getByPlaceholderText } = render(<CreatePost {...defaultProps} />);
      expect(getByPlaceholderText("What's happening?")).toBeTruthy();
    });

    it('renders character count indicator', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      expect(getByTestId('character-count')).toBeTruthy();
    });

    it('renders close button', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      expect(getByTestId('close-button')).toBeTruthy();
    });

    it('renders post button', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      expect(getByTestId('post-button')).toBeTruthy();
    });

    it('renders image picker button', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      expect(getByTestId('image-picker-button')).toBeTruthy();
    });
  });

  describe('Text Input Functionality', () => {
    it('updates post content when typing', () => {
      const { getByPlaceholderText } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      
      fireEvent.changeText(textInput, 'This is my new post!');
      expect(textInput.props.value).toBe('This is my new post!');
    });

    it('updates character count as user types', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const characterCount = getByTestId('character-count');
      
      fireEvent.changeText(textInput, 'Hello world');
      expect(characterCount.props.children).toContain('11');
    });

    it('shows warning when approaching character limit', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      
      const longText = 'a'.repeat(280); // Assuming 300 char limit
      fireEvent.changeText(textInput, longText);
      
      const characterCount = getByTestId('character-count');
      expect(characterCount.props.style).toEqual(
        expect.objectContaining({
          color: expect.stringMatching(/orange|yellow/i),
        })
      );
    });

    it('shows error when exceeding character limit', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      
      const tooLongText = 'a'.repeat(350); // Exceeding limit
      fireEvent.changeText(textInput, tooLongText);
      
      const characterCount = getByTestId('character-count');
      expect(characterCount.props.style).toEqual(
        expect.objectContaining({
          color: expect.stringMatching(/red/i),
        })
      );
    });

    it('auto-resizes text input for longer content', () => {
      const { getByPlaceholderText } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      
      const multilineText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      fireEvent.changeText(textInput, multilineText);
      
      expect(textInput.props.multiline).toBe(true);
    });
  });

  describe('Image Upload Functionality', () => {
    it('opens image picker options when image button is pressed', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      const imageButton = getByTestId('image-picker-button');
      
      fireEvent.press(imageButton);
      expect(getByTestId('image-picker-modal')).toBeTruthy();
    });

    it('launches camera when camera option is selected', async () => {
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://camera-image.jpg',
          type: 'image',
          width: 1920,
          height: 1080,
        }],
      });

      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('camera-option'));
      
      await waitFor(() => {
        expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
      });
    });

    it('launches gallery when gallery option is selected', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://gallery-image.jpg',
          type: 'image',
          width: 1920,
          height: 1080,
        }],
      });

      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });
    });

    it('displays selected images in preview', async () => {
      const mockImages = {
        canceled: false,
        assets: [
          { uri: 'file://image1.jpg', type: 'image' },
          { uri: 'file://image2.jpg', type: 'image' },
        ],
      };

      ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImages);

      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(getByTestId('image-preview-0')).toBeTruthy();
        expect(getByTestId('image-preview-1')).toBeTruthy();
      });
    });

    it('allows removing selected images', async () => {
      const mockImages = {
        canceled: false,
        assets: [{ uri: 'file://image1.jpg', type: 'image' }],
      };

      ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImages);

      const { getByTestId, queryByTestId } = render(<CreatePost {...defaultProps} />);
      
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(getByTestId('image-preview-0')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('remove-image-0'));
      
      expect(queryByTestId('image-preview-0')).toBeNull();
    });

    it('limits maximum number of images', async () => {
      const manyImages = {
        canceled: false,
        assets: Array.from({ length: 10 }, (_, i) => ({
          uri: `file://image${i}.jpg`,
          type: 'image',
        })),
      };

      ImagePicker.launchImageLibraryAsync.mockResolvedValue(manyImages);

      const { getByTestId, queryByTestId } = render(<CreatePost {...defaultProps} />);
      
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        // Should only show first 4 images (assuming limit of 4)
        expect(getByTestId('image-preview-0')).toBeTruthy();
        expect(getByTestId('image-preview-3')).toBeTruthy();
        expect(queryByTestId('image-preview-4')).toBeNull();
      });
    });

    it('handles permission denial gracefully', async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });

      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(getByTestId('permission-denied-message')).toBeTruthy();
      });
    });
  });

  describe('Post Submission', () => {
    it('calls createPost with correct data when posting', async () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, 'This is my new post!');
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(createPost).toHaveBeenCalledWith(
          { content: 'This is my new post!' },
          [],
          expect.objectContaining({ uid: 'user123' })
        );
      });
    });

    it('includes images in post submission', async () => {
      const mockImages = {
        canceled: false,
        assets: [{ uri: 'file://image1.jpg', type: 'image' }],
      };

      ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImages);

      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      
      // Add image
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(getByTestId('image-preview-0')).toBeTruthy();
      });
      
      // Add text and post
      const textInput = getByPlaceholderText("What's happening?");
      fireEvent.changeText(textInput, 'Post with image');
      fireEvent.press(getByTestId('post-button'));
      
      await waitFor(() => {
        expect(createPost).toHaveBeenCalledWith(
          { content: 'Post with image' },
          [{ uri: 'file://image1.jpg', type: 'image' }],
          expect.any(Object)
        );
      });
    });

    it('disables post button when content is empty', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      const postButton = getByTestId('post-button');
      
      expect(postButton.props.disabled).toBe(true);
    });

    it('enables post button when content is provided', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, 'Hello world');
      expect(postButton.props.disabled).toBe(false);
    });

    it('disables post button when content exceeds character limit', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      const tooLongText = 'a'.repeat(350);
      fireEvent.changeText(textInput, tooLongText);
      
      expect(postButton.props.disabled).toBe(true);
    });

    it('shows loading state while posting', async () => {
      createPost.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ id: 'post123' }), 1000))
      );

      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(postButton);
      
      expect(getByTestId('loading-indicator')).toBeTruthy();
      expect(postButton.props.disabled).toBe(true);
    });

    it('calls onPostCreated after successful submission', async () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(defaultProps.onPostCreated).toHaveBeenCalledWith({
          id: 'post123',
          content: 'Test post',
          user_id: 'user123',
        });
      });
    });

    it('clears form after successful submission', async () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(textInput.props.value).toBe('');
      });
    });
  });

  describe('Validation and Security', () => {
    it('validates post content before submission', async () => {
      validate.postContent.mockReturnValue({
        isValid: false,
        errors: ['Content is required'],
      });

      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      const postButton = getByTestId('post-button');
      
      fireEvent.press(postButton);
      
      expect(validate.postContent).toHaveBeenCalled();
      expect(createPost).not.toHaveBeenCalled();
    });

    it('sanitizes input content', async () => {
      sanitizeInput.text.mockReturnValue('Sanitized content');

      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, '<script>alert("xss")</script>');
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(sanitizeInput.text).toHaveBeenCalledWith('<script>alert("xss")</script>');
      });
    });

    it('blocks XSS attempts', async () => {
      securityChecks.hasXSS.mockReturnValue(true);

      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, '<script>alert("xss")</script>');
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(getByTestId('security-warning')).toBeTruthy();
      });
      
      expect(createPost).not.toHaveBeenCalled();
    });

    it('blocks SQL injection attempts', async () => {
      securityChecks.hasSQLInjection.mockReturnValue(true);

      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, "'; DROP TABLE posts; --");
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(getByTestId('security-warning')).toBeTruthy();
      });
      
      expect(createPost).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when post creation fails', async () => {
      createPost.mockRejectedValue(new Error('Network error'));

      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });
    });

    it('allows retry after error', async () => {
      createPost
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ id: 'post123' });

      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const postButton = getByTestId('post-button');
      
      fireEvent.changeText(textInput, 'Test post');
      fireEvent.press(postButton);
      
      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });
      
      fireEvent.press(getByTestId('retry-button'));
      
      await waitFor(() => {
        expect(createPost).toHaveBeenCalledTimes(2);
      });
    });

    it('handles image upload errors gracefully', async () => {
      ImagePicker.launchImageLibraryAsync.mockRejectedValue(
        new Error('Image picker error')
      );

      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      
      fireEvent.press(getByTestId('image-picker-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(getByTestId('image-upload-error')).toBeTruthy();
      });
    });
  });

  describe('Modal Interactions', () => {
    it('calls onClose when close button is pressed', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      const closeButton = getByTestId('close-button');
      
      fireEvent.press(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows confirmation dialog when closing with unsaved content', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      const closeButton = getByTestId('close-button');
      
      fireEvent.changeText(textInput, 'Unsaved content');
      fireEvent.press(closeButton);
      
      expect(getByTestId('confirmation-dialog')).toBeTruthy();
    });

    it('closes modal without confirmation when no content', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      const closeButton = getByTestId('close-button');
      
      fireEvent.press(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      
      const textInput = getByPlaceholderText("What's happening?");
      expect(textInput.props.accessibilityLabel).toBe('Post content input');
      
      const postButton = getByTestId('post-button');
      expect(postButton.props.accessibilityLabel).toBe('Share post');
      
      const imageButton = getByTestId('image-picker-button');
      expect(imageButton.props.accessibilityLabel).toBe('Add images');
    });

    it('has proper accessibility hints', () => {
      const { getByTestId } = render(<CreatePost {...defaultProps} />);
      
      const postButton = getByTestId('post-button');
      expect(postButton.props.accessibilityHint).toBe('Double tap to share your post');
    });

    it('announces character count for screen readers', () => {
      const { getByPlaceholderText, getByTestId } = render(<CreatePost {...defaultProps} />);
      const textInput = getByPlaceholderText("What's happening?");
      
      fireEvent.changeText(textInput, 'Hello world');
      
      const characterCount = getByTestId('character-count');
      expect(characterCount.props.accessibilityLabel).toContain('11 characters');
    });
  });
}); 