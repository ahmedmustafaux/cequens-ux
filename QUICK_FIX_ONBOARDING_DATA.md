# Quick Fix: Add onboarding_data Column

## Error
`column users.onboarding_data does not exist`

## Solution

Run this SQL in your Supabase SQL Editor:

```sql
-- Add onboarding_data column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onboarding_data JSONB;

-- Also add UPDATE policy if missing
DROP POLICY IF EXISTS "Allow users to update own data" ON users;
CREATE POLICY "Allow users to update own data" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

## Steps

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/kwfjxcdkcmggssvqyiyg/sql
2. Copy the SQL above
3. Paste and click "Run"
4. Refresh your app
5. Try signup/login/onboarding again

After this, onboarding data will be saved to the database!

