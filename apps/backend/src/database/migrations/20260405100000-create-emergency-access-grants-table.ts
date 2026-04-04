import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('emergency_access_grants', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
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
    grantor_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    grantee_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('pending_acceptance', 'active', 'revoked', 'declined'),
      allowNull: false,
      defaultValue: 'pending_acceptance',
    },
    recovery_delay_hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 72,
    },
    note: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revoked_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revoked_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
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
  });

  await queryInterface.addIndex('emergency_access_grants', ['organization_id'], {
    name: 'emergency_access_grants_organization_id_idx',
  });
  await queryInterface.addIndex('emergency_access_grants', ['grantor_user_id'], {
    name: 'emergency_access_grants_grantor_user_id_idx',
  });
  await queryInterface.addIndex('emergency_access_grants', ['grantee_user_id'], {
    name: 'emergency_access_grants_grantee_user_id_idx',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('emergency_access_grants');
}
