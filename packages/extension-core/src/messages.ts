import type { ExtensionCredentialRecord } from './backend-contract';
import type { ExtensionSessionSnapshot } from './session';

export const EXTENSION_SESSION_EVENT =
  'password-manager:extension-session-changed';
export const EXTENSION_CREDENTIALS_EVENT =
  'password-manager:extension-credentials-loaded';

export type ExtensionRuntimeMessage =
  | {
      type: 'extension.session.snapshot';
      payload: ExtensionSessionSnapshot;
    }
  | {
      type: 'extension.credentials.loaded';
      payload: {
        credentials: ExtensionCredentialRecord[];
      };
    }
  | {
      type: 'extension.unlock.requested';
      payload: {
        reason: 'manual' | 'auto-lock';
      };
    };
