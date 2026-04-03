import { DataTypes, literal, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'one_time_shares',
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
        encrypted_blob: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Password encrypted with random symmetric key',
        },
        created_by_user_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: literal('CURRENT_TIMESTAMP'),
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
          comment: 'Expiration timestamp for the share link',
        },
        is_used: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: 'Whether the share link has been accessed',
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('one_time_shares', {
      fields: ['password_id'],
      type: 'foreign key',
      name: 'one_time_shares_password_id_fkey',
      references: {
        table: 'passwords',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addConstraint('one_time_shares', {
      fields: ['created_by_user_id'],
      type: 'foreign key',
      name: 'one_time_shares_created_by_user_id_fkey',
      references: {
        table: 'users',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });
    // Create index on password_id for faster lookups
    await queryInterface.addIndex('one_time_shares', ['password_id'], {
      name: 'one_time_shares_password_id_idx',
      transaction,
    });

    // Create index on created_by_user_id for filtering
    await queryInterface.addIndex('one_time_shares', ['created_by_user_id'], {
      name: 'one_time_shares_created_by_user_id_idx',
      transaction,
    });

    // Create index on expires_at for cleanup queries
    await queryInterface.addIndex('one_time_shares', ['expires_at'], {
      name: 'one_time_shares_expires_at_idx',
      transaction,
    });

    // Create index on is_used for filtering
    await queryInterface.addIndex('one_time_shares', ['is_used'], {
      name: 'one_time_shares_is_used_idx',
      transaction,
    });

    // Create compound index for expired and unused shares cleanup
    await queryInterface.addIndex(
      'one_time_shares',
      ['expires_at', 'is_used'],
      {
        name: 'one_time_shares_expires_at_is_used_idx',
        transaction,
      },
    );
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('one_time_shares', { transaction });
  });
};
