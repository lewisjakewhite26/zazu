import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { extractBearerToken } from './logic.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables for delete-account');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return new Response(JSON.stringify({ error: 'Missing bearer token' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Resolve the caller's own user id from their access token — never trust a
    // body-supplied id, so a user can only ever delete their own account.
    const supabaseAsCaller = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userError } = await supabaseAsCaller.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const userId = userData.user.id;

    // user_word_progress and user_entitlements both reference auth.users with
    // ON DELETE CASCADE, so deleting the auth user cleanly removes both.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error(`Failed to delete user ${userId}:`, deleteError);
      return new Response(JSON.stringify({ error: 'Could not delete account' }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log(`Deleted account for user ${userId}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('delete-account handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
