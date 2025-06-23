import { renderHook, waitFor, act } from '@testing-library/react-native';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Mock dependencies
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  dismissAllNotificationsAsync: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('../../../config/supabaseConfig', () => ({
  supabase: {
    from: jest.fn(() => ({
      upsert: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    })),
  },
}));

jest.mock('../../../context/authContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'user123',
      full_name: 'John Doe',
    },
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

import { supabase } from '../../../config/supabaseConfig';

describe('usePushNotifications Hook', () => {
  const mockPushToken = {
    data: 'ExponentPushToken[abc123]',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    Notifications.getPermissionsAsync.mockResolvedValue({
      status: 'granted',
      canAskAgain: true,
    });
    
    Notifications.requestPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    
    Notifications.getExpoPushTokenAsync.mockResolvedValue(mockPushToken);
    
    Device.isDevice = true;
  });

  describe('Initialization', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => usePushNotifications());

      expect(result.current.expoPushToken).toBe('');
      expect(result.current.notification).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.permissionStatus).toBe('undetermined');
    });

    it('sets notification handler on initialization', () => {
      renderHook(() => usePushNotifications());

      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith({
        handleNotification: expect.any(Function),
      });
    });

    it('checks device compatibility', async () => {
      Device.isDevice = false;

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.error).toBe('Must use physical device for Push Notifications');
      });
    });
  });

  describe('Permission Management', () => {
    it('checks existing permissions on mount', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      });

      expect(result.current.permissionStatus).toBe('granted');
    });

    it('requests permissions when not granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
      });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('handles permission denial gracefully', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
      });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('denied');
        expect(result.current.error).toBe('Push notification permissions were denied');
      });
    });

    it('retries permission request when canAskAgain is true', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
      });

      Notifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });
    });
  });

  describe('Token Management', () => {
    it('generates push token when permissions granted', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
      });

      expect(result.current.expoPushToken).toBe('ExponentPushToken[abc123]');
    });

    it('saves token to Supabase', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('users');
      });
    });

    it('handles token generation failure', async () => {
      Notifications.getExpoPushTokenAsync.mockRejectedValue(
        new Error('Token generation failed')
      );

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to get push token');
      });
    });

    it('refreshes token when requested', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.expoPushToken).toBe('ExponentPushToken[abc123]');
      });

      // Mock new token
      Notifications.getExpoPushTokenAsync.mockResolvedValue({
        data: 'ExponentPushToken[xyz789]',
      });

      await act(async () => {
        await result.current.refreshPushToken();
      });

      expect(result.current.expoPushToken).toBe('ExponentPushToken[xyz789]');
    });

    it('removes token from Supabase on cleanup', async () => {
      const { unmount } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalled();
      });

      unmount();

      // Should attempt to remove token
      await waitFor(() => {
        expect(supabase.from().delete).toHaveBeenCalled();
      });
    });
  });

  describe('Notification Handling', () => {
    it('sets up notification listeners', () => {
      renderHook(() => usePushNotifications());

      expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });

    it('handles received notifications', async () => {
      let notificationListener;
      
      Notifications.addNotificationReceivedListener.mockImplementation((callback) => {
        notificationListener = callback;
        return { remove: jest.fn() };
      });

      const { result } = renderHook(() => usePushNotifications());

      const mockNotification = {
        request: {
          content: {
            title: 'Test Notification',
            body: 'This is a test',
            data: { chatId: 'chat123' },
          },
        },
      };

      act(() => {
        notificationListener(mockNotification);
      });

      expect(result.current.notification).toEqual(mockNotification);
    });

    it('handles notification responses (taps)', async () => {
      let responseListener;
      
      Notifications.addNotificationResponseReceivedListener.mockImplementation((callback) => {
        responseListener = callback;
        return { remove: jest.fn() };
      });

      renderHook(() => usePushNotifications());

      const mockResponse = {
        notification: {
          request: {
            content: {
              title: 'Test Notification',
              data: { chatId: 'chat123', type: 'message' },
            },
          },
        },
        actionIdentifier: 'default',
      };

      act(() => {
        responseListener(mockResponse);
      });

      // Should navigate to chat
      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/chatRoom/chat123');
    });

    it('handles different notification types', async () => {
      let responseListener;
      
      Notifications.addNotificationResponseReceivedListener.mockImplementation((callback) => {
        responseListener = callback;
        return { remove: jest.fn() };
      });

      renderHook(() => usePushNotifications());

      const postNotification = {
        notification: {
          request: {
            content: {
              data: { postId: 'post123', type: 'post_like' },
            },
          },
        },
      };

      act(() => {
        responseListener(postNotification);
      });

      const { router } = require('expo-router');
      expect(router.push).toHaveBeenCalledWith('/postDetailView/post123');
    });

    it('provides function to clear all notifications', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await act(async () => {
        await result.current.clearAllNotifications();
      });

      expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('Test Notifications', () => {
    it('allows sending test notifications', async () => {
      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.expoPushToken).toBeTruthy();
      });

      await act(async () => {
        await result.current.sendTestNotification();
      });

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Notification 📱',
          body: 'This is a test notification from SocialZ!',
          data: { test: true },
        },
        trigger: { seconds: 2 },
      });
    });

    it('prevents sending test notifications without token', async () => {
      Notifications.getExpoPushTokenAsync.mockResolvedValue(null);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.expoPushToken).toBe('');
      });

      await act(async () => {
        await result.current.sendTestNotification();
      });

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('handles Supabase save errors gracefully', async () => {
      supabase.from.mockReturnValue({
        upsert: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to save push token');
      });
    });

    it('handles notification listener errors', async () => {
      Notifications.addNotificationReceivedListener.mockImplementation(() => {
        throw new Error('Listener setup failed');
      });

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('continues working after recoverable errors', async () => {
      // Simulate temporary network error
      Notifications.getExpoPushTokenAsync
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockPushToken);

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Retry should work
      await act(async () => {
        await result.current.refreshPushToken();
      });

      expect(result.current.expoPushToken).toBe('ExponentPushToken[abc123]');
      expect(result.current.error).toBeNull();
    });
  });

  describe('Platform Compatibility', () => {
    it('handles iOS specific behavior', async () => {
      // Mock iOS platform
      jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'ios',
        select: jest.fn((obj) => obj.ios),
      }));

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      });

      // iOS should work normally
      expect(result.current.permissionStatus).toBe('granted');
    });

    it('handles Android specific behavior', async () => {
      // Mock Android platform
      jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
        OS: 'android',
        select: jest.fn((obj) => obj.android),
      }));

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
      });

      // Android should work normally
      expect(result.current.permissionStatus).toBe('granted');
    });

    it('handles unsupported platforms', async () => {
      Device.isDevice = false;

      const { result } = renderHook(() => usePushNotifications());

      await waitFor(() => {
        expect(result.current.error).toBe('Must use physical device for Push Notifications');
      });
    });
  });

  describe('Memory Management', () => {
    it('removes listeners on unmount', () => {
      const mockRemove = jest.fn();
      
      Notifications.addNotificationReceivedListener.mockReturnValue({
        remove: mockRemove,
      });
      
      Notifications.addNotificationResponseReceivedListener.mockReturnValue({
        remove: mockRemove,
      });

      const { unmount } = renderHook(() => usePushNotifications());

      unmount();

      expect(mockRemove).toHaveBeenCalledTimes(2);
    });

    it('handles cleanup errors gracefully', () => {
      const mockRemove = jest.fn(() => {
        throw new Error('Cleanup error');
      });
      
      Notifications.addNotificationReceivedListener.mockReturnValue({
        remove: mockRemove,
      });

      const { unmount } = renderHook(() => usePushNotifications());

      // Should not throw error
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty notification data', async () => {
      let responseListener;
      
      Notifications.addNotificationResponseReceivedListener.mockImplementation((callback) => {
        responseListener = callback;
        return { remove: jest.fn() };
      });

      renderHook(() => usePushNotifications());

      const emptyResponse = {
        notification: {
          request: {
            content: {
              data: {},
            },
          },
        },
      };

      act(() => {
        responseListener(emptyResponse);
      });

      // Should handle gracefully without navigation
      const { router } = require('expo-router');
      expect(router.push).not.toHaveBeenCalled();
    });

    it('handles malformed notification data', async () => {
      let notificationListener;
      
      Notifications.addNotificationReceivedListener.mockImplementation((callback) => {
        notificationListener = callback;
        return { remove: jest.fn() };
      });

      const { result } = renderHook(() => usePushNotifications());

      const malformedNotification = {
        // Missing required structure
        invalid: 'data',
      };

      act(() => {
        notificationListener(malformedNotification);
      });

      // Should handle gracefully
      expect(result.current.notification).toEqual(malformedNotification);
    });

    it('handles rapid successive notifications', async () => {
      let notificationListener;
      
      Notifications.addNotificationReceivedListener.mockImplementation((callback) => {
        notificationListener = callback;
        return { remove: jest.fn() };
      });

      const { result } = renderHook(() => usePushNotifications());

      const notifications = Array.from({ length: 10 }, (_, i) => ({
        request: {
          content: {
            title: `Notification ${i}`,
            body: `Body ${i}`,
          },
        },
      }));

      // Send multiple notifications rapidly
      notifications.forEach((notification) => {
        act(() => {
          notificationListener(notification);
        });
      });

      // Should handle the last notification
      expect(result.current.notification.request.content.title).toBe('Notification 9');
    });
  });
}); 