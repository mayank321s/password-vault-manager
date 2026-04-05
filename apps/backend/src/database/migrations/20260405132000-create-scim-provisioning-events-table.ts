import { DataTypes, QueryInterface } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('scim_provisioning_events', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    scim_token_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'scim_tokens',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    resource_type: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'success',
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    }, { transaction });

    await queryInterface.addIndex('scim_provisioning_events', ['organization_id', 'created_at'], {
      name: 'scim_events_org_created_idx',
      transaction,
    });
  });
};

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('scim_provisioning_events', { transaction });
  });
};
