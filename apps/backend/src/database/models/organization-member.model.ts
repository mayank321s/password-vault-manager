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
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import sequelize from 'sequelize';
import { Organization } from './organization.model';
import { User } from './user.model';

export const OrganizationMemberRole = {
  OWNER: 'owner',
  ADULT: 'adult',
  CHILD: 'child',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
} as const;

export type OrganizationMemberRole =
  (typeof OrganizationMemberRole)[keyof typeof OrganizationMemberRole];

export const OrganizationMemberStatus = {
  ACTIVE: 'active',
  INVITED: 'invited',
  SUSPENDED: 'suspended',
} as const;

export type OrganizationMemberStatus =
  (typeof OrganizationMemberStatus)[keyof typeof OrganizationMemberStatus];

@Table({
  tableName: 'organization_members',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['organization_id', 'user_id'],
      name: 'organization_members_org_user_unique_idx',
    },
  ],
})
export class OrganizationMember extends Model<
  InferAttributes<OrganizationMember>,
  InferCreationAttributes<OrganizationMember>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('organization_members_org_status_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('organization_members_user_status_idx')
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Default(OrganizationMemberRole.MEMBER)
  @Column(DataType.ENUM(...Object.values(OrganizationMemberRole)))
  declare role: OrganizationMemberRole;

  @AllowNull(false)
  @Default(OrganizationMemberStatus.INVITED)
  @Index('organization_members_org_status_idx')
  @Index('organization_members_user_status_idx')
  @Column(DataType.ENUM(...Object.values(OrganizationMemberStatus)))
  declare status: OrganizationMemberStatus;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'joined_at',
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare joinedAt: CreationOptional<Date>;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'invited_at',
  })
  declare invitedAt: Date | null;

  @AllowNull(true)
  @Column({
    type: DataType.DATE,
    field: 'removed_at',
  })
  declare removedAt: Date | null;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;

  @BelongsTo(() => User, 'userId')
  declare user: CreationOptional<User>;
}

