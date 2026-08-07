import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  decideEntitlementUpdate,
  parseSignatureHeader,
  timingSafeEqual,
  verifyWebhookSignature,
  WEBHOOK_TOLERANCE_SECONDS,
  type RevenueCatEvent,
} from './logic';

const SECRET = 'test-webhook-secret';

/** Node's builtin crypto — deliberately a different implementation from
 * production's crypto-js, so a pass here proves interop with any standard
 * HMAC-SHA256 implementation (i.e. RevenueCat's real signer), not just
 * agreement with our own library choice. */
function nodeHmacHex(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

function sign(body: string, timestampSeconds: number, secret = SECRET): string {
  const signedPayload = `${timestampSeconds}.${body}`;
  const signature = nodeHmacHex(signedPayload, secret);
  return `t=${timestampSeconds},v1=${signature}`;
}

describe('parseSignatureHeader', () => {
  it('extracts timestamp and signature', () => {
    expect(parseSignatureHeader('t=1700000000,v1=abcdef')).toEqual({
      timestamp: '1700000000',
      signature: 'abcdef',
    });
  });

  it('returns null when timestamp part is missing', () => {
    expect(parseSignatureHeader('v1=abcdef')).toBeNull();
  });

  it('returns null when signature part is missing', () => {
    expect(parseSignatureHeader('t=1700000000')).toBeNull();
  });

  it('returns null for garbage input', () => {
    expect(parseSignatureHeader('not-a-signature-header')).toBeNull();
  });
});

describe('timingSafeEqual', () => {
  it('returns true for identical strings', () => {
    expect(timingSafeEqual('abc123', 'abc123')).toBe(true);
  });

  it('returns false for different strings of equal length', () => {
    expect(timingSafeEqual('abc123', 'abc124')).toBe(false);
  });

  it('returns false for different-length strings', () => {
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });
});

describe('verifyWebhookSignature', () => {
  const nowMs = 1_700_000_000_000;
  const nowSeconds = Math.floor(nowMs / 1000);

  it('accepts a validly signed body computed by a different HMAC-SHA256 implementation', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });
    const header = sign(body, nowSeconds);

    expect(verifyWebhookSignature(body, header, SECRET, nodeHmacHex, nowMs)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });
    const header = sign(body, nowSeconds);
    const tamperedBody = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'attacker' } });

    expect(verifyWebhookSignature(tamperedBody, header, SECRET, nodeHmacHex, nowMs)).toBe(false);
  });

  it('rejects a signature computed with the wrong secret', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });
    const header = sign(body, nowSeconds, 'wrong-secret');

    expect(verifyWebhookSignature(body, header, SECRET, nodeHmacHex, nowMs)).toBe(false);
  });

  it('rejects a stale timestamp outside the tolerance window', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });
    const staleSeconds = nowSeconds - WEBHOOK_TOLERANCE_SECONDS - 1;
    const header = sign(body, staleSeconds);

    expect(verifyWebhookSignature(body, header, SECRET, nodeHmacHex, nowMs)).toBe(false);
  });

  it('accepts a timestamp right at the edge of the tolerance window', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });
    const edgeSeconds = nowSeconds - WEBHOOK_TOLERANCE_SECONDS;
    const header = sign(body, edgeSeconds);

    expect(verifyWebhookSignature(body, header, SECRET, nodeHmacHex, nowMs)).toBe(true);
  });

  it('rejects a malformed signature header', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });

    expect(verifyWebhookSignature(body, 'garbage', SECRET, nodeHmacHex, nowMs)).toBe(false);
  });

  it('rejects a non-numeric timestamp', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });

    expect(
      verifyWebhookSignature(body, 't=not-a-number,v1=abcdef', SECRET, nodeHmacHex, nowMs),
    ).toBe(false);
  });

  it('does not throw if the injected hmac function throws', () => {
    const body = JSON.stringify({ event: { type: 'INITIAL_PURCHASE', app_user_id: 'u1' } });
    const header = sign(body, nowSeconds);
    const throwingHmac = () => {
      throw new Error('boom');
    };

    expect(verifyWebhookSignature(body, header, SECRET, throwingHmac, nowMs)).toBe(false);
  });
});

describe('decideEntitlementUpdate', () => {
  const nowMs = 1_700_000_000_000;

  function event(type: string, extra: Partial<RevenueCatEvent['event']> = {}): RevenueCatEvent {
    return { event: { type, app_user_id: 'u1', ...extra } };
  }

  it('grants gold with the expiration date on INITIAL_PURCHASE', () => {
    const expirationMs = nowMs + 30 * 24 * 60 * 60 * 1000;
    const result = decideEntitlementUpdate(event('INITIAL_PURCHASE', { expiration_at_ms: expirationMs }), nowMs);

    expect(result).toEqual({ tier: 'gold', gold_until: new Date(expirationMs).toISOString() });
  });

  it('grants gold with no expiry when RENEWAL has no expiration_at_ms', () => {
    const result = decideEntitlementUpdate(event('RENEWAL'), nowMs);

    expect(result).toEqual({ tier: 'gold', gold_until: null });
  });

  it('downgrades to free on CANCELLATION', () => {
    expect(decideEntitlementUpdate(event('CANCELLATION'), nowMs)).toEqual({
      tier: 'free',
      gold_until: null,
    });
  });

  it('downgrades to free on EXPIRATION', () => {
    expect(decideEntitlementUpdate(event('EXPIRATION'), nowMs)).toEqual({
      tier: 'free',
      gold_until: null,
    });
  });

  it('keeps gold through the grace window on BILLING_ISSUE', () => {
    const graceExpiresAtMs = nowMs + 3 * 24 * 60 * 60 * 1000;
    const result = decideEntitlementUpdate(
      event('BILLING_ISSUE', { grace_period_expiration_at_ms: graceExpiresAtMs }),
      nowMs,
    );

    expect(result).toEqual({ tier: 'gold', gold_until: new Date(graceExpiresAtMs).toISOString() });
  });

  it('downgrades to free on BILLING_ISSUE once the grace window has passed', () => {
    const graceExpiresAtMs = nowMs - 1;
    const result = decideEntitlementUpdate(
      event('BILLING_ISSUE', { grace_period_expiration_at_ms: graceExpiresAtMs }),
      nowMs,
    );

    expect(result).toEqual({ tier: 'free', gold_until: null });
  });

  it('downgrades to free on BILLING_ISSUE with no grace period at all', () => {
    const result = decideEntitlementUpdate(event('BILLING_ISSUE'), nowMs);

    expect(result).toEqual({ tier: 'free', gold_until: null });
  });

  it('returns null for unhandled event types (e.g. TRANSFER, TEST)', () => {
    expect(decideEntitlementUpdate(event('TEST'), nowMs)).toBeNull();
    expect(decideEntitlementUpdate(event('TRANSFER'), nowMs)).toBeNull();
  });
});
