import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Vault } from './vault.model';
import sequelize from 'sequelize';

export const VaultMemberRole = {
  OWNER: 'owner',
  MANAGER: 'manager',
  TEAM_MEMBER: 'team_member',
} as const;
export type VaultMemberRole =
  (typeof VaultMemberRole)[keyof typeof VaultMemberRole];

@Table({
  tableName: 'vault_members',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['vault_id', 'user_id'],
      name: 'vault_members_vault_user_unique_idx',
    },
  ],
})
export class VaultMember extends Model<
  InferAttributes<VaultMember>,
  InferCreationAttributes<VaultMember>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Vault)
  @Index('vault_members_vault_id_idx')
  @Column(DataType.UUID)
  declare vaultId: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('vault_members_user_id_idx')
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Default(VaultMemberRole.TEAM_MEMBER)
  @Column(DataType.ENUM(...Object.values(VaultMemberRole)))
  declare userRole: VaultMemberRole;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    comment: "Vault key encrypted with user's public key",
  })
  declare vaultEncryptedKey: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'joined_at',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare joinedAt: CreationOptional<Date>;

  // Associations
  @BelongsTo(() => Vault, 'vaultId')
  declare vault: CreationOptional<Vault>;

  @BelongsTo(() => User, 'userId')
  declare user: CreationOptional<User>;
}
