import { Logger, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Password, User, Vault, VaultMember } from '../../../database/models';
import {
  PasswordRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from '../../../database/repositories';
import { VaultsController } from './vaults.controller';
import { VaultsService } from './vaults.service';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Vault, VaultMember, Password]),
    LoggerModule,
  ],
  controllers: [VaultsController],
  providers: [
    VaultsService,
    UsersRepository,
    VaultRepository,
    VaultMemberRepository,
    PasswordRepository,
  ],
  exports: [VaultsService],
})
export class VaultsModule {}
