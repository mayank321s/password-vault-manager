import { QueryInterface } from 'sequelize';

type MigrationContext = {
  context: QueryInterface;
};

export const up = async ({ context: queryInterface }: MigrationContext) => {
  return queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
      INSERT INTO organizations (
        name,
        organization_type,
        created_by_user_id,
        created_at,
        updated_at
      )
      SELECT
        CONCAT(COALESCE(NULLIF(u.username, ''), SPLIT_PART(u.email, '@', 1)), '''s Personal Organization'),
        'personal',
        u.id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM users u
      LEFT JOIN organizations o
        ON o.created_by_user_id = u.id
        AND o.organization_type = 'personal'
      WHERE o.id IS NULL
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
      INSERT INTO organization_members (
        organization_id,
        user_id,
        role,
        status,
        joined_at,
        invited_at
      )
      SELECT
        o.id,
        u.id,
        'owner',
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      FROM users u
      INNER JOIN organizations o
        ON o.created_by_user_id = u.id
        AND o.organization_type = 'personal'
      LEFT JOIN organization_members om
        ON om.organization_id = o.id
        AND om.user_id = u.id
      WHERE om.id IS NULL
      `,
      { transaction },
    );

    await queryInterface.sequelize.query(
      `
      UPDATE vaults v
      SET
        organization_id = o.id,
        updated_at = CURRENT_TIMESTAMP
      FROM organizations o
      WHERE v.organization_id IS NULL
        AND o.created_by_user_id = v.owner_user_id
        AND o.organization_type = 'personal'
      `,
      { transaction },
    );
  });
};

export const down = async ({ context: queryInterface }: MigrationContext) => {
  void queryInterface;
  throw new Error(
    'Down migration is intentionally disabled to avoid destructive rollback of tenant-mapped data.',
  );
};
