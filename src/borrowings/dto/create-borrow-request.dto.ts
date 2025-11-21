import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsString()
  bookUuid: string;

  @IsNumber()
  @Min(0.000001) // Allow very small values for testing (e.g., 10 seconds = 0.000116 days)
  @Max(90)
  @IsOptional()
  requestedDays?: number = 14;
}
