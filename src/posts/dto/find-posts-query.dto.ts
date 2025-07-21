import { IsString, MaxLength, IsOptional, IsNumber } from 'class-validator';

export class FindPostsQueryDTO {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(100, { message: 'Title cannot be longer than 100 characters' })
  title?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  // @MaxLength(100, {
  //   message: 'Page cannot be longer than 100 characters',
  // })
  page?: number = 1;

  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  // @MaxLength(100, {
  //   message: 'Limit cannot be longer than 100 characters',
  // })
  limit?: number = 10;
}
