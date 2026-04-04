import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { OrganizationSubscription } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class OrganizationSubscriptionRepository extends BaseRepository<OrganizationSubscription> {
  constructor(
    @InjectModel(OrganizationSubscription) model: typeof OrganizationSubscription,
  ) {
    super(model);
  }

  async upsertByOrganizationId(
    organizationId: string,
    values: Partial<OrganizationSubscription>,
    transaction: Transaction,
  ) {
    const existing = await this.findOneBy({ organizationId });
    if (!existing) {
      return this.create(
        {
          organizationId,
          stripeCustomerId: values.stripeCustomerId!,
          stripeSubscriptionId: values.stripeSubscriptionId!,
          stripePriceId: values.stripePriceId!,
          planType: values.planType!,
          billingInterval: values.billingInterval!,
          lifecycleStatus: values.lifecycleStatus!,
          trialEndsAt: values.trialEndsAt ?? null,
          currentPeriodEndAt: values.currentPeriodEndAt ?? null,
          lastStripeEventId: values.lastStripeEventId ?? null,
        },
        transaction,
      );
    }

    return existing.update(values, { transaction });
  }

  async upsertByStripeSubscriptionId(
    stripeSubscriptionId: string,
    values: Partial<OrganizationSubscription>,
    transaction: Transaction,
  ) {
    const existing = await this.findOneBy({ stripeSubscriptionId });
    if (!existing) {
      return null;
    }
    return existing.update(values, { transaction });
  }
}

