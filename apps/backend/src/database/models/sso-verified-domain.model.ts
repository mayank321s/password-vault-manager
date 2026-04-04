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
import { SsoConfiguration } from './sso-configuration.model';

@Table({
  tableName: 'sso_verified_domains',
  timestamps: true,
  underscored: true,
})
export class SsoVerifiedDomain extends Model<
  InferAttributes<SsoVerifiedDomain>,
  InferCreationAttributes<SsoVerifiedDomain>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => SsoConfiguration)
  @Index('sso_verified_domains_config_org_idx')
  @Column(DataType.UUID)
  declare ssoConfigurationId: string;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('sso_verified_domains_config_org_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(false)
  @Index('sso_verified_domains_domain_unique_idx')
  @Column(DataType.STRING(255))
  declare domain: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare verificationToken: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare verifiedAt: Date | null;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isPrimary: CreationOptional<boolean>;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => SsoConfiguration, 'ssoConfigurationId')
  declare ssoConfiguration: CreationOptional<SsoConfiguration>;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;
}
