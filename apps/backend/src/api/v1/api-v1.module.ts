import { RouterModule, Routes } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { PasswordsModule } from './passwords/passwords.module';
import { VaultsModule } from './vaults/vaults.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';

const API_V1_ROUTES: Routes = [
  {
    path: 'api/v1',
    children: [
      { path: 'health', module: HealthModule },
      { path: 'auth', module: AuthModule },
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
    PasswordsModule,
    VaultsModule,
    UsersModule,
    HealthModule,
  ],
})
export class ApiV1Module {}
