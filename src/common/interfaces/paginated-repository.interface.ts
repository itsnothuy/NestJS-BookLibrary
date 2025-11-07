import { PaginationQueryDto } from '../dto/pagination.dto';
import { PaginationResultDto } from '../dto/pagination-result.dto';

export interface PaginatedRepository<T> {
  findManyPaginated(
    options: PaginationQueryDto,
    filters?: Record<string, any>
  ): Promise<PaginationResultDto<T>>;
}