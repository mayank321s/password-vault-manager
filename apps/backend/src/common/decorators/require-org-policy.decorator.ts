import { SetMetadata } from '@nestjs/common';

export const ORG_POLICY_REQUIREMENTS_KEY = 'orgPolicyRequirements';

export type OrgPolicyRequirement = {
  allowExternalSharing?: boolean;
};

export const RequireOrgPolicy = (requirements: OrgPolicyRequirement) =>
  SetMetadata(ORG_POLICY_REQUIREMENTS_KEY, requirements);

