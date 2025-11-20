# 📚 Book Lending System - Quick Start Guide

## 🚀 Setup (5 minutes)

### 1. Run Database Migrations

**Option A: Automated Script (Recommended)**
```bash
./setup-borrowing-system.sh
```

**Option B: Manual**
```bash
mysql -u root -p your_database < src/database/migrations/create_borrowing_requests.sql
mysql -u root -p your_database < src/database/migrations/create_borrowings.sql
mysql -u root -p your_database < src/database/migrations/create_book_inventory.sql
```

### 2. Verify Backend Setup

The `BorrowingsModule` is already registered in `app.module.ts`. Just restart your server:

```bash
npm run start:dev
```

### 3. Integrate Frontend

Update your `App.tsx` or `main.tsx`:

```typescript
import { BorrowingProvider } from './modules/borrowing/BorrowingContext';

function App() {
  return (
    <AuthProvider>
      <BorrowingProvider>
        {/* Your existing app */}
      </BorrowingProvider>
    </AuthProvider>
  );
}
```

### 4. Add Routes

```typescript
import { MyBorrowings } from './components/borrowing/MyBorrowings';
import { BorrowingHistory } from './components/borrowing/BorrowingHistory';
import { AdminBorrowingManager } from './components/borrowing/AdminBorrowingManager';

// In your router:
<Route path="/my-borrowings" element={<MyBorrowings />} />
<Route path="/borrowing-history" element={<BorrowingHistory />} />
<Route path="/admin/borrowings" element={<AdminBorrowingManager />} />
```

### 5. Add Borrow Button to Book Detail

```typescript
import { BorrowRequestButton } from './components/borrowing/BorrowRequestButton';

// In your book detail component:
<BorrowRequestButton 
  bookUuid={book.uuid} 
  bookTitle={book.title} 
/>
```

---

## 🧪 Testing

### Test API Endpoints

```bash
# Get your JWT token first
TOKEN="your_jwt_token"

# Request to borrow a book
curl -X POST http://localhost:3000/borrowings/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookUuid": "book-uuid-here", "requestedDays": 14}'

# Get my borrowings
curl http://localhost:3000/borrowings/my-borrowings \
  -H "Authorization: Bearer $TOKEN"

# Check book availability
curl http://localhost:3000/borrowings/availability/book-uuid-here \
  -H "Authorization: Bearer $TOKEN"

# Admin: Get pending requests
curl http://localhost:3000/borrowings/admin/pending-requests \
  -H "Authorization: Bearer $TOKEN"

# Admin: Approve request
curl -X PATCH http://localhost:3000/borrowings/admin/process/request-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "approved"}'
```

---

## 📊 Features Overview

### For Students:
- ✅ Request to borrow books (7-90 days)
- ✅ View active borrowings
- ✅ Track due dates
- ✅ See late fees
- ✅ View borrowing history
- ✅ Cancel pending requests

### For Admins:
- ✅ View all pending requests
- ✅ Approve/reject requests
- ✅ Process book returns
- ✅ View overdue books
- ✅ Track borrowing statistics

### Automatic Features:
- ✅ Late fee calculation ($0.50/day, max $25)
- ✅ Overdue detection
- ✅ Book availability tracking
- ✅ Inventory management

---

## 🎯 Business Rules

| Rule | Value |
|------|-------|
| Max simultaneous borrowings | 5 books |
| Min borrow duration | 7 days |
| Max borrow duration | 90 days |
| Late fee per day | $0.50 |
| Max late fee | $25.00 |
| Default borrow duration | 14 days |

---

## 📁 File Structure

```
Backend:
src/borrowings/
├── entities/              # TypeScript interfaces
├── dto/                   # Request/Response DTOs
├── controller/            # API endpoints
├── module/                # NestJS module
├── borrowings.repo.ts     # Database operations
└── borrowings.service.ts  # Business logic

Frontend:
frontend/src/
├── modules/borrowing/
│   └── BorrowingContext.tsx    # State management
└── components/borrowing/
    ├── BorrowRequestButton.tsx  # Request to borrow
    ├── BorrowingCard.tsx        # Display borrowing
    ├── MyBorrowings.tsx         # Active borrowings page
    ├── BorrowingHistory.tsx     # History page
    └── AdminBorrowingManager.tsx # Admin panel

Database:
src/database/migrations/
├── create_borrowing_requests.sql
├── create_borrowings.sql
└── create_book_inventory.sql
```

---

## 🐛 Troubleshooting

### Issue: "Table doesn't exist"
**Solution:** Run the migration scripts in order

### Issue: "Cannot read property of undefined"
**Solution:** Make sure `BorrowingProvider` wraps your app

### Issue: "Request fails with 401"
**Solution:** Check that JWT token is valid and not expired

### Issue: "Book not available"
**Solution:** Check `book_inventory` table has the book with `availableCopies > 0`

### Issue: "Late fee not updating"
**Solution:** Call `GET /borrowings/my-borrowings` to trigger recalculation

---

## 📖 Documentation

- **Full Design:** [LENDING_SYSTEM_DESIGN.md](./LENDING_SYSTEM_DESIGN.md)
- **Implementation Summary:** [LENDING_SYSTEM_IMPLEMENTATION_SUMMARY.md](./LENDING_SYSTEM_IMPLEMENTATION_SUMMARY.md)
- **Cart System Analysis:** [CART_SYSTEM_DEEP_DIVE_ANALYSIS.md](./CART_SYSTEM_DEEP_DIVE_ANALYSIS.md)

---

## 🎨 UI Components

All components use **Tailwind CSS** and **DaisyUI** for styling. They are fully responsive and match your existing design system.

---

## 🔄 Migration Path

If you have existing borrowing data, create a migration script to:
1. Map old data to new schema
2. Calculate current overdue status
3. Update book inventory counts

---

## ✅ Checklist

- [ ] Run database migrations
- [ ] Backend server running
- [ ] Frontend integrated with BorrowingProvider
- [ ] Routes added for borrowing pages
- [ ] Borrow button added to book details
- [ ] Test student flow (request → view → history)
- [ ] Test admin flow (approve → return)
- [ ] Test edge cases (max limit, duplicate requests)

---

## 🚀 Go Live!

Once all tests pass, you're ready to deploy!

**Need Help?** Review the documentation or check the inline code comments.

---

**Built with:** NestJS + MariaDB + React + TypeScript + ❤️


───────────────────────────────────────────────────────────────────────────
⚠️ IMPORTANT SECURITY NOTICE - JANUARY 2025 ⚠️
───────────────────────────────────────────────────────────────────────────

**CRITICAL UPDATE:** UUID-Only Architecture Required

Security Enhancement Implemented
─────────────────────────────────
The borrowing system now uses UUID-only external interface to prevent:
- User enumeration attacks
- IDOR (Insecure Direct Object Reference) vulnerabilities
- Information leakage about database internals

Required Changes for Integration:
──────────────────────────────────
1. ✅ JWT must contain UUID (not integer userId)
2. ✅ All API calls must use UUIDs (bookUuid, not bookId)
3. ✅ API responses return UUIDs only
4. ✅ Frontend components use UUID props

Quick Verification:
───────────────────
# Decode your JWT - should contain UUID
echo $TOKEN | cut -d'.' -f2 | base64 -d | jq
# Expected: {"sub": "uuid-string", "email": "...", "role": "..."}
# Should NOT contain: "userId" or any integer ID

# Test API request
curl -X POST http://localhost:3000/borrowings/request \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookUuid": "your-book-uuid", "requestedDays": 14}'
# Use bookUuid (not bookId)

Updated Integration Steps:
──────────────────────────
1. Verify JWT contains UUID-only payload
2. Update BorrowRequestButton props:
   <BorrowRequestButton 
     bookUuid={book.uuid}    // ✅ Use UUID
     bookTitle={book.title} 
   />

3. BorrowingContext automatically uses UUIDs
4. All admin operations use UUID parameters

Security Benefits:
──────────────────
✅ No user enumeration (random UUIDs)
✅ No predictable resource IDs
✅ IDOR attacks prevented
✅ Database size hidden from attackers
✅ Performance maintained (internal integer IDs)

Detailed Documentation:
───────────────────────
📄 LENDING_SYSTEM_SECURITY_UPDATE.md - Complete security guide
📄 SECURITY_POSTMORTEM_UUID_ARCHITECTURE.md - Vulnerability details
📄 SECURITY_FIX_SUMMARY.md - Implementation changes

Status: ✅ SECURE & PRODUCTION READY
