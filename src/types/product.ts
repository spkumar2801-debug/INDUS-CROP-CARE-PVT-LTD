export interface ProductSpecification {
  label: string;
  value: string;
  labelTelugu?: string;
  valueTelugu?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string; // e.g. "IAS 405", "IAS 404", "IAS 503", "IAS 504"
  slug: string;
  category: string; // e.g. "Insecticides", "Herbicides", "Fungicides", etc.
  categoryTelugu?: string;
  broadGroup?: string; // Broader navigation sector e.g. "Nutrients", "Biologicals", "Fertilizers", etc.
  formulation?: string; // e.g. "Diafenthiuron 50% WP", "Cartap Hydrochloride 4% GR"
  composition?: string;
  sourcePage?: number;
  shortDescription: string;
  description: string;
  teluguDescription?: string;
  features: string[];
  specifications: ProductSpecification[];
  imagePublicId?: string;
  imageUrl: string;
  sheetImageUrl?: string; // full technical sheet image provided by company
  galleryImages?: string[];
  isPublished: boolean;
  isFeatured?: boolean;
  sortOrder: number;
  cropSeason?: string;
  daysToHarvest?: string; // e.g. "50-55 days", "40-45 days"
  fruitLength?: string; // e.g. "10-12 cm", "16-22 cm", "20-22 cm"
  averageWeight?: string; // e.g. "110-140 g"
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface QuoteFormData {
  customerName: string;
  phone: string;
  state: string;
  district: string;
  productId: string;
  productName: string;
  productCode: string;
  quantity: string;
  message: string;
}
