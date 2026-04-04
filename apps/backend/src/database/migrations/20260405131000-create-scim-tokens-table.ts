import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('scim_tokens', {
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
    label: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    token_prefix: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    token_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    last_used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    revoked_at: {
      type: DataTypes.DATE,
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
  });

  await queryInterface.addIndex('scim_tokens', ['organization_id', 'revoked_at'], {
    name: 'scim_tokens_org_revoked_idx',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('scim_tokens');
}
