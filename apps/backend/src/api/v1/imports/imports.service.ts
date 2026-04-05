import { Injectable } from '@nestjs/common';
import type {
  ImportedVaultRecord,
  ImportField,
  ParseImportRequest,
  ParseImportResponse,
} from '@repo/shared';

type CsvRow = Record<string, string>;

@Injectable()
export class ImportsService {
  parseImport(_userId: string, payload: ParseImportRequest): ParseImportResponse {
    const rows = parseCsvRows(payload.content);
    const records = rows
      .map((row) => this.parseRow(payload.provider, row))
      .filter((record): record is ImportedVaultRecord => record !== null);

    return {
      provider: payload.provider,
      totalRows: rows.length,
      parsedCount: records.length,
      skippedCount: rows.length - records.length,
      records,
    };
  }

  private parseRow(
    provider: ParseImportRequest['provider'],
    row: CsvRow,
  ): ImportedVaultRecord | null {
    switch (provider) {
      case 'generic_csv':
        return this.parseGenericCsvRow(row);
      case 'lastpass_csv':
        return this.parseLastPassRow(row);
      case 'onepassword_csv':
        return this.parseOnePasswordRow(row);
    }
  }

  private parseGenericCsvRow(row: CsvRow): ImportedVaultRecord | null {
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

  private parseLastPassRow(row: CsvRow): ImportedVaultRecord | null {
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

  private parseOnePasswordRow(row: CsvRow): ImportedVaultRecord | null {
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

    const warnings: string[] = [];
    if (normalizeBoolean(archived)) {
      warnings.push('Archived item imported for review.');
    }
    if (normalizeBoolean(favorite)) {
      warnings.push('Favorite flag preserved as metadata only.');
    }

    const record = buildImportedRecord({
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

    return {
      ...record,
      warnings: [...record.warnings, ...warnings],
    };
  }
}

function buildImportedRecord(input: {
  provider: ParseImportRequest['provider'];
  title: string;
  folder: string | null;
  tags: string[];
  url?: string;
  username?: string;
  password?: string;
  notes?: string;
  totp?: string;
}): ImportedVaultRecord {
  const urls = input.url ? [input.url] : [];
  const warnings: string[] = [];

  const fields: ImportField[] = [];
  if (input.username) fields.push({ label: 'Username', value: input.username });
  if (input.password) fields.push({ label: 'Password', value: input.password });
  if (input.url) fields.push({ label: 'Website', value: input.url });
  if (input.totp) fields.push({ label: 'TOTP', value: input.totp });
  if (input.notes) fields.push({ label: 'Notes', value: input.notes });

  const isNote = !input.password && Boolean(input.notes) && !input.username;
  if (!input.password) {
    warnings.push('No password value found; review before import.');
  }

  return {
    provider: input.provider,
    title: input.title,
    folder: input.folder,
    tags: input.tags,
    urls,
    warnings,
    content: isNote
      ? {
          type: 'note',
          content: input.notes ?? '',
        }
      : {
          type: 'password',
          fields,
        },
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

function parseCsvRows(content: string): CsvRow[] {
  const lines = splitCsvLines(content).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return [];
  }

  const headers = parseCsvLine(lines[0]!).map((header) => header.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<CsvRow>((record, header, index) => {
      record[header] = values[index] ?? '';
      return record;
    }, {});
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

function parseCsvLine(line: string): string[] {
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
  return values;
}
