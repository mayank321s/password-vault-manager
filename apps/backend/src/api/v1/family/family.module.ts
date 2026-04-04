import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Organization,
  OrganizationMember,
  OrganizationPolicy,
  User,
  Vault,
  VaultMember,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
  OrganizationPolicyRepository,
  OrganizationRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from 'src/database/repositories';
import { FamilyController } from './family.controller';
import { FamilyService } from './family.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Organization,
      OrganizationMember,
      OrganizationPolicy,
      User,
      Vault,
      VaultMember,
    ]),
  ],
  controllers: [FamilyController],
  providers: [
    FamilyService,
    OrganizationRepository,
    OrganizationMemberRepository,
    OrganizationPolicyRepository,
    UsersRepository,
    VaultRepository,
    VaultMemberRepository,
  ],
})
export class FamilyModule {}

