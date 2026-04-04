import { DataTypes, Op, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('organization_members', 'scim_external_id', {
    type: DataTypes.STRING(255),
    allowNull: true,
  });

  await queryInterface.addColumn('organization_members', 'provision_source', {
    type: DataTypes.STRING(32),
    allowNull: true,
  });

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
    },
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeIndex(
    'organization_members',
    'organization_members_org_scim_external_unique_idx',
  );
  await queryInterface.removeColumn('organization_members', 'provision_source');
  await queryInterface.removeColumn('organization_members', 'scim_external_id');
}
