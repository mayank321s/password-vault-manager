export interface DeleteVaultDialogProps {
  isOpen: boolean;
  vaultId: string;
  vaultName: string;
  onClose: () => void;
  onSuccess: () => void;
}
