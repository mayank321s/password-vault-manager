import { umzug } from './umzug';

async function main() {
  const pending = await umzug.pending();

  if (pending.length > 0) {
    console.error(
      `Pending migrations detected: ${pending.map((migration) => migration.name).join(', ')}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log('No pending migrations detected.');
}

void main();
