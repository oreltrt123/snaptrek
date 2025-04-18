-- Add is_moving and direction columns to game_players table
ALTER TABLE game_players
ADD COLUMN IF NOT EXISTS is_moving BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS direction_x FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS direction_y FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS direction_z FLOAT DEFAULT 0;

-- Make sure the Body Blocker character exists in the characters table
INSERT INTO characters (id, name, description, price, rarity, model_path, image_path)
VALUES ('char8', 'Body Blocker', 'A tactical defensive specialist with unmatched blocking abilities.', 0, 'uncommon', '/assets/3d/BodyBlock.fbx', '/body-blocker.png')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  rarity = EXCLUDED.rarity,
  model_path = EXCLUDED.model_path,
  image_path = EXCLUDED.image_path;

-- Add Body Blocker (char8) to all users by default
INSERT INTO user_characters (user_id, character_id)
SELECT id, 'char8' FROM auth.users
ON CONFLICT (user_id, character_id) DO NOTHING;
