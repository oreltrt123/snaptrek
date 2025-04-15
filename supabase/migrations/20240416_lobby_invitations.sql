-- Create a table for lobby invitations
CREATE TABLE IF NOT EXISTS lobby_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  lobby_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, recipient_id, lobby_id)
);

-- Create a table for active lobbies
CREATE TABLE IF NOT EXISTS active_lobbies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lobby_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a table for lobby members
CREATE TABLE IF NOT EXISTS lobby_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lobby_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0, -- 0 = owner, 1 = left position, 2 = right position
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lobby_id, user_id),
  UNIQUE(lobby_id, position)
);

-- Create RLS policies
ALTER TABLE lobby_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_members ENABLE ROW LEVEL SECURITY;

-- Policies for lobby_invitations
CREATE POLICY "Users can view their own invitations" 
ON lobby_invitations FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create invitations" 
ON lobby_invitations FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own invitations" 
ON lobby_invitations FOR UPDATE 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Policies for active_lobbies
CREATE POLICY "Anyone can view active lobbies" 
ON active_lobbies FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own lobbies" 
ON active_lobbies FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their lobbies" 
ON active_lobbies FOR UPDATE 
USING (auth.uid() = owner_id);

-- Policies for lobby_members
CREATE POLICY "Anyone can view lobby members" 
ON lobby_members FOR SELECT 
USING (true);

CREATE POLICY "Users can join lobbies" 
ON lobby_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership" 
ON lobby_members FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own membership" 
ON lobby_members FOR DELETE 
USING (auth.uid() = user_id);
