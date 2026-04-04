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

export const SubscriptionPlanType = {
  FAMILY: 'family',
  BUSINESS: 'business',
} as const;

export type SubscriptionPlanType =
  (typeof SubscriptionPlanType)[keyof typeof SubscriptionPlanType];

export const SubscriptionBillingInterval = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export type SubscriptionBillingInterval =
  (typeof SubscriptionBillingInterval)[keyof typeof SubscriptionBillingInterval];

export const SubscriptionLifecycleStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  GRACE: 'grace',
  FAILURE: 'failure',
  CANCELED: 'canceled',
} as const;

export type SubscriptionLifecycleStatus =
  (typeof SubscriptionLifecycleStatus)[keyof typeof SubscriptionLifecycleStatus];

@Table({
  tableName: 'organization_subscriptions',
  timestamps: false,
  underscored: true,
})
export class OrganizationSubscription extends Model<
  InferAttributes<OrganizationSubscription>,
  InferCreationAttributes<OrganizationSubscription>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @AllowNull(false)
  @ForeignKey(() => Organization)
  @Index('organization_subscriptions_organization_id_unique_idx')
  @Column(DataType.UUID)
  declare organizationId: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare stripeCustomerId: string;

  @AllowNull(false)
  @Index('organization_subscriptions_subscription_id_unique_idx')
  @Column(DataType.STRING(255))
  declare stripeSubscriptionId: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare stripePriceId: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(SubscriptionPlanType)))
  declare planType: SubscriptionPlanType;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(SubscriptionBillingInterval)))
  declare billingInterval: SubscriptionBillingInterval;

  @AllowNull(false)
  @Default(SubscriptionLifecycleStatus.ACTIVE)
  @Column(DataType.ENUM(...Object.values(SubscriptionLifecycleStatus)))
  declare lifecycleStatus: CreationOptional<SubscriptionLifecycleStatus>;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare trialEndsAt: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare currentPeriodEndAt: Date | null;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare lastStripeEventId: string | null;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updated_at',
  })
  declare updatedAt: Date;

  @BelongsTo(() => Organization, 'organizationId')
  declare organization: CreationOptional<Organization>;
}

