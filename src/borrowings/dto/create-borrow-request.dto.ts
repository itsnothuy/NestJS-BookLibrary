import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsString()
  bookUuid: string;

  @IsInt()
  @Min(7)
  @Max(90)
  @IsOptional()
  requestedDays?: number = 14;
}
