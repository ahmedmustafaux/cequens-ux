-- Cequens Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create the database schema
-- This script is idempotent - safe to run multiple times (will recreate policies/triggers)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB,
  connected_channels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_connected_channels ON users USING GIN(connected_channels);

-- ============================================================================
-- CONTACTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT NOT NULL,
  email_address TEXT,
  country_iso TEXT NOT NULL,
  avatar TEXT,
  avatar_color TEXT,
  tags TEXT[] DEFAULT '{}',
  channel TEXT,
  conversation_status TEXT DEFAULT 'unassigned',
  assignee TEXT,
  last_message TEXT,
  language TEXT,
  bot_status TEXT,
  last_interacted_channel TEXT,
  conversation_opened_time TIMESTAMPTZ,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_time TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_country_iso ON contacts(country_iso);
CREATE INDEX IF NOT EXISTS idx_contacts_conversation_status ON contacts(conversation_status);
CREATE INDEX IF NOT EXISTS idx_contacts_channel ON contacts(channel);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_last_interaction_time ON contacts(last_interaction_time);
CREATE INDEX IF NOT EXISTS idx_contacts_assignee ON contacts(assignee);
CREATE INDEX IF NOT EXISTS idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contacts_archived ON contacts(archived);

-- ============================================================================
-- SEGMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '[]',
  contact_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for segments
CREATE INDEX IF NOT EXISTS idx_segments_user_id ON segments(user_id);
CREATE INDEX IF NOT EXISTS idx_segments_created_at ON segments(created_at);

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft',
  type TEXT NOT NULL,
  recipients INTEGER DEFAULT 0,
  sent_date TIMESTAMPTZ,
  open_rate DECIMAL(5, 2) DEFAULT 0,
  click_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON campaigns(type);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_archived ON notifications(archived);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this based on user authentication later)
-- In production, you should add proper RLS policies based on user_id

-- Users policies - allow anyone to create users, but only read their own
-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration" ON users
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read own data" ON users;
CREATE POLICY "Allow users to read own data" ON users
  FOR SELECT
  USING (true); -- For now, allow reading all users (can be restricted later)

DROP POLICY IF EXISTS "Allow users to update own data" ON users;
CREATE POLICY "Allow users to update own data" ON users
  FOR UPDATE
  USING (true)
  WITH CHECK (true); -- For now, allow updating all users (can be restricted later)

-- Contacts policies
DROP POLICY IF EXISTS "Allow all operations on contacts" ON contacts;
CREATE POLICY "Allow all operations on contacts" ON contacts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Segments policies
DROP POLICY IF EXISTS "Allow all operations on segments" ON segments;
CREATE POLICY "Allow all operations on segments" ON segments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Campaigns policies
DROP POLICY IF EXISTS "Allow all operations on campaigns" ON campaigns;
CREATE POLICY "Allow all operations on campaigns" ON campaigns
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Allow all operations on notifications" ON notifications;
CREATE POLICY "Allow all operations on notifications" ON notifications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
-- Drop existing triggers if they exist, then create new ones
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_segments_updated_at ON segments;
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON segments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

