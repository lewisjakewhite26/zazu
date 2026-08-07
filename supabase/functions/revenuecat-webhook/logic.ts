// Pure logic for the RevenueCat webhook — signature verification and the
// event -> entitlement mapping — with no Deno-specific or network imports,
// so it can run under both the Deno edge function (index.ts) and Vitest.

export const WEBHOOK_TOLERANCE_SECONDS = 300;

export interface RevenueCatEvent {
  event: {
    type: string;
    app_user_id: string;
    product_id?: string;
    purchased_at_ms?: number;
    expiration_at_ms?: number;
    grace_period_expiration_at_ms?: number;
  };
}

export interface EntitlementUpdate {
  tier: 'gold' | 'free';
  gold_until: string | null;
}

export function parseSignatureHeader(
  signatureHeader: string,
): { timestamp: string; signature: string } | null {
  const parts = signatureHeader.split(',');
  const timestampPart = parts.find((part) => part.startsWith('t='));
  const signaturePart = parts.find((part) => part.startsWith('v1='));

  if (!timestampPart || !signaturePart) return null;

  return {
    timestamp: timestampPart.slice(2),
    signature: signaturePart.slice(3),
  };
}

/** Constant-time string comparison — avoids leaking match length via timing. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verify RevenueCat webhook signature per their current documentation:
 * header format: X-RevenueCat-Webhook-Signature: t=<timestamp>,v1=<hmac_sha256_hex>
 * payload: <timestamp>.<raw_request_body>
 *
 * `computeHmacHex` is injected so this module has no crypto-library
 * dependency of its own — index.ts passes crypto-js (its existing Deno
 * import), tests pass Node's builtin `crypto`.
 */
export function verifyWebhookSignature(
  body: string,
  signatureHeader: string,
  secret: string,
  computeHmacHex: (payload: string, secret: string) => string,
  nowMs: number = Date.now(),
): boolean {
  try {
    const parsed = parseSignatureHeader(signatureHeader);
    if (!parsed) return false;

    // Reject stale signatures so a captured, still-valid payload can't be
    // replayed later to re-grant or otherwise mutate entitlements.
    const timestampSeconds = Number.parseInt(parsed.timestamp, 10);
    if (!Number.isFinite(timestampSeconds)) return false;
    const ageSeconds = Math.abs(nowMs / 1000 - timestampSeconds);
    if (ageSeconds > WEBHOOK_TOLERANCE_SECONDS) return false;

    const signedPayload = `${parsed.timestamp}.${body}`;
    const computedSignature = computeHmacHex(signedPayload, secret);
    return timingSafeEqual(computedSignature.toLowerCase(), parsed.signature.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Pure mapping from a RevenueCat event to the `user_entitlements` row it
 * implies — no Supabase call, just the decision. Returns null for event
 * types we don't act on (mirrors the `default` branch in the original
 * switch statement).
 */
export function decideEntitlementUpdate(
  event: RevenueCatEvent,
  nowMs: number = Date.now(),
): EntitlementUpdate | null {
  const eventType = event.event.type;

  switch (eventType) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
      return {
        tier: 'gold',
        gold_until: event.event.expiration_at_ms
          ? new Date(event.event.expiration_at_ms).toISOString()
          : null,
      };

    case 'CANCELLATION':
    case 'EXPIRATION':
      return { tier: 'free', gold_until: null };

    case 'BILLING_ISSUE': {
      const graceExpiresAtMs = event.event.grace_period_expiration_at_ms;
      const inGracePeriod = Boolean(graceExpiresAtMs && graceExpiresAtMs > nowMs);

      if (inGracePeriod) {
        return { tier: 'gold', gold_until: new Date(graceExpiresAtMs!).toISOString() };
      }
      return { tier: 'free', gold_until: null };
    }

    default:
      return null;
  }
}
