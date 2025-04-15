-- First, make sure the profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert test users (only if they don't already exist)
-- Note: These are dummy users for testing purposes
INSERT INTO public.profiles (id, username, avatar_url)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'TestUser1', 'https://api.dicebear.com/7.x/bottts/svg?seed=1'),
    ('00000000-0000-0000-0000-000000000002', 'TestUser2', 'https://api.dicebear.com/7.x/bottts/svg?seed=2'),
    ('00000000-0000-0000-0000-000000000003', 'TestUser3', 'https://api.dicebear.com/7.x/bottts/svg?seed=3'),
    ('00000000-0000-0000-0000-000000000004', 'TestUser4', 'https://api.dicebear.com/7.x/bottts/svg?seed=4'),
    ('00000000-0000-0000-0000-000000000005', 'TestUser5', 'https://api.dicebear.com/7.x/bottts/svg?seed=5')
ON CONFLICT (id) DO NOTHING;
