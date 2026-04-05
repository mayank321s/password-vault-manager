import { describe, expect, it } from 'vitest';
import {
  createChromiumAutofillPlan,
  detectChromiumCredentialChange,
  matchChromiumCredentialsForUrl,
  toChromiumCredentialCandidate,
  type ExtensionCredentialContent,
} from './index';

const credentialRecord = {
  passwordId: 'password-1',
  vaultId: 'vault-1',
  vaultName: 'Personal',
  title: 'GitHub',
  encryptedData: 'ciphertext',
  accessSource: 'vault' as const,
  isNote: false,
  createdAt: '2026-04-05T00:00:00.000Z',
  updatedAt: '2026-04-05T00:00:00.000Z',
};

describe('chromium credential helpers', () => {
  it('normalizes generic password fields into a chromium credential candidate', () => {
    const content: ExtensionCredentialContent = {
      type: 'password',
      fields: [
        { label: 'Username', value: 'octocat' },
        { label: 'Password', value: 'hunter2' },
        { label: 'Website', value: 'https://github.com/login' },
      ],
    };

    expect(toChromiumCredentialCandidate(credentialRecord, content)).toEqual({
      ...credentialRecord,
      username: 'octocat',
      password: 'hunter2',
      urls: ['https://github.com/login'],
    });
  });

  it('matches credentials by exact host before broader domain matches', () => {
    const exact = {
      ...credentialRecord,
      passwordId: 'password-exact',
      username: 'octocat',
      password: 'hunter2',
      urls: ['https://github.com/login'],
    };
    const parentDomain = {
      ...credentialRecord,
      passwordId: 'password-parent',
      username: 'octocat',
      password: 'hunter2',
      urls: ['https://example.com/login'],
    };

    expect(
      matchChromiumCredentialsForUrl(
        [parentDomain, exact],
        'https://github.com/settings/profile',
      ).map((credential) => credential.passwordId),
    ).toEqual(['password-exact']);
  });

  it('creates an autofill plan for username and password fields', () => {
    const candidate = {
      ...credentialRecord,
      username: 'octocat',
      password: 'hunter2',
      urls: ['https://github.com/login'],
    };

    expect(
      createChromiumAutofillPlan({
        credentials: [candidate],
        pageUrl: 'https://github.com/login',
        fields: [
          {
            fieldId: 'login_field',
            type: 'email',
            autocomplete: 'username',
          },
          {
            fieldId: 'password',
            type: 'password',
            autocomplete: 'current-password',
          },
        ],
      }),
    ).toEqual({
      selectedCredential: candidate,
      matchedCredentials: [candidate],
      instructions: [
        {
          fieldId: 'login_field',
          kind: 'username',
          value: 'octocat',
        },
        {
          fieldId: 'password',
          kind: 'password',
          value: 'hunter2',
        },
      ],
    });
  });

  it('detects when an existing chromium credential should be updated', () => {
    const candidate = {
      ...credentialRecord,
      username: 'octocat',
      password: 'old-password',
      urls: ['https://github.com/login'],
    };

    expect(
      detectChromiumCredentialChange({
        credentials: [candidate],
        pageUrl: 'https://github.com/session',
        submittedUsername: 'octocat',
        submittedPassword: 'new-password',
      }),
    ).toEqual({
      action: 'update',
      matchedCredentialId: 'password-1',
    });
  });
});
