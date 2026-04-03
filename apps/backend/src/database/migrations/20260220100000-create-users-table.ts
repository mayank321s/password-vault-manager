import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        username: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        password_hash: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: 'Double-hashed with Argon2 (client + server)',
        },
        public_key: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'RSA-4096 public key in PEM format',
        },
        encrypted_seed_phrase: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Private key encrypted with master key',
        },
        encrypted_private_key: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment:
            'RSA private key encrypted with seed phrase-derived wrapping key',
        },
        encryption_salt: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Salt for PBKDF2 master key derivation',
        },
        encrypted_signing_private_key: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment:
            'RSA-PSS signing private key encrypted with seed phrase-derived wrapping key',
        },
        signing_public_key: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment:
            'RSA-PSS signing public key for account recovery verification',
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      },
      { transaction },
    );

    // Create index on email for faster lookups
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique_idx',
      transaction,
    });

    // Create index on is_active for filtering active users
    await queryInterface.addIndex('users', ['is_active'], {
      name: 'users_is_active_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('users', { transaction });
  });
};
