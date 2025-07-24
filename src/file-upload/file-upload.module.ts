import { Module } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    CloudinaryModule,
    MulterModule.register({ storage: memoryStorage() }),
  ], // Add any entities if needed,
  controllers: [FileUploadController],
  providers: [FileUploadService],
})
export class FileUploadModule {}
