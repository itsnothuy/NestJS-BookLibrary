import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepo } from './users.repo';

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

  async create(data: { email: string; password?: string; role?: 'student'|'admin' }) {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : await bcrypt.hash(crypto.randomUUID(), 10);
    return this.repo.create({
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash,
      role: data.role ?? 'student',
    });
  }

  async update(id: string, b: { email?: string; password?: string; role?: 'student'|'admin' }) {
    const patch: any = {};
    if (b.email) patch.email = b.email;
    if (b.password) patch.passwordHash = await bcrypt.hash(b.password, 10);
    if (b.role) patch.role = b.role;
    return this.repo.update(id, patch);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.repo.remove(id);
    return { deleted: true };
  }
}
