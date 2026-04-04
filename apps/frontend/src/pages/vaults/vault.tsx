import {
  CreateVaultModal,
  PasswordDetailPanel,
  PasswordFormPanel,
  PasswordListColumn,
  VaultListColumn,
  VaultSettingsPanel,
} from '../../components';
import * as styles from './vaults.css';
import { useVaultDashboardPage } from './vaults.hook';

export default function VaultsPage() {
  const {
    vaults,
    vaultsLoading,
    vaultsError,
    refetchVaults,
    selectedVault,
    selectedVaultId,
    isSharedMode,
    mode,
    passwords,
    passwordsLoading,
    passwordsError,
    passwordSearch,
    selectedPasswordId,
    passwordDetail,
    passwordDetailLoading,
    isCreateModalOpen,
    isCreatingPassword,
    editingPasswordData,
    selectedSharedItem,
    handleAddPassword,
    handleCloseCreatePassword,
    handleSelectVault,
    handleOrganizationChanged,
    handleOpenSettings,
    handleSelectPassword,
    handleCopyToClipboard,
    handleEditPassword,
    handleDeletePassword,
    setPasswordSearch,
    setIsCreateModalOpen,
  } = useVaultDashboardPage();

  const showPasswordList =
    mode === 'passwords' && (selectedVault || isSharedMode);
  const vaultName = isSharedMode
    ? 'Shared with me'
    : (selectedVault?.name ?? '');

  return (
    <>
      <div className={styles.dashboardLayout}>
        <VaultListColumn
          vaults={vaults}
          selectedVaultId={selectedVaultId}
          vaultsLoading={vaultsLoading}
          vaultsError={vaultsError}
          onSelectVault={handleSelectVault}
          onOpenSettings={handleOpenSettings}
          onCreateVault={() => setIsCreateModalOpen(true)}
          onRetry={refetchVaults}
          onOrganizationChanged={handleOrganizationChanged}
        />

        {showPasswordList && (
          <PasswordListColumn
            vaultName={vaultName}
            passwords={passwords}
            passwordsLoading={passwordsLoading}
            passwordsError={passwordsError}
            selectedPasswordId={selectedPasswordId}
            searchValue={passwordSearch}
            onSearchChange={setPasswordSearch}
            onSelectPassword={handleSelectPassword}
            onAddPassword={handleAddPassword}
            hideAddButton={isSharedMode}
          />
        )}

        {mode === 'passwords' &&
        !isSharedMode &&
        isCreatingPassword &&
        selectedVault ? (
          <PasswordFormPanel
            vault={selectedVault}
            initialData={editingPasswordData ?? undefined}
            onClose={handleCloseCreatePassword}
            onSuccess={handleCloseCreatePassword}
          />
        ) : mode === 'passwords' ? (
          <PasswordDetailPanel
            passwordDetail={passwordDetail}
            vault={selectedVault}
            isLoading={passwordDetailLoading}
            onCopy={handleCopyToClipboard}
            onEdit={handleEditPassword}
            onDelete={handleDeletePassword}
            sharedItem={selectedSharedItem}
          />
        ) : selectedVault ? (
          <VaultSettingsPanel vault={selectedVault} />
        ) : null}
      </div>

      <CreateVaultModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
