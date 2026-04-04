import { DataTypes, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.createTable(
      'stripe_webhook_events',
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        stripe_event_id: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        event_type: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        livemode: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        payload: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        processed_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      { transaction },
    );

    await queryInterface.addIndex(
      'stripe_webhook_events',
      ['stripe_event_id'],
      {
        unique: true,
        name: 'stripe_webhook_events_stripe_event_id_unique_idx',
        transaction,
      },
    );
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.dropTable('stripe_webhook_events', { transaction });
  });
};

