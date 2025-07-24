import { IsOptional, IsString, MaxLength } from 'class-validator';

export class FileUploadDTO {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
