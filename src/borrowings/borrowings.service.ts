import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { BorrowingsRepo } from './borrowings.repo';
import { BooksRepo } from '../books/books.repo';
import { UsersRepo } from '../users/users.repo';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { ProcessRequestDto } from './dto/process-request.dto';
import { ReturnBookDto } from './dto/return-book.dto';

@Injectable()
export class BorrowingsService {
  private readonly logger = new Logger(BorrowingsService.name);

  constructor(
    private readonly borrowingsRepo: BorrowingsRepo,
    private readonly booksRepo: BooksRepo,
    private readonly usersRepo: UsersRepo,
  ) {}

  // ============= STUDENT OPERATIONS =============

  /**
   * Create a new borrow request
   */
  async requestBorrow(userId: number, dto: CreateBorrowRequestDto) {
    this.logger.log(`User ${userId} requesting to borrow book ${dto.bookUuid}`);

    // 1. Validate book exists
    const book = await this.booksRepo.findByUuid(dto.bookUuid);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // 2. Check if book is available
    const isAvailable = await this.borrowingsRepo.isBookAvailable(book.id);
    if (!isAvailable) {
      throw new BadRequestException(
        'This book is currently unavailable. All copies are borrowed.'
      );
    }

    // 3. Check if user has pending request for this book
    const pendingRequests = await this.borrowingsRepo.findPendingRequestsByUser(userId);
    const alreadyRequested = pendingRequests.some((req) => req.bookId === book.id);
    if (alreadyRequested) {
      throw new BadRequestException('You already have a pending request for this book');
    }

    // 4. Check if user currently has this book borrowed
    const activeBorrowings = await this.borrowingsRepo.findActiveBorrowingsByUser(userId);
    const alreadyBorrowed = activeBorrowings.some((b) => b.bookId === book.id);
    if (alreadyBorrowed) {
      throw new BadRequestException('You currently have this book borrowed');
    }

    // 5. Check if user has reached max borrowing limit (e.g., 5 books)
    const MAX_ACTIVE_BORROWINGS = 5;
    if (activeBorrowings.length >= MAX_ACTIVE_BORROWINGS) {
      throw new BadRequestException(
        `You have reached the maximum limit of ${MAX_ACTIVE_BORROWINGS} borrowed books`
      );
    }

    // 6. Create request
    const request = await this.borrowingsRepo.createRequest({
      userId,
      bookId: book.id,
      requestedDays: dto.requestedDays || 14,
    });

    this.logger.log(`Created borrow request ${request.uuid}`);
    return this.borrowingsRepo.findRequestByUuidWithDetails(request.uuid);
  }

  /**
   * Get user's active borrowings
   */
  async getMyBorrowings(userId: number) {
    const borrowings = await this.borrowingsRepo.findActiveBorrowingsByUser(userId);

    // Update overdue status for each borrowing
    for (const borrowing of borrowings) {
      if (borrowing.status === 'active' && new Date(borrowing.dueDate) < new Date()) {
        await this.borrowingsRepo.calculateLateFee(borrowing.id);
      }
    }

    // Re-fetch to get updated status
    return this.borrowingsRepo.findActiveBorrowingsByUser(userId);
  }

  /**
   * Get user's borrowing history
   */
  async getMyHistory(userId: number) {
    return this.borrowingsRepo.findBorrowingHistoryByUser(userId);
  }

  /**
   * Get user's borrow requests
   */
  async getMyRequests(userId: number) {
    return this.borrowingsRepo.findAllRequestsByUser(userId);
  }

  /**
   * Cancel a pending borrow request
   */
  async cancelRequest(userId: number, requestUuid: string) {
    const request = await this.borrowingsRepo.findRequestByUuid(requestUuid);

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot cancel request with status: ${request.status}`
      );
    }

    return this.borrowingsRepo.processRequest(
      request.id,
      userId,
      'cancelled',
      'Cancelled by user'
    );
  }

  // ============= ADMIN OPERATIONS =============

  /**
   * Get all pending borrow requests (Admin only)
   */
  async getPendingRequests() {
    return this.borrowingsRepo.findAllPendingRequests();
  }

  /**
   * Process a borrow request - approve or reject (Admin only)
   */
  async processRequest(adminId: number, requestUuid: string, dto: ProcessRequestDto) {
    this.logger.log(`Admin ${adminId} processing request ${requestUuid}: ${dto.action}`);

    const request = await this.borrowingsRepo.findRequestByUuid(requestUuid);

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Request already processed with status: ${request.status}`
      );
    }

    // If approving, check book availability again
    if (dto.action === 'approved') {
      const isAvailable = await this.borrowingsRepo.isBookAvailable(request.bookId);
      if (!isAvailable) {
        throw new BadRequestException(
          'Book is no longer available. Please reject this request.'
        );
      }
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

      // Decrement available copies
      await this.borrowingsRepo.decrementAvailableCopies(request.bookId);

      this.logger.log(
        `Borrowing created for user ${request.userId}, book ${request.bookId}`
      );
    }

    return this.borrowingsRepo.findRequestByUuidWithDetails(processed.uuid);
  }

  /**
   * Return a borrowed book (Admin only)
   */
  async returnBook(borrowingUuid: string, dto: ReturnBookDto) {
    this.logger.log(`Processing return for borrowing ${borrowingUuid}`);

    const borrowing = await this.borrowingsRepo.findBorrowingByUuid(borrowingUuid);

    if (!borrowing) {
      throw new NotFoundException('Borrowing record not found');
    }

    if (borrowing.status === 'returned') {
      throw new BadRequestException('This book has already been returned');
    }

    // Calculate late fee if overdue
    await this.borrowingsRepo.calculateLateFee(borrowing.id);

    // Mark as returned
    const returned = await this.borrowingsRepo.returnBook(borrowing.id, dto.returnNotes);

    // Increment available copies
    await this.borrowingsRepo.incrementAvailableCopies(borrowing.bookId);

    this.logger.log(`Book returned: ${borrowingUuid}`);

    return this.borrowingsRepo.findBorrowingByUuidWithDetails(returned.uuid);
  }

  /**
   * Get all overdue borrowings (Admin only)
   */
  async getOverdueBooks() {
    const overdues = await this.borrowingsRepo.findOverdueBorrowings();

    // Update late fees for all overdue borrowings
    for (const borrowing of overdues) {
      await this.borrowingsRepo.calculateLateFee(borrowing.id);
    }

    // Re-fetch to get updated fees
    return this.borrowingsRepo.findOverdueBorrowings();
  }

  /**
   * Get specific borrowing details
   */
  async getBorrowingDetails(borrowingUuid: string) {
    const borrowing = await this.borrowingsRepo.findBorrowingByUuidWithDetails(
      borrowingUuid
    );

    if (!borrowing) {
      throw new NotFoundException('Borrowing not found');
    }

    // Update late fee if needed
    if (borrowing.status !== 'returned') {
      await this.borrowingsRepo.calculateLateFee(borrowing.id);
      return this.borrowingsRepo.findBorrowingByUuidWithDetails(borrowingUuid);
    }

    return borrowing;
  }

  // ============= BOOK AVAILABILITY =============

  /**
   * Check if a book is available for borrowing
   */
  async checkBookAvailability(bookUuid: string) {
    const book = await this.booksRepo.findByUuid(bookUuid);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const inventory = await this.borrowingsRepo.getBookInventory(book.id);
    const stats = await this.borrowingsRepo.getBookBorrowingStats(book.id);

    return {
      bookUuid: book.uuid,
      bookTitle: book.title,
      isAvailable: inventory ? inventory.availableCopies > 0 : true,
      totalCopies: inventory?.totalCopies || 1,
      availableCopies: inventory?.availableCopies || 1,
      activeBorrowings: stats.activeBorrowings,
      totalBorrowings: stats.totalBorrowings,
      averageBorrowDays: Math.round(stats.averageBorrowDays),
    };
  }

  // ============= CRON JOB HELPER (for automated checks) =============

  /**
   * Update overdue statuses (should be run daily via cron)
   */
  async updateOverdueStatuses() {
    this.logger.log('Running daily overdue status update');
    const overdues = await this.borrowingsRepo.findOverdueBorrowings();

    for (const borrowing of overdues) {
      await this.borrowingsRepo.calculateLateFee(borrowing.id);
    }

    this.logger.log(`Updated ${overdues.length} overdue borrowings`);
    return { updated: overdues.length };
  }

  // ============= UUID-BASED WRAPPERS (for external API) =============

  /**
   * Request borrow by user UUID (converts to internal ID)
   */
  async requestBorrowByUuid(userUuid: string, dto: CreateBorrowRequestDto) {
    const user = await this.usersRepo.findByUuid(userUuid);
    if (!user) throw new NotFoundException('User not found');
    return this.requestBorrow(user.id, dto);
  }

  /**
   * Get user's active borrowings by UUID
   */
  async getMyBorrowingsByUuid(userUuid: string) {
    const user = await this.usersRepo.findByUuid(userUuid);
    if (!user) throw new NotFoundException('User not found');
    return this.getMyBorrowings(user.id);
  }

  /**
   * Get user's borrowing history by UUID
   */
  async getMyHistoryByUuid(userUuid: string) {
    const user = await this.usersRepo.findByUuid(userUuid);
    if (!user) throw new NotFoundException('User not found');
    return this.getMyHistory(user.id);
  }

  /**
   * Get user's borrow requests by UUID
   */
  async getMyRequestsByUuid(userUuid: string) {
    const user = await this.usersRepo.findByUuid(userUuid);
    if (!user) throw new NotFoundException('User not found');
    return this.getMyRequests(user.id);
  }

  /**
   * Cancel request by user UUID
   */
  async cancelRequestByUuid(userUuid: string, requestUuid: string) {
    const user = await this.usersRepo.findByUuid(userUuid);
    if (!user) throw new NotFoundException('User not found');
    return this.cancelRequest(user.id, requestUuid);
  }

  /**
   * Process request by admin UUID
   */
  async processRequestByUuid(adminUuid: string, requestUuid: string, dto: ProcessRequestDto) {
    const admin = await this.usersRepo.findByUuid(adminUuid);
    if (!admin) throw new NotFoundException('Admin not found');
    return this.processRequest(admin.id, requestUuid, dto);
  }
}
