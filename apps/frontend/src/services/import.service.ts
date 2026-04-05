import type {
  CreatePasswordRequest,
  ImportedVaultRecord,
  ParseImportRequest,
  ParseImportResponse,
  VaultResponse,
} from '@repo/shared';
import { decryptVaultKey, encryptWithAES } from '@repo/crypto-utils';
import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';
import { sessionManager } from './session.service';

function toCreatePasswordContent(record: ImportedVaultRecord) {
  if (record.content.type === 'note') {
    return {
      type: 'note' as const,
      name: record.title,
      content: record.content.content,
    };
  }

  return {
    type: 'password' as const,
    name: record.title,
    fields: record.content.fields,
  };
}

export async function parseImportContent(
  request: ParseImportRequest,
): Promise<ParseImportResponse> {
  const response = await apiClient.post<ParseImportResponse>(
    API_V1_ROUTES.imports.parse,
    request,
  );

  return response.data;
}

export async function importRecordsIntoVault(input: {
  vault: VaultResponse;
  records: ImportedVaultRecord[];
}) {
  const privateKey = await sessionManager.getPrivateKey();
  if (!privateKey) {
    throw new Error('Session is locked. Please unlock your session first.');
  }

  const vaultKey = await decryptVaultKey(input.vault.vaultEncryptedKey, privateKey);
  const importedIds: string[] = [];

  for (const record of input.records) {
    const request: CreatePasswordRequest = {
      vaultId: input.vault.id,
      name: record.title,
      encryptedData: await encryptWithAES(
        toCreatePasswordContent(record),
        vaultKey,
      ),
      isNote: record.content.type === 'note',
    };

    const response = await apiClient.post<{ id: string }>(
      API_V1_ROUTES.password.create,
      request,
    );

    importedIds.push(response.data.id);
  }

  return { importedIds };
}
