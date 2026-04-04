import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, Vault, VaultMember } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class VaultMemberRepository extends BaseRepository<VaultMember> {
  constructor(@InjectModel(VaultMember) model: typeof VaultMember) {
    super(model);
  }

  getUser(vaultId: string, userId: string, organizationId?: string | null) {
    return this.model.findOne({
      where: { vaultId, userId: userId },
      include: [
        User,
        ...(organizationId
          ? [
              {
                model: Vault,
                as: 'vault',
                where: { organizationId },
                attributes: [],
                required: true,
              },
            ]
          : []),
      ],
    });
  }

  findOneByVaultAndUser(
    vaultId: string,
    userId: string,
    organizationId?: string | null,
  ) {
    return this.model.findOne({
      where: { vaultId, userId },
      include: organizationId
        ? [
            {
              model: Vault,
              as: 'vault',
              where: { organizationId },
              attributes: [],
              required: true,
            },
          ]
        : [],
    });
  }

  findAllByUserInOrganization(userId: string, organizationId?: string | null) {
    return this.model.findAll({
      where: { userId },
      include: organizationId
        ? [
            {
              model: Vault,
              as: 'vault',
              where: { organizationId },
              attributes: [],
              required: true,
            },
          ]
        : [],
    });
  }

  findAllByVaultInOrganization(vaultId: string, organizationId?: string | null) {
    return this.model.findAll({
      where: { vaultId },
      include: organizationId
        ? [
            {
              model: Vault,
              as: 'vault',
              where: { organizationId },
              attributes: [],
              required: true,
            },
          ]
        : [],
    });
  }
}
