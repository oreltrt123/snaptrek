-- Add the Standarddle character to the characters table
INSERT INTO characters (id, name, description, price, rarity, model_path, image_path)
VALUES ('standarddle', 'Standarddle', 'A versatile fighter with balanced abilities and smooth animations from Mixamo.', 1000, 'rare', '/assets/3d/Standarddle.fbx', '/standarddle.png')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  rarity = EXCLUDED.rarity,
  model_path = EXCLUDED.model_path,
  image_path = EXCLUDED.image_path;

-- Make Standarddle available to all users for testing
INSERT INTO user_characters (user_id, character_id)
SELECT id, 'standarddle' FROM auth.users
ON CONFLICT (user_id, character_id) DO NOTHING;
