export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g. "Field Trials", "Crop Varieties", "Seed Production", "Farmer Visits"
  mediaType?: 'image' | 'video';
  imagePublicId?: string;
  imageUrl: string;
  videoUrl?: string;
  videoPublicId?: string;
  altText: string;
  caption?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
