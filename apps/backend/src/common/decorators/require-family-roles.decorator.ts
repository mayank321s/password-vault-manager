import { SetMetadata } from '@nestjs/common';
import { OrganizationMemberRole } from 'src/database/models';

export const FAMILY_ROLE_REQUIREMENTS_KEY = 'familyRoleRequirements';

export const RequireFamilyRoles = (...roles: OrganizationMemberRole[]) =>
  SetMetadata(FAMILY_ROLE_REQUIREMENTS_KEY, roles);
