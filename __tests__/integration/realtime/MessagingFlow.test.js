import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useGroupMessages } from '../../../hooks/useGroupMessages';
import { firestore } from '../../../config/firebaseConfig';
import { supabase } from '../../../config/supabaseConfig';

// Mock real-time services
jest.mock('../../../config/firebaseConfig', () => ({
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    onSnapshot: jest.fn(),
    serverTimestamp: jest.fn(),
  },
}));

jest.mock('../../../config/supabaseConfig', () => ({
  supabase: {
    channel: jest.fn(),
    removeChannel: jest.fn(),
    from: jest.fn(),
  },
}));

jest.mock('../../../utiles/encryption', () => ({
  encryptMessage: jest.fn((text) => `encrypted:${text}`),
  decryptMessage: jest.fn((encrypted) => encrypted.replace('encrypted:', '')),
  generateKeyPair: jest.fn(() => ({
    publicKey: 'mockPublicKey',
    privateKey: 'mockPrivateKey',
  })),
}));

import { encryptMessage, decryptMessage } from '../../../utiles/encryption';

describe('Real-time Messaging Integration', () => {
  let mockChannel;
  let mockFirebaseUnsubscribe;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase real-time channel mock
    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn().mockResolvedValue({}),
    };

    supabase.channel.mockReturnValue(mockChannel);

    // Setup Firebase mock
    mockFirebaseUnsubscribe = jest.fn();
    firestore.onSnapshot.mockReturnValue(mockFirebaseUnsubscribe);

    // Setup encryption mocks
    encryptMessage.mockImplementation((text) => `encrypted:${text}`);
    decryptMessage.mockImplementation((encrypted) => encrypted.replace('encrypted:', ''));
  });

  describe('End-to-End Message Flow', () => {
    it('encrypts, sends, receives, and decrypts messages', async () => {
      const chatId = 'test-chat-123';
      let firebaseCallback;
      let supabaseCallback;

      // Setup Firebase listener
      firestore.onSnapshot.mockImplementation((query, callback) => {
        firebaseCallback = callback;
        return mockFirebaseUnsubscribe;
      });

      // Setup Supabase listener
      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'postgres_changes') {
          supabaseCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate sending a message
      const originalMessage = 'Hello, this is a secret message!';
      const encryptedMessage = encryptMessage(originalMessage);

      // Simulate Firebase real-time update
      const mockSnapshot = {
        docs: [{
          id: 'msg1',
          data: () => ({
            text: encryptedMessage,
            senderId: 'user123',
            timestamp: { toDate: () => new Date() },
            encrypted: true,
          }),
        }],
      };

      act(() => {
        firebaseCallback(mockSnapshot);
      });

      await waitFor(() => {
        const message = result.current.messages[0];
        expect(message.text).toBe(originalMessage); // Should be decrypted
        expect(encryptMessage).toHaveBeenCalledWith(originalMessage);
        expect(decryptMessage).toHaveBeenCalledWith(encryptedMessage);
      });
    });

    it('handles real-time presence updates', async () => {
      const chatId = 'test-chat-123';
      let presenceCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'presence') {
          presenceCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate user joining
      act(() => {
        presenceCallback({
          event: 'join',
          key: 'user123',
          currentPresences: {
            user123: [{ user_id: 'user123', online_at: new Date().toISOString() }],
            user456: [{ user_id: 'user456', online_at: new Date().toISOString() }],
          },
        });
      });

      await waitFor(() => {
        expect(result.current.onlineUsers).toEqual(['user123', 'user456']);
      });

      // Simulate user leaving
      act(() => {
        presenceCallback({
          event: 'leave',
          key: 'user456',
          currentPresences: {
            user123: [{ user_id: 'user123', online_at: new Date().toISOString() }],
          },
        });
      });

      await waitFor(() => {
        expect(result.current.onlineUsers).toEqual(['user123']);
      });
    });

    it('synchronizes typing indicators across users', async () => {
      const chatId = 'test-chat-123';
      let typingCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'broadcast') {
          typingCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate typing start
      act(() => {
        typingCallback({
          type: 'typing',
          payload: {
            user_id: 'user456',
            is_typing: true,
            user_name: 'Jane Doe',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.typingUsers).toContain('Jane Doe');
      });

      // Simulate typing stop
      act(() => {
        typingCallback({
          type: 'typing',
          payload: {
            user_id: 'user456',
            is_typing: false,
            user_name: 'Jane Doe',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.typingUsers).not.toContain('Jane Doe');
      });
    });
  });

  describe('Message Delivery and Ordering', () => {
    it('maintains correct message order with rapid updates', async () => {
      const chatId = 'test-chat-123';
      let firebaseCallback;

      firestore.onSnapshot.mockImplementation((query, callback) => {
        firebaseCallback = callback;
        return mockFirebaseUnsubscribe;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate rapid message updates
      const messages = [
        { id: 'msg1', text: 'First', timestamp: new Date('2024-01-01T10:00:00Z') },
        { id: 'msg2', text: 'Second', timestamp: new Date('2024-01-01T10:01:00Z') },
        { id: 'msg3', text: 'Third', timestamp: new Date('2024-01-01T10:02:00Z') },
      ];

      // Send messages in random order to test sorting
      const randomOrder = [messages[2], messages[0], messages[1]];
      
      const mockSnapshot = {
        docs: randomOrder.map(msg => ({
          id: msg.id,
          data: () => ({
            text: msg.text,
            senderId: 'user123',
            timestamp: { toDate: () => msg.timestamp },
          }),
        })),
      };

      act(() => {
        firebaseCallback(mockSnapshot);
      });

      await waitFor(() => {
        const resultMessages = result.current.messages;
        expect(resultMessages).toHaveLength(3);
        // Should be sorted by timestamp (newest first for display)
        expect(resultMessages[0].text).toBe('Third');
        expect(resultMessages[1].text).toBe('Second');
        expect(resultMessages[2].text).toBe('First');
      });
    });

    it('handles message delivery confirmations', async () => {
      const chatId = 'test-chat-123';
      let supabaseCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'postgres_changes') {
          supabaseCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate message delivery status update
      act(() => {
        supabaseCallback({
          eventType: 'UPDATE',
          new: {
            id: 'msg1',
            delivered_at: new Date().toISOString(),
            read_by: ['user456'],
          },
          old: {
            id: 'msg1',
            delivered_at: null,
            read_by: [],
          },
        });
      });

      await waitFor(() => {
        expect(result.current.messageStatuses['msg1']).toEqual({
          delivered: true,
          readBy: ['user456'],
        });
      });
    });

    it('handles message editing in real-time', async () => {
      const chatId = 'test-chat-123';
      let firebaseCallback;

      firestore.onSnapshot.mockImplementation((query, callback) => {
        firebaseCallback = callback;
        return mockFirebaseUnsubscribe;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Initial message
      const initialSnapshot = {
        docs: [{
          id: 'msg1',
          data: () => ({
            text: 'Original message',
            senderId: 'user123',
            timestamp: { toDate: () => new Date() },
            edited: false,
          }),
        }],
      };

      act(() => {
        firebaseCallback(initialSnapshot);
      });

      await waitFor(() => {
        expect(result.current.messages[0].text).toBe('Original message');
        expect(result.current.messages[0].edited).toBe(false);
      });

      // Edited message
      const editedSnapshot = {
        docs: [{
          id: 'msg1',
          data: () => ({
            text: 'Edited message',
            senderId: 'user123',
            timestamp: { toDate: () => new Date() },
            edited: true,
            editedAt: { toDate: () => new Date() },
          }),
        }],
      };

      act(() => {
        firebaseCallback(editedSnapshot);
      });

      await waitFor(() => {
        expect(result.current.messages[0].text).toBe('Edited message');
        expect(result.current.messages[0].edited).toBe(true);
      });
    });
  });

  describe('Group Messaging Features', () => {
    it('handles group member additions in real-time', async () => {
      const chatId = 'test-chat-123';
      let supabaseCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'postgres_changes' && callback.toString().includes('group_members')) {
          supabaseCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate new member joining
      act(() => {
        supabaseCallback({
          eventType: 'INSERT',
          new: {
            chat_id: chatId,
            user_id: 'user789',
            joined_at: new Date().toISOString(),
            role: 'member',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.groupMembers).toContainEqual(
          expect.objectContaining({
            user_id: 'user789',
            role: 'member',
          })
        );
      });
    });

    it('handles admin privilege changes', async () => {
      const chatId = 'test-chat-123';
      let supabaseCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'postgres_changes') {
          supabaseCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate role change
      act(() => {
        supabaseCallback({
          eventType: 'UPDATE',
          new: {
            chat_id: chatId,
            user_id: 'user456',
            role: 'admin',
          },
          old: {
            chat_id: chatId,
            user_id: 'user456',
            role: 'member',
          },
        });
      });

      await waitFor(() => {
        const member = result.current.groupMembers.find(m => m.user_id === 'user456');
        expect(member?.role).toBe('admin');
      });
    });

    it('synchronizes group settings changes', async () => {
      const chatId = 'test-chat-123';
      let supabaseCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'postgres_changes') {
          supabaseCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate group settings update
      act(() => {
        supabaseCallback({
          eventType: 'UPDATE',
          new: {
            id: chatId,
            name: 'New Group Name',
            description: 'Updated description',
            settings: {
              allowMessages: false,
              onlyAdminsCanPost: true,
            },
          },
          old: {
            id: chatId,
            name: 'Old Group Name',
            description: 'Old description',
            settings: {
              allowMessages: true,
              onlyAdminsCanPost: false,
            },
          },
        });
      });

      await waitFor(() => {
        expect(result.current.groupInfo.name).toBe('New Group Name');
        expect(result.current.groupInfo.settings.onlyAdminsCanPost).toBe(true);
      });
    });
  });

  describe('Connection Management', () => {
    it('handles connection drops gracefully', async () => {
      const chatId = 'test-chat-123';
      let connectionCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'system') {
          connectionCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate connection drop
      act(() => {
        connectionCallback({
          event: 'connection_lost',
          timestamp: new Date().toISOString(),
        });
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('disconnected');
      });

      // Simulate reconnection
      act(() => {
        connectionCallback({
          event: 'connection_restored',
          timestamp: new Date().toISOString(),
        });
      });

      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });
    });

    it('queues messages during disconnection', async () => {
      const chatId = 'test-chat-123';
      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate disconnection
      act(() => {
        result.current.setConnectionStatus('disconnected');
      });

      // Try to send message while disconnected
      act(() => {
        result.current.sendMessage('Message while offline');
      });

      await waitFor(() => {
        expect(result.current.queuedMessages).toHaveLength(1);
        expect(result.current.queuedMessages[0].text).toBe('Message while offline');
      });

      // Simulate reconnection
      act(() => {
        result.current.setConnectionStatus('connected');
      });

      await waitFor(() => {
        // Queued messages should be sent
        expect(result.current.queuedMessages).toHaveLength(0);
        expect(firestore.addDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            text: 'encrypted:Message while offline',
          })
        );
      });
    });

    it('handles duplicate message prevention', async () => {
      const chatId = 'test-chat-123';
      let firebaseCallback;

      firestore.onSnapshot.mockImplementation((query, callback) => {
        firebaseCallback = callback;
        return mockFirebaseUnsubscribe;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      const duplicateMessage = {
        id: 'msg1',
        data: () => ({
          text: 'Duplicate message',
          senderId: 'user123',
          timestamp: { toDate: () => new Date() },
          messageId: 'unique-msg-123',
        }),
      };

      // Send same message twice (simulate network retry)
      const mockSnapshot1 = { docs: [duplicateMessage] };
      const mockSnapshot2 = { docs: [duplicateMessage, duplicateMessage] };

      act(() => {
        firebaseCallback(mockSnapshot1);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      act(() => {
        firebaseCallback(mockSnapshot2);
      });

      await waitFor(() => {
        // Should still be 1 message (duplicate filtered)
        expect(result.current.messages).toHaveLength(1);
      });
    });
  });

  describe('Performance and Scalability', () => {
    it('handles large message volumes efficiently', async () => {
      const chatId = 'test-chat-123';
      let firebaseCallback;

      firestore.onSnapshot.mockImplementation((query, callback) => {
        firebaseCallback = callback;
        return mockFirebaseUnsubscribe;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate loading 1000 messages
      const largeMessageSet = {
        docs: Array.from({ length: 1000 }, (_, i) => ({
          id: `msg${i}`,
          data: () => ({
            text: `Message ${i}`,
            senderId: `user${i % 10}`,
            timestamp: { toDate: () => new Date(Date.now() - i * 1000) },
          }),
        })),
      };

      const startTime = performance.now();

      act(() => {
        firebaseCallback(largeMessageSet);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1000);
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Should process 1000 messages in reasonable time (< 100ms)
      expect(processingTime).toBeLessThan(100);
    });

    it('implements message pagination', async () => {
      const chatId = 'test-chat-123';
      const { result } = renderHook(() => useGroupMessages(chatId));

      // Load initial page
      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.messages).toHaveLength(20); // Default page size

      // Load more messages
      await act(async () => {
        await result.current.loadMoreMessages();
      });

      expect(result.current.messages).toHaveLength(40); // Additional page loaded
    });

    it('implements memory-efficient message cleanup', async () => {
      const chatId = 'test-chat-123';
      const { result } = renderHook(() => useGroupMessages(chatId));

      // Load many pages of messages
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          await result.current.loadMoreMessages();
        });
      }

      // Should maintain reasonable memory usage by cleaning old messages
      expect(result.current.messages.length).toBeLessThanOrEqual(100); // Max messages kept in memory
    });
  });

  describe('Error Recovery', () => {
    it('recovers from Firebase errors', async () => {
      const chatId = 'test-chat-123';
      let errorCallback;

      firestore.onSnapshot.mockImplementation((query, successCallback, error) => {
        errorCallback = error;
        return mockFirebaseUnsubscribe;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate Firebase error
      act(() => {
        errorCallback(new Error('Firebase connection failed'));
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Simulate recovery
      firestore.onSnapshot.mockImplementation((query, callback) => {
        setTimeout(() => callback({ docs: [] }), 0);
        return mockFirebaseUnsubscribe;
      });

      await act(async () => {
        await result.current.reconnect();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
        expect(result.current.connectionStatus).toBe('connected');
      });
    });

    it('recovers from Supabase errors', async () => {
      const chatId = 'test-chat-123';
      let supabaseErrorCallback;

      mockChannel.on.mockImplementation((event, callback) => {
        if (event === 'system') {
          supabaseErrorCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useGroupMessages(chatId));

      // Simulate Supabase error
      act(() => {
        supabaseErrorCallback({
          event: 'error',
          error: { message: 'Supabase connection failed' },
        });
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Simulate automatic recovery
      act(() => {
        supabaseErrorCallback({
          event: 'connection_restored',
          timestamp: new Date().toISOString(),
        });
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Cleanup', () => {
    it('properly cleans up all subscriptions', () => {
      const { unmount } = renderHook(() => useGroupMessages('test-chat'));

      unmount();

      expect(mockFirebaseUnsubscribe).toHaveBeenCalled();
      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });
  });
}); 