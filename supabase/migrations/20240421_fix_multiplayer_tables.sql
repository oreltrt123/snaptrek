-- Fix game_instances table
CREATE TABLE IF NOT EXISTS game_instances (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  player_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix game_players table
CREATE TABLE IF NOT EXISTS game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL REFERENCES game_instances(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL DEFAULT 'default',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 0,
  is_moving BOOLEAN DEFAULT FALSE,
  is_running BOOLEAN DEFAULT FALSE,
  direction_x FLOAT,
  direction_y FLOAT,
  direction_z FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS game_players_game_id_idx ON game_players(game_id);
CREATE INDEX IF NOT EXISTS game_players_user_id_idx ON game_players(user_id);

-- Add function to clean up old game data
CREATE OR REPLACE FUNCTION cleanup_old_game_data() RETURNS void AS $$
BEGIN
  -- Delete game instances older than 24 hours
  DELETE FROM game_instances 
  WHERE updated_at < NOW() - INTERVAL '24 hours';
  
  -- Delete player data for games that no longer exist
  DELETE FROM game_players
  WHERE game_id NOT IN (SELECT id FROM game_instances);
  
  -- Delete player data that hasn't been updated in 5 minutes
  DELETE FROM game_players
  WHERE updated_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run cleanup every hour
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_cron.job
    WHERE jobname = 'cleanup_old_game_data'
  ) THEN
    PERFORM pg_catalog.pg_cron.schedule('0 * * * *', 'SELECT cleanup_old_game_data()');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- pg_cron might not be available, so just ignore errors
    RAISE NOTICE 'Could not schedule cleanup job: %', SQLERRM;
END $$;
