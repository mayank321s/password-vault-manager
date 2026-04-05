import type { ExtensionCredentialRecord } from './backend-contract';

interface ExtensionCredentialField {
  readonly label: string;
  readonly value: string;
}

export type ExtensionCredentialContent =
  | {
      readonly type: 'password';
      readonly fields: readonly ExtensionCredentialField[];
    }
  | {
      readonly type: 'note';
      readonly content: string;
    };

export interface ChromiumCredentialCandidate
  extends ExtensionCredentialRecord {
  readonly username: string | null;
  readonly password: string | null;
  readonly urls: readonly string[];
}

export interface ChromiumFormFieldSnapshot {
  readonly fieldId: string;
  readonly type: string;
  readonly name?: string;
  readonly id?: string;
  readonly autocomplete?: string | null;
  readonly value?: string;
}

export interface ChromiumAutofillInstruction {
  readonly fieldId: string;
  readonly kind: 'username' | 'password';
  readonly value: string;
}

export interface ChromiumAutofillPlan {
  readonly selectedCredential: ChromiumCredentialCandidate | null;
  readonly matchedCredentials: readonly ChromiumCredentialCandidate[];
  readonly instructions: readonly ChromiumAutofillInstruction[];
}

export interface ChromiumCredentialChangeResult {
  readonly action: 'ignore' | 'save' | 'update';
  readonly matchedCredentialId: string | null;
}

export function toChromiumCredentialCandidate(
  record: ExtensionCredentialRecord,
  content: ExtensionCredentialContent,
): ChromiumCredentialCandidate | null {
  if (content.type !== 'password') {
    return null;
  }

  let username: string | null = null;
  let password: string | null = null;
  const urls: string[] = [];

  for (const field of content.fields) {
    const label = normalizeFieldLabel(field.label);
    const value = field.value.trim();

    if (!value) {
      continue;
    }

    if (!username && isUsernameLabel(label)) {
      username = value;
      continue;
    }

    if (!password && isPasswordLabel(label)) {
      password = value;
      continue;
    }

    if (isUrlLabel(label)) {
      urls.push(value);
    }
  }

  if (!password) {
    return null;
  }

  return {
    ...record,
    username,
    password,
    urls: dedupeStrings(urls),
  };
}

export function matchChromiumCredentialsForUrl(
  credentials: readonly ChromiumCredentialCandidate[],
  pageUrl: string,
): ChromiumCredentialCandidate[] {
  const currentHost = getHostname(pageUrl);
  if (!currentHost) {
    return [];
  }

  return [...credentials]
    .map((credential) => ({
      credential,
      score: getCredentialMatchScore(credential, currentHost),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .map(({ credential }) => credential);
}

export function createChromiumAutofillPlan(input: {
  readonly credentials: readonly ChromiumCredentialCandidate[];
  readonly pageUrl: string;
  readonly fields: readonly ChromiumFormFieldSnapshot[];
}): ChromiumAutofillPlan {
  const matchedCredentials = matchChromiumCredentialsForUrl(
    input.credentials,
    input.pageUrl,
  );
  const selectedCredential = matchedCredentials[0] ?? null;

  if (!selectedCredential) {
    return {
      selectedCredential: null,
      matchedCredentials,
      instructions: [],
    };
  }

  const usernameField = findChromiumUsernameField(input.fields);
  const passwordField = findChromiumPasswordField(input.fields);
  const instructions: ChromiumAutofillInstruction[] = [];

  if (usernameField && selectedCredential.username) {
    instructions.push({
      fieldId: usernameField.fieldId,
      kind: 'username',
      value: selectedCredential.username,
    });
  }

  if (passwordField && selectedCredential.password) {
    instructions.push({
      fieldId: passwordField.fieldId,
      kind: 'password',
      value: selectedCredential.password,
    });
  }

  return {
    selectedCredential,
    matchedCredentials,
    instructions,
  };
}

export function detectChromiumCredentialChange(input: {
  readonly credentials: readonly ChromiumCredentialCandidate[];
  readonly pageUrl: string;
  readonly submittedUsername?: string | null;
  readonly submittedPassword?: string | null;
}): ChromiumCredentialChangeResult {
  const submittedPassword = input.submittedPassword?.trim() ?? '';
  if (!submittedPassword) {
    return {
      action: 'ignore',
      matchedCredentialId: null,
    };
  }

  const normalizedUsername = normalizeIdentity(input.submittedUsername);
  const matches = matchChromiumCredentialsForUrl(input.credentials, input.pageUrl);

  const sameIdentity = matches.find((credential) => {
    return normalizeIdentity(credential.username) === normalizedUsername;
  });

  if (!sameIdentity) {
    return {
      action: 'save',
      matchedCredentialId: null,
    };
  }

  if (sameIdentity.password === submittedPassword) {
    return {
      action: 'ignore',
      matchedCredentialId: sameIdentity.passwordId,
    };
  }

  return {
    action: 'update',
    matchedCredentialId: sameIdentity.passwordId,
  };
}

function normalizeFieldLabel(label: string): string {
  return label.trim().toLowerCase();
}

function normalizeIdentity(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}

function isUsernameLabel(label: string): boolean {
  return /(user(name)?|email|login)/.test(label);
}

function isPasswordLabel(label: string): boolean {
  return /(password|passcode)/.test(label);
}

function isUrlLabel(label: string): boolean {
  return /(website|url|uri|link|domain|login page)/.test(label);
}

function dedupeStrings(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function getHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function getCredentialMatchScore(
  credential: ChromiumCredentialCandidate,
  currentHost: string,
): number {
  let bestScore = 0;

  for (const rawUrl of credential.urls) {
    const host = getHostname(rawUrl);
    if (!host) {
      continue;
    }

    if (host === currentHost) {
      bestScore = Math.max(bestScore, 3);
      continue;
    }

    if (currentHost.endsWith(`.${host}`) || host.endsWith(`.${currentHost}`)) {
      bestScore = Math.max(bestScore, 2);
      continue;
    }
  }

  return bestScore;
}

function findChromiumUsernameField(
  fields: readonly ChromiumFormFieldSnapshot[],
): ChromiumFormFieldSnapshot | null {
  return (
    fields.find((field) => {
      const descriptor = `${field.name ?? ''} ${field.id ?? ''} ${field.autocomplete ?? ''}`
        .toLowerCase()
        .trim();

      if (field.type === 'password') {
        return false;
      }

      return (
        field.autocomplete === 'username' ||
        field.autocomplete === 'email' ||
        /(user|email|login)/.test(descriptor)
      );
    }) ?? null
  );
}

function findChromiumPasswordField(
  fields: readonly ChromiumFormFieldSnapshot[],
): ChromiumFormFieldSnapshot | null {
  return (
    fields.find((field) => {
      return (
        field.type === 'password' &&
        field.autocomplete !== 'new-password'
      );
    }) ??
    fields.find((field) => field.type === 'password') ??
    null
  );
}
