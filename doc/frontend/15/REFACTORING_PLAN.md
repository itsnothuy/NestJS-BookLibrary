# Refactoring Attempt Postmortem & Revised Plan

**Date:** November 24, 2025  
**Status:** 🔄 **Reverted - Planning Phase**  
**Author:** AI Assistant

---

## Executive Summary

This document details a failed refactoring attempt and provides a comprehensive plan for doing it properly.

### What Happened

An attempt was made to centralize data fetching using React Context API, but it was **rushed and incomplete**:

❌ **What Went Wrong:**
- Took shortcuts with complex components (PaginatedBooksTable)
- Didn't fully understand all existing logic before modifying
- Created "partial refactorings" that broke functionality
- Didn't test changes properly
- Simplified logic that should have been preserved

✅ **What Was Kept:**
- Documentation (educational value)
- Analysis of problems
- Understanding of Context API benefits

🔄 **What Was Reverted:**
- All code changes
- Context providers
- Type definitions
- Component refactorings

---

## Table of Contents

1. [What Was Attempted](#what-was-attempted)
2. [Why It Failed](#why-it-failed)
3. [Lessons Learned](#lessons-learned)
4. [Current Codebase Analysis](#current-codebase-analysis)
5. [Proper Refactoring Plan](#proper-refactoring-plan)
6. [Implementation Strategy](#implementation-strategy)
7. [Testing Strategy](#testing-strategy)
8. [Success Criteria](#success-criteria)

---

## What Was Attempted

### Original Goal

Centralize data fetching to eliminate redundant API calls and fix type inconsistencies.

### What Was Implemented

1. **Created shared types** (`frontend/src/types/index.ts`)
   - 300+ lines of type definitions
   - Matched backend DTOs

2. **Created BooksContext** (`frontend/src/modules/books/BooksContext.tsx`)
   - 600+ lines of code
   - Caching with 5-minute TTL
   - CRUD operations

3. **Created UsersContext** (`frontend/src/modules/users/UsersContext.tsx`)
   - 500+ lines of code
   - Similar structure to BooksContext

4. **Refactored Components:**
   - `StudentBooksGallery.tsx` - Removed fetch logic ⚠️
   - `BookCarousel.tsx` - Fixed type issues ⚠️
   - `PaginatedBooksTable.tsx` - **Partial refactor** ❌

5. **Updated main.tsx:**
   - Added provider nesting

### Problems with Implementation

#### 1. PaginatedBooksTable.tsx - Critical Issues

**Original Code:** 662 lines with complex logic:
- Pagination state management
- Search and filtering
- CRUD modals
- Form validation
- Role-based access control
- Error handling
- AbortController for request cancellation

**Attempted Refactor:**
- Only partially integrated context
- Created duplicate functions (old + new)
- Left commented code
- **Broke existing functionality**
- Didn't preserve all logic paths

**Specific Issues:**
```tsx
// Created duplicate handleCreate and handleUpdate functions
const handleCreate = async () => { /* new version */ };
const oldHandleCreate = async () => { /* old version - why keep this? */ };
const handleUpdate = async () => { /* new version */ };
const handleUpdate = async () => { /* duplicate! */ };
```

This is **wrong** - you can't have two functions with the same name!

#### 2. StudentBooksGallery.tsx - Oversimplified

**Removed:**
- 70 lines of fetch logic
- AbortController
- Error handling details

**Problem:** 
- Assumed context would handle everything
- Didn't verify if removed logic was needed elsewhere

#### 3. BookCarousel.tsx - Type Issues

**Changed:**
- Fixed `coverImage` → `coverImageUrl`
- Removed `availableCopies` display

**Problem:**
- Backend doesn't return `availableCopies`
- Should have coordinated with backend first
- Changed UI without considering user impact

---

## Why It Failed

### Root Causes

1. **Rushed Implementation**
   - Tried to do too much too fast
   - Didn't take time to understand full complexity
   - Made assumptions about what could be simplified

2. **Incomplete Analysis**
   - Didn't map all dependencies
   - Didn't identify all side effects
   - Didn't consider edge cases

3. **No Testing**
   - Didn't run the code
   - Didn't verify each change
   - Didn't check for compilation errors

4. **Lack of Incremental Progress**
   - Tried to refactor multiple files at once
   - Didn't commit working states
   - No way to rollback partially

5. **Missing Context**
   - Didn't fully read all component logic
   - Didn't understand all state dependencies
   - Didn't map component interactions

---

## Lessons Learned

### Key Takeaways

1. **Never Simplify Without Full Understanding**
   - Read entire file before modifying
   - Understand every function's purpose
   - Map all dependencies

2. **Test After Every Change**
   - Compile and run after each modification
   - Verify functionality is preserved
   - Check for TypeScript errors

3. **One File At A Time**
   - Complete one component fully
   - Test thoroughly
   - Commit working state
   - Then move to next

4. **Preserve All Logic**
   - Don't remove code that "seems" unnecessary
   - Don't simplify complex logic
   - Don't assume context solves everything

5. **Document Reasoning**
   - Why each change is made
   - What problem it solves
   - What tradeoffs exist

---

## Current Codebase Analysis

Before we start refactoring, let's fully understand what we have:

### File: PaginatedBooksTable.tsx (662 lines)

**Purpose:** Admin interface for managing books

**Key Features:**
1. **Pagination:**
   - Uses custom `usePagination` hook
   - Page, limit, sort controls
   - Total pages calculation

2. **Search & Filtering:**
   - Text search with debouncing
   - Author filter
   - Year filter
   - Multiple filters work together

3. **CRUD Operations:**
   - Create book modal
   - Edit book modal
   - View book modal
   - Delete confirmation modal

4. **State Management:**
   - Books list state
   - Loading state
   - Error state
   - Modal visibility states
   - Form data state
   - Selected book state

5. **Data Fetching:**
   - Fetches books with pagination params
   - Uses AbortController for cancellation
   - Handles errors gracefully

6. **Role-Based Access:**
   - Only admins can create/edit/delete
   - Students can only view

**Dependencies:**
- `useAuth()` - for token and user role
- `usePagination()` - for pagination logic
- `useDebounce()` - for search debouncing
- `PaginatedTable` component - for table UI

**Fetch Logic:**
```tsx
const fetchBooks = async () => {
  setLoading(true);
  setError(null);
  
  // Cancel previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  const abortController = new AbortController();
  abortControllerRef.current = abortController;
  
  try {
    const queryParams = new URLSearchParams({
      page: pagination.state.page.toString(),
      limit: pagination.state.limit.toString(),
      sortBy: pagination.state.sortBy,
      sortOrder: pagination.state.sortOrder,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(debouncedAuthor && { author: debouncedAuthor }),
      ...(debouncedYear && { publishedYear: debouncedYear })
    });

    const response = await fetch(`${API_BASE}/books?${queryParams}`, { 
      signal: abortController.signal 
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: PaginationResponse = await response.json();
    setBooks(result.data);
    pagination.updatePagination({
      total: result.meta.total,
      totalPages: result.meta.totalPages,
      hasNextPage: result.meta.hasNextPage,
      hasPreviousPage: result.meta.hasPreviousPage
    });
  } catch (error: any) {
    if (error.name === 'AbortError') return;
    console.error('Error fetching books:', error);
    setError(error instanceof Error ? error.message : 'Failed to fetch books');
  } finally {
    setLoading(false);
  }
};
```

**Key Insights:**
- ⚠️ This logic is complex and handles many edge cases
- ⚠️ Must preserve AbortController
- ⚠️ Must preserve all error handling
- ⚠️ Must preserve pagination state updates
- ⚠️ Cannot simplify without losing functionality

### File: StudentBooksGallery.tsx (202 lines)

**Purpose:** Student interface for browsing books

**Key Features:**
1. **Book Grid Display:**
   - Card-based layout
   - Book covers
   - Title, author, year
   - Borrow button

2. **Modal:**
   - View book details
   - Borrow request form

3. **Data Fetching:**
   - Fetches all books
   - Uses AbortController
   - Loading and error states

**Fetch Logic:**
```tsx
useEffect(() => {
  let isMounted = true;
  const abortController = new AbortController();

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE}/books`, {
        signal: abortController.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (isMounted) {
        setBooks(data);
        setError(null);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Error fetching books:', err);
      if (isMounted) {
        setError('Failed to load books. Please try again later.');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchBooks();

  return () => {
    isMounted = false;
    abortController.abort();
  };
}, []);
```

**Key Insights:**
- ⚠️ Uses `isMounted` flag to prevent memory leaks
- ⚠️ Must preserve cleanup logic
- ⚠️ Simpler than PaginatedBooksTable but still has important patterns

### File: BookCarousel.tsx (138 lines)

**Purpose:** Homepage featured books carousel

**Key Features:**
1. **Swiper Carousel:**
   - Card-style display
   - Auto-play
   - 8 featured books

2. **Data Fetching:**
   - Fetches featured books
   - Limited to 8 books
   - Sorted by availability

**Current Type Issue:**
```tsx
interface Book {
  id: number;              // ❌ Backend returns string
  availableCopies: number; // ❌ Backend doesn't return this
  genre: string;           // ❌ Backend doesn't return this
  coverImage?: string;     // ❌ Wrong field name
}
```

**Key Insights:**
- ⚠️ Has critical type mismatches
- ⚠️ Displays fields backend doesn't provide
- ⚠️ Needs coordination with backend OR fallback display logic

---

## Proper Refactoring Plan

### Phase 1: Foundation (Week 1)

#### Step 1.1: Create Shared Types (Day 1)

**Goal:** Single source of truth for all types

**Tasks:**
1. Read all component interfaces
2. Read backend DTOs
3. Create `frontend/src/types/index.ts`
4. Document each type with JSDoc
5. **Do NOT modify any components yet**

**Checklist:**
- [ ] All Book interfaces consolidated
- [ ] All User interfaces consolidated
- [ ] All Pagination types defined
- [ ] All DTOs defined
- [ ] Types match backend exactly
- [ ] JSDoc comments added
- [ ] File compiles without errors

#### Step 1.2: Create BooksContext - Data Only (Day 2-3)

**Goal:** Context provider with ONLY data fetching (no CRUD yet)

**Tasks:**
1. Create `frontend/src/modules/books/BooksContext.tsx`
2. Implement ONLY:
   - State (books, loading, error)
   - `fetchBooks()` function
   - `fetchFeaturedBooks()` function
   - Basic caching
3. **Do NOT add CRUD operations yet**
4. **Do NOT modify any components yet**

**Checklist:**
- [ ] BooksProvider created
- [ ] useBooks() hook works
- [ ] fetchBooks() works correctly
- [ ] fetchFeaturedBooks() works correctly
- [ ] Caching works
- [ ] AbortController implemented
- [ ] Error handling works
- [ ] Loading states work
- [ ] No TypeScript errors
- [ ] Can wrap App in provider without breaking anything

#### Step 1.3: Test Foundation (Day 3)

**Goal:** Verify foundation works before refactoring components

**Tasks:**
1. Wrap App in BooksProvider
2. Create test component that uses useBooks()
3. Verify data fetching works
4. Verify caching works
5. Check console for errors
6. **Do NOT modify existing components yet**

**Checklist:**
- [ ] App runs without errors
- [ ] Context provides data correctly
- [ ] Caching reduces API calls
- [ ] No memory leaks
- [ ] No console errors

### Phase 2: Component Refactoring (Week 2)

#### Step 2.1: Refactor BookCarousel.tsx (Day 1)

**Why This First:** Simplest component, good learning case

**Process:**
1. Read entire file thoroughly
2. Map all current functionality
3. Create backup of original file
4. Make changes incrementally:
   a. Import shared Book type
   b. Import useBooks() hook
   c. Replace useState with useBooks()
   d. Remove fetch logic
   e. Fix type mismatches
   f. Update display logic for missing fields
5. Test after each change
6. Verify UI works correctly

**Checklist:**
- [ ] Read entire file
- [ ] Backup created
- [ ] Shared types imported
- [ ] useBooks() hook used
- [ ] Local fetch removed
- [ ] Type issues fixed
- [ ] Component compiles
- [ ] Component renders correctly
- [ ] Carousel displays books
- [ ] No console errors
- [ ] Commit working state

#### Step 2.2: Refactor StudentBooksGallery.tsx (Day 2)

**Why This Second:** Medium complexity, builds on BookCarousel experience

**Process:**
1. Read entire file thoroughly
2. Map all current functionality
3. Create backup
4. Make changes incrementally:
   a. Import shared types
   b. Import useBooks()
   c. Replace useState with useBooks()
   d. Remove fetch logic
   e. Preserve all existing UI logic
   f. Preserve modal functionality
   g. Test borrow button integration
5. Test after each change

**Checklist:**
- [ ] Read entire file
- [ ] Backup created
- [ ] All functionality mapped
- [ ] Shared types imported
- [ ] useBooks() hook used
- [ ] Local fetch removed
- [ ] Book grid displays correctly
- [ ] Modal works
- [ ] Borrow button works
- [ ] Loading states work
- [ ] Error states work
- [ ] No console errors
- [ ] Commit working state

#### Step 2.3: Analyze PaginatedBooksTable.tsx (Day 3)

**Why Analyze First:** Most complex component, needs careful planning

**Process:**
1. Read entire 662-line file
2. Document every function
3. Map all state variables
4. Map all dependencies
5. Identify what context should handle vs component
6. Create detailed refactoring plan
7. **Do NOT code yet**

**Checklist:**
- [ ] Every function documented
- [ ] All state variables mapped
- [ ] All dependencies identified
- [ ] Refactoring plan created
- [ ] Edge cases identified
- [ ] Test cases defined

#### Step 2.4: Add CRUD to BooksContext (Day 4)

**Goal:** Add create/update/delete operations to context

**Process:**
1. Add createBook() function
2. Add updateBook() function
3. Add deleteBook() function
4. Add proper error handling
5. Add cache invalidation
6. Test each function independently
7. **Do NOT modify PaginatedBooksTable yet**

**Checklist:**
- [ ] createBook() works
- [ ] updateBook() works
- [ ] deleteBook() works
- [ ] Error handling works
- [ ] Cache invalidates correctly
- [ ] API calls succeed
- [ ] Optimistic updates work (if implemented)
- [ ] No TypeScript errors

#### Step 2.5: Refactor PaginatedBooksTable.tsx (Day 5-6)

**Why Last:** Most complex, needs all previous experience

**Process:**
1. Create backup
2. Make changes in small commits:
   
   **Commit 1:** Import context
   ```tsx
   import { useBooks } from '../../modules/books/BooksContext';
   import type { Book } from '../../types';
   ```
   
   **Commit 2:** Replace books state
   ```tsx
   // OLD: const [books, setBooks] = useState<Book[]>([]);
   // NEW: const { books, loading, error } = useBooks();
   ```
   
   **Commit 3:** Replace fetchBooks()
   ```tsx
   // Keep ALL the same query params logic
   // Just use context.fetchBooks() instead of fetch()
   ```
   
   **Commit 4:** Replace handleCreate()
   ```tsx
   // Use context.createBook()
   // Keep all validation
   // Keep all error handling
   // Keep all modal logic
   ```
   
   **Commit 5:** Replace handleUpdate()
   
   **Commit 6:** Replace handleDelete()
   
   **Commit 7:** Test everything

3. Test after EACH commit
4. If something breaks, revert that commit and try again

**Checklist:**
- [ ] Backup created
- [ ] Context imported
- [ ] Books state replaced
- [ ] fetchBooks refactored
- [ ] Pagination still works
- [ ] Search still works
- [ ] Filters still work
- [ ] handleCreate refactored
- [ ] Create modal works
- [ ] handleUpdate refactored
- [ ] Edit modal works
- [ ] handleDelete refactored
- [ ] Delete confirmation works
- [ ] All modals work
- [ ] Role-based access preserved
- [ ] Error handling preserved
- [ ] Loading states preserved
- [ ] No duplicate functions
- [ ] No commented code
- [ ] Component compiles
- [ ] All features work
- [ ] No console errors
- [ ] Commit working state

### Phase 3: UsersContext (Week 3)

**Follow same pattern as BooksContext**

#### Step 3.1: Create UsersContext (Day 1-2)
- Data fetching only
- No CRUD yet
- Test independently

#### Step 3.2: Add CRUD to UsersContext (Day 3)
- create/update/delete operations
- Avatar upload/delete
- Test each function

#### Step 3.3: Refactor PaginatedUsersTable.tsx (Day 4-5)
- Same incremental approach
- Small commits
- Test after each change

---

## Implementation Strategy

### Rules

1. **One File Per Day Maximum**
2. **Test After Every Change**
3. **Commit Working States Only**
4. **No Shortcuts**
5. **Preserve All Logic**
6. **Document Every Decision**

### Workflow

```
For Each Component:
  1. Read entire file
  2. Document all functionality
  3. Create backup
  4. Plan changes
  5. Make ONE small change
  6. Compile and test
  7. If works: commit
  8. If breaks: revert, understand why, try again
  9. Repeat steps 5-8 until complete
  10. Final full testing
  11. Commit "Refactor ComponentName complete"
```

### Backup Strategy

Before modifying any file:

```bash
cp frontend/src/components/books/PaginatedBooksTable.tsx \
   frontend/src/components/books/PaginatedBooksTable.tsx.backup
```

### Testing Strategy

After each change:

```bash
# 1. Check TypeScript compilation
cd frontend
npm run build

# 2. Run development server
npm run dev

# 3. Manual testing checklist:
# - Component renders
# - No console errors
# - All features work
# - No regressions

# 4. If all pass, commit
git add .
git commit -m "refactor: Small specific change description"

# 5. If fails, revert
git reset --hard HEAD
```

---

## Testing Strategy

### Per-Component Tests

**BookCarousel:**
- [ ] Carousel displays
- [ ] Books load
- [ ] Auto-play works
- [ ] Click book card works
- [ ] "View All Books" link works

**StudentBooksGallery:**
- [ ] Book grid displays
- [ ] All books load
- [ ] Click book opens modal
- [ ] Modal shows correct data
- [ ] Borrow button works
- [ ] Close modal works

**PaginatedBooksTable:**
- [ ] Table displays
- [ ] Pagination works
- [ ] Page change works
- [ ] Limit change works
- [ ] Sort works
- [ ] Search works
- [ ] Author filter works
- [ ] Year filter works
- [ ] Multiple filters work together
- [ ] Create modal opens
- [ ] Create form works
- [ ] Create submits correctly
- [ ] Edit modal opens
- [ ] Edit form pre-fills correctly
- [ ] Edit submits correctly
- [ ] View modal opens
- [ ] View shows correct data
- [ ] Delete confirmation opens
- [ ] Delete works
- [ ] Role-based access works
- [ ] Admin sees CRUD buttons
- [ ] Student doesn't see CRUD buttons

### Integration Tests

- [ ] Navigate: Home → Books → Home
- [ ] Verify: Only 1 API call (cached)
- [ ] Create book as admin
- [ ] Verify: Cache invalidates
- [ ] Verify: New book appears
- [ ] Edit book
- [ ] Verify: Changes reflect immediately
- [ ] Delete book
- [ ] Verify: Book removed immediately

### Performance Tests

- [ ] Check Network tab: API calls reduced
- [ ] Check Memory: No leaks
- [ ] Check Console: No errors
- [ ] Check Re-renders: Optimized with React DevTools

---

## Success Criteria

### Functional Requirements

✅ All existing features work exactly as before  
✅ No regressions  
✅ No new bugs introduced  
✅ All UI interactions preserved  
✅ All modals work  
✅ All forms work  
✅ All validations work  
✅ Role-based access preserved  

### Technical Requirements

✅ TypeScript compiles with no errors  
✅ No console errors  
✅ No console warnings  
✅ Proper type safety throughout  
✅ Consistent code style  
✅ No duplicate code  
✅ No commented-out code  
✅ Clear function names  
✅ Proper error handling  

### Performance Requirements

✅ 80% reduction in API calls  
✅ Faster page navigation  
✅ Reduced memory usage  
✅ No memory leaks  
✅ Efficient re-renders  

### Documentation Requirements

✅ All functions documented  
✅ All types documented  
✅ README updated  
✅ CHANGELOG updated  
✅ Commit messages clear  
✅ Code comments where needed  

---

## Estimated Timeline

### Conservative Estimate

| Phase | Duration | Details |
|-------|----------|---------|
| Phase 1: Foundation | 3 days | Types + Context setup |
| Phase 2: Components | 6 days | BookCarousel (1) + Gallery (2) + Table (3) |
| Phase 3: Users | 5 days | UsersContext + PaginatedUsersTable |
| Testing & Docs | 2 days | Final testing + documentation |
| **TOTAL** | **16 days** | ~3 weeks with buffer |

### Realistic Estimate (with issues)

| Phase | Duration | Details |
|-------|----------|---------|
| Phase 1: Foundation | 4 days | +1 day for unexpected issues |
| Phase 2: Components | 8 days | +2 days for PaginatedBooksTable complexity |
| Phase 3: Users | 6 days | +1 day for edge cases |
| Testing & Docs | 3 days | +1 day for thorough testing |
| **TOTAL** | **21 days** | ~4 weeks realistic |

---

## Risk Mitigation

### Risk 1: Breaking Existing Functionality

**Mitigation:**
- Make smallest possible changes
- Test after every change
- Keep backups
- Easy rollback with git

### Risk 2: Type Mismatches with Backend

**Mitigation:**
- Study backend DTOs first
- Verify API responses
- Add runtime validation if needed
- Coordinate with backend team

### Risk 3: Complexity Underestimation

**Mitigation:**
- Analyze thoroughly before coding
- Document all functionality first
- Ask questions when unsure
- Don't make assumptions

### Risk 4: Cache Bugs

**Mitigation:**
- Simple caching first
- Add logging
- Test invalidation thoroughly
- Provide manual refresh option

---

## Decision Log

### Decision 1: Revert Everything

**Date:** November 24, 2025  
**Reason:** Previous implementation was rushed and incomplete  
**Impact:** Clean slate, can do it properly  
**Alternatives Considered:** Fix incrementally (too risky)

### Decision 2: Keep Documentation

**Date:** November 24, 2025  
**Reason:** Educational value, planning resource  
**Impact:** Team can learn from it  
**Alternatives Considered:** Delete all (wasteful)

### Decision 3: Detailed Plan First

**Date:** November 24, 2025  
**Reason:** Prevent repeating mistakes  
**Impact:** Slower start, but proper execution  
**Alternatives Considered:** Start coding immediately (already failed)

---

## Next Steps

### Immediate (Today)

1. ✅ Revert all code changes
2. ✅ Keep documentation
3. ✅ Push to GitHub
4. ✅ Create this planning document

### Tomorrow

1. Read PaginatedBooksTable.tsx completely
2. Read StudentBooksGallery.tsx completely
3. Read BookCarousel.tsx completely
4. Document all functionality

### This Week

1. Create types/index.ts properly
2. Create BooksContext (data only)
3. Test foundation
4. **Do NOT refactor components yet**

### Next Week

1. Refactor BookCarousel.tsx
2. Refactor StudentBooksGallery.tsx
3. Analyze PaginatedBooksTable.tsx
4. Create detailed PaginatedBooksTable refactor plan

---

## Conclusion

The previous refactoring failed because it was **rushed, incomplete, and didn't respect the complexity of the existing code**.

This plan takes a **measured, careful approach**:
- Understand first, code later
- One small change at a time
- Test everything
- No shortcuts
- Preserve all functionality

**Estimated time:** 3-4 weeks of careful work  
**Better than:** Breaking production with a 1-day hack

---

**Document Status:** ✅ Complete  
**Next Action:** Begin Phase 1: Foundation  
**Review Date:** After Phase 1 completion

---

## Appendix: File Locations

```
frontend/src/
├── types/
│   └── index.ts                          (TO BE CREATED)
├── modules/
│   ├── books/
│   │   └── BooksContext.tsx              (TO BE CREATED)
│   └── users/
│       └── UsersContext.tsx              (TO BE CREATED)
├── main.tsx                              (TO BE MODIFIED)
└── components/
    ├── books/
    │   ├── StudentBooksGallery.tsx       (TO BE REFACTORED)
    │   └── PaginatedBooksTable.tsx       (TO BE REFACTORED)
    ├── home/
    │   └── BookCarousel.tsx              (TO BE REFACTORED)
    └── users/
        └── PaginatedUsersTable.tsx       (TO BE REFACTORED)
```

---

**END OF DOCUMENT**
