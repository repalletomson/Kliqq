import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
  ScrollView,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { useSafeNavigation } from '../../hooks/useSafeNavigation';
import { supabase } from '../../config/supabaseConfig';

const COLORS = {
  background: '#000000',
  cardBg: '#111111',
  text: '#FFFFFF',
  textSecondary: '#E5E5E5',
  textMuted: '#A1A1AA',
  inputBg: '#1A1A1A',
  accent: '#8B5CF6',
  danger: '#EF4444',
  border: 'rgba(255, 255, 255, 0.1)',
};

const SettingsPage = () => {
  const router = useRouter();
  const { loginOut, user } = useAuth();
  const { safeBack } = useSafeNavigation({
    modals: [
      () => modalConfig.visible && setModalConfig({ visible: false, title: '', content: '' })
    ],
    onCleanup: () => {
      setModalConfig({ visible: false, title: '', content: '' });
    }
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [modalConfig, setModalConfig] = useState({ visible: false, title: '', content: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await loginOut();
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const showModal = (title, content) => {
    setModalConfig({ visible: true, title, content });
  };

  const hideModal = () => {
    setModalConfig({ visible: false, title: '', content: '' });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // 1. Delete user data from your tables (posts, comments, likes, etc.)
      // Example for Supabase:
      if (user?.uid) {
        await supabase.from('likes').delete().eq('user_id', user.uid);
        await supabase.from('comments').delete().eq('user_id', user.uid);
        await supabase.from('posts').delete().eq('user_id', user.uid);
        await supabase.from('users').delete().eq('id', user.uid);
      }
      // 2. Delete user from auth
      if (supabase.auth) {
        await supabase.auth.admin.deleteUser(user.uid);
      }
      // 3. Log out
      await loginOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
      setDeleting(false);
      return;
    }
    setDeleting(false);
    setShowDeleteModal(false);
  };

  const renderSettingItem = ({ icon, title, onPress, value, isSwitch, isLast, isDestructive }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: COLORS.cardBg,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.border,
      }}
    >
      <Ionicons 
        name={icon} 
        size={22} 
        color={isDestructive ? COLORS.danger : COLORS.accent} 
      />
      <Text style={{
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        color: isDestructive ? COLORS.danger : COLORS.text,
        fontWeight: isDestructive ? '600' : '400',
      }}>
        {title}
      </Text>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#333', true: `${COLORS.accent}80` }}
          thumbColor={value ? COLORS.accent : '#f4f3f4'}
        />
      ) : (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={isDestructive ? COLORS.danger : COLORS.textMuted} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 20,
        paddingBottom: 16,
      }}>
        <TouchableOpacity
          onPress={safeBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          fontSize: 24,
          fontWeight: '700',
          color: COLORS.text,
          marginLeft: 12,
        }}>
          Settings
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: COLORS.textMuted,
            marginLeft: 20,
            marginBottom: 8,
          }}>
            Account
          </Text>
          <View style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}>
            {renderSettingItem({
              icon: 'notifications-outline',
              title: 'Notifications',
              onPress: () => setNotificationsEnabled(!notificationsEnabled),
              value: notificationsEnabled,
              isSwitch: true,
            })}
            {renderSettingItem({
              icon: 'shield-checkmark-outline',
              title: 'Privacy',
              onPress: () => showModal('Privacy Settings', 'Configure your privacy preferences here.'),
            })}
            {renderSettingItem({
              icon: 'lock-closed-outline',
              title: 'Security',
              onPress: () => showModal('Security Settings', 'Configure your security preferences here.'),
              isLast: true,
            })}
          </View>
        </View>

        {/* Support Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: COLORS.textMuted,
            marginLeft: 20,
            marginBottom: 8,
          }}>
            Support
          </Text>
          <View style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}>
            {renderSettingItem({
              icon: 'help-circle-outline',
              title: 'Help & Support',
              onPress: () => showModal('Help & Support', 'Need help? Contact us or view our FAQs.'),
            })}
            {renderSettingItem({
              icon: 'information-circle-outline',
              title: 'About Us',
              onPress: () => showModal('About Us', 'Learn more about our app and team.'),
              isLast: true,
            })}
          </View>
        </View>

        {/* Delete Account Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{
            backgroundColor: COLORS.cardBg,
            borderRadius: 12,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}>
            {renderSettingItem({
              icon: 'trash-outline',
              title: 'Delete Account',
              onPress: () => setShowDeleteModal(true),
              isDestructive: true,
              isLast: false,
            })}
            {renderSettingItem({
              icon: 'log-out-outline',
              title: 'Logout',
              onPress: handleLogout,
              isDestructive: true,
              isLast: true,
            })}
          </View>
        </View>
      </ScrollView>

      {/* Single Modal for all settings */}
      <Modal
        visible={modalConfig.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={hideModal}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}>
          <View style={{
            backgroundColor: COLORS.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            minHeight: '50%',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <TouchableOpacity onPress={hideModal}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <Text style={{
                color: COLORS.text,
                fontSize: 20,
                fontWeight: '600',
                marginLeft: 15,
              }}>
                {modalConfig.title}
              </Text>
            </View>
            
            <View style={{ gap: 16 }}>
              <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>
                {modalConfig.content}
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 28, width: '80%' }}>
            <Text style={{ color: COLORS.danger, fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' }}>
              Delete Account
            </Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.inputBg, marginRight: 8, alignItems: 'center' }}
                disabled={deleting}
              >
                <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: COLORS.danger, marginLeft: 8, alignItems: 'center', opacity: deleting ? 0.7 : 1 }}
                disabled={deleting}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{deleting ? 'Deleting...' : 'Yes, Delete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SettingsPage; 