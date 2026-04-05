import { Injectable } from '@nestjs/common';
import type {
  ImportDuplicateGroup,
  ImportedVaultRecord,
  ImportField,
  ImportIssue,
  ParseImportRequest,
  ParseImportResponse,
} from '@repo/shared';

type CsvRow = Record<string, string>;
type RowParseResult = {
  rowNumber: number;
  row: CsvRow;
  issues: ImportIssue[];
};
type RecordBuildResult = {
  record: ImportedVaultRecord;
  issues: ImportIssue[];
};

@Injectable()
export class ImportsService {
  parseImport(_userId: string, payload: ParseImportRequest): ParseImportResponse {
    const rows = parseCsvRows(payload.content);
    const issues: ImportIssue[] = [];
    const recordResults = rows
      .map((row) => {
        issues.push(...row.issues);
        if (row.issues.some((issue) => issue.severity === 'error')) {
          return null;
        }
        return this.parseRow(payload.provider, row);
      })
      .filter((record): record is RecordBuildResult => record !== null);

    const records = recordResults.map((result) => result.record);
    issues.push(...recordResults.flatMap((result) => result.issues));

    const duplicateGroups = findDuplicateGroups(records);
    if (duplicateGroups.length > 0) {
      issues.push(...buildDuplicateIssues(duplicateGroups));
    }

    const duplicateRows = new Set(
      duplicateGroups.flatMap((group) => group.rowNumbers),
    );
    const recordsWithReviewState = records.map((record) => {
      const rowHasIssue = issues.some(
        (issue) => issue.rowNumber === record.rowNumber,
      );

      return {
        ...record,
        reviewRequired: rowHasIssue || duplicateRows.has(record.rowNumber),
        warnings: issues
          .filter(
            (issue) =>
              issue.rowNumber === record.rowNumber &&
              issue.severity === 'warning',
          )
          .map((issue) => issue.message),
      };
    });

    const errorCount = issues.filter((issue) => issue.severity === 'error').length;
    const requiresReviewCount = recordsWithReviewState.filter(
      (record) => record.reviewRequired,
    ).length;

    return {
      provider: payload.provider,
      totalRows: rows.length,
      parsedCount: records.length,
      skippedCount: rows.length - records.length,
      records: recordsWithReviewState,
      issues,
      duplicateGroups,
      summary: {
        totalRows: rows.length,
        parsedCount: records.length,
        skippedCount: rows.length - records.length,
        requiresReviewCount,
        duplicateGroupCount: duplicateGroups.length,
        issueCount: issues.length,
        errorCount,
      },
    };
  }

  private parseRow(
    provider: ParseImportRequest['provider'],
    input: RowParseResult,
  ): RecordBuildResult | null {
    switch (provider) {
      case 'generic_csv':
        return this.parseGenericCsvRow(input);
      case 'lastpass_csv':
        return this.parseLastPassRow(input);
      case 'onepassword_csv':
        return this.parseOnePasswordRow(input);
    }
  }

  private parseGenericCsvRow(input: RowParseResult): RecordBuildResult | null {
    const { row } = input;
    const title = firstValue(row, ['title', 'name', 'site', 'label']);
    const username = firstValue(row, ['username', 'user', 'email', 'login']);
    const password = firstValue(row, ['password', 'passcode', 'secret']);
    const url = firstValue(row, ['url', 'website', 'login_url', 'uri']);
    const notes = firstValue(row, ['notes', 'note', 'extra']);
    const folder = firstValue(row, ['folder', 'group', 'category']);
    const tags = splitList(firstValue(row, ['tags', 'tag']));

    if (!title && !username && !password && !url && !notes) {
      return null;
    }

    return buildImportedRecord({
      rowNumber: input.rowNumber,
      provider: 'generic_csv',
      title: title || url || username || 'Imported record',
      folder: folder || null,
      tags,
      url,
      username,
      password,
      notes,
    });
  }

  private parseLastPassRow(input: RowParseResult): RecordBuildResult | null {
    const { row } = input;
    const title = firstValue(row, ['name']);
    const username = firstValue(row, ['username']);
    const password = firstValue(row, ['password']);
    const url = firstValue(row, ['url']);
    const notes = firstValue(row, ['extra']);
    const folder = firstValue(row, ['grouping']);
    const totp = firstValue(row, ['totp']);

    if (!title && !username && !password && !url && !notes) {
      return null;
    }

    return buildImportedRecord({
      rowNumber: input.rowNumber,
      provider: 'lastpass_csv',
      title: title || url || username || 'Imported LastPass record',
      folder: folder || null,
      tags: [],
      url,
      username,
      password,
      notes,
      totp,
    });
  }

  private parseOnePasswordRow(input: RowParseResult): RecordBuildResult | null {
    const { row } = input;
    const title = firstValue(row, ['title']);
    const username = firstValue(row, ['username']);
    const password = firstValue(row, ['password']);
    const url = firstValue(row, ['url', 'website']);
    const notes = firstValue(row, ['notes']);
    const tags = splitList(firstValue(row, ['tags']));
    const otp = firstValue(row, ['otpauth', 'otp']);
    const favorite = firstValue(row, ['favorite']);
    const archived = firstValue(row, ['archived']);

    if (!title && !username && !password && !url && !notes) {
      return null;
    }

    const result = buildImportedRecord({
      rowNumber: input.rowNumber,
      provider: 'onepassword_csv',
      title: title || url || username || 'Imported 1Password record',
      folder: null,
      tags,
      url,
      username,
      password,
      notes,
      totp: otp,
    });

    if (normalizeBoolean(archived)) {
      result.issues.push({
        rowNumber: input.rowNumber,
        severity: 'warning',
        code: 'archived_item',
        message: 'Archived item imported for review.',
        field: 'Archived',
        suggestedAction:
          'Confirm the archived item should be restored before final import.',
      });
    }
    if (normalizeBoolean(favorite)) {
      result.issues.push({
        rowNumber: input.rowNumber,
        severity: 'warning',
        code: 'favorite_metadata_only',
        message: 'Favorite flag preserved as metadata only.',
        field: 'Favorite',
        suggestedAction:
          'Reapply favorite status manually after import if it still matters.',
      });
    }

    return result;
  }
}

function buildImportedRecord(input: {
  rowNumber: number;
  provider: ParseImportRequest['provider'];
  title: string;
  folder: string | null;
  tags: string[];
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  totp?: string;
}): RecordBuildResult {
  const urls = input.url ? [input.url] : [];
  const issues: ImportIssue[] = [];

  const fields: ImportField[] = [];
  if (input.username) fields.push({ label: 'Username', value: input.username });
  if (input.password) fields.push({ label: 'Password', value: input.password });
  if (input.url) fields.push({ label: 'Website', value: input.url });
  if (input.totp) fields.push({ label: 'TOTP', value: input.totp });
  if (input.notes) fields.push({ label: 'Notes', value: input.notes });

  const isNote = !input.password && Boolean(input.notes) && !input.username;
  if (!input.password) {
    issues.push({
      rowNumber: input.rowNumber,
      severity: 'warning',
      code: 'missing_password',
      message: 'No password value found; review before import.',
      field: 'password',
      suggestedAction:
        'Confirm this row is intended to be imported as a secure note or add the missing password value.',
    });
  }

  return {
    record: {
      rowNumber: input.rowNumber,
      provider: input.provider,
      title: input.title,
      folder: input.folder,
      tags: input.tags,
      urls,
      warnings: [],
      reviewRequired: issues.length > 0,
      content: isNote
        ? {
            type: 'note',
            content: input.notes ?? '',
          }
        : {
            type: 'password',
            fields,
          },
    },
    issues,
  };
}

function firstValue(row: CsvRow, aliases: string[]): string | undefined {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const entry = entries.find(([key]) => normalizeHeader(key) === alias);
    const value = entry?.[1]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
}

function splitList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeHeader(header: string): string {
  return header
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

function normalizeBoolean(value: string | undefined): boolean {
  return ['1', 'true', 'yes'].includes(value?.trim().toLowerCase() ?? '');
}

function parseCsvRows(content: string): RowParseResult[] {
  const lines = splitCsvLines(content).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return [];
  }

  const headerParse = parseCsvLine(lines[0]!);
  if (headerParse.hasUnbalancedQuotes) {
    return [];
  }

  const headers = headerParse.values.map((header) => header.trim());
  return lines.slice(1).map((line, index) => {
    const rowNumber = index + 2;
    const valuesParse = parseCsvLine(line);
    const issues: ImportIssue[] = [];

    if (
      valuesParse.hasUnbalancedQuotes ||
      valuesParse.values.length > headers.length
    ) {
      issues.push({
        rowNumber,
        severity: 'error',
        code: 'malformed_row',
        message: 'Row could not be parsed safely from the CSV source.',
        field: null,
        suggestedAction:
          'Fix unmatched quotes or extra columns in the source file, then retry the import.',
      });
    }

    const row = headers.reduce<CsvRow>((record, header, valueIndex) => {
      record[header] = valuesParse.values[valueIndex] ?? '';
      return record;
    }, {});

    return { rowNumber, row, issues };
  });
}

function splitCsvLines(content: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]!;
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      current += char;
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      lines.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

function parseCsvLine(
  line: string,
): { values: string[]; hasUnbalancedQuotes: boolean } {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]!;
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return { values, hasUnbalancedQuotes: inQuotes };
}

function findDuplicateGroups(
  records: ImportedVaultRecord[],
): ImportDuplicateGroup[] {
  const grouped = new Map<string, number[]>();

  for (const record of records) {
    const signature = buildRecordSignature(record);
    const existing = grouped.get(signature) ?? [];
    existing.push(record.rowNumber);
    grouped.set(signature, existing);
  }

  return [...grouped.entries()]
    .filter(([, rowNumbers]) => rowNumbers.length > 1)
    .map(([signature, rowNumbers]) => ({
      signature,
      rowNumbers,
      suggestedAction:
        'Review these rows and keep only the best source entry before final import.',
    }));
}

function buildDuplicateIssues(
  groups: ImportDuplicateGroup[],
): ImportIssue[] {
  return groups.flatMap((group) =>
    group.rowNumbers.map((rowNumber) => ({
      rowNumber,
      severity: 'warning' as const,
      code: 'duplicate_record' as const,
      message: `Possible duplicate detected with rows ${group.rowNumbers.join(', ')}.`,
      field: null,
      suggestedAction: group.suggestedAction,
    })),
  );
}

function buildRecordSignature(record: ImportedVaultRecord): string {
  const usernameField =
    record.content.type === 'password'
      ? record.content.fields.find((field) => field.label === 'Username')?.value
      : undefined;

  return [
    record.content.type,
    record.title.trim().toLowerCase(),
    (record.urls[0] ?? '').trim().toLowerCase(),
    (usernameField ?? '').trim().toLowerCase(),
  ].join('|');
}
