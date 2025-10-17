import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MysqlModule } from 'src/database/mysql.module';
import { UsersRepo } from './users.repo';

@Module({
  imports: [MysqlModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepo],
  exports: [UsersService, UsersRepo],
})
export class UsersModule {}
