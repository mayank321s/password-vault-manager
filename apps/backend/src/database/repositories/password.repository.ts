import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Attributes } from 'sequelize';
import {
  Password,
  PasswordPermission,
  User,
  Vault,
  VaultMember,
} from '../models';
import { BaseRepository } from './base.repository';

interface GetVaultPasswordsOptions {
  withEncryptedData: boolean;
  page: number;
  limit: number;
}

@Injectable()
export class PasswordRepository extends BaseRepository<Password> {
  constructor(@InjectModel(Password) model: typeof Password) {
    super(model);
  }

  async getVaultPasswords(
    vaultId: string,
    options: GetVaultPasswordsOptions,
    organizationId?: string | null,
  ): Promise<{ rows: Password[]; count: number }> {
    const attributes: (keyof Attributes<Password>)[] = ['id', 'isNote', 'name'];
    if (options.withEncryptedData) {
      attributes.push('encryptedData');
    }

    return this.model.findAndCountAll({
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
      attributes,
      order: [['name', 'ASC']],
      limit: options.limit,
      offset: (options.page - 1) * options.limit,
    });
  }

  async getPasswordDetails(
    id: string,
    organizationId?: string | null,
  ): Promise<Password | null> {
    return this.model.findOne({
      where: { id },
      include: [
        { model: User, as: 'creator', required: true },
        { model: User, as: 'updater', required: false },
        {
          model: Vault,
          as: 'vault',
          ...(organizationId ? { where: { organizationId } } : {}),
          include: [{ model: VaultMember, required: true }],
          required: true,
        },
        {
          model: PasswordPermission,
          include: [
            { model: User, as: 'grantedBy', required: true },
            { model: User, as: 'user', required: true },
          ],
        },
      ],
    });
  }

  async findByIdInOrganization(id: string, organizationId?: string | null) {
    return this.model.findOne({
      where: { id },
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
