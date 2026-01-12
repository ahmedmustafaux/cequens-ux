-- Migration: Add archived column to contacts table
-- This migration adds an archived boolean column to the contacts table
-- Run this in your Supabase SQL Editor

-- Add archived column if it doesn't exist
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create index for archived column for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_archived ON contacts(archived);

-- Update any existing NULL values to FALSE
UPDATE contacts SET archived = FALSE WHERE archived IS NULL;
