import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseConfig } from 'src/config/database.config';
import { models } from './models';

@Global()
@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = DatabaseConfig.configure(configService);
        return {
          dialect: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          models,
          autoLoadModels: false,
          synchronize: false, // NEVER use true in production
          logging: dbConfig.logging ? console.log : false,
          pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
          ssl: dbConfig.ssl,
          dialectOptions: dbConfig.ssl
            ? {
                ssl: {
                  require: true,
                  rejectUnauthorized: false,
                },
              }
            : {},
        };
      },
    }),
  ],
  exports: [],
})
export class DatabaseModule {}
