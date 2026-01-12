-- Migration: Add onboarding_data column to users table
-- Run this in your Supabase SQL Editor

-- Add the column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- Verify it was added (optional - you can check in Table Editor)
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' AND column_name = 'onboarding_data';

