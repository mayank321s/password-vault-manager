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
import { Organization } from './organization.model';
import { User } from './user.model';

@Table({
  tableName: 'audit_events',
  timestamps: false,
  underscored: true,
})
export class AuditEvent extends Model<
  InferAttributes<AuditEvent>,
  InferCreationAttributes<AuditEvent>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('audit_events_org_created_at_idx')
  @Index('audit_events_org_action_idx')
  @Index('audit_events_org_actor_idx')
  @Index('audit_events_org_target_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare actorUserId: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare actorEmail: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare action: string;

  @AllowNull(false)
  @Column(DataType.STRING(80))
  declare targetType: string;

  @AllowNull(true)
  @Column(DataType.STRING(120))
  declare targetId: string | null;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare targetLabel: string | null;

  @AllowNull(true)
  @Column(DataType.JSON)
  declare metadata: Record<string, unknown> | null;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'created_at',
  })
  declare createdAt: CreationOptional<Date>;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;

  @BelongsTo(() => User, 'actorUserId')
  declare actorUser: CreationOptional<User | null>;
}
