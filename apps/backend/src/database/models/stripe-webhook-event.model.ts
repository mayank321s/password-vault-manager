import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Default,
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

@Table({
  tableName: 'stripe_webhook_events',
  timestamps: false,
  underscored: true,
})
export class StripeWebhookEvent extends Model<
  InferAttributes<StripeWebhookEvent>,
  InferCreationAttributes<StripeWebhookEvent>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @Index('stripe_webhook_events_stripe_event_id_unique_idx')
  @Column({
    type: DataType.STRING(255),
    unique: true,
  })
  declare stripeEventId: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare eventType: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare livemode: CreationOptional<boolean>;

  @AllowNull(false)
  @Column(DataType.JSONB)
  declare payload: Record<string, unknown>;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'processed_at',
  })
  declare processedAt: CreationOptional<Date>;
}

