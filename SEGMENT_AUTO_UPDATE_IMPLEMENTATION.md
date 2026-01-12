# Segment Auto-Update Implementation

## Overview

Segments are now automatically updated when contacts are added, updated, or deleted. This ensures that segments always reflect the current state of contacts that match their filter criteria.

## How It Works

### Application-Level Updates (Primary Method)

When contacts are created, updated, deleted, archived, or unarchived, the system automatically:

1. **Performs the contact operation** (create/update/delete/archive/unarchive)
2. **Triggers segment recalculation** in the background (non-blocking)
3. **Updates all segments** for that user by:
   - Fetching all segments for the user
   - Re-evaluating each segment's filters against all contacts
   - Updating the `contact_ids` array for each segment

### Implementation Details

#### Functions Added

1. **`updateAllSegmentsForUser(userId: string)`** - Updates all segments for a user
   - Located in: `src/lib/supabase/segments.ts`
   - Automatically called after contact operations

2. **Database Triggers** (Optional - for future use)
   - Migration file: `supabase/migrate-auto-update-segments.sql`
   - Uses PostgreSQL `pg_notify` to notify when contacts change
   - Can be used for real-time updates via database listeners

#### Contact Operations That Trigger Updates

- ✅ **Create Contact** - New contacts are evaluated against all segment filters
- ✅ **Update Contact** - Updated contacts are re-evaluated (only if relevant fields changed)
- ✅ **Delete Contact** - Removed contacts are removed from all segments
- ✅ **Archive Contact** - Archived contacts are removed from segments
- ✅ **Unarchive Contact** - Unarchived contacts are re-evaluated

### Performance Considerations

- **Non-blocking**: Segment updates happen asynchronously and don't block contact operations
- **Background processing**: Updates are performed in the background using `.catch()` to handle errors gracefully
- **Efficient**: Only segments belonging to the affected user are updated
- **Error handling**: Errors in segment updates are logged but don't fail the contact operation

### Database Migration

To enable database-level triggers (optional), run:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrate-auto-update-segments.sql
```

This creates:
- A notification function that triggers on contact changes
- Triggers on INSERT, UPDATE, and DELETE operations
- Smart UPDATE trigger that only fires when relevant fields change

**Note**: The application-level updates are already working without this migration. The database triggers are optional and can be used for future real-time features.

## Usage

### Automatic Updates

No action required! Segments are automatically updated when:
- You create a new contact via the UI or API
- You update an existing contact
- You delete a contact
- You archive or unarchive contacts

### Manual Updates

If you need to manually update all segments for a user:

```typescript
import { updateAllSegmentsForUser } from '@/lib/supabase/segments'

// Update all segments for a user
await updateAllSegmentsForUser(userId)
```

### Update a Single Segment

To update a specific segment:

```typescript
import { updateSegmentContacts } from '@/lib/supabase/segments'

// Update a specific segment
await updateSegmentContacts(userId, segmentId)
```

## Testing

To verify the implementation:

1. **Create a segment** with specific filters (e.g., "Country = SA")
2. **Create a contact** that matches the segment filters
3. **Check the segment** - the contact should automatically appear in the segment
4. **Update the contact** to no longer match (e.g., change country)
5. **Check the segment** - the contact should be removed
6. **Update the contact** to match again
7. **Check the segment** - the contact should reappear

## Future Enhancements

Potential improvements:
- Real-time updates using Supabase Realtime subscriptions
- Batch updates for bulk contact operations
- Optimized filtering for large contact lists
- Caching of segment results
- Incremental updates (only check affected segments)
