# User Authentication Setup Complete! 🎉

## ✅ What Has Been Implemented

### 1. Database Schema
- ✅ **Users table** added to `supabase/schema.sql`
  - Fields: id, email, password_hash, first_name, last_name, company_name, onboarding_completed
  - Indexes for performance
  - RLS policies for security

### 2. User Services
- ✅ **`src/lib/supabase/users.ts`** - Complete user management:
  - `createUser()` - Register new users
  - `authenticateUser()` - Login with email/password
  - `findUserByEmail()` - Find user by email
  - `updateUserOnboarding()` - Update onboarding status
  - `emailExists()` - Check if email is already registered

### 3. Authentication Flow

#### Signup Flow:
1. User fills signup form → Checks if email exists
2. Redirects to email confirmation page
3. On email confirmation → Creates user in database
4. Redirects to login page

#### Login Flow:
1. User enters email/password
2. Authenticates against Supabase database
3. Checks `onboarding_completed` status
4. Redirects:
   - If `onboarding_completed = false` → `/onboarding`
   - If `onboarding_completed = true` → `/getting-started` or dashboard

#### Onboarding Flow:
1. New users are redirected to `/onboarding`
2. User completes onboarding preferences
3. On completion → Updates `onboarding_completed = true` in database
4. Updates user type to "existingUser"
5. Redirects to dashboard

### 4. Updated Components

- ✅ **SignupPage** - Checks email exists, saves user data for confirmation
- ✅ **EmailConfirmationPage** - Creates user account in database
- ✅ **LoginPage** - Authenticates against database, checks onboarding status
- ✅ **AuthContext** - Stores user ID, onboarding status, handles redirects
- ✅ **OnboardingContext** - Updates onboarding status in database
- ✅ **NewUserOnboardingPage** - Marks onboarding as complete in database

## 🚀 Setup Instructions

### Step 1: Update Database Schema

1. Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/kwfjxcdkcmggssvqyiyg/sql
2. Run the updated `supabase/schema.sql` (includes users table)
3. OR run just the users table creation:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user registration" ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to read own data" ON users
  FOR SELECT
  USING (true);

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Step 2: Clear Existing Data (Optional)

If you want to start fresh, run `supabase/clear-data.sql` in the SQL Editor:

```sql
DELETE FROM notifications;
DELETE FROM campaigns;
DELETE FROM segments;
DELETE FROM contacts;
DELETE FROM users;
```

### Step 3: Test the Flow

1. **Signup a new user:**
   - Go to `/signup`
   - Fill in the form
   - Click "Confirm Email" (simulates email confirmation)
   - User is created in database

2. **Login:**
   - Go to `/login`
   - Use the email/password you just signed up with
   - You should be redirected to `/onboarding` (first-time login)

3. **Complete onboarding:**
   - Complete the onboarding steps
   - On completion, `onboarding_completed` is set to `true`
   - You're redirected to dashboard

4. **Login again:**
   - Logout and login again with the same credentials
   - You should be redirected to `/getting-started` or dashboard (not onboarding)

## 🔐 Security Notes

### Password Hashing
- Currently uses SHA-256 hashing (client-side)
- ⚠️ **For production**, consider:
  - Using Supabase Auth (recommended)
  - Server-side password hashing with bcrypt
  - Password complexity requirements
  - Rate limiting on login attempts

### Row Level Security (RLS)
- Currently permissive (allows all operations)
- ⚠️ **For production**, implement:
  - User-specific RLS policies
  - Proper authentication checks
  - Data isolation per user/organization

## 📝 Database Schema

### Users Table
```sql
id                  UUID (primary key)
email               TEXT (unique, not null)
password_hash       TEXT (not null)
first_name          TEXT
last_name           TEXT
company_name        TEXT
onboarding_completed BOOLEAN (default: false)
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

## 🧪 Testing Checklist

- [ ] Signup creates user in database
- [ ] Email validation prevents duplicate signups
- [ ] Login authenticates against database
- [ ] First-time login redirects to `/onboarding`
- [ ] Onboarding completion updates database
- [ ] Second login redirects to dashboard (not onboarding)
- [ ] User data persists across sessions
- [ ] Logout clears session

## 🔄 User Flow Diagram

```
Signup → Email Confirmation → Database User Created
                                          ↓
                    Login (onboarding_completed = false)
                                          ↓
                                    /onboarding
                                          ↓
                            Complete Onboarding
                                          ↓
                    Update onboarding_completed = true
                                          ↓
                                    Dashboard

Subsequent Logins (onboarding_completed = true)
                                          ↓
                          /getting-started or Dashboard
```

## 🐛 Troubleshooting

### "Email already registered" on signup
- User already exists in database
- Try logging in instead

### Login fails
- Check password is correct
- Verify user exists in database (check Supabase dashboard)

### Always redirected to onboarding
- Check `onboarding_completed` field in database
- Should be `true` after completing onboarding
- Can manually update: `UPDATE users SET onboarding_completed = true WHERE email = 'user@example.com';`

### Database connection issues
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active
- Verify RLS policies allow operations

