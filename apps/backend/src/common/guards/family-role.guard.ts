import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
} from 'src/database/repositories';
import { FAMILY_ROLE_REQUIREMENTS_KEY } from '../decorators/require-family-roles.decorator';

type RequestWithContext = {
  user?: {
    userId: string;
    organizationId: string | null;
  };
};

@Injectable()
export class FamilyRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<OrganizationMemberRole[]>(
        FAMILY_ROLE_REQUIREMENTS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const user = request.user;
    if (!user?.userId || !user.organizationId) {
      throw new ForbiddenException('Missing organization context');
    }

    const organization = await this.organizationRepository.findById(
      user.organizationId,
    );
    if (!organization) {
      throw new ForbiddenException('Organization not found');
    }

    if (organization.organizationType !== OrganizationType.FAMILY) {
      return true;
    }

    const membership = await this.organizationMemberRepository.findOneBy({
      organizationId: user.organizationId,
      userId: user.userId,
      status: OrganizationMemberStatus.ACTIVE,
    });
    if (!membership) {
      throw new ForbiddenException('Active family membership required');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient family role');
    }

    return true;
  }
}
