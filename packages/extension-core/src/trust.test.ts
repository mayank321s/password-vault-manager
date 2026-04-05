import { describe, expect, it } from 'vitest';
import {
  assessCredentialTrust,
  createTrustedBrowserAutofillPlan,
  type ExtensionPairingRecord,
} from './index';

const candidate = {
  passwordId: 'password-1',
  vaultId: 'vault-1',
  vaultName: 'Personal',
  title: 'GitHub',
  encryptedData: 'ciphertext',
  accessSource: 'vault' as const,
  isNote: false,
  createdAt: '2026-04-05T00:00:00.000Z',
  updatedAt: '2026-04-05T00:00:00.000Z',
  username: 'octocat',
  password: 'hunter2',
  urls: ['https://github.com/login'],
};

const pairing: ExtensionPairingRecord = {
  browserId: 'browser-1',
  browserName: 'Alice MacBook Chrome',
  target: 'chromium',
  trustedOrigins: ['https://github.com/*'],
  approvedAt: '2026-04-05T00:00:00.000Z',
};

describe('extension trust controls', () => {
  it('blocks credential access from an unpaired browser', () => {
    expect(
      assessCredentialTrust({
        credential: candidate,
        target: 'chromium',
        pageUrl: 'https://github.com/login',
        pairing,
        browserId: 'browser-2',
      }),
    ).toEqual({
      allowAutofill: false,
      allowCredentialAccess: false,
      matchedOrigin: null,
      reason: 'unpaired-browser',
    });
  });

  it('allows autofill only for explicitly trusted origins', () => {
    expect(
      assessCredentialTrust({
        credential: candidate,
        target: 'chromium',
        pageUrl: 'https://github.com/login',
        pairing,
        browserId: 'browser-1',
      }),
    ).toEqual({
      allowAutofill: true,
      allowCredentialAccess: true,
      matchedOrigin: 'https://github.com/*',
      reason: 'trusted-origin',
    });
  });

  it('blocks autofill on lookalike domains even with the same path shape', () => {
    const plan = createTrustedBrowserAutofillPlan({
      target: 'chromium',
      credentials: [candidate],
      pageUrl: 'https://github-login.com/login',
      fields: [
        { fieldId: 'username', type: 'text', autocomplete: 'username' },
        { fieldId: 'password', type: 'password', autocomplete: 'current-password' },
      ],
      pairing,
      browserId: 'browser-1',
    });

    expect(plan.instructions).toEqual([]);
    expect(plan.blockedCredentials).toEqual([
      {
        credentialId: 'password-1',
        reason: 'untrusted-origin',
      },
    ]);
  });

  it('keeps credentials visible but not autofillable on sibling subdomains', () => {
    expect(
      assessCredentialTrust({
        credential: candidate,
        target: 'chromium',
        pageUrl: 'https://docs.github.com',
        pairing: {
          ...pairing,
          trustedOrigins: ['https://github.com/*'],
        },
        browserId: 'browser-1',
      }),
    ).toEqual({
      allowAutofill: false,
      allowCredentialAccess: true,
      matchedOrigin: 'https://github.com/login',
      reason: 'subdomain-match',
    });
  });

  it('rejects pairing records from a different browser family', () => {
    expect(
      assessCredentialTrust({
        credential: candidate,
        target: 'firefox',
        pageUrl: 'https://github.com/login',
        pairing,
        browserId: 'browser-1',
      }),
    ).toEqual({
      allowAutofill: false,
      allowCredentialAccess: false,
      matchedOrigin: null,
      reason: 'unpaired-browser',
    });
  });
});
