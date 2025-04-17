-- Add columns for character animation support
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS is_moving BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS direction JSONB DEFAULT NULL;

-- Add the new character to the character_types table if it doesn't exist
INSERT INTO character_types (id, name, description, price, rarity, image_url)
VALUES 
  ('char8', 'Aerial Guardian', 'A masterful defender who can fly above the battlefield', 4000, 'legendary', '/aerial-guardian.png')
ON CONFLICT (id) DO NOTHING;

-- Create a placeholder image
INSERT INTO assets (id, url, type, description)
VALUES 
  ('aerial-guardian', '/aerial-guardian.png', 'character_image', 'Aerial Guardian character image')
ON CONFLICT (id) DO NOTHING;
