import { DataTypes, Op, QueryInterface } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      'organization_members',
      'scim_external_id',
      {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.addColumn(
      'organization_members',
      'provision_source',
      {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      { transaction },
    );

    await queryInterface.addIndex(
      'organization_members',
      ['organization_id', 'scim_external_id'],
      {
        unique: true,
        name: 'organization_members_org_scim_external_unique_idx',
        where: {
          scim_external_id: {
            [Op.ne]: null,
          },
        } as never,
        transaction,
      },
    );
  });
};

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeIndex(
      'organization_members',
      'organization_members_org_scim_external_unique_idx',
      { transaction },
    );
    await queryInterface.removeColumn('organization_members', 'provision_source', {
      transaction,
    });
    await queryInterface.removeColumn('organization_members', 'scim_external_id', {
      transaction,
    });
  });
};
