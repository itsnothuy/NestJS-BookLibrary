// auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MysqlModule } from 'src/database/mysql.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersRepo } from 'src/users/users.repo';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MysqlModule,
    PassportModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret', // Use an environment variable or a default value
      signOptions: { expiresIn: (process.env.JWT_EXPIRES ?? '1h') as import('ms').StringValue }, // Optional: Set token expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepo],
})
export class AuthModule {}
