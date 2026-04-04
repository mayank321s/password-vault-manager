import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Organization, OrganizationMember, OrganizationMemberStatus } from '../models';
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
}

