import { describe, expect, it } from 'vitest';
import { extractGoogleCredentialEmail } from './googleIdentity';

function buildCredential(payload: Record<string, unknown>): string {
  const header = { alg: 'none', typ: 'JWT' };
  const encode = (value: Record<string, unknown>): string =>
    btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

  return `${encode(header)}.${encode(payload)}.signature`;
}

describe('extractGoogleCredentialEmail', () => {
  it('should return the email when the credential payload contains one', () => {
    const credential = buildCredential({ email: 'arquiteta@nexus.com' });

    expect(extractGoogleCredentialEmail(credential)).toBe('arquiteta@nexus.com');
  });

  it('should return null when the credential does not contain an email', () => {
    const credential = buildCredential({ sub: '1234567890' });

    expect(extractGoogleCredentialEmail(credential)).toBeNull();
  });

  it('should return null when the credential payload is invalid', () => {
    expect(extractGoogleCredentialEmail('invalid.@@@.signature')).toBeNull();
  });
});
