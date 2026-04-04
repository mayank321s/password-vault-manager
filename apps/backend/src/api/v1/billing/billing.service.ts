import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingCatalog } from 'src/config/billing.config';

type BillingConfig = {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  catalog: BillingCatalog;
};

@Injectable()
export class BillingService {
  constructor(private readonly configService: ConfigService) {}

  getCatalog() {
    const billing = this.configService.get<BillingConfig>('billing');

    return {
      family: billing.catalog.family,
      business: billing.catalog.business,
    };
  }
}

