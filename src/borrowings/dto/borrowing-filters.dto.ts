import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BorrowingFiltersDto {
  @IsOptional()
  @IsEnum(['active', 'returned', 'overdue'])
  status?: 'active' | 'returned' | 'overdue';

  @IsOptional()
  @IsString()
  userUuid?: string;

  @IsOptional()
  @IsString()
  bookUuid?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
