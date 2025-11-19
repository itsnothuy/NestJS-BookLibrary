import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { BorrowingsService } from '../borrowings.service';
import { CreateBorrowRequestDto } from '../dto/create-borrow-request.dto';
import { ProcessRequestDto } from '../dto/process-request.dto';
import { ReturnBookDto } from '../dto/return-book.dto';

@Controller('borrowings')
@UseGuards(JwtAuthGuard)
export class BorrowingsController {
  constructor(private readonly borrowingsService: BorrowingsService) {}

  // ============= STUDENT ENDPOINTS =============

  /**
   * POST /borrowings/request
   * Create a new borrow request
   */
  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  async requestBorrow(@Request() req, @Body() dto: CreateBorrowRequestDto) {
    return this.borrowingsService.requestBorrow(req.user.id, dto);
  }

  /**
   * GET /borrowings/my-borrowings
   * Get current user's active borrowings
   */
  @Get('my-borrowings')
  async getMyBorrowings(@Request() req) {
    return this.borrowingsService.getMyBorrowings(req.user.id);
  }

  /**
   * GET /borrowings/my-history
   * Get current user's borrowing history (returned books)
   */
  @Get('my-history')
  async getMyHistory(@Request() req) {
    return this.borrowingsService.getMyHistory(req.user.id);
  }

  /**
   * GET /borrowings/my-requests
   * Get current user's borrow requests
   */
  @Get('my-requests')
  async getMyRequests(@Request() req) {
    return this.borrowingsService.getMyRequests(req.user.id);
  }

  /**
   * PATCH /borrowings/cancel/:uuid
   * Cancel a pending borrow request
   */
  @Patch('cancel/:uuid')
  async cancelRequest(@Request() req, @Param('uuid') uuid: string) {
    return this.borrowingsService.cancelRequest(req.user.id, uuid);
  }

  /**
   * GET /borrowings/:uuid
   * Get details of a specific borrowing
   */
  @Get(':uuid')
  async getBorrowingDetails(@Param('uuid') uuid: string) {
    return this.borrowingsService.getBorrowingDetails(uuid);
  }

  // ============= ADMIN ENDPOINTS =============

  /**
   * GET /borrowings/admin/pending-requests
   * Get all pending borrow requests (Admin only)
   */
  @Get('admin/pending-requests')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getPendingRequests() {
    return this.borrowingsService.getPendingRequests();
  }

  /**
   * PATCH /borrowings/admin/process/:uuid
   * Approve or reject a borrow request (Admin only)
   */
  @Patch('admin/process/:uuid')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async processRequest(
    @Request() req,
    @Param('uuid') uuid: string,
    @Body() dto: ProcessRequestDto
  ) {
    return this.borrowingsService.processRequest(req.user.id, uuid, dto);
  }

  /**
   * POST /borrowings/admin/return/:uuid
   * Process book return (Admin only)
   */
  @Post('admin/return/:uuid')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async returnBook(@Param('uuid') uuid: string, @Body() dto: ReturnBookDto) {
    return this.borrowingsService.returnBook(uuid, dto);
  }

  /**
   * GET /borrowings/admin/overdue
   * Get all overdue borrowings (Admin only)
   */
  @Get('admin/overdue')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getOverdueBooks() {
    return this.borrowingsService.getOverdueBooks();
  }

  /**
   * POST /borrowings/admin/update-overdue
   * Manually trigger overdue status update (Admin only)
   */
  @Post('admin/update-overdue')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateOverdueStatuses() {
    return this.borrowingsService.updateOverdueStatuses();
  }

  // ============= PUBLIC/SHARED ENDPOINTS =============

  /**
   * GET /borrowings/availability/:bookUuid
   * Check book availability
   */
  @Get('availability/:bookUuid')
  async checkBookAvailability(@Param('bookUuid') bookUuid: string) {
    return this.borrowingsService.checkBookAvailability(bookUuid);
  }
}
