import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Expo Push API endpoint
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse webhook payload
    const payload = await req.json();
    const { table, record } = payload;

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let recipientUserId: string | null = null;
    let title = "";
    let body = "";

    if (table === "likes") {
      // Notify post author when their post is liked
      const { data: post, error } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", record.post_id)
        .single();
      if (error || !post) {
        return new Response(JSON.stringify({ error: "Post not found" }), { status: 400 });
      }
      recipientUserId = post.user_id;
      title = "New Like!";
      body = "Someone liked your post.";
    } else if (table === "comments") {
      // Notify post author when their post is commented on
      const { data: post, error } = await supabase
        .from("posts")
        .select("user_id")
        .eq("id", record.post_id)
        .single();
      if (error || !post) {
        return new Response(JSON.stringify({ error: "Post not found" }), { status: 400 });
      }
      recipientUserId = post.user_id;
      title = "New Comment!";
      body = `Someone commented on your post: ${record.content}`;
    } else if (table === "posts") {
      // Notify the author themselves (confirmation)
      recipientUserId = record.user_id;
      title = "Post Published!";
      body = "Your post has been successfully published!";
    } else {
      return new Response(JSON.stringify({ error: "Unsupported table" }), { status: 400 });
    }

    // Fetch recipient's expo_push_token from profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("expo_push_token")
      .eq("user_id", recipientUserId)
      .single();

    if (profileError || !profile || !profile.expo_push_token) {
      return new Response(JSON.stringify({ message: "No push token found for recipient." }), { status: 200 });
    }

    // Send push notification via Expo
    const expoRes = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: profile.expo_push_token,
        title,
        body,
      }),
    });

    const expoData = await expoRes.json();

    return new Response(JSON.stringify({ success: true, expo: expoData }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}); 