import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  Organization,
  OrganizationMember,
  User,
  Vault,
  VaultMember,
} from 'src/database/models';
import {
  OrganizationMemberRepository,
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
    UsersRepository,
    VaultRepository,
    VaultMemberRepository,
  ],
})
export class FamilyModule {}

