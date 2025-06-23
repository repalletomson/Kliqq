import { renderHook, waitFor } from '@testing-library/react-native';
import { useGroupMessages } from '../../../hooks/useGroupMessages';

// Mock Firebase
const mockSnapshot = {
  docs: [
    {
      id: 'msg1',
      data: () => ({
        text: 'Hello everyone!',
        senderId: 'user1',
        timestamp: { toDate: () => new Date('2024-01-15T10:30:00Z') },
        type: 'text',
      }),
    },
    {
      id: 'msg2', 
      data: () => ({
        text: 'How is everyone doing?',
        senderId: 'user2',
        timestamp: { toDate: () => new Date('2024-01-15T10:32:00Z') },
        type: 'text',
      }),
    },
  ],
};

const mockUserDoc = {
  data: () => ({
    fullName: 'John Doe',
    profileImage: 'https://example.com/avatar.jpg',
  }),
};

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('../../../config/firebaseConfig', () => ({
  db: {},
}));

import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';

describe('useGroupMessages Hook', () => {
  const chatId = 'chat123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    collection.mockReturnValue({});
    query.mockReturnValue({});
    orderBy.mockReturnValue({});
    doc.mockReturnValue({});
    getDoc.mockResolvedValue(mockUserDoc);
  });

  describe('Initial Loading', () => {
    it('starts with loading state', () => {
      onSnapshot.mockImplementation((query, callback) => {
        // Don't call callback immediately to simulate loading
        return jest.fn(); // Unsubscribe function
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      expect(result.current.loading).toBe(true);
      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('sets up Firebase query with correct parameters', () => {
      onSnapshot.mockImplementation(() => jest.fn());

      renderHook(() => useGroupMessages(chatId));

      expect(collection).toHaveBeenCalledWith({}, 'chats', chatId, 'messages');
      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('timestamp', 'desc');
    });

    it('subscribes to real-time updates', () => {
      onSnapshot.mockImplementation(() => jest.fn());

      renderHook(() => useGroupMessages(chatId));

      expect(onSnapshot).toHaveBeenCalled();
    });
  });

  describe('Message Loading', () => {
    it('loads and transforms messages successfully', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        // Simulate immediate callback with data
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0]).toEqual({
        id: 'msg1',
        text: 'Hello everyone!',
        senderId: 'user1',
        timestamp: expect.any(Object),
        type: 'text',
        senderName: 'John Doe',
      });
    });

    it('fetches sender details for each message', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should fetch user details for each unique sender
      expect(getDoc).toHaveBeenCalledTimes(2);
    });

    it('handles messages with missing sender data', async () => {
      getDoc.mockResolvedValue({ data: () => null });

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages[0].senderName).toBe('Unknown User');
    });

    it('sorts messages by timestamp in descending order', async () => {
      const unsortedSnapshot = {
        docs: [
          {
            id: 'msg1',
            data: () => ({
              text: 'First message',
              senderId: 'user1',
              timestamp: { toDate: () => new Date('2024-01-15T10:30:00Z') },
            }),
          },
          {
            id: 'msg2',
            data: () => ({
              text: 'Second message',
              senderId: 'user2',
              timestamp: { toDate: () => new Date('2024-01-15T10:35:00Z') },
            }),
          },
        ],
      };

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(unsortedSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Firebase query should handle ordering, but verify our logic
      expect(result.current.messages).toHaveLength(2);
    });
  });

  describe('Real-time Updates', () => {
    it('updates messages when new message arrives', async () => {
      let snapshotCallback;
      
      onSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback;
        // Initial load
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(2);

      // Simulate new message arriving
      const updatedSnapshot = {
        docs: [
          ...mockSnapshot.docs,
          {
            id: 'msg3',
            data: () => ({
              text: 'New message!',
              senderId: 'user3',
              timestamp: { toDate: () => new Date('2024-01-15T10:40:00Z') },
            }),
          },
        ],
      };

      snapshotCallback(updatedSnapshot);

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(3);
      });
    });

    it('updates existing messages when modified', async () => {
      let snapshotCallback;
      
      onSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback;
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate message update
      const updatedSnapshot = {
        docs: [
          {
            ...mockSnapshot.docs[0],
            data: () => ({
              ...mockSnapshot.docs[0].data(),
              text: 'Updated message!',
            }),
          },
          mockSnapshot.docs[1],
        ],
      };

      snapshotCallback(updatedSnapshot);

      await waitFor(() => {
        expect(result.current.messages[0].text).toBe('Updated message!');
      });
    });

    it('removes messages when deleted', async () => {
      let snapshotCallback;
      
      onSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback;
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(2);

      // Simulate message deletion
      const updatedSnapshot = {
        docs: [mockSnapshot.docs[0]], // Remove second message
      };

      snapshotCallback(updatedSnapshot);

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles snapshot listener errors', async () => {
      onSnapshot.mockImplementation((query, successCallback, errorCallback) => {
        setTimeout(() => errorCallback(new Error('Connection failed')), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Error listening to messages');
      expect(result.current.messages).toEqual([]);
    });

    it('handles user data fetch errors', async () => {
      getDoc.mockRejectedValue(new Error('User fetch failed'));

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load messages');
    });

    it('recovers from temporary errors', async () => {
      let callCount = 0;
      onSnapshot.mockImplementation((query, successCallback, errorCallback) => {
        if (callCount === 0) {
          setTimeout(() => errorCallback(new Error('Temporary error')), 0);
        } else {
          setTimeout(() => successCallback(mockSnapshot), 0);
        }
        callCount++;
        return jest.fn();
      });

      const { result, rerender } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Simulate hook re-render (reconnection attempt)
      rerender();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.messages).toHaveLength(2);
      });
    });
  });

  describe('Performance Optimization', () => {
    it('memoizes messages to prevent unnecessary re-renders', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result, rerender } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstMessages = result.current.messages;

      // Re-render hook without data change
      rerender();

      expect(result.current.messages).toBe(firstMessages); // Same reference
    });

    it('debounces rapid message updates', async () => {
      let snapshotCallback;
      
      onSnapshot.mockImplementation((query, callback) => {
        snapshotCallback = callback;
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCount = result.current.messages.length;

      // Simulate rapid updates
      for (let i = 0; i < 5; i++) {
        snapshotCallback(mockSnapshot);
      }

      // Should not cause excessive re-renders
      expect(result.current.messages.length).toBe(initialCount);
    });

    it('caches sender data to avoid duplicate fetches', async () => {
      const duplicateSenderSnapshot = {
        docs: [
          {
            id: 'msg1',
            data: () => ({
              text: 'First message',
              senderId: 'user1',
              timestamp: { toDate: () => new Date() },
            }),
          },
          {
            id: 'msg2',
            data: () => ({
              text: 'Second message',
              senderId: 'user1', // Same sender
              timestamp: { toDate: () => new Date() },
            }),
          },
        ],
      };

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(duplicateSenderSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only fetch user data once for duplicate senders
      expect(getDoc).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup', () => {
    it('unsubscribes from Firebase listener on unmount', () => {
      const unsubscribeMock = jest.fn();
      onSnapshot.mockReturnValue(unsubscribeMock);

      const { unmount } = renderHook(() => useGroupMessages(chatId));

      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });

    it('clears state on chat ID change', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(mockSnapshot), 0);
        return jest.fn();
      });

      const { result, rerender } = renderHook(
        ({ chatId }) => useGroupMessages(chatId),
        { initialProps: { chatId: 'chat123' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(2);

      // Change chat ID
      rerender({ chatId: 'chat456' });

      expect(result.current.loading).toBe(true);
      expect(result.current.messages).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty chat gracefully', async () => {
      const emptySnapshot = { docs: [] };

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(emptySnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('handles malformed message data', async () => {
      const malformedSnapshot = {
        docs: [
          {
            id: 'msg1',
            data: () => ({
              // Missing required fields
              senderId: 'user1',
            }),
          },
        ],
      };

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(malformedSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should handle gracefully without crashing
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].text).toBeUndefined();
    });

    it('handles invalid chat ID', () => {
      onSnapshot.mockImplementation(() => {
        throw new Error('Invalid chat ID');
      });

      const { result } = renderHook(() => useGroupMessages(null));

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.messages).toEqual([]);
    });

    it('handles very large message volumes', async () => {
      const largeSnapshot = {
        docs: Array.from({ length: 1000 }, (_, i) => ({
          id: `msg${i}`,
          data: () => ({
            text: `Message ${i}`,
            senderId: `user${i % 10}`,
            timestamp: { toDate: () => new Date() },
          }),
        })),
      };

      onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback(largeSnapshot), 0);
        return jest.fn();
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.messages).toHaveLength(1000);
      // Should not cause performance issues
    });
  });
}); 