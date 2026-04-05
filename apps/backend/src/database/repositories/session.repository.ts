import { Injectable } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Session } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class SessionRepository extends BaseRepository<Session> {
  constructor(@InjectModel(Session) model: typeof Session) {
    super(model);
  }

  async findActiveSessionsForUser(userId: string) {
    return this.model.findAll({
      where: {
        userId,
        revokedAt: null,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
      order: [['createdAt', 'ASC']],
    });
  }

  async revokeSessionsByIds(
    sessionIds: string[],
    revokedAt: Date,
    transaction: Transaction,
  ) {
    if (sessionIds.length === 0) {
      return;
    }

    await this.model.update(
      { revokedAt },
      {
        where: {
          id: sessionIds,
          revokedAt: null,
        },
        transaction,
      },
    );
  }
}
