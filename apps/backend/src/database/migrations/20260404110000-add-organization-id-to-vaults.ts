import { DataTypes, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      'vaults',
      'organization_id',
      {
        type: DataTypes.UUID,
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.addConstraint('vaults', {
      fields: ['organization_id'],
      type: 'foreign key',
      name: 'vaults_organization_id_fkey',
      references: {
        table: 'organizations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      transaction,
    });

    await queryInterface.addIndex('vaults', ['organization_id'], {
      name: 'vaults_organization_id_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeIndex('vaults', 'vaults_organization_id_idx', {
      transaction,
    });
    await queryInterface.removeConstraint(
      'vaults',
      'vaults_organization_id_fkey',
      { transaction },
    );
    await queryInterface.removeColumn('vaults', 'organization_id', {
      transaction,
    });
  });
};
