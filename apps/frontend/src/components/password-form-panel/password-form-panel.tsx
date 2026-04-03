import { useRef } from 'react';
import * as styles from './password-form-panel.css';
import { usePasswordFormPanel } from './password-form-panel.hook';
import type { PasswordFormPanelProps } from './password-form-panel.type';

export default function PasswordFormPanel(props: PasswordFormPanelProps) {
  const {
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
  } = usePasswordFormPanel(props);

  const isPending = mutation.isPending;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lineCount = noteContent.split('\n').length;

  return (
    <main className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          {isEditMode
            ? mode === 'note'
              ? 'Edit Note'
              : 'Edit Password'
            : mode === 'note'
              ? 'New Note'
              : 'New Password'}
        </span>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          disabled={isPending}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.actionRow}>
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeButton} ${mode === 'password' ? styles.modeButtonActive : ''}`}
              onClick={() => switchMode('password')}
              disabled={isPending}
            >
              Password
            </button>
            <button
              className={`${styles.modeButton} ${mode === 'note' ? styles.modeButtonActive : ''}`}
              onClick={() => switchMode('note')}
              disabled={isPending}
            >
              Note
            </button>
          </div>

          <button
            className={styles.saveButton}
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className={styles.formSection}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Name</label>
            <input
              className={`${styles.fieldInput} ${nameError ? styles.fieldInputError : ''}`}
              type="text"
              placeholder={
                mode === 'note' ? 'Note title…' : 'e.g. Gmail, GitHub SSH key…'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
              maxLength={200}
            />
            {nameError && <span className={styles.errorText}>{nameError}</span>}
          </div>
        </div>

        {mode === 'password' && (
          <div className={styles.dynamicFieldsSection}>
            <span className={styles.dynamicFieldsLabel}>Fields</span>

            {fields.map((field) => (
              <div key={field.id} className={styles.dynamicFieldRow}>
                <input
                  className={styles.dynamicFieldLabelInput}
                  type="text"
                  placeholder="Label"
                  value={field.label}
                  onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                  disabled={isPending}
                  maxLength={50}
                />
                <input
                  className={styles.dynamicFieldValueInput}
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateFieldValue(field.id, e.target.value)}
                  disabled={isPending}
                  maxLength={200}
                />
                <button
                  className={styles.removeFieldButton}
                  onClick={() => removeField(field.id)}
                  disabled={isPending || fields.length <= 1}
                  aria-label="Remove field"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              className={styles.addFieldButton}
              onClick={addField}
              disabled={isPending}
            >
              + Add field
            </button>
          </div>
        )}

        {mode === 'note' && (
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Content</label>
            <div className={styles.noteEditorWrapper}>
              <div ref={lineNumbersRef} className={styles.noteLineNumbers}>
                {Array.from({ length: lineCount }, (_, i) => (
                  <span key={i} className={styles.noteLineNumber}>
                    {i + 1}
                  </span>
                ))}
              </div>
              <textarea
                ref={textareaRef}
                className={styles.noteTextarea}
                placeholder="Write your note here…"
                value={noteContent}
                wrap="off"
                maxLength={100000}
                onChange={(e) => setNoteContent(e.target.value)}
                onScroll={() => {
                  if (lineNumbersRef.current && textareaRef.current) {
                    lineNumbersRef.current.scrollTop =
                      textareaRef.current.scrollTop;
                  }
                }}
                disabled={isPending}
              />
            </div>
            <span
              className={`${styles.charCounter}${noteContent.length >= 100000 ? ` ${styles.charCounterMax}` : noteContent.length >= 90000 ? ` ${styles.charCounterWarning}` : ''}`}
            >
              {noteContent.length} / 100000
            </span>
          </div>
        )}

        {mutation.isError && mutation.error.message !== 'Validation failed' && (
          <div className={styles.errorBanner}>{mutation.error.message}</div>
        )}

        {!isEditMode && (
          <div className={styles.sharedSection}>
            <span className={styles.sharedSectionTitle}>Shared With</span>
            <span className={styles.sharedEmpty}>
              Not shared with anyone outside this vault.
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
