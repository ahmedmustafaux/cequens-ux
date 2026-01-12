-- Migration: Add connected_channels column to users table
-- Run this in your Supabase SQL Editor to add the connected_channels column
-- This migration is idempotent - safe to run multiple times

-- Add connected_channels column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS connected_channels TEXT[] DEFAULT '{}';

-- Add index for connected_channels to improve query performance
CREATE INDEX IF NOT EXISTS idx_users_connected_channels ON users USING GIN(connected_channels);

-- Add comment to document the column
COMMENT ON COLUMN users.connected_channels IS 'Array of connected channel IDs (e.g., whatsapp, sms, email, messenger, instagram, phone, rcs, push)';
