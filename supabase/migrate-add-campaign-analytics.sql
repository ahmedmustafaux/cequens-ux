-- Migration to add channel and rate columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS channel TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS delivery_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS read_rate DECIMAL(5, 2) DEFAULT 0;

-- Update existing records to have a default channel if needed
UPDATE campaigns SET channel = 'Email' WHERE channel IS NULL;
