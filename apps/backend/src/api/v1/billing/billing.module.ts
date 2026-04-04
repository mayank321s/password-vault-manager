import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { StripeWebhookEvent } from 'src/database/models';
import { StripeWebhookEventRepository } from 'src/database/repositories';

@Module({
  imports: [SequelizeModule.forFeature([StripeWebhookEvent])],
  controllers: [BillingController],
  providers: [BillingService, StripeWebhookEventRepository],
  exports: [BillingService],
})
export class BillingModule {}

