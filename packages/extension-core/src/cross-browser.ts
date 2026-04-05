import {
  createChromiumAutofillPlan,
  detectChromiumCredentialChange,
  type ChromiumCredentialCandidate,
  type ChromiumCredentialChangeResult,
  type ChromiumFormFieldSnapshot,
} from './chromium';

export type ExtensionBrowserTarget = 'chromium' | 'firefox' | 'safari';

export interface BrowserExtensionManifestConfig {
  readonly manifestVersion: 2 | 3;
  readonly backgroundFormat: 'service-worker' | 'scripts';
  readonly runtimeNamespace: 'chrome' | 'browser' | 'safari';
  readonly permissions: readonly string[];
  readonly hostPermissions: readonly string[];
  readonly actionKey: 'action' | 'browser_action';
  readonly signingStrategy: 'web-store' | 'addons' | 'xcode';
}

export interface SafariSigningConfig {
  readonly appBundleId: string;
  readonly extensionBundleId: string;
  readonly teamId: string;
  readonly provisioningProfile: string;
  readonly appGroup: string;
}

export interface SafariSigningValidationResult {
  readonly isValid: boolean;
  readonly missingFields: readonly (keyof SafariSigningConfig)[];
}

export function createBrowserExtensionManifestConfig(input: {
  readonly target: ExtensionBrowserTarget;
  readonly hostPermissions?: readonly string[];
}): BrowserExtensionManifestConfig {
  const hostPermissions =
    input.hostPermissions && input.hostPermissions.length > 0
      ? input.hostPermissions
      : ['https://*/*', 'http://localhost/*'];

  if (input.target === 'firefox') {
    return {
      manifestVersion: 2,
      backgroundFormat: 'scripts',
      runtimeNamespace: 'browser',
      permissions: ['storage', 'tabs', 'activeTab', 'clipboardWrite'],
      hostPermissions,
      actionKey: 'browser_action',
      signingStrategy: 'addons',
    };
  }

  if (input.target === 'safari') {
    return {
      manifestVersion: 3,
      backgroundFormat: 'service-worker',
      runtimeNamespace: 'safari',
      permissions: ['storage', 'activeTab', 'clipboardWrite'],
      hostPermissions,
      actionKey: 'action',
      signingStrategy: 'xcode',
    };
  }

  return {
    manifestVersion: 3,
    backgroundFormat: 'service-worker',
    runtimeNamespace: 'chrome',
    permissions: ['storage', 'tabs', 'activeTab', 'clipboardWrite'],
    hostPermissions,
    actionKey: 'action',
    signingStrategy: 'web-store',
  };
}

export function createBrowserAutofillPlan(input: {
  readonly target: ExtensionBrowserTarget;
  readonly credentials: readonly ChromiumCredentialCandidate[];
  readonly pageUrl: string;
  readonly fields: readonly ChromiumFormFieldSnapshot[];
}) {
  if (input.target === 'firefox') {
    return createChromiumAutofillPlan({
      credentials: input.credentials,
      pageUrl: input.pageUrl,
      fields: reorderFirefoxFields(input.fields),
    });
  }

  return createChromiumAutofillPlan({
    credentials: input.credentials,
    pageUrl: input.pageUrl,
    fields: input.fields,
  });
}

export function detectBrowserCredentialChange(input: {
  readonly target: ExtensionBrowserTarget;
  readonly credentials: readonly ChromiumCredentialCandidate[];
  readonly pageUrl: string;
  readonly submittedUsername?: string | null;
  readonly submittedPassword?: string | null;
}): ChromiumCredentialChangeResult {
  return detectChromiumCredentialChange({
    credentials: input.credentials,
    pageUrl: input.pageUrl,
    submittedUsername: input.submittedUsername,
    submittedPassword: input.submittedPassword,
  });
}

export function validateSafariSigningConfig(
  config: Partial<SafariSigningConfig>,
): SafariSigningValidationResult {
  const requiredKeys: (keyof SafariSigningConfig)[] = [
    'appBundleId',
    'extensionBundleId',
    'teamId',
    'provisioningProfile',
    'appGroup',
  ];

  const missingFields = requiredKeys.filter((key) => {
    return !config[key]?.trim();
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

function reorderFirefoxFields(
  fields: readonly ChromiumFormFieldSnapshot[],
): ChromiumFormFieldSnapshot[] {
  const usernameLike = fields.filter((field) => {
    const descriptor = `${field.name ?? ''} ${field.id ?? ''} ${field.autocomplete ?? ''}`
      .toLowerCase()
      .trim();
    return (
      field.type !== 'password' &&
      (field.autocomplete === 'username' ||
        field.autocomplete === 'email' ||
        /(user|email|login)/.test(descriptor))
    );
  });

  const remaining = fields.filter((field) => !usernameLike.includes(field));
  return [...usernameLike, ...remaining];
}
