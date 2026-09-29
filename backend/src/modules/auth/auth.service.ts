import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { ROLE_PERMISSIONS } from '../users/constants/role-permissions.constant.js';

// A valid bcrypt hash of a random password, generated once.
// Used to spend the same time comparing when the email doesn't exist to prevent timing attacks.
const DUMMY_HASH = '$2b$10$0tKQGol3UYCvud51ABzx1.HIrz1a9YSmqNZ0m1.9pXgSaqww0XGCy';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async login(dto: LoginDto): Promise<{ accessToken: string }> {
        // 1. Find the user by email (and explicitly load the hash using QueryBuilder)
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .where('user.email = :email', { email: dto.email })
            .getOne();

        // 2. Compare the password (uses DUMMY_HASH if user is not found)
        const passwordMatches = await bcrypt.compare(
            dto.password,
            user?.passwordHash ?? DUMMY_HASH,
        );

        // 3. Reject with one generic error for every failure case
        if (!user || !passwordMatches || !user.isActive) {
            throw new UnauthorizedException('Invalid email or password');
        }

        // 4. Sign the token with the payload
        const payload: JwtPayload = { sub: user.id, email: user.email };
        return { accessToken: await this.jwtService.signAsync(payload) };
    }

    async getMe(userId: string) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        const permissions = ROLE_PERMISSIONS[user.role] || [];

        return {
            user,
            permissions,
        };
    }
}