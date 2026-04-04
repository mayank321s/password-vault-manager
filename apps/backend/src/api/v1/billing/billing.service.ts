import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingCatalog } from 'src/config/billing.config';
import Stripe from 'stripe';
import { CurrentUserData } from 'src/common/decorators';
import { CreateCheckoutSessionRequestDto } from './dto';

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
}

