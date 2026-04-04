import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { OrganizationSubscription, StripeWebhookEvent } from 'src/database/models';
import {
  OrganizationSubscriptionRepository,
  StripeWebhookEventRepository,
} from 'src/database/repositories';

@Module({
  imports: [SequelizeModule.forFeature([StripeWebhookEvent, OrganizationSubscription])],
  controllers: [BillingController],
  providers: [
    BillingService,
    StripeWebhookEventRepository,
    OrganizationSubscriptionRepository,
  ],
  exports: [BillingService],
})
export class BillingModule {}

