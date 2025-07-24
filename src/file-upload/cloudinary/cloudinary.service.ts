import { Inject, Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('CLOUDINARY') private readonly cloudinary: any) {}

  uploadFile(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'nestjs-simple-blog-project',
          resource_type: 'auto',
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      // conver file buffer to a readable stream
      // and pipe it to the upload stream
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async delete(publicId: string): Promise<any> {
    await this.cloudinary.uploader.destroy(publicId);
  }
}
