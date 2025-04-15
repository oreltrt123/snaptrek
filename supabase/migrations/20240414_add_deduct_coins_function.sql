-- Create function to deduct coins from a user's profile
CREATE OR REPLACE FUNCTION deduct_coins(user_id UUID, amount INTEGER)
RETURNS void AS $$
DECLARE
  current_coins INTEGER;
BEGIN
  -- Get current coins
  SELECT coins INTO current_coins FROM profiles WHERE id = user_id;
  
  -- Check if user has enough coins
  IF current_coins < amount THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;
  
  -- Deduct coins
  UPDATE profiles
  SET coins = coins - amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
