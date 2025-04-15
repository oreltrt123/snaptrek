-- Add additional fields to game_sessions table if they don't exist
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS health INTEGER DEFAULT 100;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS energy INTEGER DEFAULT 100;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS position_x FLOAT DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS position_y FLOAT DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS position_z FLOAT DEFAULT 0;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS team_id TEXT;

-- Create index on team_id for faster queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_team_id ON game_sessions(team_id);

-- Create function to get current players in a game instance
CREATE OR REPLACE FUNCTION get_game_players(game_instance_id TEXT)
RETURNS TABLE (
  user_id UUID,
  character_id TEXT,
  team_id TEXT,
  health INTEGER,
  energy INTEGER,
  position_x FLOAT,
  position_y FLOAT,
  position_z FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gs.user_id,
    gs.character_id,
    gs.team_id,
    gs.health,
    gs.energy,
    gs.position_x,
    gs.position_y,
    gs.position_z
  FROM 
    game_sessions gs
  WHERE 
    gs.instance_id = game_instance_id
    AND gs.ended_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update player position
CREATE OR REPLACE FUNCTION update_player_position(
  p_user_id UUID,
  p_instance_id TEXT,
  p_position_x FLOAT,
  p_position_y FLOAT,
  p_position_z FLOAT
)
RETURNS VOID AS $$
BEGIN
  UPDATE game_sessions
  SET 
    position_x = p_position_x,
    position_y = p_position_y,
    position_z = p_position_z,
    updated_at = NOW()
  WHERE 
    user_id = p_user_id
    AND instance_id = p_instance_id
    AND ended_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to assign players to teams
CREATE OR REPLACE FUNCTION assign_team(
  p_user_id UUID,
  p_instance_id TEXT,
  p_mode TEXT
)
RETURNS TEXT AS $$
DECLARE
  team_size INTEGER;
  team_count INTEGER;
  available_team TEXT;
  new_team_id TEXT;
BEGIN
  -- Determine team size based on mode
  IF p_mode = 'duo' THEN
    team_size := 2;
  ELSIF p_mode = 'trio' THEN
    team_size := 3;
  ELSE
    -- For solo and duel, each player is their own team
    team_size := 1;
  END IF;
  
  -- Find an available team that's not full
  SELECT 
    team_id INTO available_team
  FROM 
    game_sessions
  WHERE 
    instance_id = p_instance_id
    AND team_id IS NOT NULL
  GROUP BY 
    team_id
  HAVING 
    COUNT(*) < team_size
  LIMIT 1;
  
  -- If no available team, create a new one
  IF available_team IS NULL THEN
    new_team_id := 'team_' || p_instance_id || '_' || (
      SELECT COALESCE(MAX(SUBSTRING(team_id FROM 'team_' || p_instance_id || '_([0-9]+)')::INTEGER), 0) + 1
      FROM game_sessions
      WHERE instance_id = p_instance_id AND team_id LIKE 'team_' || p_instance_id || '_%'
    );
    RETURN new_team_id;
  ELSE
    RETURN available_team;
  END IF;
END;
$$ LANGUAGE plpgsql;
