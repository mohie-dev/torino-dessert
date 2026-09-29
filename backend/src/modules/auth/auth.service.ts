import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.tsjwt-payload.interface.js';

// A valid bcrypt hash of a random password, generated once.
// Used to spend the same time comparing when the email doesn't exist.
const DUMMY_HASH = 'd1cd9fd37e7cb325f34a766ffb6870d4963c57b4fb7f1d93ad0ff248c6d47334a2a3cb8f88d592e5649bd90dac4312b53264531eccbbb8b9d872c62767316b28';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async login(dto: LoginDto): Promise<{ accessToken: string }> {
        // 1. Find the user by email (and explicitly load the hash)
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .addSelect('user.passwordHash')
            .where('user.email = :email', { email: dto.email })
            .getOne();

        // 2. Compare the password
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
}