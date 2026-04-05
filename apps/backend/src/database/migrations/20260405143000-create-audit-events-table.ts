import { DataTypes, QueryInterface } from 'sequelize';
import type { MigrationFn } from 'umzug';

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'audit_events',
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        organization_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'organizations',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        actor_user_id: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        actor_email: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        action: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        target_type: {
          type: DataTypes.STRING(80),
          allowNull: false,
        },
        target_id: {
          type: DataTypes.STRING(120),
          allowNull: true,
        },
        target_label: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction },
    );

    await queryInterface.addIndex('audit_events', ['organization_id', 'created_at'], {
      name: 'audit_events_org_created_at_idx',
      transaction,
    });
    await queryInterface.addIndex('audit_events', ['organization_id', 'action'], {
      name: 'audit_events_org_action_idx',
      transaction,
    });
    await queryInterface.addIndex('audit_events', ['organization_id', 'actor_user_id'], {
      name: 'audit_events_org_actor_idx',
      transaction,
    });
    await queryInterface.addIndex('audit_events', ['organization_id', 'target_type', 'target_id'], {
      name: 'audit_events_org_target_idx',
      transaction,
    });
  });
};

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('audit_events', { transaction });
  });
};
