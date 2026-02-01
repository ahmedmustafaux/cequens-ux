export interface UpdateLog {
    id: string;
    date: string;
    title: string;
    content: string;
    type?: 'feature' | 'fix' | 'update' | 'improvement';
}

export const UPDATE_LOGS: UpdateLog[] = [
    {
        id: 'update-feb-01-campaign-targeting',
        date: 'Feb 01',
        title: 'Rich Campaign Targeting & Shopify',
        content: `• Feature: Redesigned Campaign Targeting step with 2-column Master-Detail UI.
• Integration: Added native Shopify trigger support with abandoned cart & order events.
• UX: Enhanced trigger selection with intelligent inputs (e.g. Min Order Amount).
• Refactor: Moved trigger selection from dialog to main wizard flow.`,
        type: 'feature'
    },
    {
        id: 'update-feb-01-nav-sidebar',
        date: 'Feb 01',
        title: 'Sidebar & Navigation Enhancements',
        content: `• Feature: Added external link support with "ArrowUpRight" icons in main navigation.
• Component: Introduced status badges for navigation items and sub-items.
• Sidebar: Integrated "ChannelPrompter" for proactive user engagement.
• UX: Refined sidebar animations and chevron interaction logic.`,
        type: 'feature'
    },
    {
        id: 'update-feb-01-final',
        date: 'Feb 01',
        title: 'Refined Dev Updates Drawer',
        content: `• Feature: Implemented vertical drawer for development updates.
• Component: Added card-based categorization for features, fixes, and updates.
• UX: Integrated "Mark as Read" (individual) and "Mark all as read" (global) functionality.
• UI: Standardized icon set and refined layout for better spacing and visibility.`,
        type: 'feature'
    },
    {
        id: 'update-jan-29',
        date: 'Jan 29',
        title: 'Daily Update',
        content: `• UI Refinement: Signup page logos are now larger; section renamed to "OUR PARTNERS".
• Fixes: Replaced 'saal.webp' with correct PNG format.
• New Feature: Added Global Update Banner (Floating UI at bottom) to track these changes.`,
        type: 'update'
    }
];

// Deprecated: kept for backward compatibility if needed, but should be removed
export const UPDATE_MESSAGE = UPDATE_LOGS[0].content;
