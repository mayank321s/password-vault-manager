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
      provider: 'generic_csv',
      title: 'GitHub',
      tags: ['dev', 'personal'],
      urls: ['https://github.com'],
      content: {
        type: 'password',
      },
    });
  });

  it('parses lastpass exports with grouping and totp fields', () => {
    const result = service.parseImport('user-1', {
      provider: 'lastpass_csv',
      content:
        'url,username,password,totp,extra,name,grouping,fav\nhttps://example.com,alice,password123,otpauth://totp/test,legacy note,Example,Shared,0',
    });

    expect(result.records[0]).toMatchObject({
      provider: 'lastpass_csv',
      title: 'Example',
      folder: 'Shared',
      urls: ['https://example.com'],
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
    });
  });

  it('treats note-only imports as secure notes', () => {
    const result = service.parseImport('user-1', {
      provider: 'generic_csv',
      content: 'title,notes\nServer checklist,rotate keys monthly',
    });

    expect(result.records[0]).toMatchObject({
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
});
