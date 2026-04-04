import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ScimToken } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class ScimTokenRepository extends BaseRepository<ScimToken> {
  constructor(@InjectModel(ScimToken) model: typeof ScimToken) {
    super(model);
  }

  findActiveByHash(tokenHash: string) {
    return this.model.findOne({
      where: {
        tokenHash,
        revokedAt: null,
      },
    });
  }

  findByOrganizationId(organizationId: string) {
    return this.model.findAll({
      where: { organizationId },
      order: [['createdAt', 'DESC']],
    });
  }
}
