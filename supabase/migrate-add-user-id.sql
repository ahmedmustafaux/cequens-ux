-- Migration: Add user_id columns to all tables for multi-tenancy
-- This migration adds user_id columns to contacts, segments, campaigns, and notifications tables
-- Run this in your Supabase SQL Editor
-- 
-- IMPORTANT: If you have existing data, you'll need to assign user_id values before making them NOT NULL
-- For new installations, user_id will be NOT NULL from the start

-- Add user_id column to contacts table (nullable first to handle existing data)
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to segments table (nullable first to handle existing data)
ALTER TABLE segments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to campaigns table (nullable first to handle existing data)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id column to notifications table (nullable first to handle existing data)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- For existing data: You may want to assign user_id to existing rows
-- Example (uncomment and modify as needed):
-- UPDATE contacts SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
-- UPDATE segments SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
-- UPDATE campaigns SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;
-- UPDATE notifications SET user_id = (SELECT id FROM users LIMIT 1) WHERE user_id IS NULL;

-- After assigning user_id to all existing rows, make columns NOT NULL:
-- ALTER TABLE contacts ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE segments ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE campaigns ALTER COLUMN user_id SET NOT NULL;
-- ALTER TABLE notifications ALTER COLUMN user_id SET NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_segments_user_id ON segments(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Note: Since this app uses custom authentication (not Supabase Auth),
-- RLS policies will allow all operations, but application code will filter by user_id.
-- This ensures data isolation at the application level.

-- Update RLS policies - keep existing policies that allow operations
-- The application code will handle filtering by user_id for security
