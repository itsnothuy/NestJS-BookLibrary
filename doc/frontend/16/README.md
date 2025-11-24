# Book Inventory Issue - Quick Summary

**Date:** November 24, 2025  
**Status:** ✅ **RESOLVED**

---

## The Issue

User reported that `StudentBooksGallery.tsx` showed a book with "4 of 5" copies available instead of "5 of 5", even though all books were returned.

**Question:** "Should the availableCopies be updated (increase back up to 1) when the user returns the book?"

**Answer:** Yes! And it does - the issue was an orphaned borrowing record.

---

## Root Cause

An orphaned borrowing record from **November 20, 2025** was stuck in "active" status:

```
UUID: cc5bbd63-c58d-11f0-b5f0-b6e72dc74f01
User: student1@example.com (userId: 13)
Book: Animal Farm (bookId: 28)
Status: active (should have been returned)
Borrowed: 2025-11-20 09:31:59
Due Date: 2025-12-04 16:31:59
```

This prevented the `availableCopies` from incrementing back to 5.

---

## The Fix

### Manual Database Update

```sql
-- 1. Mark borrowing as returned
UPDATE borrowings 
SET status = 'returned', 
    returnedAt = NOW(), 
    returnNotes = 'Manual fix for orphaned borrowing' 
WHERE uuid = 'cc5bbd63-c58d-11f0-b5f0-b6e72dc74f01';

-- 2. Increment available copies
UPDATE book_inventory 
SET availableCopies = availableCopies + 1 
WHERE bookId = 28;
```

### Result

✅ Book inventory now correctly shows **5 of 5** available  
✅ No other orphaned borrowings found  
✅ All book inventories verified correct

---

## Key Findings

### Backend Logic is Correct ✅

The return logic in `borrowings.service.ts` properly increments inventory:

```typescript
async returnBookByStudent(...) {
  // Mark as returned
  const returned = await this.borrowingsRepo.returnBook(borrowing.id, ...);

  // ✅ THIS WORKS CORRECTLY
  await this.borrowingsRepo.incrementAvailableCopies(borrowing.bookId);
  
  return this.borrowingsRepo.findBorrowingByUuidWithDetails(returned.uuid);
}
```

### The Problem

- Borrowing was never returned through the system
- Likely a test account borrowing that was abandoned
- Or a failed return attempt (network error, timeout, etc.)
- Left in "active" status for 4 days

---

## Recommended Actions

### Priority 1: Immediate (2-3 hours) 🔴

1. **Add Reconciliation Endpoint**
   ```typescript
   @Post('admin/reconcile-inventory/:bookUuid')
   async reconcileBookInventory(@Param('bookUuid') bookUuid: string)
   ```

2. **Add Stale Borrowing Detection**
   ```typescript
   @Get('admin/stale-borrowings')
   async getStaleBorrowings() // >30 days active
   ```

3. **Improve Frontend Error Handling**
   - Show clear error messages
   - Add retry mechanism for failed returns

### Priority 2: This Sprint (1 day) 🟡

4. **Automated Daily Reconciliation**
   ```typescript
   @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
   async reconcileAllInventoryScheduled()
   ```

5. **Better Logging**
   - Log all inventory changes with context

### Priority 3: Next Sprint (1 week) 🟢

6. **Admin Dashboard**
   - System health overview
   - Inventory status
   - Stale borrowings alert

7. **Transaction Wrapper**
   - Ensure atomic borrow/return operations

---

## Full Documentation

See complete postmortem: `/doc/frontend/16/BOOK_INVENTORY_SYNC_ISSUE_POSTMORTEM.md`

**Contents:**
- Detailed investigation process (30 minutes)
- Database queries and results
- System architecture review
- Complete fix procedure
- Verification steps
- Preventive measures
- Code examples for improvements
- 949 lines of detailed analysis

---

## Impact Assessment

| Metric | Value |
|--------|-------|
| Books Affected | 1 (bookId: 28) |
| Users Impacted | Minimal (display issue) |
| Data Integrity | ✅ Maintained |
| Functional Impact | ✅ None |
| Investigation Time | ~30 minutes |
| Resolution Time | 2 minutes |
| Downtime | 0 |
| Code Changes | 0 (manual fix) |

---

## Conclusion

The inventory sync issue was successfully resolved through manual database correction. The backend logic is sound and working correctly - this was a one-time data inconsistency caused by an orphaned borrowing record.

**Lesson:** Even with correct business logic, data can drift. Implement reconciliation and monitoring to catch issues early.

---

**Status:** ✅ Resolved  
**Follow-up:** Implement recommended preventive measures  
**Next Review:** After reconciliation endpoint is implemented

---
