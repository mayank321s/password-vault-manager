import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vaultKeys } from '../common/constants/query-keys';
import {
  importRecordsIntoVault,
  parseImportContent,
} from '../services/import.service';

export function useParseImport() {
  return useMutation({
    mutationFn: parseImportContent,
  });
}

export function useRunImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importRecordsIntoVault,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: vaultKeys.passwords(variables.vault.id),
      });
    },
  });
}
