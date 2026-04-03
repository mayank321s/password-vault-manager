import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { LoggingService } from 'src/common/logger/logger.service';
import { Password } from 'src/database/models';
import {
  OneTimeShareRepository,
  PasswordPermissionRepository,
  PasswordRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from 'src/database/repositories';
import {
  AccessOneTimeShareResponseDto,
  CreateOneTimeShareDto,
  CreatePasswordDto,
  GrantPasswordPermissionDto,
  OneTimeShareResponseDto,
  PasswordPermissionResponseDto,
  PasswordResponseDto,
  RefreshPasswordSharesDto,
  SharedPasswordItemDto,
  UpdatePasswordDto,
} from './dto';
import { PasswordPermissionLevel } from '@repo/shared';

@Injectable()
export class PasswordsService {
  constructor(
    private readonly passwordRepository: PasswordRepository,
    private readonly vaultMemberRepository: VaultMemberRepository,
    private readonly passwordPermissionRepository: PasswordPermissionRepository,
    private readonly usersRepository: UsersRepository,
    private readonly oneTimeShareRepository: OneTimeShareRepository,
    private readonly vaultRepository: VaultRepository,
    private readonly sequelize: Sequelize,
    private readonly logger: LoggingService,
  ) {}

  /**
   * Create a new password or secure note in a vault
   *
   * AUTHORIZATION: User must be a member of the vault
   * ZERO-KNOWLEDGE: Server stores encrypted data without seeing unencrypted content
   */
  async createPassword(
    userId: string,
    request: CreatePasswordDto,
  ): Promise<PasswordResponseDto> {
    try {
      // Verify user is a vault member
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: request.vaultId,
        userId,
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this vault');
      }

      // Create password
      const password = await this.sequelize.transaction(async (transaction) => {
        return this.passwordRepository.create(
          {
            vaultId: request.vaultId,
            name: request.name,
            encryptedData: request.encryptedData,
            isNote: request.isNote,
            createdByUserId: userId,
          },
          transaction,
        );
      });

      this.logger.debug('Password created', {
        passwordId: password.id,
        vaultId: request.vaultId,
        userId,
        isNote: request.isNote,
      });

      return this.buildBasicPasswordResponse(password);
    } catch (error) {
      this.logger.error('Failed to create password', {
        userId,
        vaultId: request.vaultId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get password details by ID
   *
   * AUTHORIZATION:
   * - Vault members can access
   * - Users with individual permission (viewer or editor) can access
   *
   * RETURNS: Encrypted password data for client-side decryption
   */
  async getPassword(
    userId: string,
    passwordId: string,
  ): Promise<PasswordResponseDto> {
    try {
      const password =
        await this.passwordRepository.getPasswordDetails(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      // Check vault membership first
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      let hasAccess = !!membership;
      let isShared = false;
      let sharedPasswordEncryptedKey: string | undefined;
      let sharedEncryptedData: string | undefined;
      if (!hasAccess) {
        const permission =
          await this.passwordPermissionRepository.getUserPermissionForPassword(
            passwordId,
            userId,
          );
        if (permission) {
          isShared = true;
          hasAccess = true;
          sharedPasswordEncryptedKey = permission.passwordEncryptedKey;
          sharedEncryptedData = permission.encryptedData;
        }
      }

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this password');
      }

      const vaultMemberIds = new Set(
        password.vault.members.map((m) => m.userId),
      );

      const externalShares = isShared
        ? []
        : password.permissions
            .filter((permission) => !vaultMemberIds.has(permission.userId))
            .map((permission) => ({
              userId: permission.userId,
              userEmail: permission.user.email,
              userName: permission.user.username ?? null,
              permission: permission.permission,
            }));

      return {
        id: password.id,
        name: password.name,
        encryptedData: isShared
          ? (sharedEncryptedData ?? '')
          : password.encryptedData,
        isNote: password.isNote,
        vaultId: password.vaultId,
        vaultName: password.vault.name ?? '',
        createdBy: password.createdByUserId,
        createdByUserName: password.creator.username ?? null,
        updatedByUserName: password.updater?.username ?? null,
        externalShares,
        passwordEncryptedKey: sharedPasswordEncryptedKey,
        createdAt: password.createdAt,
        updatedAt: password.updatedAt,
      };
    } catch (error) {
      this.logger.error('Failed to get password', {
        userId,
        passwordId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update password data
   *
   * AUTHORIZATION:
   * - Vault members (owner/manager/team_member) can update
   * - Users with individual "editor" permission can update
   * - Users with only "viewer" permission cannot update
   *
   * SECURITY: Only encrypted data and name can be updated
   * CLIENT RESPONSIBILITY: Re-encrypt with current vault key before updating
   */
  async updatePassword(
    userId: string,
    passwordId: string,
    request: UpdatePasswordDto,
  ): Promise<PasswordResponseDto> {
    try {
      // Get password
      const password = await this.passwordRepository.findById(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      // Check vault membership first
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      // If user is a vault member, they can update (any role)
      let hasAccess = !!membership;

      // If not a vault member, check individual password permissions
      if (!hasAccess) {
        const permission =
          await this.passwordPermissionRepository.getUserPermissionForPassword(
            passwordId,
            userId,
          );

        // User must have "editor" permission (not just "viewer")
        if (
          permission &&
          permission.permission === PasswordPermissionLevel.EDITOR
        ) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have permission to update this password',
        );
      }

      // Update password
      const updatedPassword = await this.sequelize.transaction(
        async (transaction) => {
          return this.passwordRepository.update(
            passwordId,
            {
              ...(request.name && { name: request.name }),
              ...(request.encryptedData && {
                encryptedData: request.encryptedData,
              }),
              updatedByUserId: userId,
            },
            transaction,
          );
        },
      );

      this.logger.debug('Password updated', {
        passwordId,
        vaultId: password.vaultId,
        userId,
        isVaultMember: !!membership,
      });

      return this.buildBasicPasswordResponse(updatedPassword!);
    } catch (error) {
      this.logger.error('Failed to update password', {
        userId,
        passwordId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Delete password
   *
   * AUTHORIZATION: User must be a member of the vault
   * CASCADE: Automatically deletes associated permissions and shares
   */
  async deletePassword(
    userId: string,
    passwordId: string,
  ): Promise<{ success: boolean }> {
    try {
      // Get password
      const password = await this.passwordRepository.findById(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      // Verify user is a vault member
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this password');
      }

      // Verify user is the creator
      if (password.createdByUserId !== userId) {
        throw new ForbiddenException(
          'Only the creator can delete this password',
        );
      }

      // Delete password (cascade deletes permissions and shares)
      await this.sequelize.transaction(async (transaction) => {
        await this.passwordRepository.delete({ id: passwordId }, transaction);
      });

      this.logger.debug('Password deleted', {
        passwordId,
        vaultId: password.vaultId,
        userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete password', {
        userId,
        passwordId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // ============================================
  // Password Permission Management (Phase 5.2)
  // ============================================

  /**
   * Grant individual access to a password
   * Allows sharing passwords with users outside of vault
   *
   * AUTHORIZATION: Only password creator or vault owner/manager can grant access
   * ZERO-KNOWLEDGE: Client encrypts password key with recipient's public key
   */
  async grantPasswordPermission(
    userId: string,
    passwordId: string,
    request: GrantPasswordPermissionDto,
  ): Promise<PasswordPermissionResponseDto> {
    try {
      // Get password
      const password = await this.passwordRepository.findById(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      // Verify user has permission to share (vault member)
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this password');
      }

      // Find recipient user by email
      const recipientUser = await this.usersRepository.findOneBy({
        email: request.userEmail,
      });

      if (!recipientUser) {
        throw new NotFoundException('Recipient user not found');
      }

      // Check if permission already exists
      const existingPermission =
        await this.passwordPermissionRepository.findOneBy({
          passwordId,
          userId: recipientUser.id,
        });

      if (existingPermission) {
        throw new BadRequestException(
          'User already has access to this password',
        );
      }

      // Create permission
      const permission = await this.sequelize.transaction(
        async (transaction) => {
          return this.passwordPermissionRepository.create(
            {
              passwordId,
              userId: recipientUser.id,
              permission: PasswordPermissionLevel.VIEWER,
              passwordEncryptedKey: request.passwordEncryptedKey,
              encryptedData: request.encryptedData,
              grantedByUserId: userId,
            },
            transaction,
          );
        },
      );

      this.logger.debug('Password permission granted', {
        passwordId,
        grantedBy: userId,
        recipientId: recipientUser.id,
      });

      const grantorUser = await this.usersRepository.findById(userId);

      return {
        id: permission.id,
        passwordId: permission.passwordId,
        userId: recipientUser.id,
        userEmail: recipientUser.email,
        userName: recipientUser.username,
        permission: permission.permission,
        passwordEncryptedKey: permission.passwordEncryptedKey,
        // TODO: remove null
        grantedByUserName: grantorUser?.username ?? null,
        createdAt: permission.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to grant password permission', {
        userId,
        passwordId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * List all users with individual access to a password
   *
   * AUTHORIZATION: User must have access to the password (vault member or has permission)
   */
  async listPasswordPermissions(
    userId: string,
    passwordId: string,
  ): Promise<PasswordPermissionResponseDto[]> {
    try {
      // Get password
      const password = await this.passwordRepository.findById(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      // Verify user has access (vault member)
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this password');
      }

      // Get all permissions with user details
      const permissions =
        await this.passwordPermissionRepository.getPasswordPermissions(
          passwordId,
        );

      return permissions.map((perm) => ({
        id: perm.id,
        passwordId: perm.passwordId,
        userId: perm.userId,
        userEmail: perm.user.email,
        userName: perm.user.username,
        permission: perm.permission,
        passwordEncryptedKey: perm.passwordEncryptedKey,
        grantedByUserName: perm.grantedBy.username,
        recipientPublicKey: perm.user.publicKey,
        createdAt: perm.createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to list password permissions', {
        userId,
        passwordId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Revoke individual access to a password
   *
   * AUTHORIZATION: Only password creator or vault owner/manager can revoke access
   */
  async revokePasswordPermission(
    userId: string,
    passwordId: string,
    targetUserId: string,
  ): Promise<{ success: boolean }> {
    try {
      // Get password
      const password = await this.passwordRepository.findById(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      // Verify user has permission to revoke (vault member)
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this password');
      }

      // Check if permission exists
      const permission = await this.passwordPermissionRepository.findOneBy({
        passwordId,
        userId: targetUserId,
      });

      if (!permission) {
        throw new NotFoundException('Permission not found');
      }

      // Revoke permission
      await this.sequelize.transaction(async (transaction) => {
        await this.passwordPermissionRepository.delete(
          { passwordId, userId: targetUserId },
          transaction,
        );
      });

      this.logger.debug('Password permission revoked', {
        passwordId,
        revokedBy: userId,
        targetUserId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to revoke password permission', {
        userId,
        passwordId,
        targetUserId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // ============================================
  // One-Time Share Links (Phase 5.3)
  // ============================================

  /**
   * Refresh all individual share copies after a password is updated.
   *
   * Called client-side after every edit so recipients always hold the
   * latest version encrypted with their own share-specific key.
   *
   * AUTHORIZATION: User must be a vault member
   * ZERO-KNOWLEDGE: Client re-encrypts updated content for each recipient
   */
  async refreshPasswordShares(
    userId: string,
    passwordId: string,
    request: RefreshPasswordSharesDto,
  ): Promise<{ success: boolean }> {
    try {
      const password = await this.passwordRepository.findById(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this password');
      }

      await this.sequelize.transaction(async (transaction) => {
        for (const share of request.shares) {
          await this.passwordPermissionRepository.updateWhere(
            { passwordId, userId: share.userId },
            {
              passwordEncryptedKey: share.passwordEncryptedKey,
              encryptedData: share.encryptedData,
            },
            transaction,
          );
        }
      });

      this.logger.debug('Password shares refreshed', {
        passwordId,
        userId,
        shareCount: request.shares.length,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to refresh password shares', {
        userId,
        passwordId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Create a one-time share link for a password
   *
   * AUTHORIZATION: User must have access to the password (vault member or has permission)
   * ZERO-KNOWLEDGE: Client encrypts password with random 256-bit key
   * SECURITY: Server never sees the encryption key (stored in URL fragment on client)
   */
  async createOneTimeShare(
    userId: string,
    passwordId: string,
    request: CreateOneTimeShareDto,
  ): Promise<OneTimeShareResponseDto> {
    try {
      // Get password
      const password = await this.passwordRepository.findById(passwordId);

      if (!password) {
        throw new NotFoundException('Password not found');
      }

      // Check if user has access (vault member or individual permission)
      const membership = await this.vaultMemberRepository.findOneBy({
        vaultId: password.vaultId,
        userId,
      });

      let hasAccess = !!membership;

      if (!hasAccess) {
        const permission =
          await this.passwordPermissionRepository.getUserPermissionForPassword(
            passwordId,
            userId,
          );
        hasAccess = !!permission;
      }

      if (!hasAccess) {
        throw new ForbiddenException('You do not have access to this password');
      }

      // Calculate expiration time
      const expiresAt = new Date();
      const expirationHours =
        expiresAt.getHours() + (request.expirationHours ?? 0);
      expiresAt.setHours(expirationHours);

      // Create one-time share
      const share = await this.sequelize.transaction(async (transaction) => {
        return this.oneTimeShareRepository.create(
          {
            passwordId,
            encryptedBlob: request.encryptedBlob,
            createdByUserId: userId,
            expiresAt,
            isUsed: false,
          },
          transaction,
        );
      });

      this.logger.debug('One-time share created', {
        shareId: share.id,
        passwordId,
        userId,
        expiresAt,
      });

      return {
        shareId: share.id,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to create one-time share', {
        userId,
        passwordId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Access a one-time share link
   *
   * SECURITY:
   * - Validates share exists and hasn't expired
   * - Validates share hasn't been used
   * - Marks share as used after successful retrieval
   * - Deletes share after access for security
   */
  async accessOneTimeShare(
    shareId: string,
  ): Promise<AccessOneTimeShareResponseDto> {
    try {
      // Find valid share (not expired and not used)
      const share = await this.oneTimeShareRepository.findValidShare(shareId);

      if (!share) {
        throw new NotFoundException(
          'Share link not found, expired, or already used',
        );
      }

      // Mark as used and delete in transaction
      await this.sequelize.transaction(async (transaction) => {
        await this.oneTimeShareRepository.markAsUsed(shareId);
        // Delete the share after marking as used for extra security
        await this.oneTimeShareRepository.delete({ id: shareId }, transaction);
      });

      this.logger.debug('One-time share accessed', {
        shareId,
        passwordId: share.passwordId,
      });

      return {
        encryptedBlob: share.encryptedBlob,
        expiresAt: share.expiresAt,
        createdAt: share.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to access one-time share', {
        shareId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // ============================================
  // Shared With Me (Phase 5.2)
  // ============================================

  /**
   * Get all passwords shared with the current user via individual permissions
   *
   * AUTHORIZATION: Authenticated user only — returns only their own shared passwords
   */
  async getSharedWithMe(userId: string): Promise<SharedPasswordItemDto[]> {
    try {
      const permissions =
        await this.passwordPermissionRepository.findUserPermissionsWithDetails(
          userId,
        );

      return permissions.map((perm) => ({
        id: perm.id,
        passwordId: perm.passwordId,
        passwordName: perm.password.name,
        isNote: perm.password.isNote,
        vaultId: perm.password.vaultId,
        permission: perm.permission as 'viewer' | 'editor',
        passwordEncryptedKey: perm.passwordEncryptedKey,
        grantedByUserName: perm.grantedBy.username,
        createdAt: perm.createdAt,
      }));
    } catch (error) {
      this.logger.error('Failed to get shared with me', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Build a basic PasswordResponseDto for create/update responses.
   * Fetches vault name and creator username; excludes external shares
   * (irrelevant immediately after a write operation).
   */
  private async buildBasicPasswordResponse(
    password: Password,
  ): Promise<PasswordResponseDto> {
    const [creator, vault] = await Promise.all([
      this.usersRepository.findById(password.createdByUserId),
      this.vaultRepository.findById(password.vaultId),
    ]);

    return {
      id: password.id,
      name: password.name,
      encryptedData: password.encryptedData,
      isNote: password.isNote,
      vaultId: password.vaultId,
      vaultName: vault?.name ?? '',
      createdBy: password.createdByUserId,
      createdByUserName: creator?.username ?? null,
      updatedByUserName: null,
      externalShares: [],
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    };
  }
}
