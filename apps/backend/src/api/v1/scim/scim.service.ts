import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Sequelize } from 'sequelize-typescript';
import { CurrentScimContextData, CurrentUserData } from 'src/common/decorators';
import {
  OrganizationMember,
  OrganizationMemberProvisionSource,
  OrganizationMemberRole,
  OrganizationMemberStatus,
  OrganizationType,
  ScimProvisioningEventStatus,
  User,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
  ScimProvisioningEventRepository,
  UsersRepository,
} from 'src/database/repositories';
import {
  ScimCreateUserRequest,
  ScimGroupResource,
  ScimMemberRef,
  ScimPatchGroupRequest,
  ScimPatchUserRequest,
  ScimUpdateUserRequest,
  ScimUserResource,
} from './dto';

const SCIM_USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User';
const SCIM_GROUP_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Group';
const SCIM_LIST_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:ListResponse';

type ScimRoleGroup = {
  id: string;
  displayName: string;
  role: OrganizationMemberRole;
};

const SCIM_ROLE_GROUPS: ScimRoleGroup[] = [
  { id: 'admins', displayName: 'Admins', role: OrganizationMemberRole.ADMIN },
  { id: 'managers', displayName: 'Managers', role: OrganizationMemberRole.MANAGER },
  { id: 'members', displayName: 'Members', role: OrganizationMemberRole.MEMBER },
];

@Injectable()
export class ScimService {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
    private readonly scimProvisioningEventRepository: ScimProvisioningEventRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async listUsers(scimContext: CurrentScimContextData) {
    const memberships = await this.organizationMemberRepository.findByOrganizationIdWithUsers(
      scimContext.organizationId,
    );

    await this.recordEvent(scimContext, {
      action: 'list_users',
      resourceType: 'user',
      resourceId: null,
      status: ScimProvisioningEventStatus.SUCCESS,
      detail: `Returned ${memberships.length} SCIM users`,
    });

    return {
      schemas: [SCIM_LIST_SCHEMA],
      totalResults: memberships.length,
      startIndex: 1,
      itemsPerPage: memberships.length,
      Resources: memberships.map((membership) => this.toScimUser(membership)),
    };
  }

  async getUser(scimContext: CurrentScimContextData, resourceId: string) {
    const membership = await this.requireMembershipResource(
      scimContext.organizationId,
      resourceId,
    );

    await this.recordEvent(scimContext, {
      action: 'get_user',
      resourceType: 'user',
      resourceId,
      status: ScimProvisioningEventStatus.SUCCESS,
      detail: `Fetched SCIM user ${resourceId}`,
    });

    return this.toScimUser(membership);
  }

  async createUser(
    scimContext: CurrentScimContextData,
    payload: ScimCreateUserRequest,
  ) {
    const normalizedEmail = payload.userName.toLowerCase().trim();
    const existingByExternalId = payload.externalId
      ? await this.organizationMemberRepository.findByScimExternalId(
          scimContext.organizationId,
          payload.externalId.trim(),
        )
      : null;

    if (existingByExternalId) {
      return this.updateMembershipFromPayload(
        scimContext,
        existingByExternalId,
        payload,
        'create_user',
      );
    }

    const existingUser = await this.usersRepository.findByEmail(normalizedEmail);
    const existingMembership = existingUser
      ? await this.organizationMemberRepository.findOneBy({
          organizationId: scimContext.organizationId,
          userId: existingUser.id,
        })
      : null;

    if (existingMembership) {
      const existingMembershipResource = await this.requireMembershipResource(
        scimContext.organizationId,
        existingMembership.id,
      );
      return this.updateMembershipFromPayload(
        scimContext,
        existingMembershipResource,
        payload,
        'create_user',
      );
    }

    const membershipId = await this.sequelize.transaction(async (transaction) => {
      const user =
        existingUser ??
        (await this.usersRepository.create(
          this.buildPlaceholderUser(normalizedEmail, payload.displayName),
          transaction,
        ));

      const membership = await this.organizationMemberRepository.create(
        {
          organizationId: scimContext.organizationId,
          userId: user.id,
          role: OrganizationMemberRole.MEMBER,
          ...this.buildMembershipUpdate(payload),
        },
        transaction,
      );

      return membership.id;
    });

    const persisted = await this.requireMembershipResource(
      scimContext.organizationId,
      membershipId,
    );

    await this.recordEvent(scimContext, {
      action: 'create_user',
      resourceType: 'user',
      resourceId: persisted.id,
      status: ScimProvisioningEventStatus.SUCCESS,
      detail: `Provisioned ${persisted.user.email}`,
    });

    return this.toScimUser(persisted);
  }

  async updateUser(
    scimContext: CurrentScimContextData,
    resourceId: string,
    payload: ScimUpdateUserRequest,
  ) {
    const membership = await this.requireMembershipResource(
      scimContext.organizationId,
      resourceId,
    );
    return this.updateMembershipFromPayload(
      scimContext,
      membership,
      payload,
      'update_user',
    );
  }

  async patchUser(
    scimContext: CurrentScimContextData,
    resourceId: string,
    payload: ScimPatchUserRequest,
  ) {
    const membership = await this.requireMembershipResource(
      scimContext.organizationId,
      resourceId,
    );

    const nextState: ScimUpdateUserRequest = {
      userName: membership.user.email,
      displayName: membership.user.username,
      active: membership.status === OrganizationMemberStatus.ACTIVE,
      externalId: membership.scimExternalId ?? undefined,
    };

    for (const operation of payload.Operations) {
      const op = operation.op.toLowerCase();
      const path = operation.path?.toLowerCase();
      const value = operation.value;

      if ((op === 'replace' || op === 'add') && !path && value && typeof value === 'object') {
        const mappedValue = value as Record<string, unknown>;
        if (typeof mappedValue.userName === 'string' && mappedValue.userName.trim()) {
          nextState.userName = mappedValue.userName.trim();
        }
        if (typeof mappedValue.displayName === 'string' && mappedValue.displayName.trim()) {
          nextState.displayName = mappedValue.displayName.trim();
        }
        if (typeof mappedValue.active === 'boolean') {
          nextState.active = mappedValue.active;
        }
        if (typeof mappedValue.externalId === 'string' && mappedValue.externalId.trim()) {
          nextState.externalId = mappedValue.externalId.trim();
        }
        continue;
      }

      if (op === 'remove' && path === 'externalid') {
        nextState.externalId = undefined;
        continue;
      }

      if ((op === 'replace' || op === 'add') && path === 'active') {
        nextState.active = Boolean(value);
        continue;
      }

      if ((op === 'replace' || op === 'add') && path === 'displayname') {
        nextState.displayName = String(value ?? '').trim() || nextState.displayName;
        continue;
      }

      if ((op === 'replace' || op === 'add') && path === 'username') {
        nextState.userName = String(value ?? '').trim() || nextState.userName;
        continue;
      }

      if ((op === 'replace' || op === 'add') && path === 'externalid') {
        nextState.externalId = String(value ?? '').trim() || undefined;
      }
    }

    return this.updateMembershipFromPayload(
      scimContext,
      membership,
      nextState,
      'patch_user',
    );
  }

  async listGroups(scimContext: CurrentScimContextData) {
    const memberships = await this.organizationMemberRepository.findByOrganizationIdWithUsers(
      scimContext.organizationId,
    );

    const groups = SCIM_ROLE_GROUPS.map((group) =>
      this.toScimGroup(
        group,
        memberships.filter(
          (membership) =>
            membership.role === group.role &&
            membership.status === OrganizationMemberStatus.ACTIVE,
        ),
      ),
    );

    await this.recordEvent(scimContext, {
      action: 'list_groups',
      resourceType: 'group',
      resourceId: null,
      status: ScimProvisioningEventStatus.SUCCESS,
      detail: `Returned ${groups.length} SCIM groups`,
    });

    return {
      schemas: [SCIM_LIST_SCHEMA],
      totalResults: groups.length,
      startIndex: 1,
      itemsPerPage: groups.length,
      Resources: groups,
    };
  }

  async getGroup(scimContext: CurrentScimContextData, groupId: string) {
    const group = this.requireRoleGroup(groupId);
    const memberships = await this.organizationMemberRepository.findByOrganizationIdWithUsers(
      scimContext.organizationId,
    );

    const response = this.toScimGroup(
      group,
      memberships.filter(
        (membership) =>
          membership.role === group.role &&
          membership.status === OrganizationMemberStatus.ACTIVE,
      ),
    );

    await this.recordEvent(scimContext, {
      action: 'get_group',
      resourceType: 'group',
      resourceId: groupId,
      status: ScimProvisioningEventStatus.SUCCESS,
      detail: `Fetched SCIM group ${groupId}`,
    });

    return response;
  }

  async patchGroup(
    scimContext: CurrentScimContextData,
    groupId: string,
    payload: ScimPatchGroupRequest,
  ) {
    const group = this.requireRoleGroup(groupId);
    const memberships = await this.organizationMemberRepository.findByOrganizationIdWithUsers(
      scimContext.organizationId,
    );
    const membershipMap = new Map(memberships.map((membership) => [membership.id, membership]));

    await this.sequelize.transaction(async (transaction) => {
      for (const operation of payload.Operations) {
        const op = operation.op.toLowerCase();
        const memberIds = this.extractMemberIds(operation.value);
        const targetMemberships = memberIds.map((memberId) => {
          const membership = membershipMap.get(memberId);
          if (!membership) {
            throw new NotFoundException(`SCIM member ${memberId} not found in organization`);
          }
          if (membership.role === OrganizationMemberRole.OWNER) {
            throw new BadRequestException('Owner memberships cannot be remapped by SCIM');
          }
          return membership;
        });

        if ((op === 'replace' || op === 'add') && (!operation.path || operation.path.toLowerCase() === 'members')) {
          for (const membership of targetMemberships) {
            await membership.update(
              {
                role: group.role,
                status: OrganizationMemberStatus.ACTIVE,
                joinedAt: membership.joinedAt ?? new Date(),
                removedAt: null,
                provisionSource: OrganizationMemberProvisionSource.SCIM,
              },
              { transaction },
            );
          }

          if (op === 'replace' && group.role !== OrganizationMemberRole.MEMBER) {
            const retainedIds = new Set(memberIds);
            const downgradedMemberships = memberships.filter(
              (membership) =>
                membership.role === group.role &&
                !retainedIds.has(membership.id) &&
                membership.role !== OrganizationMemberRole.OWNER,
            );

            for (const membership of downgradedMemberships) {
              await membership.update(
                {
                  role: OrganizationMemberRole.MEMBER,
                  provisionSource: OrganizationMemberProvisionSource.SCIM,
                },
                { transaction },
              );
            }
          }

          continue;
        }

        if (op === 'remove') {
          for (const membership of targetMemberships) {
            await membership.update(
              {
                role: OrganizationMemberRole.MEMBER,
                provisionSource: OrganizationMemberProvisionSource.SCIM,
              },
              { transaction },
            );
          }
        }
      }
    });

    await this.recordEvent(scimContext, {
      action: 'patch_group',
      resourceType: 'group',
      resourceId: groupId,
      status: ScimProvisioningEventStatus.SUCCESS,
      detail: `Applied ${payload.Operations.length} group operations`,
    });

    return this.getGroup(scimContext, groupId);
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
      throw new ForbiddenException('SCIM provisioning is only available for business organizations');
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

  private async updateMembershipFromPayload(
    scimContext: CurrentScimContextData,
    membership: OrganizationMember & { user: User },
    payload: ScimUpdateUserRequest | ScimCreateUserRequest,
    action: string,
  ) {
    const normalizedEmail = payload.userName.toLowerCase().trim();
    const trimmedExternalId = payload.externalId?.trim() || null;
    const normalizedDisplayName = payload.displayName?.trim() || normalizedEmail.split('@')[0];
    const nextStatus =
      payload.active === false
        ? OrganizationMemberStatus.SUSPENDED
        : OrganizationMemberStatus.ACTIVE;

    const conflictingUser = await this.usersRepository.findByEmail(normalizedEmail);
    if (conflictingUser && conflictingUser.id !== membership.userId) {
      throw new BadRequestException('Email is already assigned to another user');
    }

    await this.sequelize.transaction(async (transaction) => {
      await membership.user.update(
        {
          email: normalizedEmail,
          username: normalizedDisplayName,
        },
        { transaction },
      );

      await membership.update(
        {
          status: nextStatus,
          joinedAt:
            nextStatus === OrganizationMemberStatus.ACTIVE
              ? membership.joinedAt ?? new Date()
              : membership.joinedAt,
          removedAt: nextStatus === OrganizationMemberStatus.SUSPENDED ? new Date() : null,
          scimExternalId: trimmedExternalId,
          provisionSource: OrganizationMemberProvisionSource.SCIM,
        },
        { transaction },
      );
    });

    const updated = await this.requireMembershipResource(membership.organizationId, membership.id);
    await this.recordEvent(scimContext, {
      action,
      resourceType: 'user',
      resourceId: updated.id,
      status: ScimProvisioningEventStatus.SUCCESS,
      detail: `${updated.user.email} set to ${updated.status}`,
    });
    return this.toScimUser(updated);
  }

  private async requireMembershipResource(organizationId: string, resourceId: string) {
    const membership = await this.organizationMemberRepository.findByIdWithUser(resourceId);
    if (!membership || membership.organizationId !== organizationId) {
      throw new NotFoundException('SCIM user resource not found');
    }
    return membership;
  }

  private async recordEvent(
    scimContext: CurrentScimContextData,
    event: {
      action: string;
      resourceType: string;
      resourceId: string | null;
      status: ScimProvisioningEventStatus;
      detail: string | null;
    },
  ) {
    await this.scimProvisioningEventRepository.create({
      organizationId: scimContext.organizationId,
      scimTokenId: scimContext.scimTokenId,
      action: event.action,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      status: event.status,
      detail: event.detail,
    });
  }

  private buildPlaceholderUser(email: string, displayName?: string) {
    const placeholder = randomBytes(24).toString('hex');
    const normalizedDisplayName = displayName?.trim() || email.split('@')[0];

    return {
      email,
      username: normalizedDisplayName,
      passwordHash: `scim-${placeholder}`,
      publicKey: `SCIM_PUBLIC_KEY_${placeholder}`,
      signingPublicKey: `SCIM_SIGNING_PUBLIC_KEY_${placeholder}`,
      encryptedPrivateKey: `SCIM_ENCRYPTED_PRIVATE_KEY_${placeholder}`,
      encryptedSigningPrivateKey: `SCIM_ENCRYPTED_SIGNING_PRIVATE_KEY_${placeholder}`,
      encryptedSeedPhrase: `SCIM_ENCRYPTED_SEED_${placeholder}`,
      encryptionSalt: randomBytes(16).toString('base64'),
      isActive: true,
      totpSecret: null,
      registrationCompletedAt: null,
      registrationJti: null,
      totpRegistrationAttempts: 0,
      totpRegistrationLockedUntil: null,
    };
  }

  private buildMembershipUpdate(payload: ScimCreateUserRequest | ScimUpdateUserRequest) {
    const isActive = payload.active !== false;
    return {
      status: isActive ? OrganizationMemberStatus.ACTIVE : OrganizationMemberStatus.SUSPENDED,
      invitedAt: new Date(),
      joinedAt: isActive ? new Date() : null,
      removedAt: isActive ? null : new Date(),
      scimExternalId: payload.externalId?.trim() || null,
      provisionSource: OrganizationMemberProvisionSource.SCIM,
    };
  }

  private toScimUser(membership: OrganizationMember & { user: User }): ScimUserResource {
    return {
      schemas: [SCIM_USER_SCHEMA],
      id: membership.id,
      externalId: membership.scimExternalId,
      userName: membership.user.email,
      displayName: membership.user.username,
      active: membership.status === OrganizationMemberStatus.ACTIVE,
      emails: [{ value: membership.user.email, primary: true }],
      groups: this.toRoleGroups(membership),
    };
  }

  private toRoleGroups(membership: OrganizationMember): ScimMemberRef[] {
    const group = SCIM_ROLE_GROUPS.find((entry) => entry.role === membership.role);
    if (!group) {
      return [];
    }

    return [{ value: group.id, display: group.displayName }];
  }

  private toScimGroup(
    group: ScimRoleGroup,
    memberships: Array<OrganizationMember & { user: User }>,
  ): ScimGroupResource {
    return {
      schemas: [SCIM_GROUP_SCHEMA],
      id: group.id,
      displayName: group.displayName,
      members: memberships.map((membership) => ({
        value: membership.id,
        display: membership.user.email,
      })),
    };
  }

  private requireRoleGroup(groupId: string) {
    const normalized = groupId.toLowerCase();
    const group = SCIM_ROLE_GROUPS.find((entry) => entry.id === normalized);
    if (!group) {
      throw new NotFoundException('SCIM group not found');
    }
    return group;
  }

  private extractMemberIds(value: unknown) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map((entry) =>
          typeof entry === 'object' && entry
            ? (entry as { value?: string }).value
            : undefined,
        )
        .filter((entry): entry is string => Boolean(entry));
    }

    if (typeof value === 'object' && value) {
      const singleValue = (value as { value?: string }).value;
      return singleValue ? [singleValue] : [];
    }

    return [];
  }
}
