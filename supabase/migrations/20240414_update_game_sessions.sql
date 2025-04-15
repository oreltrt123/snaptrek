-- Add mode column to game_sessions table
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS mode TEXT;

-- Add instance_id column to game_sessions table
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS instance_id TEXT;

-- Create index on mode for faster queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_mode ON game_sessions(mode);

-- Create index on instance_id for faster queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_instance_id ON game_sessions(instance_id);
