-- Add onboarding_data column to users table
-- Run this if you already have the users table and need to add the onboarding_data column

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- This allows storing the onboarding preferences like:
-- {
--   "industry": "ecommerce",
--   "customIndustryName": null,
--   "channels": ["whatsapp", "sms"],
--   "goals": ["increase-engagement"],
--   "teamSize": "small",
--   "usage": ["marketing", "support"]
-- }

