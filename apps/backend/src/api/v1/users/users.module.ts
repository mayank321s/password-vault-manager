import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../../database/models';
import { UsersRepository } from '../../../database/repositories';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User]), AuthModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
