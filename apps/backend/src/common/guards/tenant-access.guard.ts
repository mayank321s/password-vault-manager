import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  OrganizationMemberRepository,
} from 'src/database/repositories';
import { OrganizationMemberStatus } from 'src/database/models';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

type RequestWithTenant = {
  user?: {
    userId: string;
    organizationId: string | null;
  };
  requestedOrganizationId?: string;
};

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithTenant>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Missing authenticated user context');
    }

    if (!user.organizationId) {
      throw new ForbiddenException('No active organization context available');
    }

    if (
      request.requestedOrganizationId &&
      request.requestedOrganizationId !== user.organizationId
    ) {
      throw new ForbiddenException('Requested organization is not authorized');
    }

    const membership =
      await this.organizationMemberRepository.findOneBy({
        organizationId: user.organizationId,
        userId: user.userId,
        status: OrganizationMemberStatus.ACTIVE,
      });

    if (!membership) {
      throw new ForbiddenException(
        'Active membership in organization is required',
      );
    }

    return true;
  }
}
