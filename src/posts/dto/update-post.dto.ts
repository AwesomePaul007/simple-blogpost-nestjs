/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be longer than 50 characters' })
  @IsOptional()
  title?: string;

  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be string' })
  @MinLength(5, { message: 'Content must be at least 5 characters long' })
  @IsOptional()
  content?: string;

  @IsNotEmpty({ message: 'AuthorName is required' })
  @IsString({ message: 'AuthorName must be string' })
  @MinLength(2, { message: 'AuthorName must be at least 2 characters long' })
  @MaxLength(25, { message: 'AuthorName cannot be longer than 25 characters' })
  @IsOptional()
  authorName?: string;
}
