// Type definitions for Supabase database tables
// These match the schema defined in supabase/schema.sql

export type Contact = {
  id: string;
  user_id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  email_address: string | null;
  country_iso: string;
  avatar: string | null;
  avatar_color: string | null;
  tags: string[];
  channel: string | null;
  conversation_status: string;
  assignee: string | null;
  last_message: string | null;
  language: string | null;
  bot_status: string | null;
  last_interacted_channel: string | null;
  conversation_opened_time: string | null;
  archived: boolean;
  created_at: string;
  last_interaction_time: string | null;
  updated_at: string;
}

export type Segment = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  filters: SegmentFilter[];
  contact_ids: string[];
  created_at: string;
  updated_at: string;
}

export type SegmentFilter = {
  field: string;
  operator: string;
  value: string | string[] | number | number[] | { from: string; to: string };
}

export type Campaign = {
  id: string;
  user_id: string;
  name: string;
  status: "Active" | "Draft" | "Completed";
  type: "Email" | "SMS" | "Whatsapp";
  recipients: number;
  sent_date: string | null;
  open_rate: number;
  click_rate: number;
  created_at: string;
  updated_at: string;
}

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'campaign' | 'contact' | 'message' | 'billing' | null;
  priority: 'low' | 'medium' | 'high' | 'urgent' | null;
  read: boolean;
  archived: boolean;
  timestamp: string;
  created_at: string;
}

// Helper type for converting database Contact to app Contact format
export type AppContact = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  emailAddress?: string;
  countryISO: string;
  avatar: string;
  avatarColor: string;
  tags: string[];
  channel: string | null;
  conversationStatus: string;
  assignee: string | null;
  lastMessage: string;
  isSelected: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastInteractionTime?: Date;
  language?: string;
  botStatus?: string;
  lastInteractedChannel?: string;
  conversationOpenedTime?: Date;
  archived?: boolean;
}

