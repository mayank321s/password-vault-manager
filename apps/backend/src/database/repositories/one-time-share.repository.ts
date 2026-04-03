import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OneTimeShare } from '../models';
import { BaseRepository } from './base.repository';
import { Op } from 'sequelize';

@Injectable()
export class OneTimeShareRepository extends BaseRepository<OneTimeShare> {
  constructor(@InjectModel(OneTimeShare) model: typeof OneTimeShare) {
    super(model);
  }

  /**
   * Find valid (not expired and not used) share by ID
   */
  async findValidShare(shareId: string): Promise<OneTimeShare | null> {
    return this.model.findOne({
      where: {
        id: shareId,
        isUsed: false,
        expiresAt: {
          [Op.gt]: new Date(),
        },
      },
    });
  }

  /**
   * Mark share as used
   */
  async markAsUsed(shareId: string): Promise<void> {
    await this.model.update(
      { isUsed: true },
      {
        where: { id: shareId },
      },
    );
  }

  /**
   * Delete expired shares (cleanup job)
   */
  async deleteExpiredShares(): Promise<number> {
    const result = await this.model.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
    return result;
  }

  /**
   * Delete used shares older than specified hours (cleanup job)
   */
  async deleteOldUsedShares(olderThanHours: number = 24): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

    const result = await this.model.destroy({
      where: {
        isUsed: true,
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
    });
    return result;
  }
}
