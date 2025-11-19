import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class ProcessRequestDto {
  @IsEnum(['approved', 'rejected'])
  action: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
