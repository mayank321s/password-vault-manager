import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationRoleGuard } from 'src/common/guards/organization-role.guard';
import { AuditService } from 'src/common/services/audit.service';
import {
  AuditEvent,
  Organization,
  OrganizationMember,
} from 'src/database/models';
import {
  AuditEventRepository,
  OrganizationMemberRepository,
  OrganizationRepository,
} from 'src/database/repositories';
import { AuthModule } from '../auth/auth.module';
import { AuditController } from './audit.controller';
import { AuditApiService } from './audit.service';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([AuditEvent, Organization, OrganizationMember]),
  ],
  controllers: [AuditController],
  providers: [
    AuditApiService,
    AuditService,
    AuditEventRepository,
    OrganizationRepository,
    OrganizationMemberRepository,
    OrganizationRoleGuard,
  ],
  exports: [AuditService, AuditEventRepository],
})
export class AuditModule {}
