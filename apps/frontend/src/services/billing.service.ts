import { API_V1_ROUTES } from '../common/constants/api-routes';
import { apiClient } from '../lib/api-client';

export type BillingCatalog = {
  family: {
    productId: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
  };
  business: {
    productId: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
  };
};

export type CheckoutSessionRequest = {
  plan: 'family' | 'business';
  interval: 'monthly' | 'yearly';
};

export type CheckoutSessionResponse = {
  checkoutSessionId: string;
  checkoutUrl: string;
  priceId: string;
  plan: 'family' | 'business';
  interval: 'monthly' | 'yearly';
};

export type SubscriptionState = {
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planType: 'family' | 'business';
  billingInterval: 'monthly' | 'yearly';
  lifecycleStatus: 'trial' | 'active' | 'grace' | 'failure' | 'canceled';
  trialEndsAt: string | null;
  currentPeriodEndAt: string | null;
  lastStripeEventId: string | null;
};

export type EntitlementSummary = {
  planType: 'family' | 'business';
  lifecycleStatus: 'trial' | 'active' | 'grace' | 'failure' | 'canceled';
  seats: {
    used: number;
    max: number;
    available: number;
  };
  seatPolicy: {
    softWarningThreshold: number | null;
    hardLimit: number;
    warningState: 'healthy' | 'warning' | 'full';
  };
  features: {
    externalShares: boolean;
  };
  addOns: {
    ssoPackAvailable: boolean;
    scimPackAvailable: boolean;
    auditExportPackAvailable: boolean;
    siemConnectorPackAvailable: boolean;
  };
};

export type InvoiceListResponse = {
  invoices: Array<{
    invoiceId: string;
    number: string | null;
    status: string | null;
    amountDue: number;
    amountPaid: number;
    currency: string;
    hostedInvoiceUrl: string | null;
    createdAt: string;
  }>;
};

export type BillingPortalResponse = {
  url: string;
};

export async function getBillingCatalog(): Promise<BillingCatalog> {
  const response = await apiClient.get<BillingCatalog>(API_V1_ROUTES.billing.catalog);
  return response.data;
}

export async function createCheckoutSession(
  payload: CheckoutSessionRequest,
): Promise<CheckoutSessionResponse> {
  const response = await apiClient.post<CheckoutSessionResponse>(
    API_V1_ROUTES.billing.checkoutSession,
    payload,
  );
  return response.data;
}

export async function getSubscriptionState(): Promise<SubscriptionState> {
  const response = await apiClient.get<SubscriptionState>(
    API_V1_ROUTES.billing.subscription,
  );
  return response.data;
}

export async function getEntitlements(): Promise<EntitlementSummary> {
  const response = await apiClient.get<EntitlementSummary>(
    API_V1_ROUTES.billing.entitlements,
  );
  return response.data;
}

export async function getInvoices(): Promise<InvoiceListResponse> {
  const response = await apiClient.get<InvoiceListResponse>(
    API_V1_ROUTES.billing.invoices,
  );
  return response.data;
}

export async function createBillingPortalSession(): Promise<BillingPortalResponse> {
  const response = await apiClient.post<BillingPortalResponse>(
    API_V1_ROUTES.billing.portalSession,
  );
  return response.data;
}

