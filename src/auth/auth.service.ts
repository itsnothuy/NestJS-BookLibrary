import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { StringValue as MsStringValue } from 'ms';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

type UserRecord = { id: string; email: string; passwordHash: string; role: 'student'|'admin' };
// TEMP store (replace with DB next step)
const users: UserRecord[] = [];

@Injectable()
export class AuthService {
    constructor(private jwt: JwtService) {}
    async signup(email: string, password: string) {
        const exists = users.find(u => u.email === email);
        if (exists) throw new ConflictException('Email exists');
        const passwordHash = await bcrypt.hash(password, 12);
        const user: UserRecord = { id: crypto.randomUUID(), email, passwordHash, role: 'student' };
        users.push(user);
        return this.sign(user);
    }

    async login(email: string, password: string) {
        const user = users.find(u => u.email === email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) throw new UnauthorizedException('Invalid credentials');
        return this.sign(user);
    }
    private sign(user: UserRecord) {
        const expiresIn: MsStringValue | number = (process.env.JWT_EXPIRES ?? '1d') as MsStringValue;
        return { access_token: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }, {
            secret: process.env.JWT_SECRET, expiresIn
        })};
    }
}
