import { put } from '@vercel/blob';
import { v4 as uuid } from 'uuid';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

export class MediaValidationError extends Error {}

export function classifyMedia(mimeType: string): 'IMAGE' | 'VIDEO' {
  if (IMAGE_TYPES.has(mimeType)) return 'IMAGE';
  if (VIDEO_TYPES.has(mimeType)) return 'VIDEO';
  throw new MediaValidationError(
    `Unsupported file type "${mimeType}". Allowed: JPG, JPEG, PNG, WebP, MP4, WebM.`
  );
}

export function validateSize(type: 'IMAGE' | 'VIDEO', size: number) {
  const max = type === 'IMAGE' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (size > max) {
    const maxMb = Math.round(max / (1024 * 1024));
    throw new MediaValidationError(`File too large. Max size for ${type.toLowerCase()}s is ${maxMb}MB.`);
  }
}

export async function saveMediaFile(file: File): Promise<{
  type: 'IMAGE' | 'VIDEO';
  url: string;
  fileName: string;
  fileSize: number;
}> {
  const type = classifyMedia(file.type);
  validateSize(type, file.size);

  const ext = file.name.includes('.') ? file.name.split('.').pop() : (type === 'IMAGE' ? 'jpg' : 'mp4');
  const blobName = `media/${type.toLowerCase()}-${uuid()}.${ext}`;

  const blob = await put(blobName, file, {
    access: 'public',
  });

  return {
    type,
    url: blob.url,
    fileName: file.name,
    fileSize: file.size
  };
}