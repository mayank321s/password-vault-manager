import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SsoConfiguration, SsoVerifiedDomain } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class SsoConfigurationRepository extends BaseRepository<SsoConfiguration> {
  constructor(@InjectModel(SsoConfiguration) model: typeof SsoConfiguration) {
    super(model);
  }

  findByOrganizationIdWithDomains(organizationId: string) {
    return this.model.findOne({
      where: { organizationId },
      include: [{ model: SsoVerifiedDomain, as: 'domains', required: false }],
    });
  }

  findByIdWithDomains(id: string) {
    return this.model.findByPk(id, {
      include: [{ model: SsoVerifiedDomain, as: 'domains', required: false }],
    });
  }
}
