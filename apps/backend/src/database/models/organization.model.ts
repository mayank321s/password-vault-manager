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
  UpdatedAt,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { User } from './user.model';
import { OrganizationMember } from './organization-member.model';
import { OrganizationPolicy } from './organization-policy.model';
import { Vault } from './vault.model';

export const OrganizationType = {
  PERSONAL: 'personal',
  FAMILY: 'family',
  BUSINESS: 'business',
} as const;

export type OrganizationType =
  (typeof OrganizationType)[keyof typeof OrganizationType];

@Table({
  tableName: 'organizations',
  timestamps: true,
  underscored: true,
})
export class Organization extends Model<
  InferAttributes<Organization>,
  InferCreationAttributes<Organization>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @AllowNull(false)
  @Default(OrganizationType.PERSONAL)
  @Index('organizations_organization_type_idx')
  @Column(DataType.ENUM(...Object.values(OrganizationType)))
  declare organizationType: OrganizationType;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('organizations_created_by_user_id_idx')
  @Column(DataType.UUID)
  declare createdByUserId: string;

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

  @BelongsTo(() => User, 'createdByUserId')
  declare createdByUser: CreationOptional<User>;

  @HasMany(() => OrganizationMember, 'organizationId')
  declare members: OrganizationMember[];

  @HasOne(() => OrganizationPolicy, 'organizationId')
  declare policy: CreationOptional<OrganizationPolicy>;

  @HasMany(() => Vault, 'organizationId')
  declare vaults: Vault[];
}

