import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true,
    });

    await conn.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
    const [rows] = await conn.query('SELECT name FROM _migrations');
    const done = new Set<string>((rows as any[]).map(r => r.name));
    const dir = path.join(__dirname, 'migrations');
    const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
    : [];

    for (const file of files) {
        if (done.has(file)) continue;
        const sql = fs.readFileSync(path.join(dir, file), 'utf8');
        console.log(`→ Running ${file}`);
        await conn.query(sql);
        await conn.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
        console.log(`✓ Done ${file}`);
    }
    await conn.end();
    console.log('All migrations up to date.');

}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
