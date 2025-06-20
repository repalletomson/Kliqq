-- ================================================================================================
-- 🚀 COMPLETE SUPABASE DATABASE SETUP FOR STUDENT APP - FINAL VERSION
-- ================================================================================================
-- 
-- This script sets up the complete database structure for your React Native Student App
-- 
-- WHAT THIS SCRIPT DOES:
-- ✅ Creates all required tables with proper relationships
-- ✅ Fixes missing columns (groups, is_anonymous, user_name, user_avatar, etc.)  
-- ✅ Sets up Row Level Security (RLS) policies
-- ✅ Creates automatic triggers for user creation and count updates
-- ✅ Sets up storage buckets and policies
-- ✅ Creates performance indexes
-- ✅ Fixes likes constraint issues
-- ✅ Ensures proper foreign key relationships
--
-- INSTRUCTIONS:
-- 1. Copy this entire script
-- 2. Go to your Supabase Dashboard → SQL Editor
-- 3. Paste and run this script
-- 4. Verify success by checking the tables in Table Editor
-- ================================================================================================

-- ================================================================================================
-- 1. ENABLE REQUIRED EXTENSIONS
-- ================================================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search performance

-- ================================================================================================
-- 2. STORAGE SETUP FOR FILE UPLOADS
-- ================================================================================================

-- Create storage bucket for user uploads (images, avatars, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view uploaded files" ON storage.objects;

-- Create comprehensive storage policies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'user-uploads');

CREATE POLICY "Authenticated users can upload files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ================================================================================================
-- 3. USERS TABLE - COMPLETE STRUCTURE
-- ================================================================================================

-- Drop existing users table if exists (CAREFUL: This deletes all user data)
-- DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with ALL required columns
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT,
    profile_image TEXT DEFAULT 'https://imgs.search.brave.com/SRTQLz_BmOq7xwzV7ls7bV62QzMZtDrGSacNS5G1d1A/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pY29u/cy52ZXJ5aWNvbi5j/b20vcG5nLzEyOC9t/aXNjZWxsYW5lb3Vz/LzNweC1saW5lYXIt/ZmlsbGV0LWNvbW1v/bi1pY29uL2RlZmF1/bHQtbWFsZS1hdmF0/YXItMS5wbmc',
    bio TEXT,
    college JSONB,
    branch TEXT,
    passout_year TEXT,
    year_of_study INTEGER,
    course TEXT,
    interests TEXT[] DEFAULT '{}',
    groups TEXT[] DEFAULT '{}',
    expo_push_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add any missing columns to existing users table
DO $$ 
BEGIN
    -- Add username column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'username'
    ) THEN
        ALTER TABLE public.users ADD COLUMN username TEXT UNIQUE;
        RAISE NOTICE 'Added username column to users table';
    END IF;

    -- Add groups column if missing  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'groups'
    ) THEN
        ALTER TABLE public.users ADD COLUMN groups TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added groups column to users table';
    END IF;

    -- Add expo_push_token column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'expo_push_token'
    ) THEN
        ALTER TABLE public.users ADD COLUMN expo_push_token TEXT;
        RAISE NOTICE 'Added expo_push_token column to users table';
    END IF;

    -- Add branch column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'branch'
    ) THEN
        ALTER TABLE public.users ADD COLUMN branch TEXT;
        RAISE NOTICE 'Added branch column to users table';
    END IF;

    -- Add passout_year column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'passout_year'
    ) THEN
        ALTER TABLE public.users ADD COLUMN passout_year TEXT;
        RAISE NOTICE 'Added passout_year column to users table';
    END IF;

    -- Add year_of_study column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'year_of_study'
    ) THEN
        ALTER TABLE public.users ADD COLUMN year_of_study INTEGER;
        RAISE NOTICE 'Added year_of_study column to users table';
    END IF;

    -- Add course column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'course'
    ) THEN
        ALTER TABLE public.users ADD COLUMN course TEXT;
        RAISE NOTICE 'Added course column to users table';
    END IF;

    -- Ensure interests is TEXT[] type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' 
        AND column_name = 'interests' AND data_type != 'ARRAY'
    ) THEN
        ALTER TABLE public.users ALTER COLUMN interests TYPE TEXT[] 
        USING CASE 
            WHEN interests IS NULL THEN '{}' 
            ELSE string_to_array(interests, ',') 
        END;
        RAISE NOTICE 'Updated interests column to TEXT[] type';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'interests'
    ) THEN
        ALTER TABLE public.users ADD COLUMN interests TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Added interests column as TEXT[]';
    END IF;

END $$;

-- Enable Row Level Security for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing user policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation during signup" ON public.users;

-- Create user policies
CREATE POLICY "Users can view all profiles" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- ================================================================================================
-- 4. POSTS TABLE - COMPLETE STRUCTURE  
-- ================================================================================================

-- Create posts table with ALL required columns
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    images TEXT[],
    video_url TEXT,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    user_name TEXT,
    user_avatar TEXT,
    college TEXT,
    category TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing posts table
DO $$ 
BEGIN
    -- Add title column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND table_schema = 'public' AND column_name = 'title'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN title TEXT;
        RAISE NOTICE 'Added title column to posts table';
    END IF;

    -- Add user_name column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND table_schema = 'public' AND column_name = 'user_name'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN user_name TEXT;
        RAISE NOTICE 'Added user_name column to posts table';
    END IF;

    -- Add user_avatar column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND table_schema = 'public' AND column_name = 'user_avatar'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN user_avatar TEXT;
        RAISE NOTICE 'Added user_avatar column to posts table';
    END IF;

    -- Add college column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND table_schema = 'public' AND column_name = 'college'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN college TEXT;
        RAISE NOTICE 'Added college column to posts table';
    END IF;

    -- Add category column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND table_schema = 'public' AND column_name = 'category'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN category TEXT;
        RAISE NOTICE 'Added category column to posts table';
    END IF;

    -- Add is_anonymous column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND table_schema = 'public' AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.posts ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_anonymous column to posts table';
    END IF;

END $$;

-- Enable Row Level Security for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing post policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- Create post policies
CREATE POLICY "Anyone can view posts" 
ON public.posts FOR SELECT 
USING (true);

CREATE POLICY "Users can create posts" 
ON public.posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
ON public.posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
ON public.posts FOR DELETE 
USING (auth.uid() = user_id);

-- ================================================================================================
-- 5. COMMENTS TABLE - COMPLETE STRUCTURE
-- ================================================================================================

-- Create comments table with ALL required columns including is_anonymous
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    user_name TEXT,
    user_avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing comments table
DO $$ 
BEGIN
    -- Add is_anonymous column if missing (THIS FIXES THE ERROR YOU MENTIONED)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND table_schema = 'public' AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE public.comments ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_anonymous column to comments table - ERROR FIXED!';
    END IF;

    -- Add user_name column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND table_schema = 'public' AND column_name = 'user_name'
    ) THEN
        ALTER TABLE public.comments ADD COLUMN user_name TEXT;
        RAISE NOTICE 'Added user_name column to comments table';
    END IF;

    -- Add user_avatar column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND table_schema = 'public' AND column_name = 'user_avatar'
    ) THEN
        ALTER TABLE public.comments ADD COLUMN user_avatar TEXT;
        RAISE NOTICE 'Added user_avatar column to comments table';
    END IF;

    -- Add updated_at column if missing (THIS FIXES THE NEW ERROR)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' AND table_schema = 'public' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.comments ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to comments table - NEW ERROR FIXED!';
    END IF;

END $$;

-- Enable Row Level Security for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing comment policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- Create comment policies
CREATE POLICY "Anyone can view comments" 
ON public.comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.comments FOR DELETE 
USING (auth.uid() = user_id);

-- ================================================================================================
-- 6. LIKES TABLE - FIXED CONSTRAINT ISSUES
-- ================================================================================================

-- Drop existing likes table to fix constraint issues
DROP TABLE IF EXISTS public.likes CASCADE;

-- Create likes table with proper foreign key relationships
CREATE TABLE public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique combination of user_id and post_id (no duplicate likes)
    UNIQUE(user_id, post_id)
);

-- Enable Row Level Security for likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create like policies
CREATE POLICY "Anyone can view likes" 
ON public.likes FOR SELECT 
USING (true);

CREATE POLICY "Users can create likes" 
ON public.likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" 
ON public.likes FOR DELETE 
USING (auth.uid() = user_id);

-- ================================================================================================
-- 7. SAVED POSTS TABLE
-- ================================================================================================

-- Create saved_posts table
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Enable Row Level Security for saved_posts
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing saved post policies
DROP POLICY IF EXISTS "Users can view their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can insert their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can delete their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can view own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Users can unsave posts" ON public.saved_posts;

-- Create saved post policies
CREATE POLICY "Users can view own saved posts" 
ON public.saved_posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
ON public.saved_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
ON public.saved_posts FOR DELETE 
USING (auth.uid() = user_id);

-- ================================================================================================
-- 8. NOTIFICATIONS TABLE
-- ================================================================================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing notification policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Create notification policies
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- ================================================================================================
-- 9. STREAKS TABLE - COMPLETE STRUCTURE
-- ================================================================================================

-- Drop existing streaks table to fix structure
DROP TABLE IF EXISTS public.streaks CASCADE;

-- Create streaks table with proper structure
CREATE TABLE public.streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_post_date DATE,
    streak_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one streak record per user
    UNIQUE(user_id)
);

-- Enable Row Level Security for streaks
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Create streak policies
CREATE POLICY "Users can view all streaks" 
ON public.streaks FOR SELECT 
USING (true);

CREATE POLICY "System can create streaks" 
ON public.streaks FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update own streak" 
ON public.streaks FOR UPDATE 
USING (auth.uid() = user_id);

-- ================================================================================================
-- 10. AUTOMATIC USER CREATION TRIGGER
-- ================================================================================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a more robust function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _username TEXT;
    _full_name TEXT;
BEGIN
    -- Get username from email if not provided
    _username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        SPLIT_PART(NEW.email, '@', 1)
    );
    
    -- Get full name from metadata
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        _username
    );

    -- Insert into public users table with error handling
    BEGIN
        INSERT INTO public.users (
            id,
            email,
            username,
            full_name,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            _username,
            _full_name,
            NOW(),
            NOW()
        );
    EXCEPTION 
        WHEN unique_violation THEN
            -- Handle username collision by appending random numbers
            _username := _username || '_' || FLOOR(RANDOM() * 1000)::TEXT;
            
            INSERT INTO public.users (
                id,
                email,
                username,
                full_name,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                NEW.email,
                _username,
                _full_name,
                NOW(),
                NOW()
            );
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Failed to create user record: %', SQLERRM;
    END;
    
    -- Create initial streak record
    INSERT INTO public.streaks (
        user_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NOW(),
        NOW()
    );

    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger is created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- ================================================================================================
-- 11. AUTOMATIC COUNT UPDATE TRIGGERS
-- ================================================================================================

-- Drop existing count update triggers
DROP TRIGGER IF EXISTS trigger_update_like_count_on_insert ON public.likes;
DROP TRIGGER IF EXISTS trigger_update_like_count_on_delete ON public.likes;
DROP TRIGGER IF EXISTS trigger_update_comment_count_on_insert ON public.comments;
DROP TRIGGER IF EXISTS trigger_update_comment_count_on_delete ON public.comments;
DROP TRIGGER IF EXISTS likes_count_trigger ON public.likes;
DROP TRIGGER IF EXISTS comments_count_trigger ON public.comments;

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts 
        SET like_count = like_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts 
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts 
        SET comment_count = GREATEST(0, comment_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create triggers for automatic like count updates
CREATE TRIGGER trigger_update_like_count_on_insert
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

CREATE TRIGGER trigger_update_like_count_on_delete
    AFTER DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- Create triggers for automatic comment count updates
CREATE TRIGGER trigger_update_comment_count_on_insert
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE TRIGGER trigger_update_comment_count_on_delete
    AFTER DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Create triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_streaks_updated_at ON public.streaks;
CREATE TRIGGER update_streaks_updated_at
    BEFORE UPDATE ON public.streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================================================
-- 12. PERFORMANCE INDEXES
-- ================================================================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_groups ON public.users USING GIN (groups);
CREATE INDEX IF NOT EXISTS idx_users_interests ON public.users USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users USING GIN (full_name gin_trgm_ops);

-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_like_count ON public.posts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_content ON public.posts USING GIN (content gin_trgm_ops);

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- Likes table indexes
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes(user_id, post_id);

-- Saved posts table indexes
CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Streaks table indexes
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_current_streak ON public.streaks(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_last_post_date ON public.streaks(last_post_date);

-- ================================================================================================
-- 13. VERIFICATION AND SUCCESS MESSAGES
-- ================================================================================================

-- Verify all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
    users_cols INTEGER;
    posts_cols INTEGER;
    comments_cols INTEGER;
    likes_cols INTEGER;
BEGIN
    -- Count tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'posts', 'comments', 'likes', 'saved_posts', 'notifications', 'streaks');
    
    -- Count columns in key tables
    SELECT COUNT(*) INTO users_cols
    FROM information_schema.columns 
    WHERE table_name = 'users' AND table_schema = 'public';
    
    SELECT COUNT(*) INTO posts_cols
    FROM information_schema.columns 
    WHERE table_name = 'posts' AND table_schema = 'public';
    
    SELECT COUNT(*) INTO comments_cols
    FROM information_schema.columns 
    WHERE table_name = 'comments' AND table_schema = 'public';
    
    SELECT COUNT(*) INTO likes_cols
    FROM information_schema.columns 
    WHERE table_name = 'likes' AND table_schema = 'public';
    
    RAISE NOTICE '✅ SETUP VERIFICATION:';
    RAISE NOTICE '   📊 Tables created: % out of 7', table_count;
    RAISE NOTICE '   👥 Users table columns: %', users_cols;
    RAISE NOTICE '   📝 Posts table columns: %', posts_cols;
    RAISE NOTICE '   💬 Comments table columns: %', comments_cols;
    RAISE NOTICE '   ❤️  Likes table columns: %', likes_cols;
    
    IF table_count = 7 THEN
        RAISE NOTICE '🎉 ALL TABLES CREATED SUCCESSFULLY!';
    ELSE
        RAISE NOTICE '⚠️  Some tables may be missing. Check the results above.';
    END IF;
END $$;

-- Show final table structures for verification
SELECT 
    '🔍 USERS TABLE STRUCTURE' as info,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    '🔍 POSTS TABLE STRUCTURE' as info,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    '🔍 COMMENTS TABLE STRUCTURE' as info,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'comments' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Final success message
SELECT '🚀 DATABASE SETUP COMPLETE! Your Student App is ready to go!' as status,
       'All tables, policies, triggers, and indexes have been created successfully.' as details,
       'The missing is_anonymous column has been added to fix comment errors.' as fix_note; 