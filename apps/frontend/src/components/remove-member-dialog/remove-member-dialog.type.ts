import type { VaultMemberResponse } from '@repo/shared';

export interface RemoveMemberDialogProps {
  isOpen: boolean;
  member: VaultMemberResponse['members'][number] | null;
  vaultId: string;
  onClose: () => void;
  onSuccess: () => void;
}
