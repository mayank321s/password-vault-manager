interface ShareLinkPassword {
  id: string;
  name: string;
  encryptedData: string;
}

export interface CreateShareLinkModalProps {
  isOpen: boolean;
  password: ShareLinkPassword | null;
  encryptedVaultKey: string;
  onClose: () => void;
}

export interface CreateShareLinkRequest {
  encryptedBlob: string;
  expirationHours: number;
}

export interface CreateShareLinkResponse {
  shareId: string;
  expiresAt: string;
}

export interface ProgressState {
  stage: string;
  percentage: number;
}
