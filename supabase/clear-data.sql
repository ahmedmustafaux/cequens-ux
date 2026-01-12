-- Clear all data from tables (but keep the schema)
-- Run this in your Supabase SQL Editor to reset the database
-- IMPORTANT: Run schema.sql FIRST to create the tables, then you can use this to clear data

-- Delete all data (in correct order to respect foreign keys if any)
-- These will only delete if the tables exist
DO $$
BEGIN
  -- Check and delete from each table if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    EXECUTE 'DELETE FROM notifications';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaigns') THEN
    EXECUTE 'DELETE FROM campaigns';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'segments') THEN
    EXECUTE 'DELETE FROM segments';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contacts') THEN
    EXECUTE 'DELETE FROM contacts';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    EXECUTE 'DELETE FROM users';
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist, which is fine - just continue
    NULL;
END $$;

-- Reset sequences if any
-- Note: UUIDs don't use sequences, so no reset needed

-- Optional: Reset updated_at triggers by ensuring they're still active
-- The triggers remain in place, just clearing the data

