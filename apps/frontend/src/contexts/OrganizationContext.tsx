import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient } from '../lib/api-client';
import { getSessionData, saveSessionData } from '../lib/storage';

type OrganizationType = 'personal' | 'family' | 'business' | null;

interface OrganizationContextValue {
  activeOrganizationId: string | null;
  activeOrganizationType: OrganizationType;
  organizationIds: string[];
  isReady: boolean;
  setActiveOrganizationId: (organizationId: string) => Promise<void>;
  registerOrganization: (
    organizationId: string,
    organizationType: Exclude<OrganizationType, null>,
  ) => Promise<void>;
}

interface OrganizationProviderProps {
  children: ReactNode;
}

interface JwtClaims {
  organizationId?: string | null;
  organizationType?: OrganizationType;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(
  undefined,
);

function parseJwtClaims(token: string): JwtClaims {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return {};
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload =
      normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4)) % 4);
    const decoded = JSON.parse(atob(paddedPayload)) as JwtClaims;
    return decoded;
  } catch {
    return {};
  }
}

function parseOrganizationIds(csv: string | null): string[] {
  if (!csv) {
    return [];
  }
  return csv
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<
    string | null
  >(null);
  const [activeOrganizationType, setActiveOrganizationType] =
    useState<OrganizationType>(null);
  const [organizationIds, setOrganizationIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const [storedActiveOrganizationId, storedOrganizationType, storedToken] =
        await Promise.all([
          getSessionData('active_organization_id'),
          getSessionData('active_organization_type'),
          getSessionData('jwt_token'),
        ]);

      const claims = storedToken ? parseJwtClaims(storedToken) : {};
      const resolvedOrganizationId =
        storedActiveOrganizationId || claims.organizationId || null;
      const resolvedOrganizationType =
        (storedOrganizationType as OrganizationType) ||
        claims.organizationType ||
        null;

      const csv = await getSessionData('organization_ids');
      const resolvedOrganizationIds = parseOrganizationIds(csv);
      if (
        resolvedOrganizationId &&
        !resolvedOrganizationIds.includes(resolvedOrganizationId)
      ) {
        resolvedOrganizationIds.unshift(resolvedOrganizationId);
      }

      if (!mounted) {
        return;
      }

      setActiveOrganizationIdState(resolvedOrganizationId);
      setActiveOrganizationType(resolvedOrganizationType);
      setOrganizationIds(resolvedOrganizationIds);
      apiClient.setOrganizationId(resolvedOrganizationId);
      setIsReady(true);
    };

    void initialize();
    return () => {
      mounted = false;
    };
  }, []);

  const setActiveOrganizationId = useCallback(
    async (organizationId: string) => {
      if (!organizationIds.includes(organizationId)) {
        throw new Error('Organization is not available in current context');
      }

      await saveSessionData('active_organization_id', organizationId);
      setActiveOrganizationIdState(organizationId);
      apiClient.setOrganizationId(organizationId);
    },
    [organizationIds],
  );

  const registerOrganization = useCallback(
    async (
      organizationId: string,
      organizationType: Exclude<OrganizationType, null>,
    ) => {
      const nextOrganizationIds = organizationIds.includes(organizationId)
        ? organizationIds
        : [organizationId, ...organizationIds];

      await Promise.all([
        saveSessionData('organization_ids', nextOrganizationIds.join(',')),
        saveSessionData('active_organization_id', organizationId),
        saveSessionData('active_organization_type', organizationType),
      ]);

      setOrganizationIds(nextOrganizationIds);
      setActiveOrganizationIdState(organizationId);
      setActiveOrganizationType(organizationType);
      apiClient.setOrganizationId(organizationId);
    },
    [organizationIds],
  );

  const value = useMemo<OrganizationContextValue>(
    () => ({
      activeOrganizationId,
      activeOrganizationType,
      organizationIds,
      isReady,
      setActiveOrganizationId,
      registerOrganization,
    }),
    [
      activeOrganizationId,
      activeOrganizationType,
      organizationIds,
      isReady,
      setActiveOrganizationId,
      registerOrganization,
    ],
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      'useOrganizationContext must be used within an OrganizationProvider',
    );
  }
  return context;
}
