export interface CloudinaryUploadResult {
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'qnkatbvo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'INDAS AGRI SEED IND PVT LTD';

export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options?: { width?: number; height?: number; crop?: string; quality?: string }
): string {
  if (!publicIdOrUrl) return '/images/branding/indus/indus-logo.png';
  
  // If already a local URL or non-cloudinary URL, return directly
  if (publicIdOrUrl.startsWith('/') || !publicIdOrUrl.includes('cloudinary.com')) {
    return publicIdOrUrl;
  }

  // Extract public ID if full cloudinary URL was passed
  const matches = publicIdOrUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  const publicId = matches ? matches[1] : publicIdOrUrl;

  const transforms: string[] = ['f_auto', 'q_auto'];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}

export async function uploadToCloudinary(
  file: File,
  folder: 'products' | 'gallery' | 'branding' = 'products',
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  // Validate file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
  }

  const maxBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxBytes) {
    throw new Error('Image file is too large. Maximum allowed size is 10MB.');
  }

  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `indas_agri/${folder}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    xhr.open('POST', url);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            publicId: response.public_id,
            secureUrl: response.secure_url,
            format: response.format,
            width: response.width,
            height: response.height,
            bytes: response.bytes
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary response.'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData?.error?.message || `Cloudinary upload failed (HTTP ${xhr.status})`));
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}. Verify upload preset "${UPLOAD_PRESET}".`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during image upload to Cloudinary.'));
    };

    xhr.send(formData);
  });
}

/**
 * Uploads an MP4 or WebM video file to persistent Cloudinary cloud storage.
 * Returns the permanent HTTPS secureUrl.
 */
export async function uploadVideoToCloudinary(
  file: File,
  folder: 'hero' | 'branding' = 'hero',
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const isMp4 = file.type.includes('mp4') || file.name.toLowerCase().endsWith('.mp4');
  const isWebm = file.type.includes('webm') || file.name.toLowerCase().endsWith('.webm');
  if (!isMp4 && !isWebm) {
    throw new Error('Invalid video format. Please upload MP4 (H.264) or WebM video.');
  }

  const maxBytes = 25 * 1024 * 1024; // 25MB
  if (file.size > maxBytes) {
    throw new Error('Video file is too large. Maximum allowed size is 25MB.');
  }

  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `indas_agri/${folder}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;

    xhr.open('POST', url);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve({
            publicId: response.public_id,
            secureUrl: response.secure_url,
            format: response.format,
            width: response.width,
            height: response.height,
            bytes: response.bytes
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary video response.'));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData?.error?.message || `Video upload failed (HTTP ${xhr.status})`));
        } catch {
          reject(new Error(`Video upload failed with status ${xhr.status}. Verify upload preset "${UPLOAD_PRESET}".`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during video upload to Cloudinary.'));
    };

    xhr.send(formData);
  });
}

