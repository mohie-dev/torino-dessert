import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { PassThrough } from 'stream';
import 'multer';

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: Express.Multer.File,
        folder: string = 'torino-dessert',
    ): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                { folder },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result!);
                },
            );

            const bufferStream = new PassThrough();
            bufferStream.end(file.buffer);
            bufferStream.pipe(upload);
        });
    }

    async uploadMultipleImages(files: Express.Multer.File[]) {
        const uploadPromises = files.map(file => this.uploadImage(file));
        return await Promise.all(uploadPromises);
    }
}