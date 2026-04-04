import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { EmergencyAccessGrant } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class EmergencyAccessGrantRepository extends BaseRepository<EmergencyAccessGrant> {
  constructor(
    @InjectModel(EmergencyAccessGrant) model: typeof EmergencyAccessGrant,
  ) {
    super(model);
  }

  findByParticipant(organizationId: string, userId: string) {
    return this.model.findAll({
      where: {
        organizationId,
        [Op.or]: [{ grantorUserId: userId }, { granteeUserId: userId }],
      },
      order: [['createdAt', 'DESC']],
    });
  }

  findOneScoped(
    id: string,
    organizationId: string,
    where: WhereOptions<EmergencyAccessGrant> = {},
  ) {
    return this.model.findOne({
      where: {
        id,
        organizationId,
        ...where,
      },
    });
  }
}
