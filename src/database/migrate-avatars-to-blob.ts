import { createConnection } from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// Data migration script: Convert filesystem avatars to database BLOB storage
async function migrateAvatarsToBlob() {
  const connection = await createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    user: process.env.DB_USER || 'nestuser',
    password: process.env.DB_PASSWORD || 'nestpassword',
    database: process.env.DB_NAME || 'nestjs_library'
  });

  const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
  
  console.log('Starting avatar migration from filesystem to database...');
  console.log(`Looking for avatars in: ${uploadsDir}`);
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads/avatars directory found. Migration complete.');
    await connection.end();
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  console.log(`Found ${files.length} files in avatars directory`);

  let migratedCount = 0;
  let errorCount = 0;

  for (const filename of files) {
    try {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);
      
      if (!stats.isFile()) {
        console.log(`Skipping non-file: ${filename}`);
        continue;
      }

      // Extract UUID from filename pattern: avatar-{uuid}-{timestamp}.ext
      const uuidMatch = filename.match(/avatar-([a-f0-9-]{36})-\d+\.\w+$/);
      if (!uuidMatch) {
        console.log(`Skipping file with unrecognized pattern: ${filename}`);
        continue;
      }
      
      const uuid = uuidMatch[1];
      
      // Check if user exists
      const [userRows] = await connection.execute(
        'SELECT id FROM users WHERE uuid = ? LIMIT 1', 
        [uuid]
      );
      
      if ((userRows as any[]).length === 0) {
        console.log(`User not found for avatar: ${filename}`);
        continue;
      }

      // Read the file as binary data
      const imageData = fs.readFileSync(filePath);
      
      // Determine MIME type from file extension
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.gif') mimeType = 'image/gif';
      else if (ext === '.webp') mimeType = 'image/webp';

      // Update user with BLOB data
      await connection.execute(
        `UPDATE users 
         SET avatar_data = ?, 
             avatar_mime_type = ?, 
             avatar_size_bytes = ?, 
             avatar_uploaded_at = ?
         WHERE uuid = ?`,
        [imageData, mimeType, imageData.length, new Date(), uuid]
      );

      console.log(`✅ Migrated ${filename} (${imageData.length} bytes) for user ${uuid}`);
      migratedCount++;
      
    } catch (error) {
      console.error(`❌ Error migrating ${filename}:`, error);
      errorCount++;
    }
  }

  console.log('\n=== Migration Summary ===');
  console.log(`Successfully migrated: ${migratedCount} avatars`);
  console.log(`Errors encountered: ${errorCount}`);
  console.log('Migration complete!');
  
  await connection.end();
}

// Run the migration if this script is executed directly
if (require.main === module) {
  require('dotenv').config();
  migrateAvatarsToBlob().catch(console.error);
}

export { migrateAvatarsToBlob };