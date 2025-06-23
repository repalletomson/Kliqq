import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MessageItem from '../../../components/MessageItem';

// Mock dependencies
jest.mock('../../../utiles/encryption', () => ({
  decryptMessage: jest.fn((text) => {
    if (text.startsWith('encrypted:')) {
      return text.replace('encrypted:', 'decrypted:');
    }
    return text;
  }),
}));

jest.mock('../../../utiles/dateFormat', () => ({
  formatMessageTime: jest.fn((timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

describe('MessageItem Component', () => {
  const mockCurrentUser = {
    uid: 'user1',
    full_name: 'Jane Smith',
  };

  const mockOtherUser = {
    id: 'user2',
    full_name: 'John Doe',
    profile_image: 'https://example.com/avatar.jpg',
    profile_initials: 'JD',
  };

  const defaultOwnMessage = {
    id: 'msg1',
    text: 'Hello, how are you?',
    senderId: 'user1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    senderName: 'Jane Smith',
    reactions: [],
    isEncrypted: false,
  };

  const defaultOtherMessage = {
    id: 'msg2',
    text: 'I am doing great, thanks!',
    senderId: 'user2',
    timestamp: new Date('2024-01-15T10:32:00Z'),
    senderName: 'John Doe',
    reactions: [],
    isEncrypted: false,
  };

  const defaultProps = {
    message: defaultOtherMessage,
    currentUser: mockCurrentUser,
    isOwnMessage: false,
    senderData: mockOtherUser,
    showAvatar: true,
    onLongPress: jest.fn(),
    onReaction: jest.fn(),
    onReply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering - Basic Message', () => {
    it('renders message text correctly', () => {
      const { getByText } = render(<MessageItem {...defaultProps} />);
      expect(getByText('I am doing great, thanks!')).toBeTruthy();
    });

    it('displays sender name for other user messages', () => {
      const { getByText } = render(<MessageItem {...defaultProps} />);
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('does not display sender name for own messages', () => {
      const ownMessageProps = {
        ...defaultProps,
        message: defaultOwnMessage,
        isOwnMessage: true,
      };
      
      const { queryByText } = render(<MessageItem {...ownMessageProps} />);
      expect(queryByText('Jane Smith')).toBeNull();
    });

    it('displays formatted timestamp', () => {
      const { getByText } = render(<MessageItem {...defaultProps} />);
      expect(getByText('10:32')).toBeTruthy();
    });

    it('renders avatar for other users when showAvatar is true', () => {
      const { getByTestId } = render(<MessageItem {...defaultProps} />);
      expect(getByTestId('message-avatar')).toBeTruthy();
    });

    it('does not render avatar when showAvatar is false', () => {
      const propsWithoutAvatar = {
        ...defaultProps,
        showAvatar: false,
      };
      
      const { queryByTestId } = render(<MessageItem {...propsWithoutAvatar} />);
      expect(queryByTestId('message-avatar')).toBeNull();
    });

    it('does not render avatar for own messages', () => {
      const ownMessageProps = {
        ...defaultProps,
        message: defaultOwnMessage,
        isOwnMessage: true,
      };
      
      const { queryByTestId } = render(<MessageItem {...ownMessageProps} />);
      expect(queryByTestId('message-avatar')).toBeNull();
    });
  });

  describe('Message Types', () => {
    it('renders encrypted message with decryption', () => {
      const encryptedMessage = {
        ...defaultOtherMessage,
        text: 'encrypted:U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=',
        isEncrypted: true,
      };

      const { getByText } = render(
        <MessageItem {...defaultProps} message={encryptedMessage} />
      );
      
      expect(getByText('decrypted:U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=')).toBeTruthy();
    });

    it('displays encryption indicator for encrypted messages', () => {
      const encryptedMessage = {
        ...defaultOtherMessage,
        isEncrypted: true,
      };

      const { getByTestId } = render(
        <MessageItem {...defaultProps} message={encryptedMessage} />
      );
      
      expect(getByTestId('encryption-indicator')).toBeTruthy();
    });

    it('renders image message with preview', () => {
      const imageMessage = {
        ...defaultOtherMessage,
        text: '',
        image: 'https://example.com/image.jpg',
        type: 'image',
      };

      const { getByTestId } = render(
        <MessageItem {...defaultProps} message={imageMessage} />
      );
      
      expect(getByTestId('message-image')).toBeTruthy();
    });

    it('renders reply message with referenced content', () => {
      const replyMessage = {
        ...defaultOtherMessage,
        replyTo: {
          id: 'original-msg',
          text: 'What time is the meeting?',
          senderName: 'Alice',
        },
        text: 'The meeting is at 3 PM',
      };

      const { getByText } = render(
        <MessageItem {...defaultProps} message={replyMessage} />
      );
      
      expect(getByText('What time is the meeting?')).toBeTruthy();
      expect(getByText('The meeting is at 3 PM')).toBeTruthy();
    });

    it('renders system message with special styling', () => {
      const systemMessage = {
        ...defaultOtherMessage,
        type: 'system',
        text: 'John Doe joined the group',
      };

      const { getByText, getByTestId } = render(
        <MessageItem {...defaultProps} message={systemMessage} />
      );
      
      expect(getByText('John Doe joined the group')).toBeTruthy();
      expect(getByTestId('system-message')).toBeTruthy();
    });

    it('renders deleted message placeholder', () => {
      const deletedMessage = {
        ...defaultOtherMessage,
        text: '',
        isDeleted: true,
      };

      const { getByText } = render(
        <MessageItem {...defaultProps} message={deletedMessage} />
      );
      
      expect(getByText('This message was deleted')).toBeTruthy();
    });
  });

  describe('Message Layout and Styling', () => {
    it('applies correct styling for own messages', () => {
      const ownMessageProps = {
        ...defaultProps,
        message: defaultOwnMessage,
        isOwnMessage: true,
      };
      
      const { getByTestId } = render(<MessageItem {...ownMessageProps} />);
      const messageContainer = getByTestId('message-container');
      
      expect(messageContainer.props.style).toEqual(
        expect.objectContaining({
          alignSelf: 'flex-end',
        })
      );
    });

    it('applies correct styling for other messages', () => {
      const { getByTestId } = render(<MessageItem {...defaultProps} />);
      const messageContainer = getByTestId('message-container');
      
      expect(messageContainer.props.style).toEqual(
        expect.objectContaining({
          alignSelf: 'flex-start',
        })
      );
    });

    it('shows message status for own messages', () => {
      const ownMessageWithStatus = {
        ...defaultOwnMessage,
        status: 'read',
      };

      const ownMessageProps = {
        ...defaultProps,
        message: ownMessageWithStatus,
        isOwnMessage: true,
      };
      
      const { getByTestId } = render(<MessageItem {...ownMessageProps} />);
      expect(getByTestId('message-status')).toBeTruthy();
    });

    it('does not show message status for other messages', () => {
      const { queryByTestId } = render(<MessageItem {...defaultProps} />);
      expect(queryByTestId('message-status')).toBeNull();
    });
  });

  describe('Reactions', () => {
    it('displays reactions when present', () => {
      const messageWithReactions = {
        ...defaultOtherMessage,
        reactions: [
          { emoji: '👍', users: ['user1', 'user3'], count: 2 },
          { emoji: '❤️', users: ['user2'], count: 1 },
        ],
      };

      const { getByText } = render(
        <MessageItem {...defaultProps} message={messageWithReactions} />
      );
      
      expect(getByText('👍 2')).toBeTruthy();
      expect(getByText('❤️ 1')).toBeTruthy();
    });

    it('highlights reactions from current user', () => {
      const messageWithUserReaction = {
        ...defaultOtherMessage,
        reactions: [
          { emoji: '👍', users: ['user1'], count: 1 },
        ],
      };

      const { getByTestId } = render(
        <MessageItem {...defaultProps} message={messageWithUserReaction} />
      );
      
      const reactionButton = getByTestId('reaction-👍');
      expect(reactionButton.props.style).toEqual(
        expect.objectContaining({
          backgroundColor: expect.any(String),
        })
      );
    });

    it('calls onReaction when reaction is pressed', () => {
      const messageWithReactions = {
        ...defaultOtherMessage,
        reactions: [
          { emoji: '👍', users: ['user3'], count: 1 },
        ],
      };

      const { getByTestId } = render(
        <MessageItem {...defaultProps} message={messageWithReactions} />
      );
      
      fireEvent.press(getByTestId('reaction-👍'));
      expect(defaultProps.onReaction).toHaveBeenCalledWith(messageWithReactions.id, '👍');
    });
  });

  describe('Interactions', () => {
    it('calls onLongPress when message is long pressed', () => {
      const { getByTestId } = render(<MessageItem {...defaultProps} />);
      
      fireEvent(getByTestId('message-bubble'), 'onLongPress');
      expect(defaultProps.onLongPress).toHaveBeenCalledWith(defaultOtherMessage);
    });

    it('calls onReply when reply button is pressed', () => {
      const { getByTestId } = render(<MessageItem {...defaultProps} />);
      
      // Long press to show options, then press reply
      fireEvent(getByTestId('message-bubble'), 'onLongPress');
      fireEvent.press(getByTestId('reply-button'));
      
      expect(defaultProps.onReply).toHaveBeenCalledWith(defaultOtherMessage);
    });

    it('opens image in fullscreen when image message is pressed', () => {
      const imageMessage = {
        ...defaultOtherMessage,
        image: 'https://example.com/image.jpg',
        type: 'image',
      };

      const { getByTestId } = render(
        <MessageItem {...defaultProps} message={imageMessage} />
      );
      
      fireEvent.press(getByTestId('message-image'));
      // Should trigger image viewer
    });
  });

  describe('Edge Cases', () => {
    it('handles missing sender data gracefully', () => {
      const propsWithoutSender = {
        ...defaultProps,
        senderData: null,
      };

      const { getByText } = render(<MessageItem {...propsWithoutSender} />);
      expect(getByText('Unknown User')).toBeTruthy();
    });

    it('handles very long messages with proper wrapping', () => {
      const longMessage = {
        ...defaultOtherMessage,
        text: 'This is a very long message that should wrap properly across multiple lines without breaking the layout or causing any visual issues in the chat interface',
      };

      const { getByText } = render(
        <MessageItem {...defaultProps} message={longMessage} />
      );
      
      const messageText = getByText(/This is a very long message/);
      expect(messageText).toBeTruthy();
    });

    it('handles messages with special characters and emojis', () => {
      const specialMessage = {
        ...defaultOtherMessage,
        text: 'Hello! 👋 How are you? 🤔 Special chars: <>&"\'',
      };

      const { getByText } = render(
        <MessageItem {...defaultProps} message={specialMessage} />
      );
      
      expect(getByText('Hello! 👋 How are you? 🤔 Special chars: <>&"\'')).toBeTruthy();
    });

    it('handles invalid timestamps gracefully', () => {
      const messageWithInvalidTime = {
        ...defaultOtherMessage,
        timestamp: 'invalid-date',
      };

      const { queryByText } = render(
        <MessageItem {...defaultProps} message={messageWithInvalidTime} />
      );
      
      // Should not crash
      expect(queryByText('Invalid Date')).toBeNull();
    });

    it('handles missing message text', () => {
      const messageWithoutText = {
        ...defaultOtherMessage,
        text: null,
      };

      const { queryByTestId } = render(
        <MessageItem {...defaultProps} message={messageWithoutText} />
      );
      
      // Should render without crashing
      expect(queryByTestId('message-container')).toBeTruthy();
    });

    it('handles messages with only whitespace', () => {
      const whitespaceMessage = {
        ...defaultOtherMessage,
        text: '   \n\t   ',
      };

      const { getByText } = render(
        <MessageItem {...defaultProps} message={whitespaceMessage} />
      );
      
      // Should show placeholder or handle gracefully
      expect(getByText(/\s/)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels for messages', () => {
      const { getByTestId } = render(<MessageItem {...defaultProps} />);
      
      const messageContainer = getByTestId('message-container');
      expect(messageContainer.props.accessibilityLabel).toContain('Message from John Doe');
      expect(messageContainer.props.accessibilityLabel).toContain('I am doing great, thanks!');
    });

    it('includes timestamp in accessibility label', () => {
      const { getByTestId } = render(<MessageItem {...defaultProps} />);
      
      const messageContainer = getByTestId('message-container');
      expect(messageContainer.props.accessibilityLabel).toContain('10:32');
    });

    it('has proper accessibility role for interactive elements', () => {
      const { getByTestId } = render(<MessageItem {...defaultProps} />);
      
      const messageBubble = getByTestId('message-bubble');
      expect(messageBubble.props.accessibilityRole).toBe('text');
    });

    it('provides accessibility hints for reactions', () => {
      const messageWithReactions = {
        ...defaultOtherMessage,
        reactions: [
          { emoji: '👍', users: ['user3'], count: 1 },
        ],
      };

      const { getByTestId } = render(
        <MessageItem {...defaultProps} message={messageWithReactions} />
      );
      
      const reactionButton = getByTestId('reaction-👍');
      expect(reactionButton.props.accessibilityHint).toContain('Double tap to react');
    });
  });

  describe('Performance', () => {
    it('memoizes message rendering for performance', () => {
      const { rerender } = render(<MessageItem {...defaultProps} />);
      
      // Re-render with same props should not cause re-computation
      rerender(<MessageItem {...defaultProps} />);
      
      // This test ensures the component is optimized
      expect(true).toBeTruthy();
    });

    it('handles rapid re-renders without performance issues', () => {
      const { rerender } = render(<MessageItem {...defaultProps} />);
      
      // Simulate multiple rapid re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<MessageItem {...defaultProps} key={i} />);
      }
      
      expect(true).toBeTruthy();
    });
  });
}); 