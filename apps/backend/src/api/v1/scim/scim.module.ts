import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Organization, OrganizationMember, User } from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationRepository,
  UsersRepository,
} from 'src/database/repositories';
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { ScimController } from './scim.controller';
import { ScimService } from './scim.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Organization, OrganizationMember, User]),
  ],
  controllers: [ScimController],
  providers: [
    ScimService,
    OrganizationRepository,
    OrganizationMemberRepository,
    UsersRepository,
    OrganizationRoleGuard,
  ],
  exports: [ScimService],
})
export class ScimModule {}
