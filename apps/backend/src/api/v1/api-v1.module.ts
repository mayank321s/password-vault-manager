import { RouterModule, Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { PasswordsModule } from './passwords/passwords.module';
import { VaultsModule } from './vaults/vaults.module';
import { UsersModule } from './users/users.module';
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
        { path: 'api/v1/passwords*', method: RequestMethod.ALL },
        { path: 'api/v1/vaults*', method: RequestMethod.ALL },
      );
  }
}
