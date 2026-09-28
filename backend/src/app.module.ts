import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config.js';
import { validate } from './config/env.validation.js';
import { HealthModule } from './modules/health/health.module.js';
import storageConfig from './config/storage.config.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, storageConfig],
      validate,
    }),
    
    // Setup TypeORM with Async Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    HealthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}