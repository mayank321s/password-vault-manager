import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'vault_members',
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
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        user_role: {
          type: DataTypes.ENUM('owner', 'manager', 'team_member'),
          allowNull: false,
          defaultValue: 'team_member',
        },
        vault_encrypted_key: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: "Vault key encrypted with user's public key",
        },
        joined_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('vault_members', {
      fields: ['vault_id'],
      type: 'foreign key',
      name: 'vault_members_vault_id_fkey',
      references: {
        table: 'vaults',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addConstraint('vault_members', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'vault_members_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });
    // Create composite unique index on vault_id and user_id
    await queryInterface.addIndex('vault_members', ['vault_id', 'user_id'], {
      unique: true,
      name: 'vault_members_vault_user_unique_idx',
      transaction,
    });

    // Create index on user_id for faster lookups
    await queryInterface.addIndex('vault_members', ['user_id'], {
      name: 'vault_members_user_id_idx',
      transaction,
    });

    // Create index on vault_id for faster lookups
    await queryInterface.addIndex('vault_members', ['vault_id'], {
      name: 'vault_members_vault_id_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('vault_members', { transaction });
  });
};
