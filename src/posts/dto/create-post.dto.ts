/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(50, { message: 'Title cannot be longer than 50 characters' })
  title: string;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be string' })
  @MinLength(5, { message: 'Title must be at least 5 characters long' })
  content: string;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be string' })
  @MinLength(2, { message: 'Title must be at least 2 characters long' })
  @MaxLength(25, { message: 'Title cannot be longer than 25 characters' })
  authorName: string;
}
