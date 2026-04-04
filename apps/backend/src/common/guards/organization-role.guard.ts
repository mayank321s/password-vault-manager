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
} from 'src/database/models';
import { OrganizationMemberRepository } from 'src/database/repositories';
import { ORG_ROLE_REQUIREMENTS_KEY } from '../decorators/require-org-roles.decorator';

type RequestWithContext = {
  user?: {
    userId: string;
    organizationId: string | null;
  };
};

@Injectable()
export class OrganizationRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<OrganizationMemberRole[]>(
        ORG_ROLE_REQUIREMENTS_KEY,
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

    const membership = await this.organizationMemberRepository.findOneBy({
      organizationId: user.organizationId,
      userId: user.userId,
      status: OrganizationMemberStatus.ACTIVE,
    });

    if (!membership) {
      throw new ForbiddenException('Active organization membership required');
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient organization role');
    }

    return true;
  }
}

