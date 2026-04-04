import { useMutation, useQuery } from '@tanstack/react-query';
import { billingKeys } from '../common/constants/query-keys';
import {
  createBillingPortalSession,
  createCheckoutSession,
  getBillingCatalog,
  getEntitlements,
  getInvoices,
  getSubscriptionState,
} from '../services/billing.service';

export function useBillingCatalog() {
  return useQuery({
    queryKey: billingKeys.catalog,
    queryFn: getBillingCatalog,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSubscriptionState() {
  return useQuery({
    queryKey: billingKeys.subscription,
    queryFn: getSubscriptionState,
    retry: false,
  });
}

export function useEntitlements() {
  return useQuery({
    queryKey: billingKeys.entitlements,
    queryFn: getEntitlements,
    retry: false,
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: billingKeys.invoices,
    queryFn: getInvoices,
    retry: false,
  });
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: createCheckoutSession,
  });
}

export function useCreateBillingPortalSession() {
  return useMutation({
    mutationFn: createBillingPortalSession,
  });
}

