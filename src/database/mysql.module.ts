// src/database/mysql.module.ts
import { Module } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';

export const MYSQL = Symbol('MYSQL_POOL');

@Module({
  providers: [{
    provide: MYSQL,
    useFactory: async (): Promise<Pool> => {
        const pool = await mysql.createPool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT || 3306),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          waitForConnections: true,
          connectionLimit: 10,
          namedPlaceholders: false,
          multipleStatements: true, // allow executing .sql files with several statements
        });
        return pool;
      },
    },
  ],
  exports: [MYSQL],
})
export class MysqlModule {}
