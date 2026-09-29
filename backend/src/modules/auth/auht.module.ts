import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity.js';
import { AuthService } from './auth.service.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
                signOptions: {
                    expiresIn: config.getOrThrow<string>(
                        'JWT_ACCESS_EXPIRES_IN',
                    ) as JwtSignOptions['expiresIn'],
                },
            }),
        }),
    ],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule { }