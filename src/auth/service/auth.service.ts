import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { StringValue as MsStringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { UsersRepo } from 'src/users/users.repo';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwt: JwtService,
        private usersRepo: UsersRepo,
    ) {}
    
    async signup(email: string, password: string, role: 'student' | 'admin' = 'student') {
        const exists = await this.usersRepo.findByEmail(email);
        if (exists) throw new ConflictException('Email exists');
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.usersRepo.create(
            { email, passwordHash, role }
        );
        return this.sign(user.uuid, user.email, user.role);
    }

    async login(email: string, password: string) {
        const user = await this.usersRepo.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) throw new UnauthorizedException('Invalid credentials');
        return this.sign(user.uuid, user.email, user.role);
    }
    
    private sign(uuid: string, email: string, role: string) {
        const expiresIn: MsStringValue | number = (process.env.JWT_EXPIRES ?? '1d') as MsStringValue;
        return { access_token: this.jwt.sign({ sub: uuid, email, role }, {
            secret: process.env.JWT_SECRET, expiresIn
        })};
    }

    async updateProfile(uuid: string, data: { email?: string; password?: string }): Promise<UserResponseDto> {
        const patch: any = {};
        
        if (data.email) {
            // Check if email is already taken by another user
            const existingUser = await this.usersRepo.findByEmail(data.email);
            if (existingUser && existingUser.uuid !== uuid) {
                throw new ConflictException('Email already taken');
            }
            patch.email = data.email;
        }
        
        if (data.password) {
            patch.passwordHash = await bcrypt.hash(data.password, 12);
        }
        
        const updated = await this.usersRepo.updateByUuid(uuid, patch);
        if (!updated) throw new UnauthorizedException('User not found');
        
        return UserResponseDto.fromEntity(updated);
    }
}
