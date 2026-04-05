import type { ChangeEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ImportedVaultRecord, ParseImportRequest } from '@repo/shared';
import * as panelStyles from '../../common/css/panel.css';
import { useGetVaults, useParseImport, useRunImport } from '../../hooks';
import * as styles from './import.css';

const PROVIDER_OPTIONS: {
  value: ParseImportRequest['provider'];
  label: string;
  hint: string;
}[] = [
  {
    value: 'generic_csv',
    label: 'Generic CSV',
    hint: 'For exports with common title, username, password, notes, and URL columns.',
  },
  {
    value: 'lastpass_csv',
    label: 'LastPass CSV',
    hint: 'Keeps folders and TOTP metadata from LastPass exports.',
  },
  {
    value: 'onepassword_csv',
    label: '1Password CSV',
    hint: 'Preserves archived and favorite review warnings from 1Password exports.',
  },
];

function describeRecord(record: ImportedVaultRecord) {
  if (record.content.type === 'note') {
    return 'Secure note';
  }

  const username = record.content.fields.find(
    (field) => field.label === 'Username',
  );
  return username ? `Password for ${username.value}` : 'Password item';
}

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [provider, setProvider] =
    useState<ParseImportRequest['provider']>('generic_csv');
  const [selectedVaultId, setSelectedVaultId] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [includeReviewRequired, setIncludeReviewRequired] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    importedCount: number;
    skippedCount: number;
    importedTitles: string[];
  } | null>(null);

  const { data: vaults = [], isLoading: vaultsLoading } = useGetVaults();
  const parseImport = useParseImport();
  const runImport = useRunImport();

  const selectedProvider = PROVIDER_OPTIONS.find(
    (option) => option.value === provider,
  );
  const selectedVault = useMemo(
    () => vaults.find((vault) => vault.id === selectedVaultId) ?? null,
    [selectedVaultId, vaults],
  );

  const parseResult = parseImport.data;
  const cleanRecords =
    parseResult?.records.filter((record) => !record.reviewRequired) ?? [];
  const reviewRecords =
    parseResult?.records.filter((record) => record.reviewRequired) ?? [];
  const recordsToImport = includeReviewRequired
    ? parseResult?.records ?? []
    : cleanRecords;

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setImportSummary(null);
    parseImport.reset();
    setContent(await file.text());
  };

  const handleAnalyze = () => {
    setImportSummary(null);
    parseImport.mutate({ provider, content });
  };

  const handleImport = () => {
    if (!selectedVault || recordsToImport.length === 0) {
      return;
    }

    runImport.mutate(
      { vault: selectedVault, records: recordsToImport },
      {
        onSuccess: () => {
          setImportSummary({
            importedCount: recordsToImport.length,
            skippedCount:
              (parseResult?.records.length ?? 0) - recordsToImport.length,
            importedTitles: recordsToImport
              .slice(0, 5)
              .map((record) => record.title),
          });
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Import Workspace</p>
          <h1 className={styles.title}>Move passwords in without flying blind.</h1>
          <p className={styles.subtitle}>
            Upload an export, preview exactly what will land in your vault,
            inspect anything risky, and import only the records you are ready to
            carry over.
          </p>
        </section>

        <div className={styles.layout}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Prepare your import</h2>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="provider">
                  Source format
                </label>
                <select
                  id="provider"
                  className={styles.input}
                  value={provider}
                  onChange={(event) => {
                    setProvider(event.target.value as ParseImportRequest['provider']);
                    setImportSummary(null);
                    parseImport.reset();
                  }}
                >
                  {PROVIDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className={styles.smallMeta}>{selectedProvider?.hint}</p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="vault">
                  Destination vault
                </label>
                <select
                  id="vault"
                  className={styles.input}
                  value={selectedVaultId}
                  onChange={(event) => setSelectedVaultId(event.target.value)}
                >
                  <option value="">Choose a vault</option>
                  {vaults.map((vault) => (
                    <option key={vault.id} value={vault.id}>
                      {vault.name}
                    </option>
                  ))}
                </select>
                <p className={styles.smallMeta}>
                  {vaultsLoading
                    ? 'Loading available vaults...'
                    : 'Imported records are encrypted client-side with the selected vault key before upload.'}
                </p>
              </div>
            </div>

            <div className={styles.uploadBox}>
              <div className={styles.uploadRow}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleChooseFile}
                >
                  Choose CSV file
                </button>
                <input
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                />
                <span className={styles.fileName}>
                  {fileName || 'No file selected yet'}
                </span>
              </div>
              <p className={styles.uploadHint}>
                You can upload a file or paste the export directly below. The
                analysis step will flag malformed rows, duplicates, missing
                passwords, and provider-specific review cases before anything is
                imported.
              </p>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  setImportSummary(null);
                  parseImport.reset();
                }}
                placeholder="Paste CSV export content here..."
              />
            </div>

            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={!content.trim() || parseImport.isPending}
                onClick={handleAnalyze}
              >
                {parseImport.isPending ? 'Analyzing import...' : 'Analyze import file'}
              </button>
              <Link className={styles.secondaryButton} to="/vaults">
                Back to vaults
              </Link>
            </div>

            {parseImport.isError && (
              <div className={panelStyles.errorBanner}>
                {parseImport.error instanceof Error
                  ? parseImport.error.message
                  : 'Failed to analyze the import file.'}
              </div>
            )}

            {parseResult && (
              <>
                <h2 className={styles.panelTitle}>Preview and remediation</h2>
                <div className={styles.statGrid}>
                  <div className={styles.statCard}>
                    <p className={styles.statValue}>{parseResult.summary.parsedCount}</p>
                    <p className={styles.statLabel}>Parsed records</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statValue}>{parseResult.summary.errorCount}</p>
                    <p className={styles.statLabel}>Rows blocked</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statValue}>
                      {parseResult.summary.requiresReviewCount}
                    </p>
                    <p className={styles.statLabel}>Need review</p>
                  </div>
                  <div className={styles.statCard}>
                    <p className={styles.statValue}>
                      {parseResult.summary.duplicateGroupCount}
                    </p>
                    <p className={styles.statLabel}>Duplicate groups</p>
                  </div>
                </div>

                {parseResult.issues.length > 0 && (
                  <div className={styles.issueList}>
                    {parseResult.issues.slice(0, 8).map((issue) => (
                      <div
                        key={`${issue.rowNumber}-${issue.code}-${issue.message}`}
                        className={styles.issueCard}
                      >
                        <div className={styles.issueHeader}>
                          <span
                            className={`${styles.issueSeverity} ${
                              issue.severity === 'error'
                                ? styles.severityError
                                : styles.severityWarning
                            }`}
                          >
                            {issue.severity}
                          </span>
                          <p className={styles.issueTitle}>
                            Row {issue.rowNumber}: {issue.message}
                          </p>
                        </div>
                        <p className={styles.issueText}>{issue.suggestedAction}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Row</th>
                        <th className={styles.th}>Title</th>
                        <th className={styles.th}>Type</th>
                        <th className={styles.th}>Status</th>
                        <th className={styles.th}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.records.slice(0, 12).map((record) => (
                        <tr key={`${record.rowNumber}-${record.title}`}>
                          <td className={styles.td}>{record.rowNumber}</td>
                          <td className={styles.td}>{record.title}</td>
                          <td className={styles.td}>{describeRecord(record)}</td>
                          <td className={styles.td}>
                            <span
                              className={`${styles.reviewBadge} ${
                                record.reviewRequired
                                  ? styles.reviewNeeded
                                  : styles.reviewClean
                              }`}
                            >
                              {record.reviewRequired ? 'Review' : 'Clean'}
                            </span>
                          </td>
                          <td className={styles.td}>
                            {record.warnings.length > 0
                              ? record.warnings.join(' ')
                              : 'No remediation needed.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Import strategy</label>
                  <label className={styles.checklistRow}>
                    <input
                      type="checkbox"
                      checked={includeReviewRequired}
                      onChange={(event) =>
                        setIncludeReviewRequired(event.target.checked)
                      }
                    />
                    <span className={styles.issueText}>
                      Include review-required rows in the final import. Leave
                      this off to import only clean records and remediate the
                      rest first.
                    </span>
                  </label>
                </div>

                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    disabled={
                      !selectedVault ||
                      recordsToImport.length === 0 ||
                      runImport.isPending
                    }
                    onClick={handleImport}
                  >
                    {runImport.isPending
                      ? 'Importing into vault...'
                      : `Import ${recordsToImport.length} record${
                          recordsToImport.length === 1 ? '' : 's'
                        }`}
                  </button>
                  <p className={styles.smallMeta}>
                    {includeReviewRequired
                      ? 'Review-required rows will be imported along with clean rows.'
                      : `${reviewRecords.length} review-required row${
                          reviewRecords.length === 1 ? '' : 's'
                        } will stay out of the final import for now.`}
                  </p>
                </div>

                {runImport.isError && (
                  <div className={panelStyles.errorBanner}>
                    {runImport.error instanceof Error
                      ? runImport.error.message
                      : 'Import failed before completion.'}
                  </div>
                )}

                {importSummary && (
                  <div className={styles.summaryCard}>
                    <p className={styles.summaryTitle}>Import completed</p>
                    <p className={styles.issueText}>
                      Imported {importSummary.importedCount} record
                      {importSummary.importedCount === 1 ? '' : 's'} into{' '}
                      {selectedVault?.name}. Skipped {importSummary.skippedCount}{' '}
                      record{importSummary.skippedCount === 1 ? '' : 's'} based
                      on your remediation choice.
                    </p>
                    {importSummary.importedTitles.length > 0 && (
                      <p className={styles.issueText}>
                        Recent imports: {importSummary.importedTitles.join(', ')}
                      </p>
                    )}
                    <Link
                      className={styles.secondaryButton}
                      to={`/vaults/${selectedVault?.id ?? ''}`}
                    >
                      Open destination vault
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>

          <aside className={styles.panel}>
            <h2 className={styles.panelTitle}>What this import flow checks</h2>
            <div className={styles.checklist}>
              <div className={styles.checklistRow}>
                <span className={styles.checklistBullet} />
                <p className={styles.issueText}>
                  Source-aware parsing for generic CSV, LastPass, and 1Password
                  exports.
                </p>
              </div>
              <div className={styles.checklistRow}>
                <span className={styles.checklistBullet} />
                <p className={styles.issueText}>
                  Structured remediation for malformed rows, likely duplicates,
                  missing passwords, and provider-specific warnings.
                </p>
              </div>
              <div className={styles.checklistRow}>
                <span className={styles.checklistBullet} />
                <p className={styles.issueText}>
                  Client-side encryption into the selected vault before anything
                  is sent to the server.
                </p>
              </div>
              <div className={styles.checklistRow}>
                <span className={styles.checklistBullet} />
                <p className={styles.issueText}>
                  Actionable completion summary so you know what landed and what
                  still needs attention.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
