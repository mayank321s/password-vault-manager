import { DataTypes, QueryInterface } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable('sso_verified_domains', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    sso_configuration_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sso_configurations',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

    await queryInterface.addIndex('sso_verified_domains', ['domain'], {
      unique: true,
      name: 'sso_verified_domains_domain_unique_idx',
      transaction,
    });
    await queryInterface.addIndex(
      'sso_verified_domains',
      ['sso_configuration_id', 'organization_id'],
      {
        name: 'sso_verified_domains_config_org_idx',
        transaction,
      },
    );
  });
};

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('sso_verified_domains', { transaction });
  });
};
