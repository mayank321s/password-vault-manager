import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ScimProvisioningEvent } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class ScimProvisioningEventRepository extends BaseRepository<ScimProvisioningEvent> {
  constructor(
    @InjectModel(ScimProvisioningEvent) model: typeof ScimProvisioningEvent,
  ) {
    super(model);
  }

  findByOrganizationId(organizationId: string, limit = 25) {
    return this.model.findAll({
      where: { organizationId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}
