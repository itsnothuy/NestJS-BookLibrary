# Student Dashboard & Book Cover Images Implementation

## Overview
This update implements a student-facing book gallery and adds image storage capabilities for books (similar to how user avatars are handled).

## Backend Changes

### 1. Database Schema
- **New Column**: Added `coverImageFilename` to the `book` table
- **Migration**: Created migration script at `src/database/migrations/add-book-cover-column.ts`
- **Type**: VARCHAR(255), nullable, stores filename like "book-cover-123456789.jpg"

### 2. Books Entity (`src/books/entities/book.entity.ts`)
```typescript
export interface Book {
  id: number;
  uuid: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  coverImageFilename?: string; // NEW FIELD
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Books Response DTO (`src/books/dto/book-response.dto.ts`)
- Added `coverImageUrl` field that converts `coverImageFilename` to a public URL
- Format: `/uploads/book-covers/${filename}`

### 4. Books Repository (`src/books/books.repo.ts`)
- Updated `updateByUuid()` method to handle `coverImageFilename` field

### 5. Books Service (`src/books/service/books.service.ts`)
- Added `updateCoverImage()` method to handle book cover uploads
- Similar pattern to user avatar uploads

### 6. Books Controller (`src/books/controller/books.controller.ts`)
- **New Endpoint**: `POST /books/:id/cover` (Admin only)
- Uses `FileInterceptor` with multer for file handling
- Stores files in `./uploads/book-covers/` directory
- File size limit: 5MB

### 7. Book Cover Controller (`src/books/controller/book-cover.controller.ts`)
- **New Controller**: Serves book cover images
- **Endpoint**: `GET /uploads/book-covers/:filename`
- Similar to avatar controller pattern

### 8. Books Module (`src/books/module/books.module.ts`)
- Registered `BookCoverController` alongside `BooksController`

## Frontend Changes

### 1. Student Books Gallery Component
**File**: `frontend/src/components/books/StudentBooksGallery.tsx`
- Uses HeroUI `Card`, `CardBody`, `CardFooter`, and `Image` components
- Displays books in a responsive grid (2-5 columns depending on screen size)
- Features:
  - Book cover images with fallback placeholder
  - Book title, author, and published year
  - "Borrow" button for future functionality
  - Loading and error states
  - Empty state message

**File**: `frontend/src/components/books/StudentBooksGallery.css`
- Block-style CSS matching existing codebase patterns
- Responsive grid layout with breakpoints:
  - Mobile: 2 columns
  - Tablet (640px+): 3 columns
  - Desktop (1024px+): 4 columns
  - Large Desktop (1280px+): 5 columns
- Card hover effects and smooth transitions
- Proper text truncation for long titles

### 2. Student Dashboard Page
**File**: `frontend/src/modules/app/StudentDashboard.tsx`
- Simple layout with Header and StudentBooksGallery
- Uses the same Header component as admin dashboard

**File**: `frontend/src/modules/app/StudentDashboard.css`
- Minimal styling for dashboard container
- Full-height layout with flexible main content area

### 3. Routing Updates
**File**: `frontend/src/main.tsx`
- Added `RoleBasedDashboard` component that routes based on user role:
  - Admin users → `Dashboard` (existing admin interface)
  - Student users → `StudentDashboard` (new student interface)
- Students and admins share the same Header component

## API Endpoints

### Book Cover Upload (Admin Only)
```
POST /books/:id/cover
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
- cover: <file>

Response:
{
  "id": "uuid",
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "123-456-789",
  "publishedYear": 2024,
  "coverImageUrl": "/uploads/book-covers/book-cover-1234567890.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Book Cover
```
GET /uploads/book-covers/:filename
Public endpoint (no authentication required)
```

### List Books (Public)
```
GET /books
Public endpoint - returns all books with coverImageUrl if available
```

## File Structure

```
src/
├── books/
│   ├── entities/
│   │   └── book.entity.ts (updated)
│   ├── dto/
│   │   └── book-response.dto.ts (updated)
│   ├── controller/
│   │   ├── books.controller.ts (updated)
│   │   └── book-cover.controller.ts (new)
│   ├── service/
│   │   └── books.service.ts (updated)
│   ├── module/
│   │   └── books.module.ts (updated)
│   └── books.repo.ts (updated)
├── database/
│   └── migrations/
│       └── add-book-cover-column.ts (new)
└── uploads/
    └── book-covers/ (new directory, created automatically)

frontend/src/
├── components/
│   ├── books/
│   │   ├── StudentBooksGallery.tsx (new)
│   │   └── StudentBooksGallery.css (new)
│   └── layout/
│       └── Header.tsx (shared by both roles)
├── modules/
│   └── app/
│       ├── Dashboard.tsx (admin)
│       ├── StudentDashboard.tsx (new - student)
│       └── StudentDashboard.css (new)
└── main.tsx (updated routing)
```

## How to Use

### For Administrators:
1. Login as admin
2. Navigate to Books tab
3. Create/edit a book
4. Upload a cover image using the new cover upload endpoint
5. The cover will be displayed in the student gallery

### For Students:
1. Login as student
2. Automatically redirected to the student book gallery
3. Browse available books with cover images
4. Click "Borrow" to rent a book (functionality to be implemented)

## Testing

### Run Migration:
```bash
npx ts-node src/database/migrations/add-book-cover-column.ts
```

### Start Backend:
```bash
npm run start:dev
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

## Next Steps / Future Enhancements

1. **Book Borrowing System**: Implement actual borrow/return functionality
2. **Book Details Modal**: Show full book details when clicking a card
3. **Search & Filter**: Add search and filtering capabilities for students
4. **Pagination**: Add pagination for large book collections
5. **Book Availability Status**: Show if a book is available or borrowed
6. **Borrowing History**: Track which books students have borrowed
7. **Cover Image Upload UI**: Add upload interface in admin panel (currently API-only)

## Design Patterns Used

1. **Separation of Concerns**: Student and admin interfaces are completely separate
2. **Reusable Components**: Header component shared between both roles
3. **Role-Based Routing**: Automatic redirection based on user role
4. **Consistent Styling**: Block CSS matching existing codebase patterns
5. **Responsive Design**: Mobile-first approach with breakpoints
6. **API Consistency**: Book cover handling mirrors user avatar pattern

## Notes

- Book cover images are stored in `./uploads/book-covers/`
- The database migration is idempotent (safe to run multiple times)
- All book endpoints remain public except cover upload (admin only)
- Students can view books without authentication at API level, but frontend requires login
- HeroUI components provide accessible, responsive UI out of the box
