-- Seed contacts for user ID: 2be144fe-cf45-461f-9924-3f74343141b7
-- Run this in your Supabase SQL Editor to add sample contacts for testing

-- Get user ID
WITH target_user AS (
  SELECT '2be144fe-cf45-461f-9924-3f74343141b7'::UUID AS id
)

-- Insert sample contacts
INSERT INTO contacts (user_id, name, first_name, last_name, phone, email_address, country_iso, avatar, avatar_color, tags, channel, conversation_status, assignee, last_message, language, bot_status, last_interacted_channel, conversation_opened_time, last_interaction_time, created_at, updated_at)
SELECT
  (SELECT id FROM target_user),
  'Ahmed Al-Saud',
  'Ahmed',
  'Al-Saud',
  '+966501234567',
  'ahmed.alsaud@example.com',
  'SA',
  'AS',
  'bg-blue-500',
  ARRAY['VIP', 'Premium'],
  'whatsapp',
  'assigned',
  'Support Team',
  'Thank you for your order!',
  'ar',
  'active',
  'whatsapp',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Fatima Al-Zahra',
  'Fatima',
  'Al-Zahra',
  '+971501234567',
  'fatima.zahra@example.com',
  'AE',
  'FZ',
  'bg-purple-500',
  ARRAY['New Customer'],
  'sms',
  'unassigned',
  NULL,
  'Welcome to our service!',
  'ar',
  'inactive',
  'sms',
  NULL,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '15 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Mohamed Hassan',
  'Mohamed',
  'Hassan',
  '+201234567890',
  'mohamed.hassan@example.com',
  'EG',
  'MH',
  'bg-green-500',
  ARRAY['Returning Customer', 'Loyal'],
  'email',
  'assigned',
  'Sales Team',
  'Your order has been shipped',
  'ar',
  'active',
  'email',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '60 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Sara Al-Rashid',
  'Sara',
  'Al-Rashid',
  '+966502345678',
  'sara.rashid@example.com',
  'SA',
  'SR',
  'bg-pink-500',
  ARRAY['VIP'],
  'whatsapp',
  'assigned',
  'Support Team',
  'Your payment has been processed',
  'ar',
  'active',
  'whatsapp',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '45 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Omar Al-Mansouri',
  'Omar',
  'Al-Mansouri',
  '+971502345678',
  'omar.mansouri@example.com',
  'AE',
  'OM',
  'bg-orange-500',
  ARRAY['New Customer', 'Trial'],
  'messenger',
  'unassigned',
  NULL,
  'Start your free trial today!',
  'en',
  'inactive',
  'messenger',
  NULL,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '10 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Noura Al-Mutairi',
  'Noura',
  'Al-Mutairi',
  '+966503456789',
  'noura.mutairi@example.com',
  'SA',
  'NM',
  'bg-indigo-500',
  ARRAY['Premium', 'Loyal'],
  'sms',
  'assigned',
  'Support Team',
  'Your subscription is active',
  'ar',
  'active',
  'sms',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '45 minutes',
  NOW() - INTERVAL '90 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Yasmine Fawzy',
  'Yasmine',
  'Fawzy',
  '+201234567891',
  'yasmine.fawzy@example.com',
  'EG',
  'YF',
  'bg-teal-500',
  ARRAY['New Customer'],
  'whatsapp',
  'unassigned',
  NULL,
  'Welcome! How can we help?',
  'ar',
  'inactive',
  'whatsapp',
  NULL,
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '7 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Khalid Al-Qasimi',
  'Khalid',
  'Al-Qasimi',
  '+971503456789',
  'khalid.qasimi@example.com',
  'AE',
  'KQ',
  'bg-cyan-500',
  ARRAY['VIP', 'Premium'],
  'email',
  'assigned',
  'Sales Team',
  'Your invoice is ready',
  'en',
  'active',
  'email',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '120 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Layla Al-Otaibi',
  'Layla',
  'Al-Otaibi',
  '+966504567890',
  'layla.otaibi@example.com',
  'SA',
  'LO',
  'bg-rose-500',
  ARRAY['Returning Customer'],
  'whatsapp',
  'assigned',
  'Support Team',
  'Your order is on the way',
  'ar',
  'active',
  'whatsapp',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '20 minutes',
  NOW() - INTERVAL '75 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Tarek El-Sayed',
  'Tarek',
  'El-Sayed',
  '+201234567892',
  'tarek.elsayed@example.com',
  'EG',
  'TE',
  'bg-amber-500',
  ARRAY['New Customer', 'Trial'],
  'sms',
  'unassigned',
  NULL,
  'Try our premium features',
  'ar',
  'inactive',
  'sms',
  NULL,
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '5 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Mariam Al-Hashimi',
  'Mariam',
  'Al-Hashimi',
  '+971504567890',
  'mariam.hashimi@example.com',
  'AE',
  'MH',
  'bg-violet-500',
  ARRAY['Premium', 'Loyal'],
  'whatsapp',
  'assigned',
  'Support Team',
  'Thank you for your feedback',
  'ar',
  'active',
  'whatsapp',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '10 minutes',
  NOW() - INTERVAL '100 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Fahad Al-Shammari',
  'Fahad',
  'Al-Shammari',
  '+966505678901',
  'fahad.shammari@example.com',
  'SA',
  'FS',
  'bg-emerald-500',
  ARRAY['VIP'],
  'email',
  'assigned',
  'Sales Team',
  'Your account has been upgraded',
  'ar',
  'active',
  'email',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '150 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Dina Mahmoud',
  'Dina',
  'Mahmoud',
  '+201234567893',
  'dina.mahmoud@example.com',
  'EG',
  'DM',
  'bg-fuchsia-500',
  ARRAY['New Customer'],
  'messenger',
  'unassigned',
  NULL,
  'Welcome to our platform',
  'ar',
  'inactive',
  'messenger',
  NULL,
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '3 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Hamdan Al-Mazrouei',
  'Hamdan',
  'Al-Mazrouei',
  '+971505678901',
  'hamdan.mazrouei@example.com',
  'AE',
  'HM',
  'bg-sky-500',
  ARRAY['Returning Customer', 'Loyal'],
  'sms',
  'assigned',
  'Support Team',
  'Your request has been processed',
  'en',
  'active',
  'sms',
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '180 days',
  NOW()

UNION ALL

SELECT
  (SELECT id FROM target_user),
  'Reem Al-Ghamdi',
  'Reem',
  'Al-Ghamdi',
  '+966506789012',
  'reem.ghamdi@example.com',
  'SA',
  'RG',
  'bg-lime-500',
  ARRAY['Premium', 'VIP'],
  'whatsapp',
  'assigned',
  'Support Team',
  'Your delivery is scheduled',
  'ar',
  'active',
  'whatsapp',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '5 minutes',
  NOW() - INTERVAL '200 days',
  NOW();

-- Verify the contacts were inserted
SELECT 
  id,
  name,
  phone,
  country_iso,
  channel,
  conversation_status,
  tags,
  created_at
FROM contacts
WHERE user_id = '2be144fe-cf45-461f-9924-3f74343141b7'
ORDER BY created_at DESC;
