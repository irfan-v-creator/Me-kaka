import { Product } from './types';

export const LUXURY_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    nameEn: 'The Golden Sovereign Chronometer',
    nameAr: 'كرونومتر السيادة الذهبي الفاخر',
    priceAED: 145000,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600',
    categoryEn: 'Watches',
    categoryAr: 'ساعات',
    descriptionEn: 'An masterfully engineered 24K yellow gold Swiss timepiece featuring a mechanical Tourbillon complex and sunburst champagne dial.',
    descriptionAr: 'تحفة ميكانيكية متميزة من سويسرا، مصنوعة يدوياً بالكامل من الذهب الأصفر عيار ٢٤ قيراط مع توربيون دقيق وميناء شامباني مشع.',
    stockStatus: 'Low Stock',
    stockStatusAr: 'كمية محدودة',
    isPremium: true,
    stock: 2
  },
  {
    id: 'prod_2',
    nameEn: 'The Empress Eternity Diamond Ring',
    nameAr: 'خاتم الأبدية الإمبراطوري المرصع بالماس',
    priceAED: 280000,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600',
    categoryEn: 'Jewelry',
    categoryAr: 'مجوهرات',
    descriptionEn: 'Interstellar clarity vvs1 diamond layout masterfully mounted on a flawless solid 18-karat white and gold dual band.',
    descriptionAr: 'ألماس مميز عالي النقاء درجة VVS1 مرتب بعناية متناهية ومثبت على قاعدة من الذهب الأبيض والوردي الفاخر عيار ١٨ قيراط.',
    stockStatus: 'In Stock',
    stockStatusAr: 'متوفر',
    isPremium: true,
    stock: 12
  },
  {
    id: 'prod_3',
    nameEn: 'Burj Oud Intense Bespoke Scent',
    nameAr: 'عطر برج العود الحصري المركز',
    priceAED: 4200,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
    categoryEn: 'Fragrance',
    categoryAr: 'عطور',
    descriptionEn: 'Intense raw agarwood carefully layered with pure Damascena rose nectar, cardamon leaf, and deep leather notes, bottled in crystal.',
    descriptionAr: 'تركيز دافئ وثري من دهن العود العتيق الممزوج ببتلات الورد الدمشقي النادر، أوراق الهيل، والجلود الملكية المعبأة في زجاج كرستالي.',
    stockStatus: 'In Stock',
    stockStatusAr: 'متوفر',
    isPremium: false,
    stock: 25
  },
  {
    id: 'prod_4',
    nameEn: 'Imperial Jumeirah Gold Scarf',
    nameAr: 'وشاح جميرا الإمبراطوري الحريري المطرز بالذهب',
    priceAED: 8900,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600',
    categoryEn: 'Accessories',
    categoryAr: 'إكسسوارات',
    descriptionEn: 'Woven with absolute pure hand-spun mulberry silk and featuring continuous gold-embroidered geometric calligraphies.',
    descriptionAr: 'منسوج ومطرز بالكامل يدوياً من حرير التوت الطبيعي الفاخر، مزين بخطوط وزخارف هندسية مترفة بخيوط الذهب الخالص.',
    stockStatus: 'Low Stock',
    stockStatusAr: 'كمية محدودة',
    isPremium: false,
    stock: 3
  }
];
