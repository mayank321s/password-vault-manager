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
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  Public,
  type CurrentUserData,
} from '../../../common/decorators';
import { TenantAccessGuard } from 'src/common/guards/tenant-access.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
import { PasswordsService } from './passwords.service';
import { ZodResponse } from 'nestjs-zod';

/**
 * Passwords Controller
 * Manages password and secure note CRUD operations
 *
 * All endpoints require JWT authentication via JwtAuthGuard
 * Authorization is enforced at service layer (vault membership verification)
 */
@Controller()
@UseGuards(JwtAuthGuard, TenantAccessGuard)
export class PasswordsController {
  constructor(private readonly passwordsService: PasswordsService) {}

  /**
   * Create a new password or secure note
   * POST /passwords
   *
   * ZERO-KNOWLEDGE ARCHITECTURE:
   * - Client encrypts password data with vault key before sending
   * - Server stores encrypted blob without seeing content
   * - User must be a vault member to create passwords
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: PasswordResponseDto })
  async createPassword(
    @CurrentUser() user: CurrentUserData,
    @Body() createPasswordDto: CreatePasswordDto,
  ): Promise<PasswordResponseDto> {
    return this.passwordsService.createPassword(
      user.userId,
      user.organizationId,
      createPasswordDto,
    );
  }

  /**
   * Get all passwords shared with the current user
   * GET /passwords/shared-with-me
   *
   * AUTHORIZATION: Authenticated user only
   * NOTE: This route must be declared before :passwordId to avoid route conflict
   */
  // TODO: return object containing array instead of raw array for better extensibility in the future
  @Get('shared-with-me')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: SharedPasswordItemDto })
  async getSharedWithMe(
    @CurrentUser() user: CurrentUserData,
  ): Promise<SharedPasswordItemDto[]> {
    return this.passwordsService.getSharedWithMe(user.userId);
  }

  /**
   * Get password details by ID
   * GET /passwords/:passwordId
   *
   * AUTHORIZATION:
   * - Vault members can access (any role)
   * - Users with individual permission (viewer or editor) can access
   *
   * RETURNS: Encrypted password data for client-side decryption
   */
  @Get(':passwordId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: PasswordResponseDto })
  async getPassword(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
  ): Promise<PasswordResponseDto> {
    return this.passwordsService.getPassword(
      user.userId,
      user.organizationId,
      passwordId,
    );
  }

  /**
   * Update password data
   * PATCH /passwords/:passwordId
   *
   * AUTHORIZATION:
   * - Vault members (any role) can update
   * - Users with individual "editor" permission can update
   * - Users with only "viewer" permission CANNOT update
   *
   * SECURITY NOTES:
   * - Only encrypted data and name can be updated
   * - vaultId and isNote are immutable
   * - Client must re-encrypt with current vault key
   */
  @Patch(':passwordId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: PasswordResponseDto })
  async updatePassword(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<PasswordResponseDto> {
    return this.passwordsService.updatePassword(
      user.userId,
      user.organizationId,
      passwordId,
      updatePasswordDto,
    );
  }

  /**
   * Delete password
   * DELETE /passwords/:passwordId
   *
   * AUTHORIZATION: User must be a vault member
   * CASCADE: Automatically deletes associated permissions and shares
   */
  @Delete(':passwordId')
  @HttpCode(HttpStatus.OK)
  async deletePassword(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
  ): Promise<{ success: boolean }> {
    return this.passwordsService.deletePassword(
      user.userId,
      user.organizationId,
      passwordId,
    );
  }

  // ============================================
  // Password Permission Endpoints (Phase 5.2)
  // ============================================

  /**
   * Grant individual access to a password
   * POST /passwords/:passwordId/permissions
   *
   * AUTHORIZATION: User must be a vault member
   * ZERO-KNOWLEDGE: Client encrypts password key with recipient's public key
   */
  @Post(':passwordId/permissions')
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({
    status: HttpStatus.CREATED,
    type: PasswordPermissionResponseDto,
  })
  async grantPasswordPermission(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
    @Body() grantPermissionDto: GrantPasswordPermissionDto,
  ): Promise<PasswordPermissionResponseDto> {
    return this.passwordsService.grantPasswordPermission(
      user.userId,
      user.organizationId,
      passwordId,
      grantPermissionDto,
    );
  }

  /**
   * List all users with access to a password
   * GET /passwords/:passwordId/permissions
   *
   * AUTHORIZATION: User must be a vault member
   *
   * RESPONSE: Array of PasswordPermissionResponseDto
   */
  // TODO: return object containing array instead of raw array for better extensibility in the future
  @Get(':passwordId/permissions')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({
    status: HttpStatus.OK,
    type: PasswordPermissionResponseDto,
  })
  async listPasswordPermissions(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
  ): Promise<PasswordPermissionResponseDto[]> {
    return this.passwordsService.listPasswordPermissions(
      user.userId,
      user.organizationId,
      passwordId,
    );
  }

  /**
   * Refresh share encrypted data after a password is edited
   * PATCH /passwords/:passwordId/permissions
   *
   * AUTHORIZATION: User must be a vault member
   * ZERO-KNOWLEDGE: Client re-encrypts updated password data for each recipient
   */
  @Patch(':passwordId/permissions')
  @HttpCode(HttpStatus.OK)
  async refreshPasswordShares(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
    @Body() refreshSharesDto: RefreshPasswordSharesDto,
  ): Promise<{ success: boolean }> {
    return this.passwordsService.refreshPasswordShares(
      user.userId,
      user.organizationId,
      passwordId,
      refreshSharesDto,
    );
  }

  /**
   * Revoke individual access to a password
   * DELETE /passwords/:passwordId/permissions/:userId
   *
   * AUTHORIZATION: User must be a vault member
   */
  @Delete(':passwordId/permissions/:userId')
  @HttpCode(HttpStatus.OK)
  async revokePasswordPermission(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
    @Param('userId') targetUserId: string,
  ): Promise<{ success: boolean }> {
    return this.passwordsService.revokePasswordPermission(
      user.userId,
      user.organizationId,
      passwordId,
      targetUserId,
    );
  }

  // ============================================
  // One-Time Share Link Endpoints (Phase 5.3)
  // ============================================

  /**
   * Create a one-time share link for a password
   * POST /passwords/:passwordId/share
   *
   * AUTHORIZATION: User must have access to the password
   * ZERO-KNOWLEDGE: Client encrypts password with random 256-bit key
   */
  @Post(':passwordId/share')
  @HttpCode(HttpStatus.CREATED)
  @ZodResponse({ status: HttpStatus.CREATED, type: OneTimeShareResponseDto })
  async createOneTimeShare(
    @CurrentUser() user: CurrentUserData,
    @Param('passwordId') passwordId: string,
    @Body() createShareDto: CreateOneTimeShareDto,
  ): Promise<OneTimeShareResponseDto> {
    return this.passwordsService.createOneTimeShare(
      user.userId,
      user.organizationId,
      passwordId,
      createShareDto,
    );
  }

  /**
   * Access a one-time share link
   * GET /share/:shareId
   *
   * PUBLIC ENDPOINT - No authentication required
   *
   * SECURITY:
   * - Share must exist and not be expired
   * - Share must not have been used before
   * - Share is marked as used and deleted after access
   * - Returns encrypted blob (client has key in URL fragment)
   */
  @Public()
  @Get('/share/:shareId')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ status: HttpStatus.OK, type: AccessOneTimeShareResponseDto })
  async accessOneTimeShare(
    @Param('shareId') shareId: string,
  ): Promise<AccessOneTimeShareResponseDto> {
    return this.passwordsService.accessOneTimeShare(shareId);
  }
}
