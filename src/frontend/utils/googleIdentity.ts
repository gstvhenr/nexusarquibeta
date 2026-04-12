/**
 * Input -> Output:
 * - input: Google Identity credential fragments (base64url / JWT).
 * - output: parsed user identity data for frontend-only session bootstrap.
 */

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4;
    const padded =
      padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), '=');
    return window.atob(padded);
  } catch {
    return null;
  }
}

export function extractGoogleCredentialEmail(credential: string): string | null {
  const payload = credential.split('.')[1];
  if (!payload) return null;

  const decodedPayload = decodeBase64Url(payload);
  if (!decodedPayload) return null;

  try {
    const parsed = JSON.parse(decodedPayload) as { email?: string };
    return parsed.email ?? null;
  } catch {
    return null;
  }
}
