import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  OrganizationMember,
  Organization,
  Password,
  User,
  Vault,
  VaultMember,
} from '../../../database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
  PasswordRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from '../../../database/repositories';
import { VaultsController } from './vaults.controller';
import { VaultsService } from './vaults.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { TenantAccessGuard } from 'src/common/guards/tenant-access.guard';
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { FamilyRoleGuard } from 'src/common/guards/family-role.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Vault,
      VaultMember,
      Password,
      OrganizationMember,
      Organization,
    ]),
    LoggerModule,
  ],
  controllers: [VaultsController],
  providers: [
    VaultsService,
    UsersRepository,
    VaultRepository,
    VaultMemberRepository,
    PasswordRepository,
    OrganizationMemberRepository,
    OrganizationRepository,
    TenantAccessGuard,
    OrganizationRoleGuard,
    FamilyRoleGuard,
  ],
  exports: [VaultsService],
})
export class VaultsModule {}
