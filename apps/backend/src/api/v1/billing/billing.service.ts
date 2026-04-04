import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingCatalog } from 'src/config/billing.config';
import Stripe from 'stripe';
import { CurrentUserData } from 'src/common/decorators';
import { CreateCheckoutSessionRequestDto } from './dto';
import { StripeWebhookEventRepository } from 'src/database/repositories';
import { Sequelize } from 'sequelize-typescript';
import { UniqueConstraintError } from 'sequelize';

type BillingConfig = {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  catalog: BillingCatalog;
};
type AppConfig = {
  FRONTEND_URL: string;
};

@Injectable()
export class BillingService {
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly stripeWebhookEventRepository: StripeWebhookEventRepository,
    private readonly sequelize: Sequelize,
  ) {
    const billing = this.configService.get<BillingConfig>('billing');
    if (!billing) {
      throw new Error('Missing billing configuration');
    }

    this.stripe = new Stripe(billing.stripeSecretKey);
  }

  getCatalog() {
    const billing = this.configService.get<BillingConfig>('billing');

    return {
      family: billing.catalog.family,
      business: billing.catalog.business,
    };
  }

  async createCheckoutSession(
    payload: CreateCheckoutSessionRequestDto,
    user: CurrentUserData,
  ) {
    if (!user.organizationId) {
      throw new BadRequestException(
        'Organization context is required to create checkout session',
      );
    }

    const billing = this.configService.get<BillingConfig>('billing');
    const appConfig = this.configService.get<AppConfig>('app');
    if (!billing || !appConfig) {
      throw new BadRequestException('Billing configuration is incomplete');
    }
    const planCatalog =
      payload.plan === 'family' ? billing.catalog.family : billing.catalog.business;
    const priceId =
      payload.interval === 'monthly'
        ? planCatalog.monthlyPriceId
        : planCatalog.yearlyPriceId;

    const checkoutSession = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${appConfig.FRONTEND_URL}/settings/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appConfig.FRONTEND_URL}/settings/billing/cancelled`,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        organizationId: user.organizationId,
        userId: user.userId,
        plan: payload.plan,
        interval: payload.interval,
      },
    });

    if (!checkoutSession.url) {
      throw new BadRequestException('Stripe did not return a checkout URL');
    }

    return {
      checkoutSessionId: checkoutSession.id,
      checkoutUrl: checkoutSession.url,
      priceId,
      plan: payload.plan,
      interval: payload.interval,
    };
  }

  async handleWebhook(rawBody: Buffer | undefined, stripeSignature?: string) {
    if (!stripeSignature || !rawBody) {
      throw new BadRequestException('Missing Stripe signature or raw payload');
    }

    const billing = this.configService.get<BillingConfig>('billing');
    if (!billing) {
      throw new BadRequestException('Billing configuration is incomplete');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        billing.stripeWebhookSecret,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    const alreadyProcessed = await this.stripeWebhookEventRepository.findOneBy({
      stripeEventId: event.id,
    });
    if (alreadyProcessed) {
      return { received: true, duplicate: true };
    }

    try {
      await this.sequelize.transaction(async (transaction) => {
        await this.stripeWebhookEventRepository.create(
          {
            stripeEventId: event.id,
            eventType: event.type,
            livemode: event.livemode,
            payload: event as unknown as Record<string, unknown>,
          },
          transaction,
        );
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return { received: true, duplicate: true };
      }
      throw error;
    }

    return { received: true, duplicate: false };
  }
}

