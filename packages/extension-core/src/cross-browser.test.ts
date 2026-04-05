import { describe, expect, it } from 'vitest';
import {
  createBrowserAutofillPlan,
  createBrowserExtensionManifestConfig,
  validateSafariSigningConfig,
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

describe('cross-browser extension helpers', () => {
  it('keeps Firefox autofill compatible with the Chromium credential model', () => {
    const plan = createBrowserAutofillPlan({
      target: 'firefox',
      credentials: [candidate],
      pageUrl: 'https://github.com/login',
      fields: [
        { fieldId: 'password', type: 'password', autocomplete: 'current-password' },
        { fieldId: 'user', type: 'text', autocomplete: 'username' },
      ],
    });

    expect(plan.instructions).toEqual([
      { fieldId: 'user', kind: 'username', value: 'octocat' },
      { fieldId: 'password', kind: 'password', value: 'hunter2' },
    ]);
  });

  it('generates a Firefox manifest/signing profile', () => {
    expect(
      createBrowserExtensionManifestConfig({
        target: 'firefox',
        hostPermissions: ['https://github.com/*'],
      }),
    ).toEqual({
      manifestVersion: 2,
      backgroundFormat: 'scripts',
      runtimeNamespace: 'browser',
      permissions: ['storage', 'tabs', 'activeTab', 'clipboardWrite'],
      hostPermissions: ['https://github.com/*'],
      actionKey: 'browser_action',
      signingStrategy: 'addons',
    });
  });

  it('requires the full Safari signing surface before release', () => {
    expect(
      validateSafariSigningConfig({
        appBundleId: 'com.passwordmanager.app',
        extensionBundleId: '',
        teamId: 'TEAMID123',
      }),
    ).toEqual({
      isValid: false,
      missingFields: ['extensionBundleId', 'provisioningProfile', 'appGroup'],
    });
  });
});
