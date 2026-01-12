# Supabase Migration Guide

This guide explains how to migrate from mock data to Supabase database integration.

## ✅ What Has Been Set Up

### 1. Supabase Configuration
- ✅ Supabase client library installed (`@supabase/supabase-js`)
- ✅ Supabase client configuration (`src/lib/supabase.ts`)
- ✅ Database schema SQL file (`supabase/schema.sql`)
- ✅ Type definitions (`src/lib/supabase/types.ts`)

### 2. Database Services
- ✅ Contacts service (`src/lib/supabase/contacts.ts`)
- ✅ Segments service (`src/lib/supabase/segments.ts`)
- ✅ Campaigns service (`src/lib/supabase/campaigns.ts`)
- ✅ Notifications service (`src/lib/supabase/notifications.ts`)

### 3. React Query Integration
- ✅ QueryClient configuration (`src/lib/query-client.ts`)
- ✅ QueryClientProvider added to app (`src/main.tsx`)
- ✅ React Query hooks for contacts (`src/hooks/use-contacts.ts`)
- ✅ React Query hooks for segments (`src/hooks/use-segments.ts`)
- ✅ React Query hooks for campaigns (`src/hooks/use-campaigns.ts`)

## 🚀 Setup Steps

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details and create the project

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Open `supabase/schema.sql` from this project
3. Copy and paste the entire SQL into the SQL Editor
4. Click "Run" to execute

This will create:
- `contacts` table
- `segments` table
- `campaigns` table
- `notifications` table
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for `updated_at` timestamps

### Step 3: Get API Keys

1. In Supabase dashboard, go to Settings → API
2. Copy:
   - **Project URL**
   - **anon/public key**

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**For Vercel deployment**, add these in:
- Project Settings → Environment Variables

### Step 5: Update Components

The following components need to be updated to use Supabase instead of mock data:

#### High Priority (Core Features)
- ✅ `src/pages/ContactsPage.tsx` - Main contacts list
- ⏳ `src/pages/ContactsEditPage.tsx` - Edit contact
- ⏳ `src/pages/ContactsCreatePage.tsx` - Create contact
- ⏳ `src/pages/ContactDetailPage.tsx` - Contact details
- ⏳ `src/pages/ContactsSegmentsPage.tsx` - Segments management
- ⏳ `src/components/create-contact-sheet.tsx` - Create contact form
- ⏳ `src/components/create-segment-dialog.tsx` - Create segment form
- ⏳ `src/pages/CampaignsPage.tsx` - Campaigns list
- ⏳ `src/components/action-center.tsx` - Action center contacts

#### Medium Priority
- ⏳ `src/pages/DashboardPage.tsx` - Dashboard metrics (may keep some mock data for charts)
- ⏳ Dashboard chart components (can use mock data for visualization)

#### Low Priority (Optional)
- ⏳ Notification context - if using real notifications
- ⏳ Analytics page - may keep mock data

## 📝 Migration Pattern

For each component, follow this pattern:

### Before (Mock Data):
```tsx
import { mockContacts } from "@/data/mock-data"

function MyComponent() {
  const [contacts, setContacts] = useState(mockContacts)
  // ...
}
```

### After (Supabase):
```tsx
import { useContacts, useCreateContact, useUpdateContact } from "@/hooks/use-contacts"

function MyComponent() {
  const { data: contacts, isLoading, error } = useContacts()
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage />
  // ...
}
```

## 🔄 Component Update Examples

### Example 1: ContactsPage

See `src/pages/ContactsPage.tsx` for a complete example of:
- Using `useContacts()` hook
- Handling loading states
- Handling errors
- Filtering data (move filtering logic to component)

### Example 2: Creating a Contact

```tsx
import { useCreateContact } from "@/hooks/use-contacts"
import { toast } from "sonner"

function CreateContactForm() {
  const createContact = useCreateContact()
  
  const handleSubmit = async (data) => {
    try {
      await createContact.mutateAsync(data)
      toast.success("Contact created!")
    } catch (error) {
      toast.error("Failed to create contact")
    }
  }
  // ...
}
```

### Example 3: Updating a Contact

```tsx
import { useUpdateContact } from "@/hooks/use-contacts"

function EditContactForm({ contactId }) {
  const { data: contact } = useContact(contactId)
  const updateContact = useUpdateContact()
  
  const handleSubmit = async (data) => {
    await updateContact.mutateAsync({
      id: contactId,
      contact: data
    })
  }
  // ...
}
```

## 🗑️ Removing Mock Data

Once all components are migrated:

1. **Keep types**: Move type definitions from `src/data/mock-data.ts` to `src/lib/supabase/types.ts` if needed
2. **Remove mock data file**: Delete `src/data/mock-data.ts`
3. **Update imports**: Replace all imports of mock data with Supabase hooks
4. **Remove unused functions**: Remove helper functions that are no longer needed

### Types to Keep

These types from `mock-data.ts` should be preserved:
- `Contact` → Now `AppContact` in `src/lib/supabase/types.ts`
- `Segment` → Now in `src/lib/supabase/types.ts`
- `Campaign` → Now in `src/lib/supabase/types.ts`
- `Notification` → Now in `src/lib/supabase/types.ts`
- `SegmentFilter` → Now in `src/lib/supabase/types.ts`

### Helper Functions to Review

Some helper functions in `mock-data.ts` may still be useful:
- `contactMatchesFilter()` - May need to adapt for database queries
- `getDashboardChartData()` - Can keep for generating chart data
- `getDashboardMetrics()` - Can keep if using calculated metrics

## 🔍 Testing Checklist

After migration, test:

- [ ] Contacts list loads correctly
- [ ] Create contact works
- [ ] Edit contact works
- [ ] Delete contact works
- [ ] Contact filtering works
- [ ] Contact search works
- [ ] Segments list loads
- [ ] Create segment works
- [ ] Segment filters work correctly
- [ ] Campaigns list loads
- [ ] Create/edit campaign works

## 🐛 Troubleshooting

### Connection Issues
- Verify `.env` file exists and has correct values
- Check browser console for connection errors
- Verify Supabase project is active (not paused)

### RLS (Row Level Security) Issues
- Current schema has permissive policies for development
- For production, implement proper user-based RLS policies

### Type Mismatches
- Check that `AppContact` type matches your component expectations
- Some fields may need transformation (e.g., `first_name` → `firstName`)

### Performance
- Consider adding pagination for large datasets
- Use React Query's caching to avoid unnecessary requests
- Add proper indexes for frequently queried fields

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Supabase JS Client Reference](https://supabase.com/docs/reference/javascript/introduction)

## ⚠️ Important Notes

1. **Dashboard Metrics**: The dashboard may still use mock/calculated data for metrics and charts. This is acceptable if you're generating analytics from aggregated data.

2. **Segments**: Segment filtering logic currently evaluates in-memory. For better performance with large datasets, consider:
   - Using Supabase PostgREST filters
   - Creating database functions
   - Implementing server-side filtering

3. **Notifications**: If notifications come from external systems, you may want to keep the current notification context system or integrate it with Supabase.

4. **Authentication**: The current setup uses permissive RLS policies. For production:
   - Implement proper authentication
   - Add user-based RLS policies
   - Consider using Supabase Auth

