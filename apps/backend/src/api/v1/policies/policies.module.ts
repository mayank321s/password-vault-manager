import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditEvent } from 'src/database/models';
import {
  Organization,
  OrganizationMember,
  OrganizationPolicy,
} from 'src/database/models';
import {
  AuditEventRepository,
  OrganizationMemberRepository,
  OrganizationPolicyRepository,
  OrganizationRepository,
} from 'src/database/repositories';
import { AuthModule } from '../auth/auth.module';
import { AuditService } from 'src/common/services/audit.service';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([
      Organization,
      OrganizationMember,
      OrganizationPolicy,
      AuditEvent,
    ]),
  ],
  controllers: [PoliciesController],
  providers: [
    PoliciesService,
    AuditService,
    AuditEventRepository,
    OrganizationRepository,
    OrganizationMemberRepository,
    OrganizationPolicyRepository,
  ],
})
export class PoliciesModule {}
