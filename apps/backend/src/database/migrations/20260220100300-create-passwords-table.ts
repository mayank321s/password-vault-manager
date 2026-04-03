import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'passwords',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        vault_id: {
          type: DataTypes.UUID,
          allowNull: false,
          comment: 'ID of the vault this password belongs to',
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
          comment: 'Encrypted title/name of the password entry',
        },
        encrypted_data: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment:
            'Encrypted password blob (JSON with username, password, url, notes)',
        },
        is_note: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether this is a secure note or password entry',
        },
        created_by_user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        updated_by_user_id: {
          type: DataTypes.UUID,
          allowNull: true,
          comment: 'ID of the user who last modified this password entry',
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

    await queryInterface.addConstraint('passwords', {
      fields: ['vault_id'],
      type: 'foreign key',
      name: 'passwords_vault_id_fkey',
      references: {
        table: 'vaults',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addConstraint('passwords', {
      fields: ['created_by_user_id'],
      type: 'foreign key',
      name: 'passwords_created_by_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      transaction,
    });

    await queryInterface.addConstraint('passwords', {
      fields: ['updated_by_user_id'],
      type: 'foreign key',
      name: 'passwords_updated_by_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      transaction,
    });

    // Create index on vault_id for faster lookups
    await queryInterface.addIndex('passwords', ['vault_id'], {
      name: 'passwords_vault_id_idx',
      transaction,
    });

    // Create index on created_by_user_id for filtering
    await queryInterface.addIndex('passwords', ['created_by_user_id'], {
      name: 'passwords_created_by_user_id_idx',
      transaction,
    });

    // Create index on updated_by_user_id for filtering
    await queryInterface.addIndex('passwords', ['updated_by_user_id'], {
      name: 'passwords_updated_by_user_id_idx',
      transaction,
    });

    // Create index on is_note for filtering
    await queryInterface.addIndex('passwords', ['is_note'], {
      name: 'passwords_is_note_idx',
      transaction,
    });

    // Create compound index for vault and type queries
    await queryInterface.addIndex('passwords', ['vault_id', 'is_note'], {
      name: 'passwords_vault_id_is_note_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('passwords', { transaction });
  });
};
