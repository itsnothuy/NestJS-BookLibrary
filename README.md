# Student Library API — System Architecture (Steps 1–4, No ORM)

This document visualizes the current backend stack using Mermaid diagrams: high-level components, module wiring, key request lifecycles, RBAC flow, and the minimal data model. It follows NestJS’s modules/controllers/providers/guards architecture and Passport-JWT for auth, with a raw `mysql2/promise` pool for MariaDB access.

> ✅ GitHub supports Mermaid in Markdown, so these diagrams will render automatically in your README.

---

## 1) High-Level Component Architecture

> HTTP request → Controller → Service → Repository (raw SQL) → `mysql2` Pool → MariaDB. Controllers handle routing; providers (services/repos) are DI-injected; guards/strategies handle auth.

```mermaid
flowchart LR
  subgraph Client["API Consumer (HTTP)"]
    U["Frontend / API Client"]
  end

  subgraph App["NestJS App (Express)"]
    direction LR

    subgraph C["Controllers"]
      AC["AuthController"]
      UC["UsersController"]
    end

    subgraph S["Services (Providers)"]
      AS["AuthService"]
      US["UsersService"]
    end

    subgraph G["Auth & RBAC"]
      JG["JwtAuthGuard"]
      RS["JwtStrategy"]
      RG["RolesGuard"]
    end

    subgraph R["Data Access (no ORM)"]
      UR["UsersRepo"]
      MP["MYSQL_POOL (mysql2/promise)"]
    end
  end

  DB[(MariaDB)]

  U -->|HTTP JSON| C
  AC --> AS
  UC --> US

  C -->|guards| G

  AS --> UR
  US --> UR
  UR --> MP
  MP --> DB
```

---

## 2) Module Dependency Map

> Modules encapsulate providers; exports form the public API between modules.

```mermaid
flowchart TD
  AM[AppModule] --> MM[MysqlModule]
  AM --> AuM[AuthModule]
  AM --> UM[UsersModule]

  subgraph MysqlModule
    MP[MYSQL_POOL Provider]
  end

  subgraph AuthModule
    AC[AuthController]
    AS[AuthService]
    RS[JwtStrategy]
  end

  subgraph UsersModule
    UC[UsersController]
    US[UsersService]
    UR[UsersRepo]
  end

  AS --> UR
  US --> UR
  UR --> MP
```

---

## 3) Login Request Lifecycle (Sequence)

> Passport-JWT strategy & Nest guard pattern for issuing a signed JWT and returning it to the client.

```mermaid
sequenceDiagram
  participant C as Client
  participant AC as AuthController
  participant AS as AuthService
  participant UR as UsersRepo
  participant DB as MariaDB
  participant JWT as JwtService

  C->>AC: POST /auth/login {email, password}
  AC->>AS: login(email, password)
  AS->>UR: findByEmail(email)
  UR->>DB: SELECT * FROM user WHERE email = ?
  DB-->>UR: user row
  AS->>AS: bcrypt.compare(password, passwordHash)
  AS->>JWT: sign({sub,id,email,role})
  JWT-->>AS: access_token
  AS-->>AC: {access_token}
  AC-->>C: 200 {access_token}
```

---

## 4) Protected Route + RBAC (Flow)

> Guards gate access: first JWT authentication, then authorization via a roles guard and `@Roles()` decorator.

```mermaid
flowchart TD
  A[Incoming request to /users/*] --> B{JwtAuthGuard\nBearer token valid?}
  B -- No --> E[401 Unauthorized]
  B -- Yes --> C{RolesGuard\nuser.role === 'admin'?}
  C -- No --> F[403 Forbidden]
  C -- Yes --> D[UsersController handler]
```

---

## 5) Minimal Data Model (Current Tables)

> Raw SQL migrations create the `user` table and a `_migrations` ledger. MariaDB is accessed via `mysql2` Promise pool.

```mermaid
erDiagram
  USER {
    uuid id PK
    varchar email "UNIQUE"
    varchar passwordHash
    varchar role "student|admin"
    datetime createdAt
    datetime updatedAt
  }

  _MIGRATIONS {
    int id PK
    varchar name "UNIQUE"
    timestamp run_on
  }
```

---

## 6) `/auth/me` Guard Handshake (Sequence)

> `AuthGuard('jwt')` triggers the JWT strategy, attaches `req.user`, then the controller returns it.

```mermaid
sequenceDiagram
  participant C as Client
  participant ME as GET /auth/me
  participant JG as JwtAuthGuard
  participant RS as JwtStrategy
  participant CT as Controller

  C->>ME: Authorization: Bearer <JWT>
  ME->>JG: canActivate()
  JG->>RS: validate(token payload)
  RS-->>JG: { userId, email, role }
  JG-->>CT: attaches req.user
  CT-->>C: 200 { userId, email, role }
```

---

## 7) Runtime & Deployment View

> Env-driven config, Nest app processes, SQL migrations runner, and `mysql2` pool to DB.

```mermaid
flowchart LR
  subgraph Host
    ENV[".env<br/>DB_HOST/USER/PASS/NAME<br/>JWT_SECRET/EXPIRES"]
    Proc["node / nest start"]
  end

  subgraph App["NestJS App"]
    Mods["AppModule, AuthModule, UsersModule, MysqlModule"]
    Pool["MYSQL_POOL (mysql2/promise)"]
  end

  MariaDB[(MariaDB Server)]

  ENV --> Proc
  Proc --> App
  App --> Pool --> MariaDB

  subgraph Migrations
    Runner["ts-node src/database/migrate.ts"]
    Files["*.sql in src/database/migrations"]
  end
  Runner --> MariaDB
  Files --> Runner
```
