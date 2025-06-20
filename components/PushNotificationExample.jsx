import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { getCurrentUser, sendTestPushNotification, getPushNotificationLogs } from '../lib/supabase';

export default function PushNotificationExample() {
  const {
    expoPushToken,
    notification,
    checkNotificationPermissions,
    clearAllNotifications,
    sendTestNotification,
    refreshPushToken,
    removeTokenFromSupabase,
  } = usePushNotifications();

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserAndPermissions();
  }, []);

  const loadUserAndPermissions = async () => {
    try {
      // Get current user
      const user = await getCurrentUser();
      setCurrentUser(user);

      // Check notification permissions
      const hasPermissions = await checkNotificationPermissions();
      setIsNotificationsEnabled(hasPermissions);

      // Load notification logs (optional)
      if (user?.uid) {
        loadNotificationLogs();
      }
    } catch (error) {
      console.error('Error loading user and permissions:', error);
    }
  };

  const loadNotificationLogs = async () => {
    try {
      const logs = await getPushNotificationLogs(10);
      setNotificationLogs(logs);
    } catch (error) {
      console.error('Error loading notification logs:', error);
    }
  };

  const handleToggleNotifications = async (value) => {
    setLoading(true);
    try {
      if (value) {
        // Enable notifications
        const token = await refreshPushToken();
        if (token) {
          setIsNotificationsEnabled(true);
          Alert.alert('Success', 'Push notifications enabled!');
        }
      } else {
        // Disable notifications
        if (currentUser?.uid) {
          await removeTokenFromSupabase();
          setIsNotificationsEnabled(false);
          Alert.alert('Success', 'Push notifications disabled!');
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!currentUser?.uid) {
      Alert.alert('Error', 'You must be logged in to send test notifications');
      return;
    }

    try {
      setLoading(true);
      
      // Send a test notification to yourself
      await sendTestPushNotification(
        currentUser.uid,
        [currentUser.uid],
        'test'
      );
      
      Alert.alert('Success', 'Test notification sent! Check your device.');
      
      // Refresh logs
      loadNotificationLogs();
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Local test notification scheduled!');
    } catch (error) {
      console.error('Error sending local test notification:', error);
      Alert.alert('Error', 'Failed to send local test notification');
    }
  };

  const handleClearNotifications = async () => {
    try {
      await clearAllNotifications();
      Alert.alert('Success', 'All notifications cleared!');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
        Push Notifications
      </Text>

      {/* User Info */}
      <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#f3f4f6', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>User Info</Text>
        <Text style={{ color: '#6b7280' }}>
          User ID: {currentUser?.uid || 'Not logged in'}
        </Text>
        <Text style={{ color: '#6b7280' }}>
          Name: {currentUser?.displayName || 'N/A'}
        </Text>
      </View>

      {/* Push Token Info */}
      <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#dbeafe', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Push Token Status</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
          Token: {expoPushToken ? 'Active' : 'Not available'}
        </Text>
        {expoPushToken && (
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>
            {expoPushToken.substring(0, 50)}...
          </Text>
        )}
      </View>

      {/* Notification Settings */}
      <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#dcfce7', borderRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600' }}>Enable Notifications</Text>
          <Switch
            value={isNotificationsEnabled}
            onValueChange={handleToggleNotifications}
            disabled={loading}
          />
        </View>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>
          Get notified when someone likes your posts, comments, or replies to your comments.
        </Text>
      </View>

      {/* Latest Notification */}
      {notification && (
        <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#fefce8', borderRadius: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Latest Notification</Text>
          <Text style={{ fontWeight: '500' }}>{notification.request.content.title}</Text>
          <Text style={{ color: '#6b7280' }}>{notification.request.content.body}</Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Received: {new Date(notification.date).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Test Controls */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Test Controls</Text>
        
        <TouchableOpacity
          style={{ 
            backgroundColor: loading || !isNotificationsEnabled ? '#9ca3af' : '#3b82f6', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 12 
          }}
          onPress={handleSendTestNotification}
          disabled={loading || !isNotificationsEnabled}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '500' }}>
            {loading ? 'Sending...' : 'Send Test Push Notification'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ 
            backgroundColor: loading ? '#9ca3af' : '#10b981', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 12 
          }}
          onPress={handleLocalTestNotification}
          disabled={loading}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '500' }}>
            Send Local Test Notification
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ 
            backgroundColor: loading ? '#9ca3af' : '#f59e0b', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 12 
          }}
          onPress={refreshPushToken}
          disabled={loading}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '500' }}>
            Refresh Push Token
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ 
            backgroundColor: loading ? '#9ca3af' : '#ef4444', 
            padding: 12, 
            borderRadius: 8 
          }}
          onPress={handleClearNotifications}
          disabled={loading}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '500' }}>
            Clear All Notifications
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification Logs */}
      {notificationLogs.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Recent Notification Logs</Text>
          {notificationLogs.slice(0, 5).map((log, index) => (
            <View key={log.id || index} style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text style={{ fontWeight: '500', textTransform: 'capitalize' }}>{log.type}</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                  {new Date(log.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                Sent: {log.total_sent} | Errors: {log.total_errors}
              </Text>
              {log.affected_user_ids && (
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>
                  Users: {log.affected_user_ids.length}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#f3e8ff', borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>How It Works</Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
          1. Enable notifications above to register your device
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
          2. When someone likes your posts or comments, you'll get notified
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
          3. Tap on notifications to navigate to the relevant content
        </Text>
        <Text style={{ fontSize: 14, color: '#6b7280' }}>
          4. Use test buttons to verify everything works
        </Text>
      </View>
    </ScrollView>
  );
} 