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

@Table({
  tableName: 'scim_tokens',
  timestamps: true,
  underscored: true,
})
export class ScimToken extends Model<
  InferAttributes<ScimToken>,
  InferCreationAttributes<ScimToken>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('scim_tokens_org_revoked_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare label: string;

  @AllowNull(false)
  @Column(DataType.STRING(16))
  declare tokenPrefix: string;

  @AllowNull(false)
  @Column(DataType.STRING(64))
  declare tokenHash: string;

  @AllowNull(true)
  @Index('scim_tokens_org_revoked_idx')
  @Column(DataType.DATE)
  declare revokedAt: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare lastUsedAt: Date | null;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: CreationOptional<Date>;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: CreationOptional<Date>;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;
}
