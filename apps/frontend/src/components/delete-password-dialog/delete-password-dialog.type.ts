export interface DeletePasswordDialogProps {
  isOpen: boolean;
  passwordId: string;
  passwordName: string;
  vaultId: string;
  onClose: () => void;
  onSuccess: () => void;
}
