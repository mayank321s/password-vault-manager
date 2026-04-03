import { DataTypes, QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.addColumn(
      'users',
      'registration_completed_at',
      {
        type: DataTypes.DATE,
        allowNull: true,
        comment:
          'Timestamp when the user completed their initial registration (TOTP verified)',
      },
      { transaction },
    );

    await queryInterface.addColumn(
      'users',
      'registration_jti',
      {
        type: DataTypes.STRING(36),
        allowNull: true,
        comment:
          'JTI of the pending registration or TOTP-enrollment token; cleared on completion',
      },
      { transaction },
    );

    await queryInterface.addColumn(
      'users',
      'totp_registration_attempts',
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment:
          'Number of failed TOTP attempts during registration or post-recovery re-enrollment',
      },
      { transaction },
    );

    await queryInterface.addColumn(
      'users',
      'totp_registration_locked_until',
      {
        type: DataTypes.DATE,
        allowNull: true,
        comment:
          'Account locked for registration TOTP attempts until this timestamp',
      },
      { transaction },
    );
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.removeColumn(
      'users',
      'totp_registration_locked_until',
      { transaction },
    );
    await queryInterface.removeColumn('users', 'totp_registration_attempts', {
      transaction,
    });
    await queryInterface.removeColumn('users', 'registration_jti', {
      transaction,
    });
    await queryInterface.removeColumn('users', 'registration_completed_at', {
      transaction,
    });
  });
};
