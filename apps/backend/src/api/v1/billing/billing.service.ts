import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingCatalog } from 'src/config/billing.config';
import Stripe from 'stripe';
import { CurrentUserData } from 'src/common/decorators';
import { CreateCheckoutSessionRequestDto } from './dto';
import {
  OrganizationMemberRepository,
  OrganizationSubscriptionRepository,
  StripeWebhookEventRepository,
} from 'src/database/repositories';
import { Sequelize } from 'sequelize-typescript';
import { Transaction, UniqueConstraintError } from 'sequelize';
import {
  SubscriptionBillingInterval,
  SubscriptionLifecycleStatus,
  SubscriptionPlanType,
} from 'src/database/models';

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
    private readonly organizationSubscriptionRepository: OrganizationSubscriptionRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
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

  async getCurrentSubscription(user: CurrentUserData) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization context is required');
    }

    const subscription =
      await this.organizationSubscriptionRepository.findOneBy({
        organizationId: user.organizationId,
      });

    if (!subscription) {
      throw new BadRequestException('No subscription found for organization');
    }

    return {
      organizationId: subscription.organizationId,
      stripeCustomerId: subscription.stripeCustomerId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId,
      planType: subscription.planType,
      billingInterval: subscription.billingInterval,
      lifecycleStatus: subscription.lifecycleStatus,
      trialEndsAt: subscription.trialEndsAt
        ? subscription.trialEndsAt.toISOString()
        : null,
      currentPeriodEndAt: subscription.currentPeriodEndAt
        ? subscription.currentPeriodEndAt.toISOString()
        : null,
      lastStripeEventId: subscription.lastStripeEventId,
    };
  }

  async getEntitlements(user: CurrentUserData) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization context is required');
    }

    const subscription =
      await this.organizationSubscriptionRepository.findOneBy({
        organizationId: user.organizationId,
      });
    if (!subscription) {
      throw new BadRequestException('No subscription found for organization');
    }

    const seatsUsed = await this.organizationMemberRepository.countActiveMembers(
      user.organizationId,
    );
    const maxSeats = subscription.planType === SubscriptionPlanType.FAMILY ? 6 : 100;
    const availableSeats = Math.max(maxSeats - seatsUsed, 0);

    const isPlanUsable =
      subscription.lifecycleStatus !== SubscriptionLifecycleStatus.FAILURE &&
      subscription.lifecycleStatus !== SubscriptionLifecycleStatus.CANCELED;

    return {
      planType: subscription.planType,
      lifecycleStatus: subscription.lifecycleStatus,
      seats: {
        used: seatsUsed,
        max: maxSeats,
        available: availableSeats,
      },
      features: {
        externalShares:
          isPlanUsable && subscription.planType === SubscriptionPlanType.BUSINESS,
      },
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
        await this.processStripeEvent(event, transaction);

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

  private async processStripeEvent(event: Stripe.Event, transaction: Transaction) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.processCheckoutSessionCompleted(event, transaction);
        return;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.processCustomerSubscriptionEvent(event, transaction);
        return;
      case 'invoice.payment_failed':
        await this.processInvoicePaymentFailed(event, transaction);
        return;
      case 'invoice.payment_succeeded':
        await this.processInvoicePaymentSucceeded(event, transaction);
        return;
      default:
        return;
    }
  }

  private async processCheckoutSessionCompleted(
    event: Stripe.Event,
    transaction: Transaction,
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== 'subscription' || !session.subscription) {
      return;
    }

    const organizationId = session.metadata?.organizationId;
    const plan = session.metadata?.plan as SubscriptionPlanType | undefined;
    const interval =
      session.metadata?.interval as SubscriptionBillingInterval | undefined;
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;

    if (
      !organizationId ||
      !plan ||
      !interval ||
      !customerId ||
      !subscriptionId
    ) {
      return;
    }

    const stripeSubscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    await this.organizationSubscriptionRepository.upsertByOrganizationId(
      organizationId,
      {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripePriceId: stripeSubscription.items.data[0]?.price?.id ?? '',
        planType: plan,
        billingInterval: interval,
        lifecycleStatus: this.mapStripeSubscriptionStatus(stripeSubscription.status),
        trialEndsAt: stripeSubscription.trial_end
          ? new Date(stripeSubscription.trial_end * 1000)
          : null,
        currentPeriodEndAt: stripeSubscription.items.data[0]?.current_period_end
          ? new Date(stripeSubscription.items.data[0].current_period_end * 1000)
          : null,
        lastStripeEventId: event.id,
      },
      transaction,
    );
  }

  private async processCustomerSubscriptionEvent(
    event: Stripe.Event,
    transaction: Transaction,
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;

    await this.organizationSubscriptionRepository.upsertByStripeSubscriptionId(
      subscriptionId,
      {
        stripeCustomerId: customerId,
        stripePriceId: subscription.items.data[0]?.price?.id ?? '',
        lifecycleStatus: this.mapStripeSubscriptionStatus(subscription.status),
        trialEndsAt: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        currentPeriodEndAt: subscription.items.data[0]?.current_period_end
          ? new Date(subscription.items.data[0].current_period_end * 1000)
          : null,
        lastStripeEventId: event.id,
      },
      transaction,
    );
  }

  private async processInvoicePaymentFailed(
    event: Stripe.Event,
    transaction: Transaction,
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionParent = invoice.parent?.subscription_details?.subscription;
    const subscriptionId =
      typeof subscriptionParent === 'string'
        ? subscriptionParent
        : subscriptionParent?.id;
    if (!subscriptionId) {
      return;
    }

    await this.organizationSubscriptionRepository.upsertByStripeSubscriptionId(
      subscriptionId,
      {
        lifecycleStatus: SubscriptionLifecycleStatus.FAILURE,
        lastStripeEventId: event.id,
      },
      transaction,
    );
  }

  private async processInvoicePaymentSucceeded(
    event: Stripe.Event,
    transaction: Transaction,
  ) {
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionParent = invoice.parent?.subscription_details?.subscription;
    const subscriptionId =
      typeof subscriptionParent === 'string'
        ? subscriptionParent
        : subscriptionParent?.id;
    if (!subscriptionId) {
      return;
    }

    await this.organizationSubscriptionRepository.upsertByStripeSubscriptionId(
      subscriptionId,
      {
        lifecycleStatus: SubscriptionLifecycleStatus.ACTIVE,
        lastStripeEventId: event.id,
      },
      transaction,
    );
  }

  private mapStripeSubscriptionStatus(
    status: Stripe.Subscription.Status,
  ): (typeof SubscriptionLifecycleStatus)[keyof typeof SubscriptionLifecycleStatus] {
    switch (status) {
      case 'trialing':
        return SubscriptionLifecycleStatus.TRIAL;
      case 'active':
        return SubscriptionLifecycleStatus.ACTIVE;
      case 'past_due':
      case 'unpaid':
      case 'paused':
        return SubscriptionLifecycleStatus.GRACE;
      case 'incomplete':
      case 'incomplete_expired':
        return SubscriptionLifecycleStatus.FAILURE;
      case 'canceled':
        return SubscriptionLifecycleStatus.CANCELED;
      default:
        return SubscriptionLifecycleStatus.ACTIVE;
    }
  }
}

