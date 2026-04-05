import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CurrentUserData } from 'src/common/decorators';
import { AuditService } from 'src/common/services/audit.service';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationPolicyRepository,
  OrganizationRepository,
} from 'src/database/repositories';
import {
  OrganizationPolicyResponseDto,
  UpsertOrganizationPolicyRequestDto,
} from './dto';

@Injectable()
export class PoliciesService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly organizationPolicyRepository: OrganizationPolicyRepository,
    private readonly auditService: AuditService,
  ) {}

  async getCurrentPolicy(
    user: CurrentUserData,
  ): Promise<OrganizationPolicyResponseDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(user);
    const policy = await this.organizationPolicyRepository.findOneBy({
      organizationId,
    });

    if (!policy) {
      return this.buildDefaultResponse(organizationId);
    }

    return this.toResponse(policy);
  }

  async upsertPolicy(
    user: CurrentUserData,
    payload: UpsertOrganizationPolicyRequestDto,
  ): Promise<OrganizationPolicyResponseDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(user);
    const existingPolicy = await this.organizationPolicyRepository.findOneBy({
      organizationId,
    });

    const policy = existingPolicy
      ? await existingPolicy.update({
          requireMfa: payload.requireMfa,
          restrictExternalSharing: payload.restrictExternalSharing,
          sessionTimeoutMinutes: payload.sessionTimeoutMinutes,
          maxDevicesPerUser: payload.maxDevicesPerUser,
          policyVersion: 'v1',
        })
      : await this.organizationPolicyRepository.create({
          organizationId,
          requireMfa: payload.requireMfa,
          restrictExternalSharing: payload.restrictExternalSharing,
          sessionTimeoutMinutes: payload.sessionTimeoutMinutes,
          maxDevicesPerUser: payload.maxDevicesPerUser,
          policyVersion: 'v1',
        });

    const response = this.toResponse(policy);

    await this.auditService.recordFromUser(user, {
      action: 'organization_policy.updated',
      targetType: 'organization_policy',
      targetId: organizationId,
      targetLabel: 'Organization policy',
      metadata: {
        requireMfa: response.requireMfa,
        restrictExternalSharing: response.restrictExternalSharing,
        sessionTimeoutMinutes: response.sessionTimeoutMinutes,
        maxDevicesPerUser: response.maxDevicesPerUser,
      },
    });

    return response;
  }

  private async requireBusinessOrganizationAdmin(user: CurrentUserData) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization context is required');
    }

    const [organization, membership] = await Promise.all([
      this.organizationRepository.findById(user.organizationId),
      this.organizationMemberRepository.findOneBy({
        organizationId: user.organizationId,
        userId: user.userId,
        status: OrganizationMemberStatus.ACTIVE,
      }),
    ]);

    if (!organization || organization.organizationType !== OrganizationType.BUSINESS) {
      throw new ForbiddenException('Organization policies are only available for business organizations');
    }

    if (
      !membership ||
      (membership.role !== OrganizationMemberRole.OWNER &&
        membership.role !== OrganizationMemberRole.ADMIN)
    ) {
      throw new ForbiddenException('Admin organization access is required');
    }

    return organization.id;
  }

  private buildDefaultResponse(
    organizationId: string,
  ): OrganizationPolicyResponseDto {
    return {
      organizationId,
      requireMfa: false,
      restrictExternalSharing: false,
      sessionTimeoutMinutes: 60,
      maxDevicesPerUser: 5,
      policyVersion: 'v1',
      updatedAt: null,
    };
  }

  private toResponse(policy: {
    organizationId: string;
    requireMfa: boolean;
    restrictExternalSharing: boolean;
    sessionTimeoutMinutes: number;
    maxDevicesPerUser: number;
    policyVersion: string;
    updatedAt: Date;
  }): OrganizationPolicyResponseDto {
    return {
      organizationId: policy.organizationId,
      requireMfa: policy.requireMfa,
      restrictExternalSharing: policy.restrictExternalSharing,
      sessionTimeoutMinutes: policy.sessionTimeoutMinutes,
      maxDevicesPerUser: policy.maxDevicesPerUser,
      policyVersion: policy.policyVersion,
      updatedAt: policy.updatedAt.toISOString(),
    };
  }
}
