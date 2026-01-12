# Supabase Setup Instructions

This project uses Supabase as the backend database. Follow these steps to set up your Supabase project.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details:
   - Name: `cequens-v0` (or your preferred name)
   - Database Password: Choose a strong password (save it!)
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for it to be ready (takes ~2 minutes)

## 2. Run the Database Schema

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL and create all tables, indexes, and policies

## 3. Get Your API Keys

1. In your Supabase project dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. For Vercel deployment, add these same environment variables in your Vercel project settings:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## 5. Verify the Setup

After completing the above steps, your application should be able to:
- Connect to Supabase
- Create, read, update, and delete contacts
- Manage segments, campaigns, and notifications

## Troubleshooting

### Connection Issues
- Verify your environment variables are correctly set
- Check that your Supabase project is active (not paused)
- Ensure you're using the correct project URL and anon key

### RLS (Row Level Security) Issues
- The schema includes permissive RLS policies for development
- For production, you should implement proper user-based RLS policies

### Migration Issues
- If you encounter errors when running the schema, make sure your Supabase project is fully initialized
- Check the Supabase logs in the dashboard for detailed error messages

## Next Steps

Once your database is set up:
1. Seed your database with initial data (optional)
2. Test the application to ensure everything is working
3. Consider implementing authentication if needed
4. Update RLS policies for production security

