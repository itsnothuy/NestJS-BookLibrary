import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { StringValue as MsStringValue } from 'ms';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersRepo } from 'src/users/users.repo';


@Injectable()
export class AuthService {
    constructor(
        private jwt: JwtService,
        private usersRepo: UsersRepo,

    ) {}
    async signup(email: string, password: string) {
        const exists = await this.usersRepo.findByEmail(email);
        if (exists) throw new ConflictException('Email exists');
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.usersRepo.create(
            { id: crypto.randomUUID(), email, passwordHash, role: 'student' }
        );
        return this.sign(user.id, user.email, user.role);
    }

    async login(email: string, password: string) {
        const user = await this.usersRepo.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) throw new UnauthorizedException('Invalid credentials');
        return this.sign(user.id, user.email, user.role);
    }
    private sign(id: string, email: string, role: string) {
        const expiresIn: MsStringValue | number = (process.env.JWT_EXPIRES ?? '1d') as MsStringValue;
        return { access_token: this.jwt.sign({ sub: id, email, role }, {
            secret: process.env.JWT_SECRET, expiresIn
        })};
    }
}
