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
  OrganizationPolicy,
  OrganizationSubscription,
  Organization,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationPolicyRepository,
  OrganizationRepository,
  OrganizationSubscriptionRepository,
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
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { OrganizationPolicyGuard } from 'src/common/guards/organization-policy.guard';
import { EntitlementGuard } from 'src/common/guards/entitlement.guard';
import { FamilyRoleGuard } from 'src/common/guards/family-role.guard';

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
      Organization,
      OrganizationPolicy,
      OrganizationSubscription,
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
    OrganizationRepository,
    OrganizationPolicyRepository,
    OrganizationSubscriptionRepository,
    TenantAccessGuard,
    OrganizationRoleGuard,
    FamilyRoleGuard,
    OrganizationPolicyGuard,
    EntitlementGuard,
  ],
  exports: [PasswordsService],
})
export class PasswordsModule {}
