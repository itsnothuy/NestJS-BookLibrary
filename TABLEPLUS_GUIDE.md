# TablePlus Database Connection Guide

## Database Configuration

The application uses MariaDB running in Docker container with the following settings:

### Connection Details
- **Host**: `localhost`
- **Port**: `3307` (mapped from container port 3306)
- **Database**: `nestjs_library`
- **Username**: `nestuser`
- **Password**: `nestpassword`
- **Root Password**: `rootpassword` (for admin access)

## How to Connect with TablePlus

### Step 1: Install TablePlus
Download and install TablePlus from: https://tableplus.com/

### Step 2: Create New Connection
1. Open TablePlus
2. Click "Create a new connection"
3. Select "MariaDB" (or MySQL - they're compatible)

### Step 3: Enter Connection Details
Fill in the connection form:
```
Name: Student Library API
Host: localhost
Port: 3307
User: nestuser
Password: nestpassword
Database: nestjs_library
```

### Step 4: Test Connection
1. Click "Test" to verify the connection
2. If successful, click "Connect"

## Alternative: Root Access
For full admin access, you can also connect using:
```
User: root
Password: rootpassword
```

## Database Tables
Once connected, you should see these tables:
- `users` - User accounts with roles (student/admin)
- `books` - Book catalog with CRUD operations
- Migration history tables

## Troubleshooting

### Connection Refused
If you can't connect:
1. Make sure Docker containers are running:
   ```bash
   cd /path/to/student-library-api
   docker-compose up -d
   ```

2. Check if MariaDB container is healthy:
   ```bash
   docker-compose ps
   ```

3. Verify port 3307 is accessible:
   ```bash
   telnet localhost 3307
   ```

### Container Not Running
Start the database:
```bash
cd /Users/tranhuy/Desktop/Code/student-library-api
docker-compose up -d mariadb
```

### Reset Database
To reset the database completely:
```bash
docker-compose down -v
docker-compose up -d mariadb
# Wait for container to be ready, then run migrations
npm run migrate
```

## SQL Queries for Testing

Once connected, you can run these queries to explore the data:

```sql
-- View all users
SELECT * FROM users;

-- View all books  
SELECT * FROM books;

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- View recent books
SELECT * FROM books ORDER BY createdAt DESC LIMIT 10;
```