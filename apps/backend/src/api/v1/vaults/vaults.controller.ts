import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type CurrentUserData } from '../../../common/decorators';
import { TenantAccessGuard } from 'src/common/guards/tenant-access.guard';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
import { VaultsService } from './vaults.service';

@Controller()
@UseGuards(JwtAuthGuard, TenantAccessGuard)
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  /**
   * Create a new vault
   * POST /vaults
   *
   * SECURITY NOTES:
   * - vaultEncryptedKey is the vault's symmetric key encrypted with user's public key
   * - Only the creator (owner) can decrypt the vault key initially
   * - Members are added separately with their own encrypted keys
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createVault(
    @CurrentUser() user: CurrentUserData,
    @Body() request: CreateVaultRequestDto,
  ): Promise<VaultResponseDto> {
    return this.vaultsService.createVault(user.userId, user.organizationId, request);
  }

  /**
   * Get all vaults where user is a member
   * GET /vaults
   *
   * Returns vaults with vaultEncryptedKey for client-side decryption
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserVaults(
    @CurrentUser() user: CurrentUserData,
  ): Promise<VaultResponseDto[]> {
    return this.vaultsService.getUserVaults(user.userId, user.organizationId);
  }

  /**
   * Get vault details with members list
   * GET /vaults/:vaultId/members
   *
   * Requires user to be a vault member
   */
  @Get(':vaultId/members')
  @HttpCode(HttpStatus.OK)
  async getVaultDetails(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
  ): Promise<VaultMemberResponseDto> {
    return this.vaultsService.getVaultMembers(
      user.userId,
      user.organizationId,
      vaultId,
    );
  }

  /**
   * Get all passwords in a vault
   * GET /vaults/:vaultId/passwords
   *
   * CRITICAL DEPENDENCY for Phase 4.5 client-side re-encryption
   *
   * SECURITY NOTES:
   * - User must be a vault member to access passwords
   * - Returns encrypted passwords (server never sees unencrypted data)
   * - Used by client for vault key rotation and re-encryption
   *
   * RESPONSE:
   * - Returns array of encrypted passwords with metadata
   * - Client decrypts using vault key
   * - Used for re-encryption when removing members
   */
  @Get(':vaultId/passwords')
  @HttpCode(HttpStatus.OK)
  async getVaultPasswords(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
    @Query() query: GetVaultPasswordsQueryDto,
  ): Promise<GetVaultPasswordsResponseDto> {
    return this.vaultsService.getVaultPasswords(
      user.userId,
      user.organizationId,
      vaultId,
      query,
    );
  }

  /**
   * Update vault name
   * PATCH /vaults/:vaultId
   *
   * Only owner can update vault
   */
  @Patch(':vaultId')
  @HttpCode(HttpStatus.OK)
  async updateVault(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
    @Body() updateVaultDto: UpdateVaultRequestDto,
  ): Promise<{ success: true }> {
    return this.vaultsService.updateVault(
      user.userId,
      user.organizationId,
      vaultId,
      updateVaultDto,
    );
  }

  /**
   * Delete vault
   * DELETE /vaults/:vaultId
   *
   * RESTRICTIONS:
   * - Only owner can delete
   * - Cannot delete personal vault
   * - Cascade deletes all passwords and members
   */
  @Delete(':vaultId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVault(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
  ): Promise<void> {
    return this.vaultsService.deleteVault(
      user.userId,
      user.organizationId,
      vaultId,
    );
  }

  // ============================================
  // Vault Member Management Endpoints
  // ============================================

  /**
   * Add member to vault
   * POST /vaults/:vaultId/members
   *
   * SECURITY NOTES:
   * - Only owner or manager can add members
   * - Client must encrypt vault key with new member's public key
   * - Server stores the encrypted vault key for the new member
   */
  @Post(':vaultId/members')
  @HttpCode(HttpStatus.CREATED)
  async addVaultMember(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
    @Body() addMemberDto: AddVaultMemberRequestDto,
  ): Promise<SuccessResponseDto> {
    return this.vaultsService.addVaultMember(
      user.userId,
      user.organizationId,
      vaultId,
      addMemberDto,
    );
  }

  /**
   * Update member role
   * PATCH /vaults/:vaultId/members/:memberId
   *
   * Only owner can change roles
   * Cannot change owner role
   */
  @Patch(':vaultId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async updateVaultMemberRole(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
    @Param('memberId') memberId: string,
    @Body() updateRoleDto: UpdateVaultMemberRoleRequestDto,
  ): Promise<SuccessResponseDto> {
    return this.vaultsService.updateVaultMemberRole(
      user.userId,
      user.organizationId,
      vaultId,
      memberId,
      updateRoleDto,
    );
  }

  /**
   * Remove member from vault with REQUIRED re-encryption
   * DELETE /vaults/:vaultId/members/:memberId
   *
   * SECURITY GUARANTEE:
   * - Re-encryption is MANDATORY - no insecure fallback option
   * - All passwords re-encrypted with new vault key
   * - All remaining members receive new encrypted vault key
   * - Removed member's cached key becomes useless immediately
   * - Atomic operation ensures consistency
   *
   * CLIENT MUST PROVIDE:
   * - reEncryptionData.memberKeys: New vault key encrypted for each remaining member
   * - reEncryptionData.reEncryptedPasswords: All passwords re-encrypted with new key
   *
   * This endpoint will REJECT requests without complete re-encryption data.
   */
  @Delete(':vaultId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeVaultMember(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
    @Param('memberId') memberId: string,
    @Body() request: RotateVaultKeysRequestDto,
  ): Promise<SuccessResponseDto> {
    return this.vaultsService.removeMemberWithReEncryption(
      user.userId,
      user.organizationId,
      vaultId,
      memberId,
      request,
    );
  }

  // ============================================
  // Vault Security: Key Rotation & Re-encryption
  // ============================================

  /**
   * Rotate vault keys - re-encrypt all data with new vault key
   * POST /vaults/:vaultId/rotate-keys
   *
   * CLIENT RESPONSIBILITIES:
   * 1. Generate new random vault key (256-bit AES key)
   * 2. Decrypt all passwords with old vault key
   * 3. Re-encrypt all passwords with new vault key
   * 4. Encrypt new vault key with each member's public key
   * 5. Send all re-encrypted data to this endpoint
   *
   * This is an atomic operation - all updates succeed or fail together.
   */
  @Post(':vaultId/rotate-keys')
  @HttpCode(HttpStatus.OK)
  async rotateVaultKeys(
    @CurrentUser() user: CurrentUserData,
    @Param('vaultId') vaultId: string,
    @Body() rotateKeysDto: RotateVaultKeysRequestDto,
  ): Promise<SuccessResponseDto> {
    return this.vaultsService.rotateVaultKeys(
      user.userId,
      user.organizationId,
      vaultId,
      rotateKeysDto,
    );
  }
}
