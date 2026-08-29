import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// We use the service role key server-side only so we can bypass RLS 
// while passing the Clerk userId as part of the query.
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);
