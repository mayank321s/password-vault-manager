import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { ScimTokenAuthGuard } from 'src/common/guards/scim-token-auth.guard';
import {
  Organization,
  OrganizationMember,
  ScimProvisioningEvent,
  ScimToken,
  User,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
  ScimProvisioningEventRepository,
  ScimTokenRepository,
  UsersRepository,
} from 'src/database/repositories';
import { ScimAdminService } from './scim-admin.service';
import { ScimController } from './scim.controller';
import { ScimService } from './scim.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Organization,
      OrganizationMember,
      ScimProvisioningEvent,
      ScimToken,
      User,
    ]),
  ],
  controllers: [ScimController],
  providers: [
    ScimService,
    ScimAdminService,
    OrganizationRepository,
    OrganizationMemberRepository,
    ScimProvisioningEventRepository,
    ScimTokenRepository,
    UsersRepository,
    OrganizationRoleGuard,
    ScimTokenAuthGuard,
  ],
  exports: [ScimService, ScimAdminService],
})
export class ScimModule {}
