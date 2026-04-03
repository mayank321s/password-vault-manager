import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User, VaultMember } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(@InjectModel(User) model: typeof User) {
    super(model);
  }

  async searchByQuery(
    query: string,
    excludeUserId: string,
    vaultId: string,
    limit = 10,
  ): Promise<User[]> {
    return this.model.findAll({
      include: [
        {
          model: VaultMember,
          as: 'vaultMemberships',
          required: false,
          where: { vaultId },
          attributes: ['id'],
        },
      ],
      where: {
        id: { [Op.ne]: excludeUserId },
        '$vaultMemberships.id$': { [Op.is]: null },
        isActive: true,
        [Op.or]: [
          { email: { [Op.iLike]: `%${query}%` } },
          { username: { [Op.iLike]: `%${query}%` } },
        ],
      },
      attributes: ['id', 'email', 'username', 'publicKey'],
      limit,
      order: [['email', 'ASC']],
      subQuery: false,
    });
  }
}
