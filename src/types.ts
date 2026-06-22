export type Language = 'en' | 'ar';

export interface NavItem {
  labelEn: string;
  labelAr: string;
  href: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  priceAED: number;
  image: string;
  videoUrl?: string;
  categoryEn: string;
  categoryAr: string;
  descriptionEn: string;
  descriptionAr: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  stockStatusAr: 'متوفر' | 'كمية محدودة' | 'نفذت الكمية';
  isPremium?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryZone {
  id: string;
  nameEn: string;
  nameAr: string;
  feeAED: number;
  estimatedDays: string;
  estimatedDaysAr: string;
}

