import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'vaults',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        is_personal_vault: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: "True if this is a user's personal vault",
        },
        owner_user_id: {
          type: DataTypes.UUID,
          allowNull: false,
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

    await queryInterface.addConstraint('vaults', {
      fields: ['owner_user_id'],
      type: 'foreign key',
      name: 'vaults_owner_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    // Create index on owner_user_id for faster lookups
    await queryInterface.addIndex('vaults', ['owner_user_id'], {
      name: 'vaults_owner_user_id_idx',
      transaction,
    });

    // Create index on is_personal_vault for filtering
    await queryInterface.addIndex('vaults', ['is_personal_vault'], {
      name: 'vaults_is_personal_vault_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('vaults', { transaction });
  });
};
