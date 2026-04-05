import { ImportsService } from './imports.service';

describe('ImportsService', () => {
  const service = new ImportsService();

  it('parses generic csv rows into password content', () => {
    const result = service.parseImport('user-1', {
      provider: 'generic_csv',
      content:
        'title,url,username,password,notes,tags\nGitHub,https://github.com,octocat,hunter2,personal account,dev;personal',
    });

    expect(result.parsedCount).toBe(1);
    expect(result.records[0]).toMatchObject({
      rowNumber: 2,
      provider: 'generic_csv',
      title: 'GitHub',
      tags: ['dev', 'personal'],
      urls: ['https://github.com'],
      reviewRequired: false,
      content: {
        type: 'password',
      },
    });
    expect(result.summary).toMatchObject({
      issueCount: 0,
      requiresReviewCount: 0,
      duplicateGroupCount: 0,
    });
  });

  it('parses lastpass exports with grouping and totp fields', () => {
    const result = service.parseImport('user-1', {
      provider: 'lastpass_csv',
      content:
        'url,username,password,totp,extra,name,grouping,fav\nhttps://example.com,alice,password123,otpauth://totp/test,legacy note,Example,Shared,0',
    });

    expect(result.records[0]).toMatchObject({
      rowNumber: 2,
      provider: 'lastpass_csv',
      title: 'Example',
      folder: 'Shared',
      urls: ['https://example.com'],
      reviewRequired: false,
      content: {
        type: 'password',
        fields: expect.arrayContaining([
          { label: 'TOTP', value: 'otpauth://totp/test' },
        ]),
      },
    });
  });

  it('parses onepassword exports and preserves warning metadata', () => {
    const result = service.parseImport('user-1', {
      provider: 'onepassword_csv',
      content:
        'Title,Url,Username,Password,OTPAuth,Favorite,Archived,Tags,Notes\nBank,https://bank.test,alice,s3cret,otpauth://totp/bank,1,1,finance;important,high priority',
    });

    expect(result.records[0]).toMatchObject({
      provider: 'onepassword_csv',
      title: 'Bank',
      tags: ['finance', 'important'],
      warnings: expect.arrayContaining([
        'Archived item imported for review.',
        'Favorite flag preserved as metadata only.',
      ]),
      reviewRequired: true,
    });
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'archived_item', rowNumber: 2 }),
        expect.objectContaining({
          code: 'favorite_metadata_only',
          rowNumber: 2,
        }),
      ]),
    );
  });

  it('treats note-only imports as secure notes', () => {
    const result = service.parseImport('user-1', {
      provider: 'generic_csv',
      content: 'title,notes\nServer checklist,rotate keys monthly',
    });

    expect(result.records[0]).toMatchObject({
      reviewRequired: true,
      warnings: ['No password value found; review before import.'],
      content: {
        type: 'note',
        content: 'rotate keys monthly',
      },
    });
  });

  it('parses csv exports with a utf-8 bom in the first header', () => {
    const result = service.parseImport('user-1', {
      provider: 'generic_csv',
      content:
        '\uFEFFtitle,url,username,password\nGitHub,https://github.com,octocat,hunter2',
    });

    expect(result.records[0]).toMatchObject({
      rowNumber: 2,
      title: 'GitHub',
      urls: ['https://github.com'],
      content: {
        type: 'password',
        fields: expect.arrayContaining([
          { label: 'Username', value: 'octocat' },
          { label: 'Password', value: 'hunter2' },
        ]),
      },
    });
  });

  it('flags duplicate records for remediation review', () => {
    const result = service.parseImport('user-1', {
      provider: 'generic_csv',
      content: [
        'title,url,username,password',
        'GitHub,https://github.com,octocat,hunter2',
        'GitHub,https://github.com,octocat,new-secret',
      ].join('\n'),
    });

    expect(result.duplicateGroups).toHaveLength(1);
    expect(result.duplicateGroups[0]).toMatchObject({
      rowNumbers: [2, 3],
    });
    expect(result.records.map((record) => record.reviewRequired)).toEqual([
      true,
      true,
    ]);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'duplicate_record', rowNumber: 2 }),
        expect.objectContaining({ code: 'duplicate_record', rowNumber: 3 }),
      ]),
    );
  });

  it('reports malformed rows with structured remediation guidance', () => {
    const result = service.parseImport('user-1', {
      provider: 'generic_csv',
      content: [
        'title,url,username,password',
        'Broken,https://github.com,"octocat,hunter2',
      ].join('\n'),
    });

    expect(result.records).toHaveLength(0);
    expect(result.skippedCount).toBe(1);
    expect(result.summary.errorCount).toBe(1);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'malformed_row',
          rowNumber: 2,
          severity: 'error',
        }),
      ]),
    );
  });
});
