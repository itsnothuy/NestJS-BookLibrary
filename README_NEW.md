# Student Library Management System

A full-stack application with NestJS backend and React frontend for managing books and users in a library system.

## 🏗️ Project Structure

```
student-library-api/
├── src/                          # Backend (NestJS)
│   ├── auth/                     # Authentication module
│   ├── books/                    # Books CRUD module  
│   ├── users/                    # Users management module
│   ├── database/                 # Database connections & migrations
│   └── common/                   # Shared utilities (guards, decorators)
├── frontend/                     # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/             # Login/Signup components
│   │   │   ├── books/            # Books management table
│   │   │   ├── users/            # Users management table
│   │   │   └── app/              # Dashboard & main app
│   │   └── main.tsx              # App entry point
├── docker-compose.yml            # MariaDB database container
├── TABLEPLUS_GUIDE.md           # Database connection guide
└── README.md                     # This file
```

## 🚀 Features

### Authentication & Authorization
- ✅ **JWT-based authentication** with Passport
- ✅ **Role-based access control** (Student/Admin)
- ✅ **Secure password hashing** with bcrypt
- ✅ **Auto-increment + UUID** dual-ID pattern for security

### Books Management
- ✅ **Public book browsing** (all users)
- ✅ **Admin-only CRUD operations** (Create/Update/Delete)
- ✅ **ISBN validation** and book metadata
- ✅ **Beautiful table interface** with modals

### Users Management  
- ✅ **Admin-only user administration**
- ✅ **Role assignment** (Student/Admin)
- ✅ **User creation and management**
- ✅ **Visual role badges** in interface

### Frontend Features
- ✅ **Modern React with TypeScript**
- ✅ **HeroUI component library** with Tailwind CSS
- ✅ **Responsive design** and clean UI
- ✅ **Role-based navigation** and conditional rendering
- ✅ **Real-time error handling** and loading states

## 🛠️ Technology Stack

### Backend
- **NestJS** - Node.js framework with TypeScript
- **MariaDB** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **Passport** - Authentication middleware
- **mysql2** - Database driver (no ORM)
- **Docker** - Containerized database

### Frontend  
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **HeroUI** - Modern component library
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git** for version control

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/student-library-api.git
cd student-library-api
```

### 2. Start Database
```bash
docker-compose up -d mariadb
```

### 3. Install Backend Dependencies
```bash
npm install
```

### 4. Run Database Migrations
```bash
npx ts-node src/database/migrate.ts
```

### 5. Start Backend Server
```bash
npm run start:dev
```

### 6. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 7. Start Frontend Development Server
```bash
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health Check**: http://localhost:3000/health
- **Database**: localhost:3307 (see [TablePlus Guide](./TABLEPLUS_GUIDE.md))

## 👥 Default Users

### Test Student Account
- **Email**: `testuser@example.com`
- **Password**: `TestPassword123`
- **Role**: Student (can view books only)

### Create Admin Account
Use the signup form and select "Admin" role, or create via API:
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "AdminPassword123", "role": "admin"}'
```

## 📊 Database Access

See the detailed [TablePlus Connection Guide](./TABLEPLUS_GUIDE.md) for connecting to the MariaDB database.

**Quick Connection:**
- Host: `localhost:3307`
- Database: `nestjs_library`
- User: `nestuser`
- Password: `nestpassword`

## 🔐 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login  
- `GET /auth/me` - Get current user profile

### Books (Public read, Admin write)
- `GET /books` - List all books
- `GET /books/:id` - Get book by UUID
- `POST /books` - Create book (Admin only)
- `PATCH /books/:id` - Update book (Admin only)  
- `DELETE /books/:id` - Delete book (Admin only)

### Users (Admin only)
- `GET /users` - List all users
- `GET /users/:id` - Get user by UUID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 🧪 Testing

### Test API with curl
```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com", "password": "TestPassword123"}'

# Get books (public)
curl http://localhost:3000/books
```

### Run Backend Tests
```bash
npm run test
npm run test:e2e
```

## 🔧 Development

### Backend Development
```bash
npm run start:dev  # Hot reload enabled
```

### Frontend Development  
```bash
cd frontend
npm run dev       # Vite dev server with HMR
```

### Database Management
```bash
# Reset database
docker-compose down -v
docker-compose up -d mariadb
npx ts-node src/database/migrate.ts

# View logs
docker-compose logs mariadb
```

## 📁 Key Files

- `src/main.ts` - Backend application entry point
- `frontend/src/main.tsx` - Frontend application entry point
- `docker-compose.yml` - Database container configuration
- `src/database/migrate.ts` - Database migration script
- `frontend/src/modules/` - React components organized by feature

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.