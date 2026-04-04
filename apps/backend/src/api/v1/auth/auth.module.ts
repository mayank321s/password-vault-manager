import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtConfig, jwtConfiguration } from 'src/config/jwt.config';
import { TotpConfig, totpConfiguration } from 'src/config/totp.config';
import { Organization } from '../../../database/models/organization.model';
import { OrganizationMember } from '../../../database/models/organization-member.model';
import { Session } from '../../../database/models/session.model';
import { User } from '../../../database/models/user.model';
import { VaultMember } from '../../../database/models/vault-member.model';
import { Vault } from '../../../database/models/vault.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import {
  OrganizationRepository,
  OrganizationMemberRepository,
  SessionRepository,
  UsersRepository,
  VaultMemberRepository,
  VaultRepository,
} from 'src/database/repositories';
import { TotpService } from 'src/common/services/totp.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfiguration)],
      inject: [JwtConfig],
      extraProviders: [JwtConfig],
      useFactory: (config: JwtConfig) => {
        return {
          secret: config.secret,
          signOptions: {
            expiresIn: config.expiration,
          },
        };
      },
    }),
    ConfigModule.forFeature(totpConfiguration),
    SequelizeModule.forFeature([
      User,
      Vault,
      VaultMember,
      Session,
      Organization,
      OrganizationMember,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    UsersRepository,
    VaultRepository,
    JwtConfig,
    VaultMemberRepository,
    OrganizationMemberRepository,
    OrganizationRepository,
    SessionRepository,
    TotpConfig,
    TotpService,
  ],
  exports: [AuthService, JwtAuthGuard, PassportModule],
})
export class AuthModule {}
