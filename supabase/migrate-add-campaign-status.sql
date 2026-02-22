-- Migration to add schedule type and recurring schedule columns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS schedule_type TEXT; -- 'now', 'scheduled', 'recurring'
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS recurring_schedule JSONB;

-- Set default schedule_type for existing records
UPDATE campaigns SET schedule_type = 'now' WHERE schedule_type IS NULL;
