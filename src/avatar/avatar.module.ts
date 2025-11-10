import { Module } from '@nestjs/common';
import { AvatarController } from './avatar.controller';
import { UsersModule } from '../users/module/users.module';

@Module({
  imports: [UsersModule], // Import UsersModule to get access to UsersRepo
  controllers: [AvatarController],
})
export class AvatarModule {}