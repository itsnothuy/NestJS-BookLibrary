import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'mysql2/promise';
import { MYSQL } from '../database/mysql.module';

@Injectable()
export class UsersRepo {
  constructor(@Inject(MYSQL) private pool: Pool) {}

  async findByEmail(email: string) {
    const [rows] = await this.pool.execute('SELECT * FROM user WHERE email=? LIMIT 1', [email]);
    return Array.isArray(rows) ? rows[0] : null;
  }
}