-- Migration: Auto-update segments when contacts are added/updated/deleted
-- This creates a trigger that automatically updates all segments for a user
-- when their contacts change, ensuring segments stay in sync with contact data
-- 
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- FUNCTION: Update all segments for a user
-- ============================================================================
-- This function will be called by the trigger to update all segments
-- Since complex filter evaluation requires JavaScript logic, we'll use
-- a notification approach that the application can listen to
CREATE OR REPLACE FUNCTION notify_segment_update()
RETURNS TRIGGER AS $$
DECLARE
  affected_user_id UUID;
BEGIN
  -- Get the user_id from the contact (works for both INSERT and UPDATE)
  IF TG_OP = 'DELETE' THEN
    affected_user_id := OLD.user_id;
  ELSE
    affected_user_id := NEW.user_id;
  END IF;

  -- Notify that segments need to be updated for this user
  -- The application layer will listen to this and update segments
  PERFORM pg_notify('segment_update', affected_user_id::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS: Auto-update segments on contact changes
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_segments_on_contact_insert ON contacts;
DROP TRIGGER IF EXISTS trigger_update_segments_on_contact_update ON contacts;
DROP TRIGGER IF EXISTS trigger_update_segments_on_contact_delete ON contacts;

-- Trigger on INSERT
CREATE TRIGGER trigger_update_segments_on_contact_insert
  AFTER INSERT ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_segment_update();

-- Trigger on UPDATE (only if relevant fields changed)
CREATE TRIGGER trigger_update_segments_on_contact_update
  AFTER UPDATE ON contacts
  FOR EACH ROW
  WHEN (
    OLD.country_iso IS DISTINCT FROM NEW.country_iso OR
    OLD.tags IS DISTINCT FROM NEW.tags OR
    OLD.channel IS DISTINCT FROM NEW.channel OR
    OLD.conversation_status IS DISTINCT FROM NEW.conversation_status OR
    OLD.archived IS DISTINCT FROM NEW.archived OR
    OLD.first_name IS DISTINCT FROM NEW.first_name OR
    OLD.last_name IS DISTINCT FROM NEW.last_name OR
    OLD.email_address IS DISTINCT FROM NEW.email_address OR
    OLD.phone IS DISTINCT FROM NEW.phone
  )
  EXECUTE FUNCTION notify_segment_update();

-- Trigger on DELETE
CREATE TRIGGER trigger_update_segments_on_contact_delete
  AFTER DELETE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_segment_update();

-- ============================================================================
-- FUNCTION: Update all segments for a user (application-level helper)
-- ============================================================================
-- This function can be called directly from the application to update segments
-- It's a placeholder that will be handled by the application layer
-- since complex filter evaluation requires JavaScript logic
COMMENT ON FUNCTION notify_segment_update() IS 
  'Notifies the application to update segments when contacts change. The application should listen to the segment_update channel and call updateAllSegmentsForUser() when notified.';
