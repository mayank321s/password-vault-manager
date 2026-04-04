import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { CurrentUserData } from 'src/common/decorators';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
  ScimProvisioningEventStatus,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
  ScimProvisioningEventRepository,
  ScimTokenRepository,
} from 'src/database/repositories';
import {
  CreateScimTokenRequestDto,
  CreateScimTokenResponseDto,
  ScimDiagnosticsDto,
  ScimTokenResponseDto,
} from './dto';

@Injectable()
export class ScimAdminService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly scimTokenRepository: ScimTokenRepository,
    private readonly scimProvisioningEventRepository: ScimProvisioningEventRepository,
  ) {}

  async listTokens(currentUser: CurrentUserData): Promise<ScimTokenResponseDto[]> {
    const organizationId = await this.requireBusinessOrganizationAdmin(currentUser);
    const tokens = await this.scimTokenRepository.findByOrganizationId(organizationId);
    return tokens.map((token) => this.toTokenResponse(token));
  }

  async createToken(
    currentUser: CurrentUserData,
    payload: CreateScimTokenRequestDto,
  ): Promise<CreateScimTokenResponseDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(currentUser);
    const rawToken = `pvm_scim_${randomBytes(24).toString('hex')}`;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const tokenPrefix = rawToken.slice(0, 12);

    const token = await this.scimTokenRepository.create(
      {
        organizationId,
        label: payload.label.trim(),
        tokenPrefix,
        tokenHash,
        lastUsedAt: null,
        revokedAt: null,
      },
      undefined as never,
    );

    return {
      ...this.toTokenResponse(token),
      plainTextToken: rawToken,
    };
  }

  async revokeToken(currentUser: CurrentUserData, tokenId: string) {
    const organizationId = await this.requireBusinessOrganizationAdmin(currentUser);
    const token = await this.scimTokenRepository.findById(tokenId);
    if (!token || token.organizationId !== organizationId) {
      throw new BadRequestException('SCIM token not found for organization');
    }

    await token.update({ revokedAt: token.revokedAt ?? new Date() });
    return this.toTokenResponse(token);
  }

  async getDiagnostics(currentUser: CurrentUserData): Promise<ScimDiagnosticsDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(currentUser);
    const [tokens, recentEvents] = await Promise.all([
      this.scimTokenRepository.findByOrganizationId(organizationId),
      this.scimProvisioningEventRepository.findByOrganizationId(organizationId, 20),
    ]);

    const activeTokens = tokens.filter((token) => !token.revokedAt);
    const failures = recentEvents.filter(
      (event) => event.status === ScimProvisioningEventStatus.FAILURE,
    );
    const successes = recentEvents.filter(
      (event) => event.status === ScimProvisioningEventStatus.SUCCESS,
    );
    const latestTokenUseAt = activeTokens
      .map((token) => token.lastUsedAt)
      .filter((value): value is Date => Boolean(value))
      .sort((left, right) => right.getTime() - left.getTime())[0] ?? null;

    return {
      organizationId,
      tokenStatus: {
        activeTokenCount: activeTokens.length,
        revokedTokenCount: tokens.filter((token) => Boolean(token.revokedAt)).length,
        latestTokenUseAt: latestTokenUseAt?.toISOString() ?? null,
      },
      provisioningStatus: {
        lastSuccessAt: successes[0]?.createdAt?.toISOString() ?? null,
        lastFailureAt: failures[0]?.createdAt?.toISOString() ?? null,
        recentFailureCount: failures.length,
      },
      endpoints: {
        baseUrl: '/api/v1/scim/v2',
        usersUrl: '/api/v1/scim/v2/Users',
        groupsUrl: '/api/v1/scim/v2/Groups',
      },
      recentEvents: recentEvents.map((event) => ({
        eventId: event.id,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        status: event.status,
        detail: event.detail,
        createdAt: event.createdAt.toISOString(),
      })),
      tokens: tokens.map((token) => this.toTokenResponse(token)),
    };
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
      throw new ForbiddenException('SCIM controls are only available for business organizations');
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

  private toTokenResponse(token: {
    id: string;
    label: string;
    tokenPrefix: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    revokedAt: Date | null;
  }): ScimTokenResponseDto {
    return {
      tokenId: token.id,
      label: token.label,
      tokenPrefix: token.tokenPrefix,
      createdAt: token.createdAt.toISOString(),
      lastUsedAt: token.lastUsedAt ? token.lastUsedAt.toISOString() : null,
      revokedAt: token.revokedAt ? token.revokedAt.toISOString() : null,
    };
  }
}
