import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { Organization } from './organization.model';

@Table({
  tableName: 'organization_policies',
  timestamps: false,
  underscored: true,
})
export class OrganizationPolicy extends Model<
  InferAttributes<OrganizationPolicy>,
  InferCreationAttributes<OrganizationPolicy>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('organization_policies_organization_id_unique_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare requireMfa: CreationOptional<boolean>;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare restrictExternalSharing: CreationOptional<boolean>;

  @AllowNull(false)
  @Default(60)
  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 5,
      max: 1440,
    },
  })
  declare sessionTimeoutMinutes: CreationOptional<number>;

  @AllowNull(false)
  @Default(5)
  @Column({
    type: DataType.INTEGER,
    validate: {
      min: 1,
      max: 50,
    },
  })
  declare maxDevicesPerUser: CreationOptional<number>;

  @AllowNull(false)
  @Default('v1')
  @Column(DataType.STRING(32))
  declare policyVersion: CreationOptional<string>;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  declare updatedAt: Date;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;
}

