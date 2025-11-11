import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsString() 
  @IsNotEmpty()
  title!: string;

  @IsString() 
  @IsNotEmpty()
  author!: string;

  // Most modern codes are ISBN-13; adjust if you need ISBN-10 as well.
  @IsString() 
  isbn!: string;

  @IsOptional() 
  @IsInt() 
  @Min(0) 
  @Max(9999)
  publishedYear?: number;
}
