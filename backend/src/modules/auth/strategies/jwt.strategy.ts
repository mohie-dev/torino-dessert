import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface.js';
import { ROLE_PERMISSIONS } from '../../users/constants/role-permissions.constant.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersRepository.findOne({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
            }
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User is deactivated or not found');
        }

        const permissions = ROLE_PERMISSIONS[user.role] || [];

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            permissions,
        };
    }
}