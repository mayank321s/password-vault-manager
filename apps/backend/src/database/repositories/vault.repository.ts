import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize';
import { User, Vault, VaultMember } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class VaultRepository extends BaseRepository<Vault> {
  constructor(@InjectModel(Vault) model: typeof Vault) {
    super(model);
  }

  async createPersonalVault(
    userId: string,
    transaction: Transaction,
    organizationId?: string | null,
  ) {
    return this.create(
      {
        name: 'Personal Vault',
        isPersonalVault: true,
        ownerUserId: userId,
        organizationId: organizationId ?? null,
      },
      transaction,
    );
  }

  async getVaultMembers(vaultId: string, organizationId?: string | null) {
    const vault = await this.model.findOne({
      where: {
        id: vaultId,
        ...(organizationId ? { organizationId } : {}),
      },
      include: [
        {
          model: VaultMember,
          include: [User],
        },
      ],
    });
    return vault;
  }

  async findByIdInOrganization(vaultId: string, organizationId?: string | null) {
    return this.model.findOne({
      where: {
        id: vaultId,
        ...(organizationId ? { organizationId } : {}),
      },
    });
  }
}
