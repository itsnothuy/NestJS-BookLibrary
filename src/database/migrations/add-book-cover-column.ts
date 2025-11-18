import { Pool } from 'mysql2/promise';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function addBookCoverColumn() {
  const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'nestuser',
    password: process.env.DB_PASSWORD || 'nestpassword',
    database: process.env.DB_NAME || 'nestjs_library',
  });

  try {
    console.log('Adding coverImageFilename column to book table...');
    
    // Check if column already exists
    const [columns]: any = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'book' AND COLUMN_NAME = 'coverImageFilename'`,
      [process.env.DB_NAME || 'nestjs_library']
    );

    if (columns.length > 0) {
      console.log('Column coverImageFilename already exists. Skipping...');
      return;
    }

    // Add the column
    await pool.query(`
      ALTER TABLE book
      ADD COLUMN coverImageFilename VARCHAR(255) DEFAULT NULL
      AFTER publishedYear
    `);

    console.log('Successfully added coverImageFilename column to book table');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addBookCoverColumn()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
