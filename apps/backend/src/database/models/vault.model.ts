import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
  Index,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Organization } from './organization.model';
import { Password } from './password.model';
import { VaultMember } from './vault-member.model';
import { InferAttributes } from 'sequelize';

type RequiredColumns = Pick<Vault, 'name' | 'ownerUserId'>;
type OptionalColumns = Partial<Pick<Vault, 'isPersonalVault' | 'organizationId'>>;

type VaultCreationAttributes = RequiredColumns & OptionalColumns;

@Table({
  tableName: 'vaults',
  timestamps: true,
  underscored: true,
})
export class Vault extends Model<
  InferAttributes<Vault>,
  VaultCreationAttributes
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @AllowNull(false)
  @Default(false)
  @Index('vaults_is_personal_vault_idx')
  @Column({
    type: DataType.BOOLEAN,
    comment: "True if this is a user's personal vault",
  })
  declare isPersonalVault: boolean;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('vaults_owner_user_id_idx')
  @Column(DataType.UUID)
  declare ownerUserId: string;

  @AllowNull(true)
  @ForeignKey(() => Organization)
  @Index('vaults_organization_id_idx')
  @Column(DataType.UUID)
  declare organizationId: string | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  declare updatedAt: Date;

  // Associations
  @BelongsTo(() => User, 'ownerUserId')
  declare owner: User;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: Organization | null;

  @HasMany(() => VaultMember, 'vaultId')
  declare members: VaultMember[];

  @HasMany(() => Password, 'vaultId')
  declare passwords: Password[];
}
