import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  EmergencyAccessGrant,
  Organization,
  OrganizationMember,
  User,
} from 'src/database/models';
import {
  EmergencyAccessGrantRepository,
  OrganizationMemberRepository,
  OrganizationRepository,
  UsersRepository,
} from 'src/database/repositories';
import { TenantAccessGuard } from 'src/common/guards/tenant-access.guard';
import { FamilyRoleGuard } from 'src/common/guards/family-role.guard';
import { EmergencyAccessController } from './emergency-access.controller';
import { EmergencyAccessService } from './emergency-access.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EmergencyAccessGrant,
      Organization,
      OrganizationMember,
      User,
    ]),
  ],
  controllers: [EmergencyAccessController],
  providers: [
    EmergencyAccessService,
    EmergencyAccessGrantRepository,
    OrganizationRepository,
    OrganizationMemberRepository,
    UsersRepository,
    TenantAccessGuard,
    FamilyRoleGuard,
  ],
})
export class EmergencyAccessModule {}
