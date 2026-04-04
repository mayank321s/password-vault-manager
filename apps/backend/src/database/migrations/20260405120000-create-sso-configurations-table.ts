import { DataTypes, QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('sso_configurations', {
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
    provider: {
      type: DataTypes.ENUM('entra_oidc'),
      allowNull: false,
      defaultValue: 'entra_oidc',
    },
    tenant_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    client_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    client_secret_ref: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    redirect_uri: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    issuer: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    authorization_endpoint: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    token_endpoint: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    scopes: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: 'openid profile email',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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

  await queryInterface.addIndex('sso_configurations', ['organization_id'], {
    unique: true,
    name: 'sso_configurations_organization_id_unique_idx',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('sso_configurations');
}
