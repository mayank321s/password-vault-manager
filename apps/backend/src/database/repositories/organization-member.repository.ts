import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Organization, OrganizationMember, OrganizationMemberStatus, User } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class OrganizationMemberRepository extends BaseRepository<OrganizationMember> {
  constructor(@InjectModel(OrganizationMember) model: typeof OrganizationMember) {
    super(model);
  }

  async findActiveMembershipWithOrganization(userId: string) {
    return this.model.findOne({
      where: {
        userId,
        status: OrganizationMemberStatus.ACTIVE,
      },
      include: [
        {
          model: Organization,
          as: 'organization',
          required: true,
        },
      ],
      order: [
        ['joinedAt', 'ASC'],
        ['invitedAt', 'ASC'],
      ],
    });
  }

  async countActiveMembers(organizationId: string): Promise<number> {
    return this.model.count({
      where: {
        organizationId,
        status: OrganizationMemberStatus.ACTIVE,
      },
    });
  }

  async findByOrganizationIdWithUsers(organizationId: string) {
    return this.model.findAll({
      where: { organizationId },
      include: [
        {
          model: User,
          as: 'user',
          required: true,
        },
      ],
      order: [
        [{ model: User, as: 'user' }, 'email', 'ASC'],
        ['invitedAt', 'ASC'],
      ],
    });
  }

  async findByIdWithUser(id: string) {
    return this.model.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          required: true,
        },
      ],
    });
  }

  async findByScimExternalId(organizationId: string, scimExternalId: string) {
    return this.model.findOne({
      where: { organizationId, scimExternalId },
      include: [
        {
          model: User,
          as: 'user',
          required: true,
        },
      ],
    });
  }
}

