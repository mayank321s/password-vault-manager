import { DataTypes, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      'users',
      'totp_secret',
      {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      { transaction },
    );
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeColumn('users', 'totp_secret', { transaction });
  });
};
