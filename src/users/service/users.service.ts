import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersRepo } from '../users.repo';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
constructor(private repo: UsersRepo) {}
  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: CreateUserDto) {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : await bcrypt.hash(crypto.randomUUID(), 10);
    return this.repo.create({
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash,
      role: data.role ?? 'student',
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const patch: any = {};
    if (data.email) patch.email = data.email;
    if (data.password) patch.passwordHash = await bcrypt.hash(data.password, 10);
    if (data.role) patch.role = data.role;
    return this.repo.update(id, patch);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.repo.remove(id);
    return { deleted: true };
  }
}
