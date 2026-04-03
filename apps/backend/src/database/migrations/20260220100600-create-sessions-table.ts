import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'sessions',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        jwt_token_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          comment: 'JTI claim from JWT for token blacklisting',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: 'JWT expiration timestamp',
        },
        revoked_at: {
          type: DataTypes.DATE,
          allowNull: true,
          comment: 'Timestamp when session was manually revoked',
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('sessions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'sessions_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    // Create unique index on jwt_token_id for fast lookups
    await queryInterface.addIndex('sessions', ['jwt_token_id'], {
      unique: true,
      name: 'sessions_jwt_token_id_unique_idx',
      transaction,
    });

    // Create index on user_id for listing user sessions
    await queryInterface.addIndex('sessions', ['user_id'], {
      name: 'sessions_user_id_idx',
      transaction,
    });

    // Create index on expires_at for cleanup queries
    await queryInterface.addIndex('sessions', ['expires_at'], {
      name: 'sessions_expires_at_idx',
      transaction,
    });

    // Create index on revoked_at for filtering revoked sessions
    await queryInterface.addIndex('sessions', ['revoked_at'], {
      name: 'sessions_revoked_at_idx',
      transaction,
    });

    // Create compound index for active session queries
    await queryInterface.addIndex('sessions', ['user_id', 'revoked_at'], {
      name: 'sessions_user_id_revoked_at_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('sessions', { transaction });
  });
};
