import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Password, PasswordPermission, User } from '../models';
import { BaseRepository } from './base.repository';

@Injectable()
export class PasswordPermissionRepository extends BaseRepository<PasswordPermission> {
  constructor(
    @InjectModel(PasswordPermission) model: typeof PasswordPermission,
  ) {
    super(model);
  }

  /**
   * Get all permissions for a password with user details
   */
  async getPasswordPermissions(
    passwordId: string,
  ): Promise<PasswordPermission[]> {
    return this.model.findAll({
      where: { passwordId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'username', 'publicKey'],
          required: true,
        },
        {
          model: User,
          as: 'grantedBy',
          attributes: ['id', 'username'],
          required: true,
        },
      ],
    });
  }

  /**
   * Get all passwords shared with a user, including password details and grantor
   */
  async findUserPermissionsWithDetails(
    userId: string,
  ): Promise<PasswordPermission[]> {
    return this.model.findAll({
      where: { userId },
      include: [
        {
          model: Password,
          required: true,
        },
        {
          model: User,
          as: 'grantedBy',
          attributes: ['id', 'username'],
          required: false,
        },
      ],
    });
  }

  /**
   * Get user's permission for a specific password
   */
  async getUserPermissionForPassword(
    passwordId: string,
    userId: string,
  ): Promise<PasswordPermission | null> {
    return this.model.findOne({
      where: { passwordId, userId },
    });
  }
}
