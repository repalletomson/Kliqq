-- Add profile_initials field to users table
-- Run this SQL in your Supabase SQL editor

-- Add profile_initials column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public' AND column_name = 'profile_initials'
    ) THEN
        ALTER TABLE public.users ADD COLUMN profile_initials TEXT;
        RAISE NOTICE 'Added profile_initials column to users table';
    END IF;
END $$;

-- Update existing users to have profile_initials based on full_name
UPDATE public.users 
SET profile_initials = (
    CASE 
        WHEN full_name IS NOT NULL AND trim(full_name) != '' THEN
            CASE 
                WHEN array_length(string_to_array(trim(full_name), ' '), 1) >= 2 THEN
                    upper(left(split_part(trim(full_name), ' ', 1), 1)) || 
                    upper(left(split_part(trim(full_name), ' ', -1), 1))
                ELSE
                    upper(left(trim(full_name), 1))
            END
        ELSE 'U'
    END
)
WHERE profile_initials IS NULL AND full_name IS NOT NULL;

-- Add check constraint to ensure profile_initials is not too long
ALTER TABLE public.users 
ADD CONSTRAINT check_profile_initials_length 
CHECK (length(profile_initials) <= 3);

COMMIT; 