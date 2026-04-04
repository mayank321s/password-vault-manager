import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  OrganizationMember,
  Password,
  User,
  Vault,
  VaultMember,
} from '../../../database/models';
import {
  OrganizationMemberRepository,
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

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Vault,
      VaultMember,
      Password,
      OrganizationMember,
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
    TenantAccessGuard,
    OrganizationRoleGuard,
  ],
  exports: [VaultsService],
})
export class VaultsModule {}
