import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReturnBookDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  returnNotes?: string;
}
