import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MessageInput from '../../../components/messageInput';
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

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  Feather: 'Feather',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('../../../utiles/encryption', () => ({
  encryptMessage: jest.fn((text) => `encrypted:${text}`),
}));

describe('MessageInput Component', () => {
  const defaultProps = {
    onSendMessage: jest.fn(),
    onTyping: jest.fn(),
    disabled: false,
    placeholder: 'Type a message...',
    chatId: 'chat123',
    currentUser: {
      uid: 'user1',
      full_name: 'Jane Smith',
    },
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
  });

  describe('Rendering', () => {
    it('renders text input with placeholder', () => {
      const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      expect(getByPlaceholderText('Type a message...')).toBeTruthy();
    });

    it('renders send button', () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      expect(getByTestId('send-button')).toBeTruthy();
    });

    it('renders attachment button', () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      expect(getByTestId('attachment-button')).toBeTruthy();
    });

    it('renders emoji button', () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      expect(getByTestId('emoji-button')).toBeTruthy();
    });

    it('disables input when disabled prop is true', () => {
      const disabledProps = { ...defaultProps, disabled: true };
      const { getByPlaceholderText } = render(<MessageInput {...disabledProps} />);
      
      const textInput = getByPlaceholderText('Type a message...');
      expect(textInput.props.editable).toBe(false);
    });
  });

  describe('Text Input Functionality', () => {
    it('updates text value when typing', () => {
      const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      fireEvent.changeText(textInput, 'Hello world');
      expect(textInput.props.value).toBe('Hello world');
    });

    it('calls onTyping when user starts typing', async () => {
      const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      fireEvent.changeText(textInput, 'H');
      
      await waitFor(() => {
        expect(defaultProps.onTyping).toHaveBeenCalledWith(true);
      });
    });

    it('calls onTyping with false when user stops typing', async () => {
      const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      fireEvent.changeText(textInput, 'Hello');
      
      // Wait for typing timeout
      await waitFor(() => {
        expect(defaultProps.onTyping).toHaveBeenCalledWith(false);
      }, { timeout: 3000 });
    });

    it('auto-expands text input for multiple lines', () => {
      const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      const longText = 'This is a very long message\nthat spans multiple lines\nand should expand the input area';
      fireEvent.changeText(textInput, longText);
      
      // Input should be multiline
      expect(textInput.props.multiline).toBe(true);
    });

    it('limits maximum height of text input', () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      const veryLongText = Array(20).fill('This is a line of text').join('\n');
      fireEvent.changeText(textInput, veryLongText);
      
      const inputContainer = getByTestId('input-container');
      const maxHeight = 120; // Assuming max height is 120
      expect(inputContainer.props.style.height).toBeLessThanOrEqual(maxHeight);
    });
  });

  describe('Send Message Functionality', () => {
    it('sends message when send button is pressed', async () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, 'Hello world');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith({
          text: 'Hello world',
          type: 'text',
          chatId: 'chat123',
          senderId: 'user1',
        });
      });
    });

    it('sends message when return key is pressed', async () => {
      const { getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      fireEvent.changeText(textInput, 'Hello world');
      fireEvent(textInput, 'onSubmitEditing');
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalled();
      });
    });

    it('clears input after sending message', async () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, 'Hello world');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(textInput.props.value).toBe('');
      });
    });

    it('does not send empty messages', async () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      const sendButton = getByTestId('send-button');
      
      fireEvent.press(sendButton);
      
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
    });

    it('does not send messages with only whitespace', async () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, '   \n\t   ');
      fireEvent.press(sendButton);
      
      expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
    });

    it('disables send button when input is empty', () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      const sendButton = getByTestId('send-button');
      
      expect(sendButton.props.disabled).toBe(true);
    });

    it('enables send button when input has text', () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, 'Hello');
      
      expect(sendButton.props.disabled).toBe(false);
    });
  });

  describe('Attachment Functionality', () => {
    it('opens attachment options when attachment button is pressed', () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      const attachmentButton = getByTestId('attachment-button');
      
      fireEvent.press(attachmentButton);
      
      expect(getByTestId('attachment-modal')).toBeTruthy();
    });

    it('launches image picker when camera option is selected', async () => {
      ImagePicker.launchCameraAsync.mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://camera-image.jpg',
          type: 'image',
          width: 1920,
          height: 1080,
        }],
      });

      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      
      fireEvent.press(getByTestId('attachment-button'));
      fireEvent.press(getByTestId('camera-option'));
      
      await waitFor(() => {
        expect(ImagePicker.launchCameraAsync).toHaveBeenCalled();
      });
    });

    it('launches gallery picker when gallery option is selected', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: false,
        assets: [{
          uri: 'file://gallery-image.jpg',
          type: 'image',
          width: 1920,
          height: 1080,
        }],
      });

      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      
      fireEvent.press(getByTestId('attachment-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      });
    });

    it('sends image message when image is selected', async () => {
      const mockImage = {
        canceled: false,
        assets: [{
          uri: 'file://test-image.jpg',
          type: 'image',
          width: 1920,
          height: 1080,
        }],
      };

      ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImage);

      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      
      fireEvent.press(getByTestId('attachment-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith({
          type: 'image',
          image: 'file://test-image.jpg',
          chatId: 'chat123',
          senderId: 'user1',
        });
      });
    });

    it('handles image picker cancellation gracefully', async () => {
      ImagePicker.launchImageLibraryAsync.mockResolvedValue({
        canceled: true,
      });

      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      
      fireEvent.press(getByTestId('attachment-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).not.toHaveBeenCalled();
      });
    });

    it('handles permission denial gracefully', async () => {
      ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'denied',
      });

      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      
      fireEvent.press(getByTestId('attachment-button'));
      fireEvent.press(getByTestId('gallery-option'));
      
      // Should show permission denied message
      await waitFor(() => {
        expect(getByTestId('permission-denied-message')).toBeTruthy();
      });
    });
  });

  describe('Emoji Functionality', () => {
    it('opens emoji picker when emoji button is pressed', () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      const emojiButton = getByTestId('emoji-button');
      
      fireEvent.press(emojiButton);
      
      expect(getByTestId('emoji-picker')).toBeTruthy();
    });

    it('inserts emoji into text input when emoji is selected', () => {
      const { getByTestId, getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      fireEvent.changeText(textInput, 'Hello ');
      fireEvent.press(getByTestId('emoji-button'));
      fireEvent.press(getByTestId('emoji-😀'));
      
      expect(textInput.props.value).toBe('Hello 😀');
    });

    it('closes emoji picker after emoji selection', () => {
      const { getByTestId, queryByTestId } = render(<MessageInput {...defaultProps} />);
      
      fireEvent.press(getByTestId('emoji-button'));
      fireEvent.press(getByTestId('emoji-😀'));
      
      expect(queryByTestId('emoji-picker')).toBeNull();
    });

    it('maintains cursor position when inserting emoji', () => {
      const { getByTestId, getByPlaceholderText } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      
      fireEvent.changeText(textInput, 'Hello world');
      // Simulate cursor at position 6 (after "Hello ")
      fireEvent(textInput, 'onSelectionChange', {
        nativeEvent: { selection: { start: 6, end: 6 } }
      });
      
      fireEvent.press(getByTestId('emoji-button'));
      fireEvent.press(getByTestId('emoji-😀'));
      
      expect(textInput.props.value).toBe('Hello 😀world');
    });
  });

  describe('Reply Functionality', () => {
    it('shows reply preview when replying to a message', () => {
      const replyMessage = {
        id: 'msg1',
        text: 'Original message',
        senderName: 'John Doe',
      };

      const propsWithReply = {
        ...defaultProps,
        replyTo: replyMessage,
      };

      const { getByText, getByTestId } = render(<MessageInput {...propsWithReply} />);
      
      expect(getByTestId('reply-preview')).toBeTruthy();
      expect(getByText('Replying to John Doe')).toBeTruthy();
      expect(getByText('Original message')).toBeTruthy();
    });

    it('cancels reply when cancel button is pressed', () => {
      const replyMessage = {
        id: 'msg1',
        text: 'Original message',
        senderName: 'John Doe',
      };

      const onCancelReply = jest.fn();
      const propsWithReply = {
        ...defaultProps,
        replyTo: replyMessage,
        onCancelReply,
      };

      const { getByTestId } = render(<MessageInput {...propsWithReply} />);
      
      fireEvent.press(getByTestId('cancel-reply-button'));
      expect(onCancelReply).toHaveBeenCalled();
    });

    it('includes reply data when sending reply message', async () => {
      const replyMessage = {
        id: 'msg1',
        text: 'Original message',
        senderName: 'John Doe',
      };

      const propsWithReply = {
        ...defaultProps,
        replyTo: replyMessage,
      };

      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...propsWithReply} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, 'This is my reply');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith({
          text: 'This is my reply',
          type: 'text',
          chatId: 'chat123',
          senderId: 'user1',
          replyTo: replyMessage,
        });
      });
    });
  });

  describe('Encryption', () => {
    it('encrypts messages when encryption is enabled', async () => {
      const encryptionProps = {
        ...defaultProps,
        encryptionEnabled: true,
      };

      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...encryptionProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, 'Secret message');
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith({
          text: 'encrypted:Secret message',
          type: 'text',
          chatId: 'chat123',
          senderId: 'user1',
          isEncrypted: true,
        });
      });
    });

    it('shows encryption indicator when encryption is enabled', () => {
      const encryptionProps = {
        ...defaultProps,
        encryptionEnabled: true,
      };

      const { getByTestId } = render(<MessageInput {...encryptionProps} />);
      expect(getByTestId('encryption-indicator')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long messages gracefully', async () => {
      const longMessage = 'a'.repeat(5000);
      
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, longMessage);
      fireEvent.press(sendButton);
      
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledWith({
          text: longMessage.substring(0, 2000), // Should truncate to max length
          type: 'text',
          chatId: 'chat123',
          senderId: 'user1',
        });
      });
    });

    it('handles rapid send button presses', async () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, 'Test message');
      
      // Rapidly press send button multiple times
      fireEvent.press(sendButton);
      fireEvent.press(sendButton);
      fireEvent.press(sendButton);
      
      // Should only send once
      await waitFor(() => {
        expect(defaultProps.onSendMessage).toHaveBeenCalledTimes(1);
      });
    });

    it('handles component unmounting gracefully', () => {
      const { unmount } = render(<MessageInput {...defaultProps} />);
      
      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      
      const textInput = getByPlaceholderText('Type a message...');
      expect(textInput.props.accessibilityLabel).toBe('Message input');
      
      const sendButton = getByTestId('send-button');
      expect(sendButton.props.accessibilityLabel).toBe('Send message');
      
      const attachmentButton = getByTestId('attachment-button');
      expect(attachmentButton.props.accessibilityLabel).toBe('Attach file');
    });

    it('has proper accessibility hints', () => {
      const { getByTestId } = render(<MessageInput {...defaultProps} />);
      
      const sendButton = getByTestId('send-button');
      expect(sendButton.props.accessibilityHint).toBe('Double tap to send message');
    });

    it('has proper accessibility roles', () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      
      const textInput = getByPlaceholderText('Type a message...');
      expect(textInput.props.accessibilityRole).toBe('text');
      
      const sendButton = getByTestId('send-button');
      expect(sendButton.props.accessibilityRole).toBe('button');
    });

    it('announces when message is sent', async () => {
      const { getByPlaceholderText, getByTestId } = render(<MessageInput {...defaultProps} />);
      const textInput = getByPlaceholderText('Type a message...');
      const sendButton = getByTestId('send-button');
      
      fireEvent.changeText(textInput, 'Hello world');
      fireEvent.press(sendButton);
      
      // Should announce message sent for screen readers
      await waitFor(() => {
        expect(getByTestId('accessibility-announcement')).toBeTruthy();
      });
    });
  });
}); 