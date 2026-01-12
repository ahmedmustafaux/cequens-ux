# Supabase Database Setup Instructions

## ⚠️ Important: Setup Order

You must run the SQL scripts in this order:

1. **First**: Run `schema.sql` - Creates all tables
2. **Then** (optional): Run `clear-data.sql` - Clears existing data

## Step-by-Step Setup

### Step 1: Create Tables (Required)

1. Go to your Supabase SQL Editor:
   https://supabase.com/dashboard/project/kwfjxcdkcmggssvqyiyg/sql

2. Open `supabase/schema.sql` in your project

3. Copy the **entire contents** of `schema.sql`

4. Paste it into the Supabase SQL Editor

5. Click **"Run"** or press `Ctrl+Enter` (or `Cmd+Enter` on Mac)

6. You should see a success message indicating all tables were created

### Step 2: Clear Data (Optional - Only if needed)

⚠️ **Only run this AFTER schema.sql has been executed!**

If you want to start with an empty database:

1. Open `supabase/clear-data.sql` in your project

2. Copy the entire contents

3. Paste into Supabase SQL Editor

4. Click **"Run"**

This will delete all existing data but keep the table structure.

## Verify Setup

After running `schema.sql`, verify the tables were created:

1. In Supabase dashboard, go to **Table Editor**

2. You should see these tables:
   - ✅ `users`
   - ✅ `contacts`
   - ✅ `segments`
   - ✅ `campaigns`
   - ✅ `notifications`

## Troubleshooting

### Error: "relation does not exist"
- **Solution**: You need to run `schema.sql` first to create the tables

### Error: "permission denied"
- **Solution**: Make sure you're running the SQL as the correct user in Supabase

### Tables not showing in Table Editor
- Refresh the page
- Check the SQL Editor for any error messages
- Verify you selected the correct database/project

## Next Steps

After the database is set up:
1. Your app will automatically connect (environment variables are already configured)
2. Test signup/login flow
3. Users will be saved to the `users` table
4. Contacts, segments, etc. will be saved to their respective tables

