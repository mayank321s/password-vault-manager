import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import {
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
  VaultMemberRole,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from 'src/database/repositories';
import { CurrentUserData } from 'src/common/decorators';
import {
  AcceptFamilyInvitationRequestDto,
  AcceptFamilyInvitationResponseDto,
  CreateFamilyWorkspaceRequestDto,
  CreateFamilyWorkspaceResponseDto,
  FamilyMembersResponseDto,
  InviteFamilyMemberRequestDto,
  InviteFamilyMemberResponseDto,
} from './dto';

@Injectable()
export class FamilyService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly usersRepository: UsersRepository,
    private readonly vaultRepository: VaultRepository,
    private readonly vaultMemberRepository: VaultMemberRepository,
  ) {}

  async createWorkspace(
    currentUser: CurrentUserData,
    payload: CreateFamilyWorkspaceRequestDto,
  ): Promise<CreateFamilyWorkspaceResponseDto> {
    const user = await this.usersRepository.findById(currentUser.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sequelize.transaction(async (transaction) => {
      const organization = await this.organizationRepository.create(
        {
          name: payload.name.trim(),
          organizationType: OrganizationType.FAMILY,
          createdByUserId: currentUser.userId,
        },
        transaction,
      );

      await this.organizationMemberRepository.create(
        {
          organizationId: organization.id,
          userId: currentUser.userId,
          role: OrganizationMemberRole.OWNER,
          status: OrganizationMemberStatus.ACTIVE,
          invitedAt: new Date(),
          joinedAt: new Date(),
        },
        transaction,
      );

      const familyVault = await this.vaultRepository.create(
        {
          name: 'Family Shared Vault',
          isPersonalVault: false,
          ownerUserId: currentUser.userId,
          organizationId: organization.id,
        },
        transaction,
      );

      await this.vaultMemberRepository.create(
        {
          vaultId: familyVault.id,
          userId: currentUser.userId,
          userRole: VaultMemberRole.OWNER,
          vaultEncryptedKey: payload.familyVaultEncryptedKey,
        },
        transaction,
      );

      return {
        organizationId: organization.id,
        familyVaultId: familyVault.id,
        status: 'created',
      };
    });
  }

  async inviteMember(
    currentUser: CurrentUserData,
    organizationId: string,
    payload: InviteFamilyMemberRequestDto,
  ): Promise<InviteFamilyMemberResponseDto> {
    const actorMembership = await this.organizationMemberRepository.findOneBy({
      organizationId,
      userId: currentUser.userId,
      status: OrganizationMemberStatus.ACTIVE,
    });
    if (!actorMembership) {
      throw new ForbiddenException('Active membership required');
    }
    if (actorMembership.role !== OrganizationMemberRole.OWNER) {
      throw new ForbiddenException('Only family owner can invite members');
    }

    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization || organization.organizationType !== OrganizationType.FAMILY) {
      throw new NotFoundException('Family workspace not found');
    }

    const invitee = await this.usersRepository.findOneBy({
      email: payload.userEmail.toLowerCase().trim(),
    });
    if (!invitee) {
      throw new NotFoundException('Invitee user not found');
    }
    if (invitee.id === currentUser.userId) {
      throw new BadRequestException('Cannot invite yourself');
    }

    const existing = await this.organizationMemberRepository.findOneBy({
      organizationId,
      userId: invitee.id,
    });
    if (existing?.status === OrganizationMemberStatus.ACTIVE) {
      throw new BadRequestException('User is already an active member');
    }

    const role =
      payload.role === 'adult'
        ? OrganizationMemberRole.ADULT
        : OrganizationMemberRole.CHILD;

    if (existing) {
      await this.sequelize.transaction(async (transaction) => {
        await existing.update(
          {
            role,
            status: OrganizationMemberStatus.INVITED,
            invitedAt: new Date(),
            removedAt: null,
          },
          { transaction },
        );
      });
    } else {
      await this.sequelize.transaction(async (transaction) => {
        await this.organizationMemberRepository.create(
          {
            organizationId,
            userId: invitee.id,
            role,
            status: OrganizationMemberStatus.INVITED,
            invitedAt: new Date(),
            joinedAt: null,
          },
          transaction,
        );
      });
    }

    return {
      organizationId,
      userId: invitee.id,
      role,
      status: OrganizationMemberStatus.INVITED,
    };
  }

  async acceptInvitation(
    currentUser: CurrentUserData,
    organizationId: string,
    payload: AcceptFamilyInvitationRequestDto,
  ): Promise<AcceptFamilyInvitationResponseDto> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization || organization.organizationType !== OrganizationType.FAMILY) {
      throw new NotFoundException('Family workspace not found');
    }

    const membership = await this.organizationMemberRepository.findOneBy({
      organizationId,
      userId: currentUser.userId,
    });
    if (!membership || membership.status !== OrganizationMemberStatus.INVITED) {
      throw new ForbiddenException('No pending invitation found');
    }

    const familyVault = await this.vaultRepository.findOneBy({
      organizationId,
      isPersonalVault: false,
    });
    if (!familyVault) {
      throw new NotFoundException('Family vault not found');
    }

    await this.sequelize.transaction(async (transaction) => {
      await membership.update(
        {
          status: OrganizationMemberStatus.ACTIVE,
          joinedAt: new Date(),
          removedAt: null,
        },
        { transaction },
      );

      const existingVaultMembership = await this.vaultMemberRepository.findOneBy({
        vaultId: familyVault.id,
        userId: currentUser.userId,
      });
      if (!existingVaultMembership) {
        await this.vaultMemberRepository.create(
          {
            vaultId: familyVault.id,
            userId: currentUser.userId,
            userRole: VaultMemberRole.TEAM_MEMBER,
            vaultEncryptedKey: payload.familyVaultEncryptedKey,
          },
          transaction,
        );
      }
    });

    return {
      organizationId,
      userId: currentUser.userId,
      status: 'accepted',
    };
  }

  async getMembers(
    currentUser: CurrentUserData,
    organizationId: string,
  ): Promise<FamilyMembersResponseDto> {
    const actorMembership = await this.organizationMemberRepository.findOneBy({
      organizationId,
      userId: currentUser.userId,
      status: OrganizationMemberStatus.ACTIVE,
    });
    if (!actorMembership) {
      throw new ForbiddenException('Active membership required');
    }

    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization || organization.organizationType !== OrganizationType.FAMILY) {
      throw new NotFoundException('Family workspace not found');
    }

    const members = await this.organizationMemberRepository.findAllBy({
      organizationId,
    });

    const memberRows = await Promise.all(
      members.map(async (member) => {
        const user = await this.usersRepository.findById(member.userId);
        return {
          userId: member.userId,
          email: user?.email ?? '',
          username: user?.username ?? 'unknown',
          role: member.role as 'owner' | 'adult' | 'child',
          status: member.status as 'active' | 'invited' | 'suspended',
          invitedAt: member.invitedAt ? member.invitedAt.toISOString() : null,
          joinedAt: member.joinedAt ? member.joinedAt.toISOString() : null,
        };
      }),
    );

    return {
      organizationId,
      members: memberRows,
    };
  }
}
