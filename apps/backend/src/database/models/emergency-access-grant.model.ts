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
  UpdatedAt,
} from 'sequelize-typescript';
import { Organization } from './organization.model';
import { User } from './user.model';

export const EmergencyAccessGrantStatus = {
  PENDING_ACCEPTANCE: 'pending_acceptance',
  ACTIVE: 'active',
  REVOKED: 'revoked',
  DECLINED: 'declined',
} as const;

export type EmergencyAccessGrantStatus =
  (typeof EmergencyAccessGrantStatus)[keyof typeof EmergencyAccessGrantStatus];

@Table({
  tableName: 'emergency_access_grants',
  timestamps: true,
  underscored: true,
})
export class EmergencyAccessGrant extends Model<
  InferAttributes<EmergencyAccessGrant>,
  InferCreationAttributes<EmergencyAccessGrant>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('emergency_access_grants_organization_id_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('emergency_access_grants_grantor_user_id_idx')
  @Column(DataType.UUID)
  declare grantorUserId: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Index('emergency_access_grants_grantee_user_id_idx')
  @Column(DataType.UUID)
  declare granteeUserId: string;

  @AllowNull(false)
  @Default(EmergencyAccessGrantStatus.PENDING_ACCEPTANCE)
  @Column(DataType.ENUM(...Object.values(EmergencyAccessGrantStatus)))
  declare status: EmergencyAccessGrantStatus;

  @AllowNull(false)
  @Default(72)
  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 24,
      max: 24 * 30,
    },
  })
  declare recoveryDelayHours: CreationOptional<number>;

  @AllowNull(true)
  @Column(DataType.STRING(500))
  declare note: string | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare acceptedAt: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare revokedAt: Date | null;

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare revokedByUserId: string | null;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;

  @BelongsTo(() => User, 'grantorUserId')
  declare grantor: CreationOptional<User>;

  @BelongsTo(() => User, 'granteeUserId')
  declare grantee: CreationOptional<User>;

  @BelongsTo(() => User, 'revokedByUserId')
  declare revokedBy: CreationOptional<User>;
}
