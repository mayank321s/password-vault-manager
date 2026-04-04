import { DataTypes, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'organization_subscriptions',
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
        stripe_customer_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        stripe_subscription_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        stripe_price_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        plan_type: {
          type: DataTypes.ENUM('family', 'business'),
          allowNull: false,
        },
        billing_interval: {
          type: DataTypes.ENUM('monthly', 'yearly'),
          allowNull: false,
        },
        lifecycle_status: {
          type: DataTypes.ENUM('trial', 'active', 'grace', 'failure', 'canceled'),
          allowNull: false,
          defaultValue: 'active',
        },
        trial_ends_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        current_period_end_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        last_stripe_event_id: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction },
    );

    await queryInterface.addConstraint('organization_subscriptions', {
      fields: ['organization_id'],
      type: 'foreign key',
      name: 'organization_subscriptions_organization_id_fkey',
      references: {
        table: 'organizations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      transaction,
    });

    await queryInterface.addIndex(
      'organization_subscriptions',
      ['organization_id'],
      {
        unique: true,
        name: 'organization_subscriptions_organization_id_unique_idx',
        transaction,
      },
    );

    await queryInterface.addIndex(
      'organization_subscriptions',
      ['stripe_subscription_id'],
      {
        unique: true,
        name: 'organization_subscriptions_subscription_id_unique_idx',
        transaction,
      },
    );
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('organization_subscriptions', { transaction });
  });
};

