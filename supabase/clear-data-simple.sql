-- Simple version: Clear all data from tables
-- IMPORTANT: Only run this AFTER you've run schema.sql to create the tables!
-- If you get an error, it means the tables don't exist yet - run schema.sql first

-- Delete all data (in correct order to respect foreign keys if any)
DELETE FROM notifications WHERE true;
DELETE FROM campaigns WHERE true;
DELETE FROM segments WHERE true;
DELETE FROM contacts WHERE true;
DELETE FROM users WHERE true;

-- Note: The WHERE true clause ensures it works even if tables are empty
-- If you get "relation does not exist" error, you need to run schema.sql first!

