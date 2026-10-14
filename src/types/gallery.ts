export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: string; // e.g. "Field Trials", "Crop Varieties", "Seed Production", "Farmer Visits"
  imagePublicId?: string;
  imageUrl: string;
  altText: string;
  caption?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}
