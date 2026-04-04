import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SsoConfiguration, SsoVerifiedDomain } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class SsoVerifiedDomainRepository extends BaseRepository<SsoVerifiedDomain> {
  constructor(@InjectModel(SsoVerifiedDomain) model: typeof SsoVerifiedDomain) {
    super(model);
  }

  findByDomain(domain: string) {
    return this.model.findOne({
      where: { domain },
      include: [{ model: SsoConfiguration, as: 'ssoConfiguration', required: true }],
    });
  }
}
