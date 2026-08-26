/** Extracts the bearer token from an Authorization header, or null if absent/malformed. */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() || null : null;
}
