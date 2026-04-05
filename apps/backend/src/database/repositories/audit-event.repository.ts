import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { AuditEvent } from '../models';
import { BaseRepository } from './base.repository';

type AuditEventFilters = {
  organizationId: string;
  actorUserId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  createdFrom?: Date;
  createdTo?: Date;
};

@Injectable()
export class AuditEventRepository extends BaseRepository<AuditEvent> {
  constructor(@InjectModel(AuditEvent) model: typeof AuditEvent) {
    super(model);
  }

  async findByFilters(filters: AuditEventFilters, limit = 100) {
    const where: WhereOptions<AuditEvent> = {
      organizationId: filters.organizationId,
    };

    if (filters.actorUserId) {
      where.actorUserId = filters.actorUserId;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.targetType) {
      where.targetType = filters.targetType;
    }
    if (filters.targetId) {
      where.targetId = filters.targetId;
    }
    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {
        ...(filters.createdFrom ? { [Op.gte]: filters.createdFrom } : {}),
        ...(filters.createdTo ? { [Op.lte]: filters.createdTo } : {}),
      };
    }

    return this.model.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}
