import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuditService } from 'src/common/services/audit.service';
import {
  AuditEvent,
  Organization,
  OrganizationMember,
  SsoConfiguration,
  SsoVerifiedDomain,
} from 'src/database/models';
import {
  AuditEventRepository,
  OrganizationMemberRepository,
  OrganizationRepository,
  SsoConfigurationRepository,
  SsoVerifiedDomainRepository,
} from 'src/database/repositories';
import { ssoConfiguration, SsoConfig } from 'src/config/sso.config';
import { SsoController } from './sso.controller';
import { SsoService } from './sso.service';

@Module({
  imports: [
    ConfigModule.forFeature(ssoConfiguration),
    SequelizeModule.forFeature([
      Organization,
      OrganizationMember,
      AuditEvent,
      SsoConfiguration,
      SsoVerifiedDomain,
    ]),
  ],
  controllers: [SsoController],
  providers: [
    SsoService,
    AuditService,
    AuditEventRepository,
    SsoConfigurationRepository,
    SsoVerifiedDomainRepository,
    OrganizationRepository,
    OrganizationMemberRepository,
    SsoConfig,
  ],
  exports: [SsoService, SsoConfigurationRepository, SsoVerifiedDomainRepository],
})
export class SsoModule {}
