-- Function to check if a trigger exists
CREATE OR REPLACE FUNCTION public.check_trigger_exists(
  trigger_name TEXT,
  table_name TEXT,
  schema_name TEXT DEFAULT 'public'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.triggers
    WHERE event_object_schema = schema_name
      AND event_object_table = table_name
      AND trigger_name = trigger_name
  ) INTO trigger_exists;
  
  RETURN trigger_exists;
END;
$$;
