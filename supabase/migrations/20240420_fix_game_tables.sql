-- Create or update game_instances table
CREATE TABLE IF NOT EXISTS game_instances (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  player_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create or update game_players table
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id TEXT NOT NULL REFERENCES game_instances(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  position JSONB,
  rotation DOUBLE PRECISION,
  is_moving BOOLEAN DEFAULT FALSE,
  is_running BOOLEAN DEFAULT FALSE,
  character_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS game_players_game_id_idx ON game_players(game_id);
CREATE INDEX IF NOT EXISTS game_players_user_id_idx ON game_players(user_id);
CREATE INDEX IF NOT EXISTS game_players_updated_at_idx ON game_players(updated_at);

-- Add function to clean up old game data
CREATE OR REPLACE FUNCTION cleanup_old_game_data() RETURNS void AS $$
BEGIN
  -- Delete game players that haven't been updated in the last 10 minutes
  DELETE FROM game_players
  WHERE updated_at < NOW() - INTERVAL '10 minutes';
  
  -- Update player count in game instances
  UPDATE game_instances gi
  SET player_count = (
    SELECT COUNT(*) 
    FROM game_players gp 
    WHERE gp.game_id = gi.id
  );
  
  -- Delete empty game instances that are older than 1 hour
  DELETE FROM game_instances
  WHERE player_count = 0 AND created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to both tables
DROP TRIGGER IF EXISTS update_game_instances_updated_at ON game_instances;
CREATE TRIGGER update_game_instances_updated_at
BEFORE UPDATE ON game_instances
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_players_updated_at ON game_players;
CREATE TRIGGER update_game_players_updated_at
BEFORE UPDATE ON game_players
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
