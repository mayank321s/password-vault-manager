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
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { Organization } from './organization.model';
import { SsoVerifiedDomain } from './sso-verified-domain.model';

export const SsoProvider = {
  ENTRA_OIDC: 'entra_oidc',
} as const;

export type SsoProvider = (typeof SsoProvider)[keyof typeof SsoProvider];

@Table({
  tableName: 'sso_configurations',
  timestamps: true,
  underscored: true,
})
export class SsoConfiguration extends Model<
  InferAttributes<SsoConfiguration>,
  InferCreationAttributes<SsoConfiguration>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('sso_configurations_organization_id_unique_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(false)
  @Default(SsoProvider.ENTRA_OIDC)
  @Column(DataType.ENUM(...Object.values(SsoProvider)))
  declare provider: SsoProvider;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare tenantId: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare clientId: string;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare clientSecretRef: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare redirectUri: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare issuer: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare authorizationEndpoint: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare tokenEndpoint: string;

  @AllowNull(false)
  @Default('openid profile email')
  @Column(DataType.STRING(500))
  declare scopes: CreationOptional<string>;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: CreationOptional<boolean>;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;

  @HasMany(() => SsoVerifiedDomain, 'ssoConfigurationId')
  declare domains: CreationOptional<SsoVerifiedDomain[]>;
}
