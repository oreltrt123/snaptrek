-- This migration file fixes the profiles table and ensures users are properly added

-- 1. First, make sure the profiles table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Create RLS policies to allow access to the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 3. Create a trigger to automatically add users to profiles when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Add existing auth users to profiles if they don't exist yet
INSERT INTO public.profiles (id, username, avatar_url)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', email),
  'https://api.dicebear.com/7.x/bottts/svg?seed=' || id
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Add some test users if the profiles table is empty
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  IF user_count = 0 THEN
    -- Insert test users only if no users exist
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES
      ('00000000-0000-0000-0000-000000000001', 'TestUser1', 'https://api.dicebear.com/7.x/bottts/svg?seed=1'),
      ('00000000-0000-0000-0000-000000000002', 'TestUser2', 'https://api.dicebear.com/7.x/bottts/svg?seed=2'),
      ('00000000-0000-0000-0000-000000000003', 'TestUser3', 'https://api.dicebear.com/7.x/bottts/svg?seed=3'),
      ('00000000-0000-0000-0000-000000000004', 'TestUser4', 'https://api.dicebear.com/7.x/bottts/svg?seed=4'),
      ('00000000-0000-0000-0000-000000000005', 'TestUser5', 'https://api.dicebear.com/7.x/bottts/svg?seed=5')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;

-- 6. Make sure the lobby_invitations table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.lobby_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lobby_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Create RLS policies for lobby_invitations
ALTER TABLE public.lobby_invitations ENABLE ROW LEVEL SECURITY;

-- Allow users to see invitations they've sent or received
DROP POLICY IF EXISTS "Allow users to see their invitations" ON public.lobby_invitations;
CREATE POLICY "Allow users to see their invitations" 
ON public.lobby_invitations 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Allow users to create invitations
DROP POLICY IF EXISTS "Allow users to create invitations" ON public.lobby_invitations;
CREATE POLICY "Allow users to create invitations" 
ON public.lobby_invitations 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Allow users to update invitations they've received
DROP POLICY IF EXISTS "Allow users to update received invitations" ON public.lobby_invitations;
CREATE POLICY "Allow users to update received invitations" 
ON public.lobby_invitations 
FOR UPDATE 
USING (auth.uid() = recipient_id);

-- 8. Create lobby_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lobby_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lobby_id TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(lobby_id, position)
);

-- 9. Create RLS policies for lobby_members
ALTER TABLE public.lobby_members ENABLE ROW LEVEL SECURITY;

-- Allow public read access to lobby members
DROP POLICY IF EXISTS "Allow public read access to lobby members" ON public.lobby_members;
CREATE POLICY "Allow public read access to lobby members" 
ON public.lobby_members 
FOR SELECT 
USING (true);

-- Allow users to join lobbies
DROP POLICY IF EXISTS "Allow users to join lobbies" ON public.lobby_members;
CREATE POLICY "Allow users to join lobbies" 
ON public.lobby_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to leave lobbies
DROP POLICY IF EXISTS "Allow users to leave lobbies" ON public.lobby_members;
CREATE POLICY "Allow users to leave lobbies" 
ON public.lobby_members 
FOR DELETE 
USING (auth.uid() = user_id);
