import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ixjihcvx',
  api_key: process.env.CLOUDINARY_API_KEY || '691765734874534',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'bGDsN9ZSA1F837suY3vibpDpiqo',
  secure: true,
});

export { cloudinary };

/**
 * Upload an image buffer or file path to Cloudinary
 */
export async function uploadImageToCloudinary(
  file: string | Buffer,
  folder = 'tka_simulasi',
  publicId?: string
): Promise<{ url: string; secure_url: string; public_id: string }> {
  if (typeof file === 'string') {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      public_id: publicId,
      resource_type: 'auto',
      overwrite: true,
    });
    return {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } else {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'auto',
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({
            url: result.url,
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );
      uploadStream.end(file);
    });
  }
}

/**
 * Helper to get Cloudinary URL for student profile photos or exam assets
 */
export function getCloudinaryAssetUrl(pathOrPublicId: string): string {
  if (!pathOrPublicId) return '';
  if (pathOrPublicId.startsWith('http://') || pathOrPublicId.startsWith('https://')) {
    return pathOrPublicId;
  }
  return cloudinary.url(pathOrPublicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
  });
}
