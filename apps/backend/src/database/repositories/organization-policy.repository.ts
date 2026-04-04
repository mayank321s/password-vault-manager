import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrganizationPolicy } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class OrganizationPolicyRepository extends BaseRepository<OrganizationPolicy> {
  constructor(@InjectModel(OrganizationPolicy) model: typeof OrganizationPolicy) {
    super(model);
  }
}

