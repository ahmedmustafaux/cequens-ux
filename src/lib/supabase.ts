import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables and throw clear error if missing
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  const errorMessage = `
    ⚠️ Supabase configuration is missing!
    
    Missing environment variables: ${missingVars.join(', ')}
    
    Setup Instructions:
    1. For local development: Create a .env file in the project root with:
       VITE_SUPABASE_URL=https://your-project.supabase.co
       VITE_SUPABASE_ANON_KEY=your-anon-key-here
    
    2. For Vercel deployment: 
       - Go to your Vercel project → Settings → Environment Variables
       - Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
       - Redeploy your application
    
    See supabase/README.md for detailed setup instructions.
  `
  
  // Always throw in both dev and production to prevent silent failures
  throw new Error(errorMessage)
}

// Create client with validated values
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
