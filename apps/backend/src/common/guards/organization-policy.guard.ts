import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OrganizationPolicyRepository } from 'src/database/repositories';
import {
  ORG_POLICY_REQUIREMENTS_KEY,
  OrgPolicyRequirement,
} from '../decorators/require-org-policy.decorator';

type RequestWithContext = {
  user?: {
    organizationId: string | null;
  };
};

@Injectable()
export class OrganizationPolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationPolicyRepository: OrganizationPolicyRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requirements = this.reflector.getAllAndOverride<OrgPolicyRequirement>(
      ORG_POLICY_REQUIREMENTS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requirements) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const organizationId = request.user?.organizationId;
    if (!organizationId) {
      throw new ForbiddenException('Missing organization context');
    }

    const policy = await this.organizationPolicyRepository.findOneBy({
      organizationId,
    });

    if (!policy) {
      return true;
    }

    if (
      requirements.allowExternalSharing === false &&
      policy.restrictExternalSharing
    ) {
      throw new ForbiddenException(
        'External sharing is restricted by organization policy',
      );
    }

    return true;
  }
}

