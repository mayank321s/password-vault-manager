import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'organizations',
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
        organization_type: {
          type: DataTypes.ENUM('personal', 'family', 'business'),
          allowNull: false,
          defaultValue: 'personal',
        },
        created_by_user_id: {
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

    await queryInterface.addConstraint('organizations', {
      fields: ['created_by_user_id'],
      type: 'foreign key',
      name: 'organizations_created_by_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      transaction,
    });

    await queryInterface.addIndex('organizations', ['organization_type'], {
      name: 'organizations_organization_type_idx',
      transaction,
    });

    await queryInterface.addIndex('organizations', ['created_by_user_id'], {
      name: 'organizations_created_by_user_id_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('organizations', { transaction });
  });
};

