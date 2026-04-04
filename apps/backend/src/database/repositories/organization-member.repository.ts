import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrganizationMember } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class OrganizationMemberRepository extends BaseRepository<OrganizationMember> {
  constructor(@InjectModel(OrganizationMember) model: typeof OrganizationMember) {
    super(model);
  }
}

