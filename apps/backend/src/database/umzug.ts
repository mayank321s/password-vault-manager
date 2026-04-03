import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'password_manager',
  logging: process.env.DATABASE_LOGGING === 'true' ? console.log : false,
});

const template = `import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction((transaction) => {
    return Promise.resolve(transaction);
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction((transaction) => {
    return Promise.resolve(transaction);
  });
};
`;

const migrationsDir = path.resolve(process.cwd(), 'src', 'database', 'migrations');
const createMigrationsDir = path.resolve(
  process.cwd(),
  'src',
  'database',
  'migrations',
);

// Create Umzug instance
export const umzug = new Umzug({
  migrations: {
    glob: [
      path.join(migrationsDir, '*.{ts,js}').replace(/\\/g, '/'),
      { ignore: ['**/*.d.ts'] },
    ],
  },
  create: {
    folder: createMigrationsDir,
    template: (filepath) => [[`${filepath}.ts`, template]],
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

// Export types for migration functions
export type Migration = typeof umzug._types.migration;
