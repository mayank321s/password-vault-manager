import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { StripeWebhookEvent } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class StripeWebhookEventRepository extends BaseRepository<StripeWebhookEvent> {
  constructor(
    @InjectModel(StripeWebhookEvent)
    stripeWebhookEventModel: typeof StripeWebhookEvent,
  ) {
    super(stripeWebhookEventModel);
  }
}

