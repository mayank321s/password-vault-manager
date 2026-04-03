import { useState, useCallback } from 'react';
import { useCreatePassword, useUpdatePassword } from '../../hooks';
import type {
  PasswordField,
  PasswordFormPanelProps,
  PanelMode,
} from './password-form-panel.type';
import { CreatePasswordContent } from '../../types';

function makeField(length: number): PasswordField {
  return { id: `field-${length}`, label: '', value: '' };
}

export function usePasswordFormPanel({
  vault,
  initialData,
  onClose,
  onSuccess,
}: PasswordFormPanelProps) {
  const isEditMode = !!initialData;

  const [mode, setMode] = useState<PanelMode>(() =>
    initialData ? (initialData.isNote ? 'note' : 'password') : 'password',
  );
  const [name, setName] = useState(() => initialData?.name ?? '');
  const [fields, setFields] = useState<PasswordField[]>(() => {
    if (initialData?.fields && initialData.fields.length > 0) {
      return initialData.fields.map((f, i) => ({
        id: `field-${i}`,
        label: f.label,
        value: f.value,
      }));
    }
    return [makeField(0)];
  });
  const [noteContent, setNoteContent] = useState(
    () => initialData?.noteContent ?? '',
  );
  const [nameError, setNameError] = useState('');

  const createPassword = useCreatePassword(vault.id);
  const updatePassword = useUpdatePassword(vault.id);

  const mutation = isEditMode ? updatePassword : createPassword;

  const switchMode = useCallback((next: PanelMode) => {
    setMode(next);
    setNameError('');
  }, []);

  const addField = useCallback(() => {
    setFields((prev) => [...prev, makeField(prev.length)]);
  }, []);

  const updateFieldLabel = useCallback((id: string, label: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)));
  }, []);

  const updateFieldValue = useCallback((id: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  }, []);

  const removeField = useCallback((id: string) => {
    setFields((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const resetForm = useCallback(() => {
    setName('');
    setFields([makeField(0)]);
    setNoteContent('');
    setNameError('');
    setMode('password');
  }, []);

  const handleSave = useCallback(() => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }
    setNameError('');

    const content: CreatePasswordContent =
      mode === 'note'
        ? { type: 'note', name: trimmedName, content: noteContent }
        : {
            type: 'password',
            name: trimmedName,
            fields: fields.map(({ label, value }) => ({ label, value })),
          };

    if (isEditMode && initialData) {
      updatePassword.mutate(
        { passwordId: initialData.id, vault, content },
        {
          onSuccess: () => {
            onSuccess();
          },
        },
      );
    } else {
      createPassword.mutate(
        { vault, content },
        {
          onSuccess: () => {
            resetForm();
            onSuccess();
          },
        },
      );
    }
  }, [
    name,
    mode,
    noteContent,
    fields,
    vault,
    isEditMode,
    initialData,
    createPassword,
    updatePassword,
    resetForm,
    onSuccess,
  ]);

  const handleClose = useCallback(() => {
    if (!mutation.isPending) {
      resetForm();
      onClose();
    }
  }, [mutation.isPending, resetForm, onClose]);

  return {
    isEditMode,
    mode,
    switchMode,
    name,
    setName,
    nameError,
    fields,
    addField,
    updateFieldLabel,
    updateFieldValue,
    removeField,
    noteContent,
    setNoteContent,
    mutation,
    handleSave,
    handleClose,
  };
}
