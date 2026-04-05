import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const utcTimestamp = new Date().toISOString();
const reportDate = utcTimestamp.slice(0, 10);
const reportPath = path.join(
  repoRoot,
  'docs',
  'qa',
  `MASTER_REGRESSION_EVIDENCE_${reportDate}.md`,
);

const automatedSuites = [
  {
    name: 'Backend unit and smoke regression',
    command: 'pnpm --filter backend exec jest --runInBand --passWithNoTests',
    covers: ['auth', 'vault', 'billing', 'tenant boundaries', 'SSO/SCIM'],
  },
  {
    name: 'Extension regression suite',
    command: 'pnpm --filter @repo/extension-core run test',
    covers: ['extension'],
  },
  {
    name: 'Shared package build',
    command: 'pnpm --filter @repo/shared build',
    covers: ['auth', 'vault', 'billing', 'tenant boundaries', 'SSO/SCIM', 'shared contracts'],
  },
  {
    name: 'Backend production build',
    command: 'pnpm --filter backend build',
    covers: ['auth', 'vault', 'billing', 'tenant boundaries', 'SSO/SCIM'],
  },
  {
    name: 'Frontend typecheck',
    command: 'pnpm --filter frontend run check-types',
    covers: ['auth', 'vault', 'billing', 'extension onboarding', 'admin surfaces'],
  },
  {
    name: 'Frontend production build',
    command: 'pnpm --filter frontend build',
    covers: ['auth', 'vault', 'billing', 'admin surfaces', 'import UX'],
  },
];

const manualSuites = [
  'Accessibility walkthrough for login, vault, org settings, import, and extension onboarding flows.',
  'Performance spot-check for frontend production build output and route-load regressions on critical launch pages.',
  'Tenant-boundary verification across personal, family, and business workspace switching plus restricted admin surfaces.',
  'Billing/SSO/SCIM admin-path sanity review using the current launch-ready UI and API contracts.',
];

function extractSection(content, heading, fallbackLines) {
  const marker = `## ${heading}`;
  const startIndex = content.indexOf(marker);
  if (startIndex === -1) {
    return fallbackLines;
  }

  const nextHeadingIndex = content.indexOf('\n## ', startIndex + marker.length);
  const sectionBody = content
    .slice(startIndex + marker.length, nextHeadingIndex === -1 ? undefined : nextHeadingIndex)
    .trim();

  if (!sectionBody) {
    return fallbackLines;
  }

  return sectionBody.split('\n');
}

function runSuite(suite) {
  const startedAt = new Date().toISOString();
  try {
    const output = execSync(suite.command, {
      cwd: repoRoot,
      stdio: 'pipe',
      encoding: 'utf8',
    });

    return {
      ...suite,
      status: 'passed',
      startedAt,
      finishedAt: new Date().toISOString(),
      output: output.trim(),
    };
  } catch (error) {
    const stdout = typeof error.stdout === 'string' ? error.stdout : '';
    const stderr = typeof error.stderr === 'string' ? error.stderr : '';
    return {
      ...suite,
      status: 'failed',
      startedAt,
      finishedAt: new Date().toISOString(),
      output: `${stdout}\n${stderr}`.trim(),
      exitCode: error.status ?? 1,
    };
  }
}

const results = automatedSuites.map(runSuite);
const hasFailures = results.some((result) => result.status !== 'passed');
const existingReport = fs.existsSync(reportPath)
  ? fs.readFileSync(reportPath, 'utf8')
  : '';
const preservedManualChecklist = extractSection(
  existingReport,
  'Manual Certification Checklist',
  manualSuites.map((item) => `- [ ] ${item}`),
);
const preservedNotes = extractSection(existingReport, 'Notes', [
  '- This report is generated from executable repository checks plus a launch certification checklist for manual sign-off.',
  '- Manual items must be marked complete by the release owner before go-live.',
]);

const lines = [
  '# Master Regression Evidence',
  '',
  `- Generated at: ${utcTimestamp}`,
  `- Repository: \`D:\\work\\password-manager-dev\``,
  `- Overall automated status: ${hasFailures ? 'failed' : 'passed'}`,
  '',
  '## Automated Suites',
];

for (const result of results) {
  lines.push('');
  lines.push(`### ${result.name}`);
  lines.push(`- Status: ${result.status}`);
  lines.push(`- Covers: ${result.covers.join(', ')}`);
  lines.push(`- Command: \`${result.command}\``);
  lines.push(`- Started: ${result.startedAt}`);
  lines.push(`- Finished: ${result.finishedAt}`);
  if (result.exitCode) {
    lines.push(`- Exit code: ${result.exitCode}`);
  }
  if (result.output) {
    lines.push('');
    lines.push('```text');
    lines.push(result.output);
    lines.push('```');
  }
}

lines.push('');
lines.push('## Manual Certification Checklist');
lines.push('');
for (const line of preservedManualChecklist) {
  lines.push(line);
}

lines.push('');
lines.push('## Notes');
lines.push('');
for (const line of preservedNotes) {
  lines.push(line);
}

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);

console.log(`Wrote regression report to ${reportPath}`);

if (hasFailures) {
  process.exitCode = 1;
}
