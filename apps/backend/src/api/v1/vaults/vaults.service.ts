import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InferCreationAttributes, Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { LoggingService } from 'src/common/logger/logger.service';
import { Password, Vault, VaultMember } from 'src/database/models';
import { VaultMemberRole } from 'src/database/models/vault-member.model';
import {
  PasswordRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from 'src/database/repositories';
import {
  AddVaultMemberRequestDto,
  CreateVaultRequestDto,
  GetVaultPasswordsQueryDto,
  GetVaultPasswordsResponseDto,
  RotateVaultKeysRequestDto,
  SuccessResponseDto,
  UpdateVaultMemberRoleRequestDto,
  UpdateVaultRequestDto,
  VaultMemberResponseDto,
  VaultResponseDto,
} from './dto';

@Injectable()
export class VaultsService {
  constructor(
    private readonly vaultRepository: VaultRepository,
    private readonly vaultMemberRepository: VaultMemberRepository,
    private readonly usersRepository: UsersRepository,
    private readonly sequelize: Sequelize,
    private readonly logger: LoggingService,
    private readonly passwordRepository: PasswordRepository,
  ) {
    this.logger.debug('Logger initialized for VaultsService');
  }

  /**
   * Create a new vault
   * - Creates vault owned by current user
   * - Adds creator as vault member with 'owner' role
   */
  async createVault(
    userId: string,
    request: CreateVaultRequestDto,
  ): Promise<VaultResponseDto> {
    try {
      const vault = await this.sequelize.transaction(async (transaction) => {
        const vault = await this.vaultRepository.create(
          {
            name: request.name,
            isPersonalVault: false,
            ownerUserId: userId,
          },
          transaction,
        );

        // Add creator as vault member with 'owner' role
        await this.vaultMemberRepository.create(
          {
            vaultId: vault.id,
            userId: userId,
            userRole: VaultMemberRole.OWNER,
            vaultEncryptedKey: request.vaultEncryptedKey,
          },
          transaction,
        );
        return vault;
      });

      this.logger.debug('Vault created', {
        vaultId: vault.id,
        userId,
        vaultName: request.name,
      });

      return this.mapVaultToResponse(
        vault,
        request.vaultEncryptedKey,
        VaultMemberRole.OWNER,
      );
    } catch (error) {
      this.logger.error('Failed to create vault', {
        userId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get all vaults where user is a member
   * Returns vault list with encrypted keys for decryption
   */
  async getUserVaults(userId: string): Promise<VaultResponseDto[]> {
    try {
      // Find all vault memberships for the user
      const vaultMembers = await this.vaultMemberRepository.findAllBy({
        userId,
      });

      if (vaultMembers.length === 0) {
        return [];
      }

      // Get all vault IDs
      const vaultIds = vaultMembers.map((vm) => vm.vaultId);

      // Fetch all vaults
      const vaults = await this.vaultRepository.findAllBy({
        id: { [Op.in]: vaultIds },
      });

      // Map vaults to response with encrypted keys
      return vaults.map((vault) => {
        const vaultMember = vaultMembers.find((vm) => vm.vaultId === vault.id);
        return this.mapVaultToResponse(
          vault,
          vaultMember?.vaultEncryptedKey || '',
          vaultMember?.userRole || VaultMemberRole.TEAM_MEMBER,
        );
      });
    } catch (error) {
      this.logger.error('Failed to get user vaults', {
        userId,
        error,
      });
      throw error;
    }
  }

  /**
   * Get vault details with members list
   * Verifies user has access to vault
   */
  async getVaultMembers(
    userId: string,
    vaultId: string,
  ): Promise<VaultMemberResponseDto> {
    try {
      // Verify user has access to this vault
      const userMembership = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId,
      });

      if (!userMembership) {
        throw new ForbiddenException('You do not have access to this vault');
      }

      // Fetch vault with members
      const vault = await this.vaultRepository.getVaultMembers(vaultId);

      if (!vault) {
        throw new NotFoundException('Vault not found');
      }

      const members: VaultMemberResponseDto['members'] = vault.members.map(
        (member: VaultMember) => ({
          id: member.id,
          userId: member.userId,
          userEmail: member.user.email,
          userName: member.user.username,
          userRole: member.userRole,
          vaultEncryptedKey: member.vaultEncryptedKey,
          joinedAt: member.joinedAt,
          publicKey: member.user.publicKey,
        }),
      );

      return { members };
    } catch (error) {
      this.logger.error('Failed to get vault details', {
        userId,
        vaultId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get all passwords in a vault
   * CRITICAL DEPENDENCY for Phase 4.5 client-side re-encryption
   *
   * SECURITY NOTES:
   * - User must be a vault member to access passwords
   * - Returns encrypted passwords (server never sees unencrypted data)
   * - Used by client for vault key rotation and re-encryption
   */
  async getVaultPasswords(
    userId: string,
    vaultId: string,
    query: GetVaultPasswordsQueryDto,
  ): Promise<GetVaultPasswordsResponseDto> {
    try {
      const userMembership = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId,
      });

      if (!userMembership) {
        throw new ForbiddenException('You do not have access to this vault');
      }

      const { rows, count } = await this.passwordRepository.getVaultPasswords(
        vaultId,
        {
          withEncryptedData: query.withEncryptedData,
          page: query.page,
          limit: query.limit,
        },
      );

      return {
        passwords: rows.map((password) => ({
          id: password.id,
          name: password.name,
          isNote: password.isNote,
          ...(query.withEncryptedData && {
            encryptedData: password.encryptedData,
          }),
        })),
        total: count,
        page: query.page,
        limit: query.limit,
      };
    } catch (error) {
      this.logger.error('Failed to get vault passwords', {
        userId,
        vaultId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update vault name
   * Only owner can update
   */
  async updateVault(
    userId: string,
    vaultId: string,
    updateVaultDto: UpdateVaultRequestDto,
  ): Promise<{ success: true }> {
    try {
      // Get vault and verify ownership
      const vault = await this.vaultRepository.findById(vaultId);

      if (!vault) {
        throw new NotFoundException('Vault not found');
      }

      if (vault.ownerUserId !== userId) {
        throw new ForbiddenException('Only the vault owner can update it');
      }

      // Update vault
      await this.sequelize.transaction(async (transaction) => {
        return this.vaultRepository.update(
          vaultId,
          {
            name: updateVaultDto.name,
          },
          transaction,
        );
      });

      this.logger.debug('Vault updated', {
        vaultId,
        userId,
        newName: updateVaultDto.name,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to update vault', {
        userId,
        vaultId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Delete vault
   * - Only owner can delete
   * - Cannot delete personal vault
   * - Cascade delete all passwords in vault
   */
  async deleteVault(userId: string, vaultId: string): Promise<void> {
    try {
      // Get vault and verify ownership
      const vault = await this.vaultRepository.findById(vaultId);

      if (!vault) {
        throw new NotFoundException('Vault not found');
      }

      if (vault.ownerUserId !== userId) {
        throw new ForbiddenException('Only the vault owner can delete it');
      }

      if (vault.isPersonalVault) {
        throw new BadRequestException('Cannot delete personal vault');
      }

      await this.sequelize.transaction(async (transaction) => {
        // Delete vault (cascade will handle members and passwords)
        return this.vaultRepository.delete({ id: vaultId }, transaction);
      });

      this.logger.debug('Vault deleted', {
        vaultId,
        userId,
      });
    } catch (error) {
      this.logger.error('Failed to delete vault', {
        userId,
        vaultId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Add member to vault
   * Only owner or manager can add members
   * Client encrypts vault key with new member's public key
   */
  async addVaultMember(
    userId: string,
    vaultId: string,
    request: AddVaultMemberRequestDto,
  ): Promise<SuccessResponseDto> {
    try {
      // Verify user has permission to add members (owner or manager)
      const userMembership = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId,
      });

      if (!userMembership) {
        throw new ForbiddenException('You do not have access to this vault');
      }

      if (
        userMembership.userRole !== VaultMemberRole.OWNER &&
        userMembership.userRole !== VaultMemberRole.MANAGER
      ) {
        throw new ForbiddenException(
          'Only vault owners and managers can add members',
        );
      }

      // Find user by email
      const newMember = await this.usersRepository.findOneBy({
        email: request.userEmail,
      });

      if (!newMember) {
        throw new NotFoundException('User not found');
      }

      // Check if user is already a member
      const existingMembership = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId: newMember.id,
      });

      if (existingMembership) {
        throw new BadRequestException('User is already a member of this vault');
      }

      await this.sequelize.transaction(async (transaction) => {
        return this.vaultMemberRepository.create(
          {
            vaultId,
            userId: newMember.id,
            userRole: request.userRole,
            vaultEncryptedKey: request.vaultEncryptedKey,
          },
          transaction,
        );
      });

      this.logger.debug('Vault member added', {
        vaultId,
        addedBy: userId,
        newMemberId: newMember.id,
        role: request.userRole,
      });

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error('Failed to add vault member', {
        userId,
        vaultId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Update member role
   * Only owner can change roles
   * Cannot change owner role
   */
  async updateVaultMemberRole(
    userId: string,
    vaultId: string,
    memberId: string,
    request: UpdateVaultMemberRoleRequestDto,
  ): Promise<SuccessResponseDto> {
    try {
      // Verify vault ownership
      const vault = await this.vaultRepository.findById(vaultId);

      if (!vault) {
        throw new NotFoundException('Vault not found');
      }

      if (vault.ownerUserId !== userId) {
        throw new ForbiddenException('Only the vault owner can change roles');
      }

      // Get member
      const member = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId: memberId,
      });

      if (!member) {
        throw new NotFoundException('Member not found in this vault');
      }

      // Cannot change owner role
      if (member.userRole === VaultMemberRole.OWNER) {
        throw new BadRequestException('Cannot change owner role');
      }

      // Update role
      await this.sequelize.transaction(async (transaction) => {
        await this.vaultMemberRepository.updateWhere(
          { vaultId, userId: memberId },
          { userRole: request.userRole },
          transaction,
        );
      });

      await this.vaultMemberRepository.getUser(vaultId, memberId);

      this.logger.debug('Vault member role updated', {
        vaultId,
        updatedBy: userId,
        memberId,
        newRole: request.userRole,
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to update vault member role', {
        userId,
        vaultId,
        memberId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Remove member from vault
   * Only owner or manager can remove members
   * Cannot remove owner
   */
  async removeVaultMember(
    userId: string,
    vaultId: string,
    memberId: string,
  ): Promise<void> {
    try {
      // Verify user has permission (owner or manager)
      const userMembership = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId,
      });

      if (!userMembership) {
        throw new ForbiddenException('You do not have access to this vault');
      }

      if (
        userMembership.userRole !== VaultMemberRole.OWNER &&
        userMembership.userRole !== VaultMemberRole.MANAGER
      ) {
        throw new ForbiddenException(
          'Only vault owners and managers can remove members',
        );
      }

      // Get member to remove
      const memberToRemove = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId: memberId,
      });

      if (!memberToRemove) {
        throw new NotFoundException('Member not found in this vault');
      }

      // Cannot remove owner
      if (
        memberToRemove.userRole === VaultMemberRole.OWNER ||
        memberToRemove.userRole === VaultMemberRole.MANAGER
      ) {
        throw new BadRequestException('Cannot remove vault owner or manager');
      }

      // Remove member
      await this.sequelize.transaction(async (transaction) => {
        await this.vaultMemberRepository.delete(
          { vaultId, userId: memberId },
          transaction,
        );
      });

      this.logger.debug('Vault member removed', {
        vaultId,
        removedBy: userId,
        removedMemberId: memberId,
      });
    } catch (error) {
      this.logger.error('Failed to remove vault member', {
        userId,
        vaultId,
        memberId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Remove member from vault with REQUIRED re-encryption
   * Ensures secure member removal by always rotating vault keys
   *
   * SECURITY GUARANTEE: Re-encryption is mandatory. Removed members cannot access vault data.
   */
  async removeMemberWithReEncryption(
    userId: string,
    vaultId: string,
    memberId: string,
    request: RotateVaultKeysRequestDto,
  ): Promise<{
    success: boolean;
    passwordsUpdated: number;
    membersUpdated: number;
  }> {
    try {
      // Verify user has permission (owner or manager)
      const userMembership = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId,
      });

      if (!userMembership) {
        throw new ForbiddenException('You do not have access to this vault');
      }

      if (
        userMembership.userRole !== VaultMemberRole.OWNER &&
        userMembership.userRole !== VaultMemberRole.MANAGER
      ) {
        throw new ForbiddenException(
          'Only vault owners and managers can remove members',
        );
      }

      // Get member to remove
      const memberToRemove = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId: memberId,
      });

      if (!memberToRemove) {
        throw new NotFoundException('Member not found in this vault');
      }

      // Cannot remove owner
      if (memberToRemove.userRole === VaultMemberRole.OWNER) {
        throw new BadRequestException('Cannot remove vault owner');
      }

      // Perform secure removal with re-encryption (atomic operation)
      const result = await this.sequelize.transaction(async (transaction) => {
        // Remove the member first
        await this.vaultMemberRepository.delete(
          { vaultId, userId: memberId },
          transaction,
        );

        // Rotate vault keys for remaining members
        return this.performVaultKeyRotation(
          vaultId,
          request,
          transaction,
          memberId,
        );
      });

      this.logger.debug('Vault member removed securely with re-encryption', {
        vaultId,
        removedBy: userId,
        removedMemberId: memberId,
        passwordsUpdated: result.passwordsUpdated,
        membersUpdated: result.membersUpdated,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to remove vault member with re-encryption', {
        userId,
        vaultId,
        memberId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Rotate vault keys - re-encrypt all data with new vault key
   * Use this after removing a member to ensure they cannot access vault data
   *
   * CLIENT RESPONSIBILITIES:
   * 1. Decrypt vault key with their private key
   * 2. Generate new random vault key
   * 3. Fetch and decrypt all passwords with old key
   * 4. Re-encrypt all passwords with new key
   * 5. Fetch remaining members' public keys
   * 6. Encrypt new vault key with each member's public key
   * 7. Send all re-encrypted data to this endpoint
   */
  async rotateVaultKeys(
    userId: string,
    vaultId: string,
    rotateKeysDto: RotateVaultKeysRequestDto,
  ): Promise<{
    success: boolean;
    passwordsUpdated: number;
    membersUpdated: number;
  }> {
    try {
      // Verify user is vault owner or manager
      const userMembership = await this.vaultMemberRepository.findOneBy({
        vaultId,
        userId,
      });

      if (!userMembership) {
        throw new ForbiddenException('You do not have access to this vault');
      }

      if (
        userMembership.userRole !== VaultMemberRole.OWNER &&
        userMembership.userRole !== VaultMemberRole.MANAGER
      ) {
        throw new ForbiddenException(
          'Only vault owners and managers can rotate vault keys',
        );
      }

      const result = await this.sequelize.transaction(async (transaction) => {
        return this.performVaultKeyRotation(
          vaultId,
          rotateKeysDto,
          transaction,
        );
      });

      this.logger.debug('Vault keys rotated successfully', {
        vaultId,
        rotatedBy: userId,
        passwordsUpdated: result.passwordsUpdated,
        membersUpdated: result.membersUpdated,
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to rotate vault keys', {
        userId,
        vaultId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * PRIVATE: Perform the actual vault key rotation
   * Updates member keys and re-encrypts all passwords
   */
  private async performVaultKeyRotation(
    vaultId: string,
    request: RotateVaultKeysRequestDto,
    transaction: Transaction,
    excludeMemberId?: string, // Optional member ID to exclude (used for removeMemberWithReEncryption)
  ): Promise<{
    success: boolean;
    passwordsUpdated: number;
    membersUpdated: number;
  }> {
    // Get all current members (excluding the removed member if applicable)
    let currentMembers = await this.vaultMemberRepository.findAllBy({
      vaultId,
    });

    if (excludeMemberId) {
      currentMembers = currentMembers.filter(
        (m) => m.userId !== excludeMemberId,
      );
    }

    // Validate that all remaining members have new encrypted keys
    const providedMemberIds = new Set(request.memberKeys.map((k) => k.userId));
    const remainingMemberIds = new Set(currentMembers.map((m) => m.userId));

    // Check for missing members
    const missingMembers = [...remainingMemberIds].filter(
      (id) => !providedMemberIds.has(id),
    );
    if (missingMembers.length > 0) {
      throw new BadRequestException(
        `Missing encrypted vault keys for members: ${missingMembers.join(', ')}`,
      );
    }

    // Check for extra members (security check)
    const extraMembers = [...providedMemberIds].filter(
      (id) => !remainingMemberIds.has(id),
    );
    if (extraMembers.length > 0) {
      throw new BadRequestException(
        `Provided keys for non-members: ${extraMembers.join(', ')}`,
      );
    }

    // Update all member encrypted keys
    let membersUpdated = 0;
    for (const memberKey of request.memberKeys) {
      await this.vaultMemberRepository.updateWhere(
        { vaultId, userId: memberKey.userId },
        { vaultEncryptedKey: memberKey.vaultEncryptedKey },
        transaction,
      );
      membersUpdated++;
    }

    // Update all password encrypted data
    let passwordsUpdated = 0;
    for (const password of request.reEncryptedPasswords) {
      const updateData: Partial<InferCreationAttributes<Password>> = {
        encryptedData: password.encryptedData,
      };

      if (password.name) {
        updateData.name = password.name;
      }

      await this.passwordRepository.updateWhere(
        { id: password.passwordId, vaultId },
        updateData,
        transaction,
      );
      passwordsUpdated++;
    }

    return {
      success: true,
      passwordsUpdated,
      membersUpdated,
    };
  }

  /**
   * Helper method to map Vault model to response DTO
   */
  private mapVaultToResponse(
    vault: Vault,
    vaultEncryptedKey: string,
    userRole: VaultMemberRole,
  ): VaultResponseDto {
    return {
      id: vault.id,
      name: vault.name,
      isPersonalVault: vault.isPersonalVault,
      vaultEncryptedKey,
      ownerUserId: vault.ownerUserId,
      createdAt: vault.createdAt,
      updatedAt: vault.updatedAt,
      userRole,
    };
  }
}
