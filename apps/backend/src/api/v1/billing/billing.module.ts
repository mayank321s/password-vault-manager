import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import {
  OrganizationMember,
  OrganizationSubscription,
  StripeWebhookEvent,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationSubscriptionRepository,
  StripeWebhookEventRepository,
} from 'src/database/repositories';

@Module({
  imports: [
    SequelizeModule.forFeature([
      StripeWebhookEvent,
      OrganizationSubscription,
      OrganizationMember,
    ]),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    StripeWebhookEventRepository,
    OrganizationSubscriptionRepository,
    OrganizationMemberRepository,
  ],
  exports: [BillingService],
})
export class BillingModule {}

