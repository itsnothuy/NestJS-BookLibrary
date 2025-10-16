import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {}
aimport { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private users: Repository<User>) {}

  findAll() {
    return this.users.find();
  }

  async findOne(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: { email: string; password?: string; role?: UserRole }) {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    const user = this.users.create({
      email: data.email,
      passwordHash: passwordHash ?? '',
      role: data.role ?? 'student',
    });
    return this.users.save(user);
  }

  async update(id: string, data: Partial<{ email: string; password: string; role: UserRole }>) {
    const user = await this.findOne(id);
    if (data.email) user.email = data.email;
    if (data.password) user.passwordHash = await bcrypt.hash(data.password, 10);
    if (data.role) user.role = data.role;
    return this.users.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.users.remove(user);
    return { deleted: true };
  }
}
