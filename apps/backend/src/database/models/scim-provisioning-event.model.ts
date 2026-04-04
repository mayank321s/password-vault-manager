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
import { ScimToken } from './scim-token.model';

export const ScimProvisioningEventStatus = {
  SUCCESS: 'success',
  FAILURE: 'failure',
} as const;

export type ScimProvisioningEventStatus =
  (typeof ScimProvisioningEventStatus)[keyof typeof ScimProvisioningEventStatus];

@Table({
  tableName: 'scim_provisioning_events',
  timestamps: true,
  underscored: true,
})
export class ScimProvisioningEvent extends Model<
  InferAttributes<ScimProvisioningEvent>,
  InferCreationAttributes<ScimProvisioningEvent>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('scim_events_org_created_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(true)
  @ForeignKey(() => ScimToken)
  @Column(DataType.UUID)
  declare scimTokenId: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(64))
  declare action: string;

  @AllowNull(false)
  @Column(DataType.STRING(32))
  declare resourceType: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare resourceId: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(32))
  declare status: ScimProvisioningEventStatus;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare detail: string | null;

  @CreatedAt
  @Index('scim_events_org_created_idx')
  @Column(DataType.DATE)
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;

  @BelongsTo(() => ScimToken, 'scimTokenId')
  declare scimToken: CreationOptional<ScimToken>;
}
