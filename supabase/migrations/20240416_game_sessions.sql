-- Create game_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID PRIMARY KEY,
  mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_session_players table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.game_session_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 0,
  UNIQUE(session_id, user_id)
);

-- Add RLS policies
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_session_players ENABLE ROW LEVEL SECURITY;

-- Game sessions policies
CREATE POLICY "Anyone can view game sessions"
  ON public.game_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create game sessions"
  ON public.game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own game sessions"
  ON public.game_sessions
  FOR UPDATE
  USING (created_by = auth.uid());

-- Game session players policies
CREATE POLICY "Anyone can view game session players"
  ON public.game_session_players
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join game sessions"
  ON public.game_session_players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player data"
  ON public.game_session_players
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.game_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.game_session_players TO authenticated;
GRANT SELECT ON public.game_sessions TO anon;
GRANT SELECT ON public.game_session_players TO anon;
