import { supabase } from '../config/supabaseConfig';

// ===================== USER MANAGEMENT =====================

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (!user) return null;
    
    // Get user profile data from our users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.warn('No user profile found for user:', user.id);
        return null;
      } else {
        console.error('Error fetching user profile:', profileError);
        return {
          uid: user.id,
          email: user.email || '',
          displayName: user.user_metadata?.full_name || '',
          groups: [],
        };
      }
    }
    
    return {
      uid: user.id,
      email: user.email || '',
      displayName: profile?.full_name || user.user_metadata?.full_name || '',
      groups: profile?.groups || [],
      ...profile
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('No user profile found for user:', userId);
        return null;
      }
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const searchUsers = async (searchQuery, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, username, profile_image, college, branch')
      .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
};

// ===================== ADVANCED USER FEATURES =====================

export const getUserStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_stats', { user_uuid: userId });
    
    if (error) throw error;
    return data[0] || {};
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {};
  }
};

export const updateUserStreak = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak data
    const { data: currentStreak, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError;
    }
    
    let newStreakData = {
      last_post_date: today,
      streak_active: true,
      updated_at: new Date().toISOString()
    };
    
    if (currentStreak) {
      const lastPostDate = new Date(currentStreak.last_post_date);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate - lastPostDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day - increment streak
        newStreakData.current_streak = currentStreak.current_streak + 1;
        newStreakData.longest_streak = Math.max(currentStreak.longest_streak, newStreakData.current_streak);
      } else if (daysDiff === 0) {
        // Same day - don't change streak
        return currentStreak;
      } else {
        // Streak broken - reset to 1
        newStreakData.current_streak = 1;
        newStreakData.longest_streak = currentStreak.longest_streak;
      }
    } else {
      // First post - create new streak
      newStreakData.current_streak = 1;
      newStreakData.longest_streak = 1;
    }
    
    const { data, error } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        ...newStreakData
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user streak:", error);
    throw error;
  }
};

// ===================== COLLEGE & GROUP MANAGEMENT =====================

export const getUsersByCollege = async (collegeName) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .contains('college', { name: collegeName });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching users by college:", error);
    return [];
  }
};

// ===================== POSTS SYSTEM =====================

export const getUserFeed = async (userId, limit = 20) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_feed', { 
        user_uuid: userId, 
        feed_limit: limit 
      });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching user feed:", error);
    return [];
  }
};

export const createPost = async (postData) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update user streak
    if (postData.user_id) {
      await updateUserStreak(postData.user_id);
    }
    
    return data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const updatePost = async (postId, updateData) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const searchPosts = async (searchQuery, limit = 20) => {
  try {
    const { data, error } = await supabase
      .rpc('search_posts', { 
        search_query: searchQuery, 
        search_limit: limit 
      });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

// ===================== COMMENTS SYSTEM =====================

export const getPostComments = async (postId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_post_comments', { post_uuid: postId });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching post comments:", error);
    return [];
  }
};

export const createComment = async (commentData) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// ===================== LIKES SYSTEM =====================

export const toggleLike = async (userId, postId) => {
  try {
    // Check if like already exists
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) throw deleteError;
      return { liked: false, action: 'unliked' };
    } else {
      // Like - add the like
      const { data, error: insertError } = await supabase
        .from('likes')
        .insert({
          user_id: userId,
          post_id: postId
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      return { liked: true, action: 'liked', data };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const isPostLiked = async (userId, postId) => {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking if post is liked:", error);
    return false;
  }
};

// ===================== SAVED POSTS SYSTEM =====================

export const toggleSavePost = async (userId, postId) => {
  try {
    // Check if post is already saved
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingSave) {
      // Unsave - remove the save
      const { error: deleteError } = await supabase
        .from('saved_posts')
        .delete()
        .eq('id', existingSave.id);
      
      if (deleteError) throw deleteError;
      return { saved: false, action: 'unsaved' };
    } else {
      // Save - add the save
      const { data, error: insertError } = await supabase
        .from('saved_posts')
        .insert({
          user_id: userId,
          post_id: postId
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      return { saved: true, action: 'saved', data };
    }
  } catch (error) {
    console.error("Error toggling save post:", error);
    throw error;
  }
};

export const getUserSavedPosts = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('saved_posts')
      .select(`
        *,
        posts:post_id (
          *,
          users:user_id (
            full_name,
            username,
            profile_image
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching saved posts:", error);
    return [];
  }
};

// ===================== STORAGE MANAGEMENT =====================

export const uploadImage = async (uri, bucket, folder = '') => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob);
    
    if (error) throw error;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export const deleteImage = async (url, bucket) => {
  try {
    // Extract the file path from the URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// ===================== ENHANCED NOTIFICATIONS =====================

export const createNotification = async (userId, notificationData) => {
  try {
    const { data, error } = await supabase
      .rpc('create_notification', {
        target_user_id: userId,
        notification_type: notificationData.type,
        notification_title: notificationData.title,
        notification_message: notificationData.message,
        notification_data: notificationData.data || {}
      });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getUserNotifications = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId) => {
  try {
    const { data, error } = await supabase
      .rpc('mark_notifications_read', { user_uuid: userId });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// ===================== REAL-TIME SUBSCRIPTIONS =====================

export const subscribeToUserChanges = (userId, callback) => {
  return supabase
    .channel('user-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${userId}`
    }, callback)
    .subscribe();
};

export const subscribeToPostChanges = (callback) => {
  return supabase
    .channel('post-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'posts'
    }, callback)
    .subscribe();
};

export const subscribeToNotifications = (userId, callback) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    }, callback)
    .subscribe();
};

export const subscribeToPostLikes = (postId, callback) => {
  return supabase
    .channel(`post-${postId}-likes`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'likes',
      filter: `post_id=eq.${postId}`
    }, callback)
    .subscribe();
};

export const subscribeToPostComments = (postId, callback) => {
  return supabase
    .channel(`post-${postId}-comments`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'comments',
      filter: `post_id=eq.${postId}`
    }, callback)
    .subscribe();
};

// ===================== UTILITY FUNCTIONS =====================

export const formatSupabaseDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials.';
  } else if (error.message?.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account.';
  } else if (error.message?.includes('Network request failed')) {
    return 'Network connection failed. Please check your internet connection.';
  } else if (error.code === 'auth/user-not-found') {
    return 'No account found with this email address.';
  } else if (error.code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.';
  } else if (error.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists.';
  } else if (error.code === 'auth/weak-password') {
    return 'Password should be at least 6 characters long.';
  } else if (error.message?.includes('rate limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};

// ===================== DATA CONSISTENCY HELPERS =====================

export const recalculatePostCounts = async () => {
  try {
    await supabase.rpc('recalculate_post_like_counts');
    await supabase.rpc('recalculate_post_comment_counts');
    return true;
  } catch (error) {
    console.error("Error recalculating post counts:", error);
    throw error;
  }
};

// ===================== PUSH NOTIFICATION FUNCTIONS =====================

export const savePushToken = async (userId, token, deviceInfo = {}) => {
  try {
    const { error } = await supabase.rpc('upsert_expo_token', {
      p_user_id: userId,
      p_token: token,
      p_device_info: deviceInfo,
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error saving push token:", error);
    throw error;
  }
};

export const removePushToken = async (userId) => {
  try {
    const { error } = await supabase.rpc('remove_expo_token', {
      p_user_id: userId,
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error removing push token:", error);
    throw error;
  }
};

export const getUserPushToken = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('expo_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user push token:", error);
    return null;
  }
};

export const getPushNotificationLogs = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('push_notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching push notification logs:", error);
    return [];
  }
};

// Test function to manually send a push notification
export const sendTestPushNotification = async (actorUserId, affectedUserIds, type = 'test') => {
  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        type,
        actorUserId,
        affectedUserIds,
        title: 'Test Notification 🧪',
        body: 'This is a test push notification from your app!',
        data: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error sending test push notification:", error);
    throw error;
  }
};

export default supabase; 