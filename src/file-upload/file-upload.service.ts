import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { UserEntity } from 'src/auth/entities/user-entity';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    description: string,
    user: UserEntity,
  ): Promise<FileEntity> {
    const cloudinaryResponse = await this.cloudinaryService.uploadFile(file);

    const newCreatedFile = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: cloudinaryResponse?.secure_url,
      publicId: cloudinaryResponse?.public_id,
      description,
      uploader: user,
    });

    return this.fileRepository.save(newCreatedFile);
  }

  async finAll(): Promise<FileEntity[]> {
    return this.fileRepository.find({
      relations: ['uploader'], // Include uploader relation
      order: { createdAt: 'DESC' },
    });
  }

  async removeFile(publicId: string): Promise<void> {
    const deleteReq = await this.fileRepository.findOne({
      where: { id: publicId },
    });

    if (!deleteReq) {
      throw new NotFoundException(
        `Failed to delete file with publicId: ${publicId}`,
      );
    }
    await this.cloudinaryService.delete(publicId);
  }
}
