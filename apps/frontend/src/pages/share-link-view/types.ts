export interface ShareLinkData {
  encryptedBlob: string;
  expiresAt: string;
  createdAt: string;
}

export interface CopyState {
  [key: string]: boolean;
}
