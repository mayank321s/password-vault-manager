import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  OrganizationMember,
  Password,
  VaultMember,
  PasswordPermission,
  User,
  OneTimeShare,
  Vault,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  PasswordRepository,
  VaultMemberRepository,
  PasswordPermissionRepository,
  UsersRepository,
  OneTimeShareRepository,
  VaultRepository,
} from 'src/database/repositories';
import { PasswordsController } from './passwords.controller';
import { PasswordsService } from './passwords.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { TenantAccessGuard } from 'src/common/guards/tenant-access.guard';

/**
 * Passwords Module
 * Handles password and secure note CRUD operations
 * Includes individual password permission management (Phase 5.2)
 * Includes one-time share links (Phase 5.3)
 *
 * DEPENDENCIES:
 * - Password model & repository for data access
 * - VaultMember model & repository for authorization checks
 * - PasswordPermission model & repository for individual sharing
 * - User model & repository for user lookups
 * - OneTimeShare model & repository for temporary share links
 * - JwtAuthGuard (imported via controller decorator)
 */
@Module({
  imports: [
    SequelizeModule.forFeature([
      Password,
      VaultMember,
      PasswordPermission,
      User,
      OneTimeShare,
      Vault,
      OrganizationMember,
    ]),
    LoggerModule,
  ],
  controllers: [PasswordsController],
  providers: [
    PasswordsService,
    PasswordRepository,
    VaultMemberRepository,
    PasswordPermissionRepository,
    UsersRepository,
    OneTimeShareRepository,
    VaultRepository,
    OrganizationMemberRepository,
    TenantAccessGuard,
  ],
  exports: [PasswordsService],
})
export class PasswordsModule {}
