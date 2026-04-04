import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CurrentUserData } from 'src/common/decorators';
import {
  EmergencyAccessGrantStatus,
  OrganizationMemberRole,
  OrganizationMemberStatus,
} from 'src/database/models';
import {
  EmergencyAccessGrantRepository,
  OrganizationMemberRepository,
  UsersRepository,
} from 'src/database/repositories';
import {
  CreateEmergencyAccessGrantRequestDto,
  EmergencyAccessGrantListResponseDto,
  EmergencyAccessGrantSummaryDto,
} from './dto';

@Injectable()
export class EmergencyAccessService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly emergencyAccessGrantRepository: EmergencyAccessGrantRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async listGrants(
    user: CurrentUserData,
  ): Promise<EmergencyAccessGrantListResponseDto> {
    const organizationId = this.requireOrganizationId(user);
    await this.requireActiveMembership(organizationId, user.userId);

    const grants = await this.emergencyAccessGrantRepository.findByParticipant(
      organizationId,
      user.userId,
    );

    const summaries = await Promise.all(
      grants.map((grant) => this.toSummary(grant)),
    );

    return {
      outgoing: summaries.filter((grant) => grant.grantorUserId === user.userId),
      incoming: summaries.filter((grant) => grant.granteeUserId === user.userId),
    };
  }

  async createGrant(
    user: CurrentUserData,
    payload: CreateEmergencyAccessGrantRequestDto,
  ): Promise<EmergencyAccessGrantSummaryDto> {
    const organizationId = this.requireOrganizationId(user);
    const actorMembership = await this.requireActiveMembership(
      organizationId,
      user.userId,
    );

    if (
      actorMembership.role !== OrganizationMemberRole.OWNER &&
      actorMembership.role !== OrganizationMemberRole.ADULT
    ) {
      throw new ForbiddenException(
        'Only owner or adult members can configure emergency access',
      );
    }

    const grantee = await this.usersRepository.findOneBy({
      email: payload.granteeEmail.toLowerCase().trim(),
    });
    if (!grantee) {
      throw new NotFoundException('Trusted contact user not found');
    }
    if (grantee.id === user.userId) {
      throw new BadRequestException('You cannot assign yourself as emergency contact');
    }

    const granteeMembership = await this.requireActiveMembership(
      organizationId,
      grantee.id,
    );
    if (granteeMembership.role === OrganizationMemberRole.CHILD) {
      throw new BadRequestException(
        'Child members cannot be assigned as emergency contacts',
      );
    }

    const duplicate = (
      await this.emergencyAccessGrantRepository.findByParticipant(
        organizationId,
        user.userId,
      )
    ).find(
      (grant) =>
        grant.grantorUserId === user.userId &&
        grant.granteeUserId === grantee.id &&
        grant.status !== EmergencyAccessGrantStatus.REVOKED &&
        grant.status !== EmergencyAccessGrantStatus.DECLINED,
    );
    if (duplicate) {
      throw new BadRequestException(
        'Emergency access is already pending or active for this contact',
      );
    }

    const created = await this.sequelize.transaction(async (transaction) =>
      this.emergencyAccessGrantRepository.create(
        {
          organizationId,
          grantorUserId: user.userId,
          granteeUserId: grantee.id,
          status: EmergencyAccessGrantStatus.PENDING_ACCEPTANCE,
          recoveryDelayHours: payload.recoveryDelayHours,
          note: payload.note?.trim() || null,
          acceptedAt: null,
          revokedAt: null,
          revokedByUserId: null,
        },
        transaction,
      ),
    );

    return this.toSummary(created);
  }

  async acceptGrant(
    user: CurrentUserData,
    grantId: string,
  ): Promise<EmergencyAccessGrantSummaryDto> {
    const organizationId = this.requireOrganizationId(user);
    await this.requireActiveMembership(organizationId, user.userId);

    const grant = await this.emergencyAccessGrantRepository.findOneScoped(
      grantId,
      organizationId,
    );
    if (!grant) {
      throw new NotFoundException('Emergency access grant not found');
    }
    if (grant.granteeUserId !== user.userId) {
      throw new ForbiddenException('Only the invited trusted contact can accept');
    }
    if (grant.status !== EmergencyAccessGrantStatus.PENDING_ACCEPTANCE) {
      throw new BadRequestException('Only pending grants can be accepted');
    }

    await this.sequelize.transaction(async (transaction) => {
      await grant.update(
        {
          status: EmergencyAccessGrantStatus.ACTIVE,
          acceptedAt: new Date(),
        },
        { transaction },
      );
    });

    return this.toSummary(grant);
  }

  async revokeGrant(
    user: CurrentUserData,
    grantId: string,
  ): Promise<EmergencyAccessGrantSummaryDto> {
    const organizationId = this.requireOrganizationId(user);
    await this.requireActiveMembership(organizationId, user.userId);

    const grant = await this.emergencyAccessGrantRepository.findOneScoped(
      grantId,
      organizationId,
    );
    if (!grant) {
      throw new NotFoundException('Emergency access grant not found');
    }
    if (grant.grantorUserId !== user.userId && grant.granteeUserId !== user.userId) {
      throw new ForbiddenException('Only participants can revoke emergency access');
    }
    if (grant.status === EmergencyAccessGrantStatus.REVOKED) {
      throw new BadRequestException('Emergency access has already been revoked');
    }

    await this.sequelize.transaction(async (transaction) => {
      await grant.update(
        {
          status: EmergencyAccessGrantStatus.REVOKED,
          revokedAt: new Date(),
          revokedByUserId: user.userId,
        },
        { transaction },
      );
    });

    return this.toSummary(grant);
  }

  private requireOrganizationId(user: CurrentUserData) {
    if (!user.organizationId) {
      throw new BadRequestException('Organization context is required');
    }
    return user.organizationId;
  }

  private async requireActiveMembership(organizationId: string, userId: string) {
    const membership = await this.organizationMemberRepository.findOneBy({
      organizationId,
      userId,
      status: OrganizationMemberStatus.ACTIVE,
    });
    if (!membership) {
      throw new ForbiddenException('Active organization membership required');
    }
    return membership;
  }

  private async toSummary(grant: {
    id: string;
    organizationId: string;
    grantorUserId: string;
    granteeUserId: string;
    status: string;
    recoveryDelayHours: number;
    note: string | null;
    acceptedAt: Date | null;
    revokedAt: Date | null;
    revokedByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<EmergencyAccessGrantSummaryDto> {
    const [grantor, grantee] = await Promise.all([
      this.usersRepository.findById(grant.grantorUserId),
      this.usersRepository.findById(grant.granteeUserId),
    ]);

    return {
      grantId: grant.id,
      organizationId: grant.organizationId,
      grantorUserId: grant.grantorUserId,
      grantorEmail: grantor?.email ?? '',
      grantorUsername: grantor?.username ?? 'unknown',
      granteeUserId: grant.granteeUserId,
      granteeEmail: grantee?.email ?? '',
      granteeUsername: grantee?.username ?? 'unknown',
      status:
        grant.status as EmergencyAccessGrantSummaryDto['status'],
      recoveryDelayHours: grant.recoveryDelayHours,
      note: grant.note,
      acceptedAt: grant.acceptedAt ? grant.acceptedAt.toISOString() : null,
      revokedAt: grant.revokedAt ? grant.revokedAt.toISOString() : null,
      revokedByUserId: grant.revokedByUserId,
      createdAt: grant.createdAt.toISOString(),
      updatedAt: grant.updatedAt.toISOString(),
    };
  }
}
