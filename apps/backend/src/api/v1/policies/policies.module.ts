import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Organization,
  OrganizationMember,
  OrganizationPolicy,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationPolicyRepository,
  OrganizationRepository,
} from 'src/database/repositories';
import { AuthModule } from '../auth/auth.module';
import { PoliciesController } from './policies.controller';
import { PoliciesService } from './policies.service';

@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([
      Organization,
      OrganizationMember,
      OrganizationPolicy,
    ]),
  ],
  controllers: [PoliciesController],
  providers: [
    PoliciesService,
    OrganizationRepository,
    OrganizationMemberRepository,
    OrganizationPolicyRepository,
  ],
})
export class PoliciesModule {}
