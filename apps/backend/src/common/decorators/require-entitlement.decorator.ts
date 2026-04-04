import { SetMetadata } from '@nestjs/common';

export const ENTITLEMENT_REQUIREMENTS_KEY = 'entitlementRequirements';

export type EntitlementFeature = 'externalShares';

export const RequireEntitlement = (feature: EntitlementFeature) =>
  SetMetadata(ENTITLEMENT_REQUIREMENTS_KEY, feature);

