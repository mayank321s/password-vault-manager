import { DataTypes, Op, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'organization_policies',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        organization_id: {
          type: DataTypes.UUID,
          allowNull: false,
          unique: true,
        },
        require_mfa: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        restrict_external_sharing: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        session_timeout_minutes: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 60,
        },
        max_devices_per_user: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 5,
        },
        policy_version: {
          type: DataTypes.STRING(32),
          allowNull: false,
          defaultValue: 'v1',
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('organization_policies', {
      fields: ['organization_id'],
      type: 'foreign key',
      name: 'organization_policies_organization_id_fkey',
      references: {
        table: 'organizations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addConstraint('organization_policies', {
      fields: ['session_timeout_minutes'],
      type: 'check',
      name: 'organization_policies_session_timeout_minutes_check',
      where: {
        session_timeout_minutes: {
          // 5 min to 24h policy window
          [Op.gte]: 5,
          [Op.lte]: 1440,
        },
      } as never,
      transaction,
    });

    await queryInterface.addConstraint('organization_policies', {
      fields: ['max_devices_per_user'],
      type: 'check',
      name: 'organization_policies_max_devices_per_user_check',
      where: {
        max_devices_per_user: {
          [Op.gte]: 1,
          [Op.lte]: 50,
        },
      } as never,
      transaction,
    });

    await queryInterface.addIndex('organization_policies', ['organization_id'], {
      unique: true,
      name: 'organization_policies_organization_id_unique_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('organization_policies', { transaction });
  });
};
