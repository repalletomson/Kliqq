import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ChatItem from '../../../components/ChatItem';
import { router } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('../../../utiles/safeNavigation', () => ({
  safeNavigate: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../../utiles/dateFormat', () => ({
  formatMessageTime: jest.fn((timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }),
}));

describe('ChatItem Component', () => {
  const mockChatData = {
    id: 'chat123',
    participants: ['user1', 'user2'],
    lastMessage: {
      text: 'Hello, how are you?',
      timestamp: new Date('2024-01-15T10:30:00Z'),
      senderId: 'user2',
    },
    recipientData: {
      id: 'user2',
      full_name: 'John Doe',
      username: 'johndoe',
      profile_image: 'https://example.com/avatar.jpg',
      profile_initials: 'JD',
      isOnline: true,
    },
    unreadCount: 3,
  };

  const mockCurrentUser = {
    uid: 'user1',
    full_name: 'Jane Smith',
  };

  const defaultProps = {
    item: mockChatData,
    currentUser: mockCurrentUser,
    onPress: jest.fn(),
    onLongPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders chat item with basic information', () => {
      const { getByText, getByTestId } = render(<ChatItem {...defaultProps} />);

      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('Hello, how are you?')).toBeTruthy();
      expect(getByTestId('chat-item')).toBeTruthy();
    });

    it('renders profile image when available', () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      
      const profileImage = getByTestId('profile-image');
      expect(profileImage).toBeTruthy();
      expect(profileImage.props.source.uri).toBe('https://example.com/avatar.jpg');
    });

    it('renders profile initials when image is not available', () => {
      const propsWithoutImage = {
        ...defaultProps,
        item: {
          ...mockChatData,
          recipientData: {
            ...mockChatData.recipientData,
            profile_image: null,
          },
        },
      };

      const { getByText } = render(<ChatItem {...propsWithoutImage} />);
      expect(getByText('JD')).toBeTruthy();
    });

    it('shows online indicator when user is online', () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      expect(getByTestId('online-indicator')).toBeTruthy();
    });

    it('hides online indicator when user is offline', () => {
      const propsWithOfflineUser = {
        ...defaultProps,
        item: {
          ...mockChatData,
          recipientData: {
            ...mockChatData.recipientData,
            isOnline: false,
          },
        },
      };

      const { queryByTestId } = render(<ChatItem {...propsWithOfflineUser} />);
      expect(queryByTestId('online-indicator')).toBeNull();
    });

    it('displays unread count badge when there are unread messages', () => {
      const { getByText, getByTestId } = render(<ChatItem {...defaultProps} />);
      
      expect(getByTestId('unread-badge')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
    });

    it('hides unread count badge when there are no unread messages', () => {
      const propsWithoutUnread = {
        ...defaultProps,
        item: {
          ...mockChatData,
          unreadCount: 0,
        },
      };

      const { queryByTestId } = render(<ChatItem {...propsWithoutUnread} />);
      expect(queryByTestId('unread-badge')).toBeNull();
    });
  });

  describe('Message Display', () => {
    it('displays "You:" prefix for messages sent by current user', () => {
      const propsWithOwnMessage = {
        ...defaultProps,
        item: {
          ...mockChatData,
          lastMessage: {
            ...mockChatData.lastMessage,
            senderId: 'user1', // Current user
          },
        },
      };

      const { getByText } = render(<ChatItem {...propsWithOwnMessage} />);
      expect(getByText('You: Hello, how are you?')).toBeTruthy();
    });

    it('displays message without prefix for messages from other users', () => {
      const { getByText } = render(<ChatItem {...defaultProps} />);
      expect(getByText('Hello, how are you?')).toBeTruthy();
    });

    it('truncates long messages with ellipsis', () => {
      const propsWithLongMessage = {
        ...defaultProps,
        item: {
          ...mockChatData,
          lastMessage: {
            ...mockChatData.lastMessage,
            text: 'This is a very long message that should be truncated because it exceeds the maximum length allowed for display in the chat preview',
          },
        },
      };

      const { getByText } = render(<ChatItem {...propsWithLongMessage} />);
      const displayedText = getByText(/This is a very long message/);
      expect(displayedText.props.children.length).toBeLessThan(100);
    });

    it('handles encrypted messages', () => {
      const propsWithEncryptedMessage = {
        ...defaultProps,
        item: {
          ...mockChatData,
          lastMessage: {
            ...mockChatData.lastMessage,
            text: 'encrypted:U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIipRkwB0K1Y=',
            isEncrypted: true,
          },
        },
      };

      const { getByText } = render(<ChatItem {...propsWithEncryptedMessage} />);
      expect(getByText('🔒 Encrypted message')).toBeTruthy();
    });

    it('displays placeholder when no last message exists', () => {
      const propsWithoutLastMessage = {
        ...defaultProps,
        item: {
          ...mockChatData,
          lastMessage: null,
        },
      };

      const { getByText } = render(<ChatItem {...propsWithoutLastMessage} />);
      expect(getByText('No messages yet')).toBeTruthy();
    });
  });

  describe('Time Formatting', () => {
    it('displays formatted time for recent messages', () => {
      const { getByText } = render(<ChatItem {...defaultProps} />);
      expect(getByText('10:30')).toBeTruthy();
    });

    it('handles invalid timestamps gracefully', () => {
      const propsWithInvalidTime = {
        ...defaultProps,
        item: {
          ...mockChatData,
          lastMessage: {
            ...mockChatData.lastMessage,
            timestamp: 'invalid-date',
          },
        },
      };

      const { queryByText } = render(<ChatItem {...propsWithInvalidTime} />);
      // Should not crash and should handle gracefully
      expect(queryByText('Invalid Date')).toBeNull();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when chat item is pressed', () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      
      fireEvent.press(getByTestId('chat-item'));
      expect(defaultProps.onPress).toHaveBeenCalledWith(mockChatData);
    });

    it('calls onLongPress when chat item is long pressed', () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      
      fireEvent(getByTestId('chat-item'), 'onLongPress');
      expect(defaultProps.onLongPress).toHaveBeenCalledWith(mockChatData);
    });

    it('navigates to chat room when pressed', async () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      
      fireEvent.press(getByTestId('chat-item'));
      
      await waitFor(() => {
        expect(defaultProps.onPress).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing recipient data gracefully', () => {
      const propsWithoutRecipient = {
        ...defaultProps,
        item: {
          ...mockChatData,
          recipientData: null,
        },
      };

      const { getByText } = render(<ChatItem {...propsWithoutRecipient} />);
      expect(getByText('Unknown User')).toBeTruthy();
    });

    it('handles missing user names gracefully', () => {
      const propsWithoutName = {
        ...defaultProps,
        item: {
          ...mockChatData,
          recipientData: {
            ...mockChatData.recipientData,
            full_name: null,
            username: null,
          },
        },
      };

      const { getByText } = render(<ChatItem {...propsWithoutName} />);
      expect(getByText('Anonymous')).toBeTruthy();
    });

    it('handles very large unread counts', () => {
      const propsWithLargeUnread = {
        ...defaultProps,
        item: {
          ...mockChatData,
          unreadCount: 999,
        },
      };

      const { getByText } = render(<ChatItem {...propsWithLargeUnread} />);
      expect(getByText('99+')).toBeTruthy(); // Should cap at 99+
    });

    it('handles empty message text', () => {
      const propsWithEmptyMessage = {
        ...defaultProps,
        item: {
          ...mockChatData,
          lastMessage: {
            ...mockChatData.lastMessage,
            text: '',
          },
        },
      };

      const { getByText } = render(<ChatItem {...propsWithEmptyMessage} />);
      expect(getByText('Message')).toBeTruthy(); // Should show placeholder
    });

    it('handles special message types', () => {
      const propsWithImageMessage = {
        ...defaultProps,
        item: {
          ...mockChatData,
          lastMessage: {
            ...mockChatData.lastMessage,
            text: '',
            image: 'https://example.com/image.jpg',
            type: 'image',
          },
        },
      };

      const { getByText } = render(<ChatItem {...propsWithImageMessage} />);
      expect(getByText('📷 Image')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      
      const chatItem = getByTestId('chat-item');
      expect(chatItem.props.accessibilityLabel).toContain('Chat with John Doe');
      expect(chatItem.props.accessibilityHint).toContain('Double tap to open chat');
    });

    it('indicates unread messages in accessibility label', () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      
      const chatItem = getByTestId('chat-item');
      expect(chatItem.props.accessibilityLabel).toContain('3 unread messages');
    });

    it('has proper accessibility role', () => {
      const { getByTestId } = render(<ChatItem {...defaultProps} />);
      
      const chatItem = getByTestId('chat-item');
      expect(chatItem.props.accessibilityRole).toBe('button');
    });
  });
}); 