import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Constants for Expo Push API
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 100; // Expo recommends max 100 notifications per request

interface PushNotificationPayload {
  type: 'like' | 'comment' | 'reply';
  postId?: string;
  commentId?: string;
  actorUserId: string;
  affectedUserIds: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
}

interface ExpoPushToken {
  user_id: string;
  token: string;
  updated_at: string;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  channelId?: string;
}

serve(async (req) => {
  try {
    // Enable CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const payload: PushNotificationPayload = await req.json();
    
    console.log('Received notification request:', JSON.stringify(payload, null, 2));

    // Validate payload
    if (!payload.type || !payload.actorUserId || !payload.affectedUserIds?.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, actorUserId, or affectedUserIds' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get actor user details for personalized messages
    const { data: actorUser, error: actorError } = await supabase
      .from('users')
      .select('full_name, username')
      .eq('id', payload.actorUserId)
      .maybeSingle(); // Use maybeSingle instead of single to handle missing users

    if (actorError) {
      console.error('Error fetching actor user:', actorError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch actor user details' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const actorName = actorUser?.full_name || actorUser?.username || 'Someone';

    // Fetch Expo push tokens for affected users
    const { data: tokenData, error: tokenError } = await supabase
      .from('expo_tokens')
      .select('user_id, token')
      .in('user_id', payload.affectedUserIds)
      .not('token', 'is', null);

    if (tokenError) {
      console.error('Error fetching push tokens:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!tokenData || tokenData.length === 0) {
      console.log('No push tokens found for affected users');
      return new Response(
        JSON.stringify({ message: 'No push tokens found', sent: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create personalized messages based on notification type
    const messages: ExpoPushMessage[] = tokenData.map((tokenInfo) => {
      let title = payload.title;
      let body = payload.body;

      // Generate contextual messages
      switch (payload.type) {
        case 'like':
          title = 'New Like! 👍';
          body = `${actorName} liked your post`;
          break;
        case 'comment':
          title = 'New Comment! 💬';
          body = `${actorName} commented on your post`;
          break;
        case 'reply':
          title = 'New Reply! 💭';
          body = `${actorName} replied to your comment`;
          break;
        default:
          title = payload.title || 'New Notification';
          body = payload.body || `${actorName} interacted with your content`;
      }

      return {
        to: tokenInfo.token,
        title,
        body,
        data: {
          type: payload.type,
          postId: payload.postId,
          commentId: payload.commentId,
          actorUserId: payload.actorUserId,
          ...payload.data,
        },
        sound: 'default',
        badge: 1,
        channelId: 'default',
      };
    });

    console.log(`Prepared ${messages.length} push notifications`);

    // Split messages into chunks for Expo API limits
    const chunks: ExpoPushMessage[][] = [];
    for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
      chunks.push(messages.slice(i, i + CHUNK_SIZE));
    }

    let totalSent = 0;
    let errors: any[] = [];

    // Send each chunk to Expo Push API
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        console.log(`Sending chunk ${i + 1}/${chunks.length} with ${chunk.length} notifications`);
        
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
          console.error(`Expo API error for chunk ${i + 1}:`, responseData);
          errors.push({
            chunk: i + 1,
            error: responseData,
          });
          continue;
        }

        // Check individual message responses
        if (responseData.data) {
          for (let j = 0; j < responseData.data.length; j++) {
            const result = responseData.data[j];
            if (result.status === 'ok') {
              totalSent++;
            } else {
              console.error(`Message ${j} in chunk ${i + 1} failed:`, result);
              errors.push({
                chunk: i + 1,
                messageIndex: j,
                error: result,
              });
            }
          }
        } else {
          totalSent += chunk.length;
        }

        // Rate limiting: wait 1 second between chunks
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error sending chunk ${i + 1}:`, error);
        errors.push({
          chunk: i + 1,
          error: error.message,
        });
      }
    }

    // Log notification to database for analytics/history
    try {
      await supabase.from('push_notification_logs').insert({
        type: payload.type,
        actor_user_id: payload.actorUserId,
        affected_user_ids: payload.affectedUserIds,
        total_sent: totalSent,
        total_errors: errors.length,
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Failed to log notification:', logError);
      // Don't fail the entire operation if logging fails
    }

    const result = {
      success: true,
      totalRequested: messages.length,
      totalSent,
      totalErrors: errors.length,
      chunks: chunks.length,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log('Push notification result:', JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Unexpected error in push notification function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}); 