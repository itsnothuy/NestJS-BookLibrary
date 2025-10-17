// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MysqlModule } from 'src/database/mysql.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersRepo } from 'src/users/users.repo';
import type { StringValue } from 'ms';

@Module({
  imports: [
    MysqlModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: process.env.JWT_EXPIRES ?? '1d' as StringValue},
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepo],
})
export class AuthModule {}
