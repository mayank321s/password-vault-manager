import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { randomBytes } from 'crypto';
import { CurrentUserData } from 'src/common/decorators';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
  SsoProvider,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
  SsoConfigurationRepository,
  SsoVerifiedDomainRepository,
} from 'src/database/repositories';
import {
  SsoConfigurationResponseDto,
  UpsertSsoConfigurationRequestDto,
  VerifySsoDomainRequestDto,
} from './dto';

@Injectable()
export class SsoService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly ssoConfigurationRepository: SsoConfigurationRepository,
    private readonly ssoVerifiedDomainRepository: SsoVerifiedDomainRepository,
  ) {}

  async getCurrentConfiguration(
    user: CurrentUserData,
  ): Promise<SsoConfigurationResponseDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(user);
    const configuration =
      await this.ssoConfigurationRepository.findByOrganizationIdWithDomains(
        organizationId,
      );
    if (!configuration) {
      throw new NotFoundException('SSO configuration not found for organization');
    }
    return this.toResponse(configuration);
  }

  async upsertConfiguration(
    user: CurrentUserData,
    payload: UpsertSsoConfigurationRequestDto,
  ): Promise<SsoConfigurationResponseDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(user);
    const normalizedDomains = [...new Set(payload.domains.map((domain) => this.normalizeDomain(domain)))];
    const primaryDomain = this.normalizeDomain(payload.primaryDomain);
    if (!normalizedDomains.includes(primaryDomain)) {
      throw new BadRequestException('Primary domain must be included in the domain list');
    }

    const issuer = `https://login.microsoftonline.com/${payload.tenantId}/v2.0`;
    const authorizationEndpoint = `https://login.microsoftonline.com/${payload.tenantId}/oauth2/v2.0/authorize`;
    const tokenEndpoint = `https://login.microsoftonline.com/${payload.tenantId}/oauth2/v2.0/token`;

    const configuration = await this.ssoConfigurationRepository.findOneBy({
      organizationId,
    });

    const persistedConfiguration = await this.sequelize.transaction(
      async (transaction) => {
        const savedConfiguration = configuration
          ? await configuration.update(
              {
                provider: SsoProvider.ENTRA_OIDC,
                tenantId: payload.tenantId.trim(),
                clientId: payload.clientId.trim(),
                clientSecretRef: payload.clientSecretRef?.trim() || null,
                redirectUri: payload.redirectUri.trim(),
                issuer,
                authorizationEndpoint,
                tokenEndpoint,
                scopes: 'openid profile email',
                isActive: true,
              },
              { transaction },
            )
          : await this.ssoConfigurationRepository.create(
              {
                organizationId,
                provider: SsoProvider.ENTRA_OIDC,
                tenantId: payload.tenantId.trim(),
                clientId: payload.clientId.trim(),
                clientSecretRef: payload.clientSecretRef?.trim() || null,
                redirectUri: payload.redirectUri.trim(),
                issuer,
                authorizationEndpoint,
                tokenEndpoint,
                scopes: 'openid profile email',
                isActive: true,
              },
              transaction,
            );

        const existingDomains = await this.ssoVerifiedDomainRepository.findAllBy({
          ssoConfigurationId: savedConfiguration.id,
        });

        for (const domain of normalizedDomains) {
          const existingDomain = existingDomains.find((item) => item.domain === domain);
          if (existingDomain) {
            await existingDomain.update(
              {
                isPrimary: domain === primaryDomain,
              },
              { transaction },
            );
            continue;
          }

          await this.ssoVerifiedDomainRepository.create(
            {
              ssoConfigurationId: savedConfiguration.id,
              organizationId,
              domain,
              verificationToken: this.generateVerificationToken(),
              verifiedAt: null,
              isPrimary: domain === primaryDomain,
            },
            transaction,
          );
        }

        return savedConfiguration;
      },
    );

    const reloaded = await this.ssoConfigurationRepository.findByIdWithDomains(
      persistedConfiguration.id,
    );
    if (!reloaded) {
      throw new NotFoundException('SSO configuration could not be reloaded');
    }
    return this.toResponse(reloaded);
  }

  async verifyDomain(
    user: CurrentUserData,
    domainId: string,
    payload: VerifySsoDomainRequestDto,
  ): Promise<SsoConfigurationResponseDto> {
    const organizationId = await this.requireBusinessOrganizationAdmin(user);
    const configuration =
      await this.ssoConfigurationRepository.findByOrganizationIdWithDomains(
        organizationId,
      );
    if (!configuration) {
      throw new NotFoundException('SSO configuration not found');
    }

    const domain = configuration.domains?.find((item) => item.id === domainId);
    if (!domain) {
      throw new NotFoundException('SSO domain not found');
    }
    if (domain.verificationToken !== payload.verificationToken.trim()) {
      throw new BadRequestException('Verification token does not match');
    }

    await domain.update({
      verifiedAt: new Date(),
    });

    const updated = await this.ssoConfigurationRepository.findByIdWithDomains(
      configuration.id,
    );
    if (!updated) {
      throw new NotFoundException('SSO configuration not found');
    }
    return this.toResponse(updated);
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
      throw new ForbiddenException('SSO configuration is only available for business organizations');
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

  private normalizeDomain(domain: string) {
    return domain.trim().toLowerCase();
  }

  private generateVerificationToken() {
    return `pvm-verify-${randomBytes(16).toString('hex')}`;
  }

  private toResponse(configuration: {
    id: string;
    organizationId: string;
    provider: 'entra_oidc';
    tenantId: string;
    clientId: string;
    clientSecretRef: string | null;
    redirectUri: string;
    issuer: string;
    authorizationEndpoint: string;
    tokenEndpoint: string;
    scopes: string;
    isActive: boolean;
    domains?: Array<{
      id: string;
      domain: string;
      verificationToken: string;
      verifiedAt: Date | null;
      isPrimary: boolean;
    }>;
  }): SsoConfigurationResponseDto {
    return {
      configId: configuration.id,
      organizationId: configuration.organizationId,
      provider: configuration.provider,
      tenantId: configuration.tenantId,
      clientId: configuration.clientId,
      clientSecretRef: configuration.clientSecretRef,
      redirectUri: configuration.redirectUri,
      issuer: configuration.issuer,
      authorizationEndpoint: configuration.authorizationEndpoint,
      tokenEndpoint: configuration.tokenEndpoint,
      scopes: configuration.scopes,
      isActive: configuration.isActive,
      domains: (configuration.domains ?? []).map((domain) => ({
        domainId: domain.id,
        domain: domain.domain,
        verificationToken: domain.verificationToken,
        verifiedAt: domain.verifiedAt ? domain.verifiedAt.toISOString() : null,
        isPrimary: domain.isPrimary,
      })),
    };
  }
}
