import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { hmacSHA256 } from 'https://esm.sh/crypto-js@4.1.1';

function parseSignatureHeader(signatureHeader: string): { timestamp: string; signature: string } | null {
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((part) => part.startsWith('t='));
  const signaturePart = parts.find((part) => part.startsWith('v1='));

  if (!timestampPart || !signaturePart) return null;

  return {
    timestamp: timestampPart.slice(2),
    signature: signaturePart.slice(3),
  };
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const REVENUECAT_WEBHOOK_KEY = Deno.env.get('REVENUECAT_WEBHOOK_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !REVENUECAT_WEBHOOK_KEY) {
  throw new Error('Missing required environment variables for RevenueCat webhook');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface RevenueCatEvent {
  event: {
    type: string;
    app_user_id: string;
    product_id?: string;
    purchased_at_ms?: number;
    expiration_at_ms?: number;
    grace_period_expiration_at_ms?: number;
  };
}

interface WebhookRequest {
  body: string;
  headers: Record<string, string>;
}

/**
 * Verify RevenueCat webhook signature per their current documentation:
 * header format: X-RevenueCat-Webhook-Signature: t=<timestamp>,v1=<hmac_sha256_hex>
 * payload: <timestamp>.<raw_request_body>
 */
function verifyWebhookSignature(body: string, signatureHeader: string): boolean {
  try {
    const parsed = parseSignatureHeader(signatureHeader);
    if (!parsed) return false;

    const signedPayload = `${parsed.timestamp}.${body}`;
    const computedSignature = hmacSHA256(signedPayload, REVENUECAT_WEBHOOK_KEY!).toString();
    return computedSignature.toLowerCase() === parsed.signature.toLowerCase();
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

async function handleRevenueCatEvent(event: RevenueCatEvent): Promise<void> {
  const eventType = event.event.type;
  const userId = event.event.app_user_id;

  if (!userId) {
    console.error('Webhook event missing app_user_id');
    return;
  }

  console.log(`Processing RevenueCat event: ${eventType} for user: ${userId}`);

  try {
    // Map RevenueCat events to entitlement state
    switch (eventType) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
        // User purchased or renewed Gold subscription
        await supabase.from('user_entitlements').upsert(
          {
            user_id: userId,
            tier: 'gold',
            gold_until: event.event.expiration_at_ms
              ? new Date(event.event.expiration_at_ms).toISOString()
              : null,
            source: 'revenuecat',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
        console.log(`Updated user ${userId} to gold tier`);
        break;

      case 'CANCELLATION':
      case 'EXPIRATION':
        // User cancelled or Gold subscription expired - downgrade to free
        await supabase.from('user_entitlements').upsert(
          {
            user_id: userId,
            tier: 'free',
            gold_until: null,
            source: 'revenuecat',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
        console.log(`Downgraded user ${userId} to free tier`);
        break;

      case 'BILLING_ISSUE': {
        // Payment failed — RevenueCat gives a grace window before the entitlement
        // actually lapses. Store that window as gold_until so existing RLS checks
        // (gold_until > now()) keep access alive during grace and self-expire after,
        // without needing a follow-up event.
        const graceExpiresAtMs = event.event.grace_period_expiration_at_ms;
        const inGracePeriod = Boolean(graceExpiresAtMs && graceExpiresAtMs > Date.now());

        if (inGracePeriod) {
          await supabase.from('user_entitlements').upsert(
            {
              user_id: userId,
              tier: 'gold',
              gold_until: new Date(graceExpiresAtMs!).toISOString(),
              source: 'revenuecat',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );
          console.log(
            `Billing issue for user ${userId}, in grace period until ${new Date(graceExpiresAtMs!).toISOString()}`,
          );
        } else {
          await supabase.from('user_entitlements').upsert(
            {
              user_id: userId,
              tier: 'free',
              gold_until: null,
              source: 'revenuecat',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );
          console.log(`Billing issue for user ${userId}, no/expired grace period — downgraded to free`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (error) {
    console.error(`Error processing event for user ${userId}:`, error);
    throw error;
  }
}

export async function handler(req: WebhookRequest): Promise<Response> {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const signature = req.headers['x-revenuecat-webhook-signature'] || req.headers['x-revenuecat-signature'] || req.headers['x-signature'];

    if (!signature) {
      console.error('Webhook missing signature header');
      return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 401 });
    }

    const body = req.body;

    if (!verifyWebhookSignature(body, signature as string)) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 });
    }

    const event = JSON.parse(body) as RevenueCatEvent;
    await handleRevenueCatEvent(event);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
