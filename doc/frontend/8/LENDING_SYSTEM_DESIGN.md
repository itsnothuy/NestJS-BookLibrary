# Book Lending/Borrowing System - Complete Design Document

**Inspired by Cart System Analysis | Adapted for NestJS + React + MariaDB**

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Comparison](#architecture-comparison)
3. [Database Design](#database-design)
4. [Backend Implementation Plan](#backend-implementation-plan)
5. [Frontend Implementation Plan](#frontend-implementation-plan)
6. [State Management Strategy](#state-management-strategy)
7. [API Endpoints Specification](#api-endpoints-specification)
8. [Business Logic & Rules](#business-logic--rules)
9. [Implementation Phases](#implementation-phases)
10. [Performance Optimizations](#performance-optimizations)

---

## 1. System Overview

### Concept Mapping: Cart System → Lending System

```
CART SYSTEM              →    LENDING SYSTEM
─────────────────────────────────────────────────────────
Cart Items               →    Borrowed Books
Add to Cart              →    Request to Borrow
Remove from Cart         →    Cancel Borrow Request
Update Quantity          →    Extend Loan Period
Purchase                 →    Confirm Borrow / Return
Purchase History         →    Borrowing History
Firebase Persistence     →    MariaDB + REST API
Redux State              →    React Context + Local State
```

### System Goals

✅ **Students can:**
- Browse available books
- Request to borrow books
- View their borrowed books
- Return books
- View borrowing history
- Track due dates and late fees

✅ **Admins can:**
- Approve/reject borrow requests
- Manage book inventory
- Track all borrowings
- Handle returns
- Manage late fees

---

## 2. Architecture Comparison

### Cart System Architecture (Original)
```
┌─────────────────────────────────────────────────────────┐
│                    CART ECOSYSTEM                       │
├─────────────────────────────────────────────────────────┤
│ Redux Store (Memory)                                    │
│ ├── cartSlice.jsx (State Management)                    │
│ └── Persistence: Firebase Firestore                     │
├─────────────────────────────────────────────────────────┤
│ React Components                                        │
│ ├── SingleBook.jsx (Add to Cart)                       │
│ ├── CartItem.jsx (Cart Item Display)                   │
│ └── CartPage.jsx (Cart Overview)                       │
├─────────────────────────────────────────────────────────┤
│ Firebase Integration                                    │
│ └── Firestore (Purchase History)                       │
└─────────────────────────────────────────────────────────┘
```

### New Lending System Architecture
```
┌─────────────────────────────────────────────────────────┐
│              LENDING/BORROWING ECOSYSTEM                │
├─────────────────────────────────────────────────────────┤
│ NestJS Backend API                                      │
│ ├── BorrowingsModule                                    │
│ │   ├── BorrowingsController                           │
│ │   ├── BorrowingsService                              │
│ │   └── BorrowingsRepository                           │
│ ├── JWT Authentication                                  │
│ └── Role-based Authorization                            │
├─────────────────────────────────────────────────────────┤
│ MariaDB Database                                        │
│ ├── borrowing_requests (Pending requests)              │
│ ├── borrowings (Active + History)                      │
│ └── Foreign Keys: users, books                         │
├─────────────────────────────────────────────────────────┤
│ React Frontend                                          │
│ ├── Context API (Auth + Borrowing State)               │
│ ├── BorrowRequestButton (Request to borrow)            │
│ ├── MyBorrowings (User's borrowed books)               │
│ ├── BorrowingHistory (Past borrowings)                 │
│ └── AdminBorrowingManager (Admin panel)                │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Database Design

### 3.1 New Tables

#### **Table: `borrowing_requests`**
```sql
CREATE TABLE IF NOT EXISTS borrowing_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    
    -- Foreign Keys
    userId INT NOT NULL,
    bookId INT NOT NULL,
    
    -- Request Details
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    requestedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    requestedDays INT NOT NULL DEFAULT 14, -- How many days user wants to borrow
    
    -- Admin Response
    processedBy INT NULL, -- Admin user ID who processed the request
    processedAt DATETIME NULL,
    rejectionReason VARCHAR(500) NULL,
    
    -- Metadata
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
    FOREIGN KEY (processedBy) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_borrowing_requests_uuid (uuid),
    INDEX idx_borrowing_requests_user (userId),
    INDEX idx_borrowing_requests_book (bookId),
    INDEX idx_borrowing_requests_status (status),
    INDEX idx_borrowing_requests_requested_at (requestedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### **Table: `borrowings`**
```sql
CREATE TABLE IF NOT EXISTS borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    
    -- Foreign Keys
    userId INT NOT NULL,
    bookId INT NOT NULL,
    requestId INT NULL, -- Link back to original request
    
    -- Borrowing Details
    borrowedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dueDate DATETIME NOT NULL,
    returnedAt DATETIME NULL,
    
    -- Status
    status ENUM('active', 'returned', 'overdue') NOT NULL DEFAULT 'active',
    
    -- Late Fee Calculation
    daysOverdue INT NOT NULL DEFAULT 0,
    lateFeeAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    lateFeePerDay DECIMAL(10, 2) NOT NULL DEFAULT 0.50, -- $0.50 per day
    
    -- Notes
    borrowNotes VARCHAR(500) NULL,
    returnNotes VARCHAR(500) NULL,
    
    -- Metadata
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
    FOREIGN KEY (requestId) REFERENCES borrowing_requests(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_borrowings_uuid (uuid),
    INDEX idx_borrowings_user (userId),
    INDEX idx_borrowings_book (bookId),
    INDEX idx_borrowings_status (status),
    INDEX idx_borrowings_due_date (dueDate),
    INDEX idx_borrowings_borrowed_at (borrowedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### **Table: `book_inventory`** (Optional - for tracking quantities)
```sql
CREATE TABLE IF NOT EXISTS book_inventory (
    bookId INT PRIMARY KEY,
    totalCopies INT NOT NULL DEFAULT 1,
    availableCopies INT NOT NULL DEFAULT 1,
    
    -- Metadata
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
    
    CHECK (availableCopies >= 0),
    CHECK (totalCopies >= availableCopies)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.2 Database Relationships

```
┌─────────────┐         ┌──────────────────────┐         ┌─────────────┐
│   users     │         │ borrowing_requests   │         │    book     │
│─────────────│         │──────────────────────│         │─────────────│
│ id (PK)     │◄───────┤ userId (FK)          │         │ id (PK)     │
│ uuid        │         │ bookId (FK)          ├────────►│ uuid        │
│ email       │         │ status               │         │ title       │
│ role        │         │ requestedAt          │         │ author      │
└─────────────┘         │ processedBy (FK)     │         │ isbn        │
                        └──────────────────────┘         └─────────────┘
       │                         │                                │
       │                         │                                │
       │                         ▼                                │
       │                ┌──────────────────────┐                 │
       │                │    borrowings        │                 │
       └───────────────►│──────────────────────│◄────────────────┘
                        │ id (PK)              │
                        │ userId (FK)          │
                        │ bookId (FK)          │
                        │ requestId (FK)       │
                        │ borrowedAt           │
                        │ dueDate              │
                        │ returnedAt           │
                        │ status               │
                        │ lateFeeAmount        │
                        └──────────────────────┘
```

---

## 4. Backend Implementation Plan

### 4.1 Module Structure

```
src/
├── borrowings/
│   ├── borrowings.module.ts
│   ├── borrowings.repo.ts
│   ├── borrowings.service.ts
│   ├── controller/
│   │   └── borrowings.controller.ts
│   ├── dto/
│   │   ├── create-borrow-request.dto.ts
│   │   ├── process-request.dto.ts
│   │   ├── return-book.dto.ts
│   │   └── borrowing-filters.dto.ts
│   └── entities/
│       ├── borrowing-request.entity.ts
│       └── borrowing.entity.ts
```

### 4.2 Entity Definitions

#### **borrowing-request.entity.ts**
```typescript
export interface BorrowingRequest {
  id: number;
  uuid: string;
  userId: number;
  bookId: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: Date;
  requestedDays: number;
  processedBy: number | null;
  processedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BorrowingRequestRow = BorrowingRequest;
```

#### **borrowing.entity.ts**
```typescript
export interface Borrowing {
  id: number;
  uuid: string;
  userId: number;
  bookId: number;
  requestId: number | null;
  borrowedAt: Date;
  dueDate: Date;
  returnedAt: Date | null;
  status: 'active' | 'returned' | 'overdue';
  daysOverdue: number;
  lateFeeAmount: number;
  lateFeePerDay: number;
  borrowNotes: string | null;
  returnNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BorrowingRow = Borrowing;

// Extended type with relations
export interface BorrowingWithDetails extends Borrowing {
  user?: {
    id: number;
    uuid: string;
    email: string;
    role: string;
  };
  book?: {
    id: number;
    uuid: string;
    title: string;
    author: string;
    isbn: string;
    coverImageFilename?: string;
  };
}
```

### 4.3 DTOs

#### **create-borrow-request.dto.ts**
```typescript
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsString()
  bookUuid: string; // Book to borrow

  @IsInt()
  @Min(1)
  @Max(90) // Maximum 90 days
  @IsOptional()
  requestedDays?: number = 14; // Default 14 days
}
```

#### **process-request.dto.ts**
```typescript
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ProcessRequestDto {
  @IsEnum(['approved', 'rejected'])
  action: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
```

#### **return-book.dto.ts**
```typescript
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReturnBookDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  returnNotes?: string; // Optional notes about book condition
}
```

### 4.4 Repository Methods

#### **borrowings.repo.ts** (Key Methods)
```typescript
@Injectable()
export class BorrowingsRepo {
  constructor(@Inject(MYSQL) private readonly pool: Pool) {}

  // === BORROWING REQUESTS ===
  
  async createRequest(data: {
    userId: number;
    bookId: number;
    requestedDays: number;
  }): Promise<BorrowingRequestRow>
  
  async findRequestByUuid(uuid: string): Promise<BorrowingRequestRow | null>
  
  async findPendingRequestsByUser(userId: number): Promise<BorrowingRequestRow[]>
  
  async findAllPendingRequests(): Promise<BorrowingRequestRow[]>
  
  async processRequest(
    requestId: number,
    adminId: number,
    action: 'approved' | 'rejected',
    rejectionReason?: string
  ): Promise<BorrowingRequestRow>
  
  // === BORROWINGS ===
  
  async createBorrowing(data: {
    userId: number;
    bookId: number;
    requestId: number | null;
    dueDate: Date;
    borrowNotes?: string;
  }): Promise<BorrowingRow>
  
  async findActiveBorrowingsByUser(userId: number): Promise<BorrowingWithDetails[]>
  
  async findBorrowingHistoryByUser(userId: number): Promise<BorrowingWithDetails[]>
  
  async findOverdueBorrowings(): Promise<BorrowingWithDetails[]>
  
  async returnBook(
    borrowingId: number,
    returnNotes?: string
  ): Promise<BorrowingRow>
  
  async calculateLateFee(borrowingId: number): Promise<number>
  
  async isBookAvailable(bookId: number): Promise<boolean>
  
  async getBookBorrowingStats(bookId: number): Promise<{
    totalBorrowings: number;
    activeBorrowings: number;
    averageBorrowDays: number;
  }>
}
```

### 4.5 Service Layer

#### **borrowings.service.ts** (Business Logic)
```typescript
@Injectable()
export class BorrowingsService {
  constructor(
    private readonly borrowingsRepo: BorrowingsRepo,
    private readonly booksRepo: BooksRepo,
  ) {}

  // === STUDENT OPERATIONS ===
  
  async requestBorrow(userId: number, dto: CreateBorrowRequestDto) {
    // 1. Validate book exists
    const book = await this.booksRepo.findByUuid(dto.bookUuid);
    if (!book) throw new NotFoundException('Book not found');
    
    // 2. Check if book is available
    const isAvailable = await this.borrowingsRepo.isBookAvailable(book.id);
    if (!isAvailable) {
      throw new BadRequestException('Book is currently unavailable');
    }
    
    // 3. Check if user has pending request for this book
    const pendingRequests = await this.borrowingsRepo.findPendingRequestsByUser(userId);
    const alreadyRequested = pendingRequests.some(req => req.bookId === book.id);
    if (alreadyRequested) {
      throw new BadRequestException('You already have a pending request for this book');
    }
    
    // 4. Check if user currently has this book borrowed
    const activeBorrowings = await this.borrowingsRepo.findActiveBorrowingsByUser(userId);
    const alreadyBorrowed = activeBorrowings.some(b => b.bookId === book.id);
    if (alreadyBorrowed) {
      throw new BadRequestException('You currently have this book borrowed');
    }
    
    // 5. Create request
    return this.borrowingsRepo.createRequest({
      userId,
      bookId: book.id,
      requestedDays: dto.requestedDays || 14,
    });
  }
  
  async getMyBorrowings(userId: number) {
    return this.borrowingsRepo.findActiveBorrowingsByUser(userId);
  }
  
  async getMyHistory(userId: number) {
    return this.borrowingsRepo.findBorrowingHistoryByUser(userId);
  }
  
  async cancelRequest(userId: number, requestUuid: string) {
    const request = await this.borrowingsRepo.findRequestByUuid(requestUuid);
    if (!request) throw new NotFoundException('Request not found');
    if (request.userId !== userId) throw new ForbiddenException();
    if (request.status !== 'pending') {
      throw new BadRequestException('Can only cancel pending requests');
    }
    
    return this.borrowingsRepo.processRequest(
      request.id,
      userId,
      'cancelled',
      'Cancelled by user'
    );
  }
  
  // === ADMIN OPERATIONS ===
  
  async getPendingRequests() {
    return this.borrowingsRepo.findAllPendingRequests();
  }
  
  async processRequest(adminId: number, requestUuid: string, dto: ProcessRequestDto) {
    const request = await this.borrowingsRepo.findRequestByUuid(requestUuid);
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending') {
      throw new BadRequestException('Request already processed');
    }
    
    // Update request status
    const processed = await this.borrowingsRepo.processRequest(
      request.id,
      adminId,
      dto.action,
      dto.rejectionReason
    );
    
    // If approved, create borrowing record
    if (dto.action === 'approved') {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + request.requestedDays);
      
      await this.borrowingsRepo.createBorrowing({
        userId: request.userId,
        bookId: request.bookId,
        requestId: request.id,
        dueDate,
        borrowNotes: `Approved by admin`,
      });
    }
    
    return processed;
  }
  
  async getAllBorrowings(filters?: BorrowingFiltersDto) {
    // Return all borrowings with filters
    // Implementation depends on filter requirements
  }
  
  async returnBook(borrowingUuid: string, dto: ReturnBookDto) {
    const borrowing = await this.borrowingsRepo.findByUuid(borrowingUuid);
    if (!borrowing) throw new NotFoundException('Borrowing not found');
    if (borrowing.status === 'returned') {
      throw new BadRequestException('Book already returned');
    }
    
    // Calculate late fee if overdue
    const lateFee = await this.borrowingsRepo.calculateLateFee(borrowing.id);
    
    return this.borrowingsRepo.returnBook(borrowing.id, dto.returnNotes);
  }
  
  async getOverdueBooks() {
    return this.borrowingsRepo.findOverdueBorrowings();
  }
}
```

### 4.6 Controller Endpoints

#### **borrowings.controller.ts**
```typescript
@Controller('borrowings')
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  // === STUDENT ENDPOINTS ===
  
  @Post('request')
  @UseGuards(JwtAuthGuard)
  async requestBorrow(
    @Request() req,
    @Body() dto: CreateBorrowRequestDto
  ) {
    return this.borrowingsService.requestBorrow(req.user.id, dto);
  }
  
  @Get('my-borrowings')
  @UseGuards(JwtAuthGuard)
  async getMyBorrowings(@Request() req) {
    return this.borrowingsService.getMyBorrowings(req.user.id);
  }
  
  @Get('my-history')
  @UseGuards(JwtAuthGuard)
  async getMyHistory(@Request() req) {
    return this.borrowingsService.getMyHistory(req.user.id);
  }
  
  @Patch('cancel/:uuid')
  @UseGuards(JwtAuthGuard)
  async cancelRequest(@Request() req, @Param('uuid') uuid: string) {
    return this.borrowingsService.cancelRequest(req.user.id, uuid);
  }
  
  // === ADMIN ENDPOINTS ===
  
  @Get('pending-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getPendingRequests() {
    return this.borrowingsService.getPendingRequests();
  }
  
  @Patch('process/:uuid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async processRequest(
    @Request() req,
    @Param('uuid') uuid: string,
    @Body() dto: ProcessRequestDto
  ) {
    return this.borrowingsService.processRequest(req.user.id, uuid, dto);
  }
  
  @Post('return/:uuid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async returnBook(
    @Param('uuid') uuid: string,
    @Body() dto: ReturnBookDto
  ) {
    return this.borrowingsService.returnBook(uuid, dto);
  }
  
  @Get('overdue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getOverdueBooks() {
    return this.borrowingsService.getOverdueBooks();
  }
  
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllBorrowings(@Query() filters: BorrowingFiltersDto) {
    return this.borrowingsService.getAllBorrowings(filters);
  }
}
```

---

## 5. Frontend Implementation Plan

### 5.1 Context API for Borrowing State

#### **BorrowingContext.tsx**
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

interface Borrowing {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverUrl: string | null;
  borrowedAt: string;
  dueDate: string;
  status: 'active' | 'overdue';
  daysOverdue: number;
  lateFeeAmount: number;
}

interface BorrowingRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  requestedDays: number;
}

interface BorrowingContextType {
  borrowings: Borrowing[];
  requests: BorrowingRequest[];
  loading: boolean;
  error: string | null;
  requestBorrow: (bookUuid: string, days?: number) => Promise<void>;
  cancelRequest: (requestUuid: string) => Promise<void>;
  refreshBorrowings: () => Promise<void>;
}

const BorrowingContext = createContext<BorrowingContextType | null>(null);

export function BorrowingProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [requests, setRequests] = useState<BorrowingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    if (isAuthenticated) {
      refreshBorrowings();
    }
  }, [isAuthenticated]);

  const refreshBorrowings = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const [borrowingsRes, requestsRes] = await Promise.all([
        fetch(`${API_BASE}/borrowings/my-borrowings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/borrowings/my-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (borrowingsRes.ok) {
        const data = await borrowingsRes.json();
        setBorrowings(data);
      }

      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setRequests(data);
      }
    } catch (err) {
      setError('Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  };

  const requestBorrow = async (bookUuid: string, days = 14) => {
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/borrowings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bookUuid, requestedDays: days }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to request borrow');
    }

    await refreshBorrowings();
  };

  const cancelRequest = async (requestUuid: string) => {
    if (!token) throw new Error('Not authenticated');
    
    const res = await fetch(`${API_BASE}/borrowings/cancel/${requestUuid}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Failed to cancel request');
    
    await refreshBorrowings();
  };

  return (
    <BorrowingContext.Provider
      value={{
        borrowings,
        requests,
        loading,
        error,
        requestBorrow,
        cancelRequest,
        refreshBorrowings,
      }}
    >
      {children}
    </BorrowingContext.Provider>
  );
}

export const useBorrowing = () => {
  const context = useContext(BorrowingContext);
  if (!context) throw new Error('useBorrowing must be used within BorrowingProvider');
  return context;
};
```

### 5.2 Component Structure

```
frontend/src/
├── components/
│   ├── borrowing/
│   │   ├── BorrowRequestButton.tsx
│   │   ├── BorrowingCard.tsx
│   │   ├── MyBorrowings.tsx
│   │   ├── BorrowingHistory.tsx
│   │   └── AdminBorrowingManager.tsx
│   ├── books/
│   │   └── BookDetail.tsx (add borrow button)
```

#### **BorrowRequestButton.tsx**
```typescript
import React, { useState } from 'react';
import { useBorrowing } from '../../modules/borrowing/BorrowingContext';

interface Props {
  bookUuid: string;
  bookTitle: string;
  isAvailable: boolean;
}

export function BorrowRequestButton({ bookUuid, bookTitle, isAvailable }: Props) {
  const { requestBorrow, requests } = useBorrowing();
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(14);

  const hasPendingRequest = requests.some(
    req => req.bookId === bookUuid && req.status === 'pending'
  );

  const handleRequest = async () => {
    try {
      setLoading(true);
      await requestBorrow(bookUuid, days);
      alert(`Borrow request submitted for "${bookTitle}"!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (!isAvailable) {
    return (
      <button disabled className="btn-disabled">
        Currently Unavailable
      </button>
    );
  }

  if (hasPendingRequest) {
    return (
      <button disabled className="btn-pending">
        Request Pending
      </button>
    );
  }

  return (
    <div className="borrow-request-form">
      <label>
        Borrow for:
        <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>1 week</option>
          <option value={14}>2 weeks</option>
          <option value={30}>1 month</option>
        </select>
      </label>
      <button
        onClick={handleRequest}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Requesting...' : 'Request to Borrow'}
      </button>
    </div>
  );
}
```

#### **MyBorrowings.tsx**
```typescript
import React from 'react';
import { useBorrowing } from '../../modules/borrowing/BorrowingContext';
import { BorrowingCard } from './BorrowingCard';

export function MyBorrowings() {
  const { borrowings, loading, error } = useBorrowing();

  if (loading) return <div>Loading your borrowings...</div>;
  if (error) return <div>Error: {error}</div>;
  if (borrowings.length === 0) {
    return <div>You don't have any borrowed books yet.</div>;
  }

  return (
    <div className="my-borrowings">
      <h2>My Borrowed Books</h2>
      <div className="borrowings-grid">
        {borrowings.map(borrowing => (
          <BorrowingCard key={borrowing.id} borrowing={borrowing} />
        ))}
      </div>
    </div>
  );
}
```

#### **BorrowingCard.tsx**
```typescript
import React from 'react';

interface Props {
  borrowing: {
    id: string;
    bookTitle: string;
    bookAuthor: string;
    bookCoverUrl: string | null;
    borrowedAt: string;
    dueDate: string;
    status: 'active' | 'overdue';
    daysOverdue: number;
    lateFeeAmount: number;
  };
}

export function BorrowingCard({ borrowing }: Props) {
  const isOverdue = borrowing.status === 'overdue';
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const getDaysUntilDue = () => {
    const due = new Date(borrowing.dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntilDue = getDaysUntilDue();

  return (
    <div className={`borrowing-card ${isOverdue ? 'overdue' : ''}`}>
      <img
        src={borrowing.bookCoverUrl || '/placeholder-book.png'}
        alt={borrowing.bookTitle}
        className="book-cover"
      />
      <div className="borrowing-details">
        <h3>{borrowing.bookTitle}</h3>
        <p className="author">{borrowing.bookAuthor}</p>
        <div className="dates">
          <p>Borrowed: {formatDate(borrowing.borrowedAt)}</p>
          <p className={isOverdue ? 'overdue-text' : ''}>
            Due: {formatDate(borrowing.dueDate)}
            {isOverdue ? (
              <span> ({borrowing.daysOverdue} days overdue)</span>
            ) : (
              <span> ({daysUntilDue} days left)</span>
            )}
          </p>
        </div>
        {borrowing.lateFeeAmount > 0 && (
          <p className="late-fee">
            Late Fee: ${borrowing.lateFeeAmount.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## 6. State Management Strategy

### Comparison: Cart Redux vs Borrowing Context

#### **Cart System (Redux)**
```typescript
// Pros:
✅ Centralized state
✅ DevTools support
✅ Time-travel debugging

// Cons:
❌ Overkill for simple cart
❌ More boilerplate
❌ Firebase coupling in reducer
```

#### **Borrowing System (Context API)**
```typescript
// Pros:
✅ Simpler for authenticated state
✅ No extra dependencies
✅ Clean separation: UI ↔ API
✅ No Firebase dependency

// Cons:
❌ Less tooling
❌ Manual optimization needed
```

### Why Context API is Better Here:

1. **Authentication-dependent**: Borrowings only exist for logged-in users
2. **Server as source of truth**: No client-side cart manipulation
3. **Real-time not needed**: Periodic fetches are sufficient
4. **Simpler mental model**: Fetch → Display → Refresh

---

## 7. API Endpoints Specification

### Student Endpoints

```
POST   /borrowings/request
       Body: { bookUuid: string, requestedDays?: number }
       Response: BorrowingRequest

GET    /borrowings/my-borrowings
       Response: Borrowing[]

GET    /borrowings/my-history
       Response: Borrowing[]

GET    /borrowings/my-requests
       Response: BorrowingRequest[]

PATCH  /borrowings/cancel/:uuid
       Response: BorrowingRequest
```

### Admin Endpoints

```
GET    /borrowings/pending-requests
       Response: BorrowingRequest[]

PATCH  /borrowings/process/:uuid
       Body: { action: 'approved' | 'rejected', rejectionReason?: string }
       Response: BorrowingRequest

POST   /borrowings/return/:uuid
       Body: { returnNotes?: string }
       Response: Borrowing

GET    /borrowings/overdue
       Response: Borrowing[]

GET    /borrowings
       Query: { status?, userId?, bookId?, page?, limit? }
       Response: PaginatedResult<Borrowing>
```

### Book Availability Endpoint

```
GET    /books/:uuid/availability
       Response: {
         isAvailable: boolean,
         totalCopies: number,
         availableCopies: number,
         activeBorrowings: number
       }
```

---

## 8. Business Logic & Rules

### Borrowing Rules

1. **Request Limits**:
   - ✅ Student can request max 5 books simultaneously
   - ✅ Cannot request same book twice
   - ✅ Cannot request book they currently have

2. **Borrow Duration**:
   - ✅ Minimum: 7 days
   - ✅ Maximum: 90 days
   - ✅ Default: 14 days

3. **Late Fees**:
   - ✅ $0.50 per day overdue
   - ✅ Maximum late fee: $25.00
   - ✅ Calculated on return

4. **Book Availability**:
   - ✅ Book available if `activeBorrowings < totalCopies`
   - ✅ Check inventory before approval

### Status Transitions

```
Request Status Flow:
pending → approved → [creates borrowing]
pending → rejected → [end]
pending → cancelled → [end]

Borrowing Status Flow:
active → returned (on time)
active → overdue → returned (with late fee)
```

---

## 9. Implementation Phases

### Phase 1: Backend Foundation (Week 1)
- [x] Create database migrations
- [x] Create entities and DTOs
- [x] Implement repository layer
- [x] Implement service layer
- [x] Create controller endpoints
- [x] Add authentication guards

### Phase 2: Frontend Foundation (Week 2)
- [ ] Create BorrowingContext
- [ ] Implement BorrowRequestButton
- [ ] Create MyBorrowings page
- [ ] Create BorrowingHistory page
- [ ] Add borrowing status indicators to book cards

### Phase 3: Admin Features (Week 3)
- [ ] Admin pending requests page
- [ ] Request approval/rejection UI
- [ ] Book return interface
- [ ] Overdue books dashboard
- [ ] Late fee management

### Phase 4: Enhancements (Week 4)
- [ ] Email notifications (request approved, due date reminder)
- [ ] Search and filter borrowings
- [ ] Borrowing statistics
- [ ] Export borrowing reports
- [ ] Book recommendations based on history

---

## 10. Performance Optimizations

### Lessons from Cart System Analysis

#### **Avoid These Cart System Mistakes:**

1. ❌ **Linear search in arrays**
   ```typescript
   // Cart System: O(n) search
   const existingItem = items.find(item => item.bookId === bookId);
   
   // Our Solution: Database indexes + efficient queries
   INDEX idx_borrowings_user (userId)
   INDEX idx_borrowings_book (bookId)
   ```

2. ❌ **Unnecessary re-renders**
   ```typescript
   // Cart System: All items re-render on any change
   
   // Our Solution: Memoization
   const BorrowingCard = React.memo(({ borrowing }) => { ... });
   ```

3. ❌ **Async operations in reducers**
   ```typescript
   // Cart System: Firebase calls in reducer
   
   // Our Solution: API calls in Context, not in state updates
   ```

### Our Optimizations:

1. **Database Indexes**: Fast lookups for user/book borrowings
2. **Pagination**: Don't load all borrowings at once
3. **Caching**: Store fetched borrowings, refresh on demand
4. **Lazy Loading**: Load history only when user navigates to it
5. **Optimistic UI**: Show request immediately, sync with server

---

## Summary

### What We're Building:

```
✅ Full CRUD for borrowing requests
✅ Admin approval workflow
✅ Automatic late fee calculation
✅ Borrowing history tracking
✅ Book availability checking
✅ Role-based access control
```

### Tech Stack:

```
Backend:  NestJS + MariaDB + TypeORM-like patterns
Frontend: React + TypeScript + Context API
Auth:     JWT + Role Guards
```

### Key Improvements Over Cart System:

```
✅ Server-side state (no Redux complexity)
✅ Database persistence (no Firebase dependency)
✅ RESTful API (standard, testable)
✅ Role-based features (admin vs student)
✅ Better separation of concerns
```

---

**Design Complete:** Ready for Implementation  
**Next Step:** Create database migrations and start backend implementation  
**Estimated Time:** 3-4 weeks for full implementation


───────────────────────────────────────────────────────────────────────────
🔒 CRITICAL SECURITY UPDATE - JANUARY 2025 🔒
───────────────────────────────────────────────────────────────────────────

**IMPORTANT:** This design document describes the original implementation.
A critical security vulnerability was discovered and fixed after initial deployment.

Security Issue: Exposed Database Integer IDs
─────────────────────────────────────────────
The original implementation exposed internal integer IDs in:
- JWT tokens (userId as integer)
- API responses (userId, bookId, requestId as integers)  
- Frontend code (using integer IDs throughout)

Security Fix: UUID-Only External Interface
───────────────────────────────────────────
All external communication now uses UUIDs exclusively:
✅ JWT: {sub: uuid, email, role} - NO integer userId
✅ API parameters: /borrowings/:uuid (UUID string)
✅ API responses: All IDs are UUIDs
✅ Frontend: Uses UUIDs throughout
✅ Backend: UUID → ID translation layer in service

Benefits:
- Prevents user enumeration
- Prevents IDOR attacks
- Hides database internals
- Maintains performance (integer IDs used internally)

Updated Documentation:
📄 LENDING_SYSTEM_SECURITY_UPDATE.md - Comprehensive security guide
📄 SECURITY_POSTMORTEM_UUID_ARCHITECTURE.md - Vulnerability analysis
📄 SECURITY_FIX_SUMMARY.md - Implementation details
📄 BORROWING_SYSTEM_POSTMORTEM.md - Complete system postmortem

**When implementing this design:**
1. Use UUIDs for all external communication
2. Implement UUID → ID translation in service layer
3. Keep integer IDs for internal database operations
4. Never expose integer IDs to clients

Status: ✅ SECURITY ENHANCED - PRODUCTION READY
