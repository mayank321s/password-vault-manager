import { RouterModule, Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { EmergencyAccessModule } from './emergency-access/emergency-access.module';
import { FamilyModule } from './family/family.module';
import { PasswordsModule } from './passwords/passwords.module';
import { VaultsModule } from './vaults/vaults.module';
import { UsersModule } from './users/users.module';
import { SsoModule } from './sso/sso.module';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { TenantContextMiddleware } from 'src/common/middleware/tenant-context.middleware';

const API_V1_ROUTES: Routes = [
  {
    path: 'api/v1',
    children: [
      { path: 'health', module: HealthModule },
      { path: 'auth', module: AuthModule },
      { path: 'billing', module: BillingModule },
      { path: 'emergency-access', module: EmergencyAccessModule },
      { path: 'family', module: FamilyModule },
      { path: 'sso', module: SsoModule },
      { path: 'passwords', module: PasswordsModule },
      { path: 'vaults', module: VaultsModule },
      { path: 'users', module: UsersModule },
    ],
  },
];

@Module({
  imports: [
    RouterModule.register(API_V1_ROUTES),
    AuthModule,
    BillingModule,
    EmergencyAccessModule,
    FamilyModule,
    SsoModule,
    PasswordsModule,
    VaultsModule,
    UsersModule,
    HealthModule,
  ],
})
export class ApiV1Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes(
        { path: 'api/v1/family*', method: RequestMethod.ALL },
        { path: 'api/v1/emergency-access*', method: RequestMethod.ALL },
        { path: 'api/v1/sso*', method: RequestMethod.ALL },
        { path: 'api/v1/passwords*', method: RequestMethod.ALL },
        { path: 'api/v1/vaults*', method: RequestMethod.ALL },
      );
  }
}
