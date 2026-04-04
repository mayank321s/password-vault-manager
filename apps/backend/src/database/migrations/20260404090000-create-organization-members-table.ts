import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'organization_members',
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
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM(
            'owner',
            'adult',
            'child',
            'admin',
            'manager',
            'member',
          ),
          allowNull: false,
          defaultValue: 'member',
        },
        status: {
          type: DataTypes.ENUM('active', 'invited', 'suspended'),
          allowNull: false,
          defaultValue: 'invited',
        },
        joined_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
        invited_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        removed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('organization_members', {
      fields: ['organization_id'],
      type: 'foreign key',
      name: 'organization_members_organization_id_fkey',
      references: {
        table: 'organizations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addConstraint('organization_members', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'organization_members_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addIndex(
      'organization_members',
      ['organization_id', 'user_id'],
      {
        unique: true,
        name: 'organization_members_org_user_unique_idx',
        transaction,
      },
    );

    await queryInterface.addIndex(
      'organization_members',
      ['organization_id', 'status'],
      {
        name: 'organization_members_org_status_idx',
        transaction,
      },
    );

    await queryInterface.addIndex('organization_members', ['user_id', 'status'], {
      name: 'organization_members_user_status_idx',
      transaction,
    });
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('organization_members', { transaction });
  });
};

