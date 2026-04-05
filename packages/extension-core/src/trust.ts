import type {
  ChromiumAutofillPlan,
  ChromiumCredentialCandidate,
} from './chromium';
import {
  createBrowserAutofillPlan,
  type ExtensionBrowserTarget,
} from './cross-browser';
import type { ChromiumFormFieldSnapshot } from './chromium';

export interface ExtensionPairingRecord {
  readonly browserId: string;
  readonly browserName: string;
  readonly target: ExtensionBrowserTarget;
  readonly trustedOrigins: readonly string[];
  readonly approvedAt: string;
  readonly expiresAt?: string;
}

export interface CredentialTrustAssessment {
  readonly allowAutofill: boolean;
  readonly allowCredentialAccess: boolean;
  readonly matchedOrigin: string | null;
  readonly reason:
    | 'trusted-origin'
    | 'subdomain-match'
    | 'unpaired-browser'
    | 'untrusted-origin'
    | 'pairing-expired';
}

export function assessCredentialTrust(input: {
  readonly credential: ChromiumCredentialCandidate;
  readonly pageUrl: string;
  readonly pairing: ExtensionPairingRecord | null;
  readonly browserId: string;
  readonly now?: string;
}): CredentialTrustAssessment {
  if (!input.pairing || input.pairing.browserId !== input.browserId) {
    return {
      allowAutofill: false,
      allowCredentialAccess: false,
      matchedOrigin: null,
      reason: 'unpaired-browser',
    };
  }

  if (isPairingExpired(input.pairing, input.now)) {
    return {
      allowAutofill: false,
      allowCredentialAccess: false,
      matchedOrigin: null,
      reason: 'pairing-expired',
    };
  }

  const pageHost = getHostname(input.pageUrl);
  if (!pageHost) {
    return {
      allowAutofill: false,
      allowCredentialAccess: false,
      matchedOrigin: null,
      reason: 'untrusted-origin',
    };
  }

  const trustedOrigin = input.pairing.trustedOrigins.find((origin) => {
    const trustedHost = getHostname(origin);
    return trustedHost === pageHost;
  });

  if (trustedOrigin) {
    return {
      allowAutofill: true,
      allowCredentialAccess: true,
      matchedOrigin: trustedOrigin,
      reason: 'trusted-origin',
    };
  }

  const sameDomainOrigin = input.credential.urls.find((origin) => {
    const credentialHost = getHostname(origin);
    return credentialHost !== null && shareRegistrableDomain(credentialHost, pageHost);
  });

  if (sameDomainOrigin) {
    return {
      allowAutofill: false,
      allowCredentialAccess: true,
      matchedOrigin: sameDomainOrigin,
      reason: 'subdomain-match',
    };
  }

  return {
    allowAutofill: false,
    allowCredentialAccess: false,
    matchedOrigin: null,
    reason: 'untrusted-origin',
  };
}

export function createTrustedBrowserAutofillPlan(input: {
  readonly target: ExtensionBrowserTarget;
  readonly credentials: readonly ChromiumCredentialCandidate[];
  readonly pageUrl: string;
  readonly fields: readonly ChromiumFormFieldSnapshot[];
  readonly pairing: ExtensionPairingRecord | null;
  readonly browserId: string;
  readonly now?: string;
}): ChromiumAutofillPlan & {
  readonly blockedCredentials: readonly {
    credentialId: string;
    reason: CredentialTrustAssessment['reason'];
  }[];
} {
  const trustedCredentials: ChromiumCredentialCandidate[] = [];
  const blockedCredentials: {
    credentialId: string;
    reason: CredentialTrustAssessment['reason'];
  }[] = [];

  for (const credential of input.credentials) {
    const assessment = assessCredentialTrust({
      credential,
      pageUrl: input.pageUrl,
      pairing: input.pairing,
      browserId: input.browserId,
      now: input.now,
    });

    if (assessment.allowAutofill) {
      trustedCredentials.push(credential);
      continue;
    }

    blockedCredentials.push({
      credentialId: credential.passwordId,
      reason: assessment.reason,
    });
  }

  const plan = createBrowserAutofillPlan({
    target: input.target,
    credentials: trustedCredentials,
    pageUrl: input.pageUrl,
    fields: input.fields,
  });

  return {
    ...plan,
    blockedCredentials,
  };
}

function isPairingExpired(
  pairing: ExtensionPairingRecord,
  now?: string,
): boolean {
  if (!pairing.expiresAt) {
    return false;
  }

  return new Date(pairing.expiresAt).getTime() <= new Date(now ?? Date.now()).getTime();
}

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function shareRegistrableDomain(left: string, right: string): boolean {
  return getRegistrableDomain(left) === getRegistrableDomain(right);
}

function getRegistrableDomain(host: string): string {
  if (host === 'localhost' || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return host;
  }

  const parts = host.split('.').filter(Boolean);
  if (parts.length <= 2) {
    return host;
  }

  return parts.slice(-2).join('.');
}
