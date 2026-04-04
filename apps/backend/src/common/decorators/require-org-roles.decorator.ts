import { SetMetadata } from '@nestjs/common';
import { OrganizationMemberRole } from 'src/database/models';

export const ORG_ROLE_REQUIREMENTS_KEY = 'orgRoleRequirements';

export const RequireOrgRoles = (...roles: OrganizationMemberRole[]) =>
  SetMetadata(ORG_ROLE_REQUIREMENTS_KEY, roles);

