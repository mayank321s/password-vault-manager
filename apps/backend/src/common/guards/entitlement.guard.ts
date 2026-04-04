import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ENTITLEMENT_REQUIREMENTS_KEY,
  EntitlementFeature,
} from 'src/common/decorators';
import {
  OrganizationMemberRepository,
  OrganizationSubscriptionRepository,
} from 'src/database/repositories';
import { SubscriptionLifecycleStatus } from 'src/database/models';

type RequestWithContext = {
  user?: {
    organizationId: string | null;
  };
};

type Entitlements = {
  features: Record<EntitlementFeature, boolean>;
};

@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationSubscriptionRepository: OrganizationSubscriptionRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<EntitlementFeature>(
      ENTITLEMENT_REQUIREMENTS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!feature) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const organizationId = request.user?.organizationId;
    if (!organizationId) {
      throw new ForbiddenException('Organization context is required');
    }

    const entitlements = await this.getEntitlements(organizationId);
    if (!entitlements.features[feature]) {
      throw new ForbiddenException(
        `Feature "${feature}" is not available for current plan`,
      );
    }

    return true;
  }

  private async getEntitlements(organizationId: string): Promise<Entitlements> {
    const subscription =
      await this.organizationSubscriptionRepository.findOneBy({
        organizationId,
      });
    const activeSeats = await this.organizationMemberRepository.countActiveMembers(
      organizationId,
    );

    if (
      !subscription ||
      subscription.lifecycleStatus === SubscriptionLifecycleStatus.FAILURE ||
      subscription.lifecycleStatus === SubscriptionLifecycleStatus.CANCELED
    ) {
      return {
        features: {
          externalShares: false,
        },
      };
    }

    const maxSeats = subscription.planType === 'family' ? 6 : 100;
    return {
      features: {
        externalShares:
          subscription.planType === 'business' && activeSeats <= maxSeats,
      },
    };
  }
}

