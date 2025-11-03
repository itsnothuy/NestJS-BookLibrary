import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepo } from '../users.repo';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private repo: UsersRepo) {}
  
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.repo.findAll();
    return users.map(user => UserResponseDto.fromEntity(user));
  }

  async findOne(uuid: string): Promise<UserResponseDto> {
    const user = await this.repo.findByUuid(uuid);
    if (!user) throw new NotFoundException('User not found');
    return UserResponseDto.fromEntity(user);
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const passwordHash = data.password 
      ? await bcrypt.hash(data.password, 10) 
      : await bcrypt.hash('defaultPassword123', 10);
    const created = await this.repo.create({
      email: data.email,
      passwordHash,
      role: data.role ?? 'student',
    });
    return UserResponseDto.fromEntity(created);
  }

  async update(uuid: string, data: UpdateUserDto): Promise<UserResponseDto> {
    const patch: any = {};
    if (data.email) patch.email = data.email;
    if (data.password) patch.passwordHash = await bcrypt.hash(data.password, 10);
    if (data.role) patch.role = data.role;
    
    const updated = await this.repo.updateByUuid(uuid, patch);
    if (!updated) throw new NotFoundException('User not found');
    return UserResponseDto.fromEntity(updated);
  }

  async remove(uuid: string) {
    const user = await this.repo.findByUuid(uuid);
    if (!user) throw new NotFoundException('User not found');
    const deleted = await this.repo.removeByUuid(uuid);
    if (!deleted) throw new NotFoundException('Failed to delete user');
    return { deleted: true };
  }
}
