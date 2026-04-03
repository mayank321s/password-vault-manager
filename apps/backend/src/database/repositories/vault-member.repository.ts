import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, VaultMember } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class VaultMemberRepository extends BaseRepository<VaultMember> {
  constructor(@InjectModel(VaultMember) model: typeof VaultMember) {
    super(model);
  }

  getUser(vaultId: string, userId: string) {
    return this.model.findOne({
      where: { vaultId, userId: userId },
      include: User,
    });
  }
}
