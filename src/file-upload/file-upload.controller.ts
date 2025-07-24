import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { JWTAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDTO } from './dto/file-upload.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserEntity, UserRole } from 'src/auth/entities/user-entity';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFile: FileUploadDTO,
    @CurrentUser() user: UserEntity,
  ): Promise<any> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.fileUploadService.uploadFile(
      file,
      uploadFile?.description || '',
      user,
    );
  }

  @Get()
  findAll(): Promise<any> {
    return this.fileUploadService.finAll();
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JWTAuthGuard, RolesGuard)
  async removeFile(@Param('id') id: string) {
    await this.fileUploadService.removeFile(id);
    return { message: 'File deleted successfully' };
  }
}
