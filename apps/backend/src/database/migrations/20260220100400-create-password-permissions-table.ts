import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'password_permissions',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        password_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        permission: {
          type: DataTypes.ENUM('owner', 'editor', 'viewer'),
          allowNull: false,
          defaultValue: 'viewer',
        },
        password_encrypted_key: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Password-specific encryption key for individual sharing',
        },
        encrypted_data: {
          type: DataTypes.TEXT,
          allowNull: false,
          defaultValue: '',
          comment:
            'Password data re-encrypted with the share-specific AES key (zero-knowledge per-share copy)',
        },
        granted_by_user_id: {
          type: DataTypes.UUID,
          allowNull: false,
          comment: 'ID of the user who granted this permission',
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('password_permissions', {
      fields: ['password_id'],
      type: 'foreign key',
      name: 'password_permissions_password_id_fkey',
      references: {
        table: 'passwords',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addConstraint('password_permissions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'password_permissions_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addConstraint('password_permissions', {
      fields: ['granted_by_user_id'],
      type: 'foreign key',
      name: 'password_permissions_granted_by_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      transaction,
    });

    // Create composite unique index on password_id and user_id
    await queryInterface.addIndex(
      'password_permissions',
      ['password_id', 'user_id'],
      {
        unique: true,
        name: 'password_permissions_password_user_unique_idx',
        transaction,
      },
    );

    // Create index on user_id for faster lookups
    await queryInterface.addIndex('password_permissions', ['user_id'], {
      name: 'password_permissions_user_id_idx',
      transaction,
    });

    // Create index on password_id for faster lookups
    await queryInterface.addIndex('password_permissions', ['password_id'], {
      name: 'password_permissions_password_id_idx',
      transaction,
    });

    // Create index on granted_by_user_id for faster lookups
    await queryInterface.addIndex(
      'password_permissions',
      ['granted_by_user_id'],
      {
        name: 'password_permissions_granted_by_user_id_idx',
        transaction,
      },
    );
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('password_permissions', { transaction });
  });
};
