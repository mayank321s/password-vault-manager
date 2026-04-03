import { lazy } from 'react';

export const CreateVaultModal = lazy(
  () => import('./create-vault-model/create-vault-modal'),
);
export const VaultListColumn = lazy(
  () => import('./vault-list-column/vault-list-column'),
);
export const PasswordListColumn = lazy(
  () => import('./password-list-column/password-list-column'),
);
export const PasswordDetailPanel = lazy(
  () => import('./password-detail-panel/password-detail-panel'),
);
export const VaultSettingsPanel = lazy(
  () => import('./vault-settings-panel/vault-settings-panel'),
);
export const PasswordFormPanel = lazy(
  () => import('./password-form-panel/password-form-panel'),
);
