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
  stock?: number;
  originalPriceAED?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  productName: string;
  priceAED: number;
  customerPhone: string;
  orderTime: string;
  clientName?: string;
  deliveryCoordinates?: string;
  bespokeNotes?: string;
  vatAED?: number;
  status?: 'Pending' | 'Dispatched' | 'Secured' | 'Cancelled' | 'Processing' | 'Shipped' | 'Delivered';
  checkoutMethod?: 'WhatsApp' | 'QuickBuy';
  userEmail?: string;
  customerEmail?: string;
  items?: CartItem[];
  subtotal?: number;
  discount?: number;
}

export interface DeliveryZone {
  id: string;
  nameEn: string;
  nameAr: string;
  feeAED: number;
  estimatedDays: string;
  estimatedDaysAr: string;
}

