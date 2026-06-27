import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Sparkles, Receipt, ArrowRight, ArrowLeft } from 'lucide-react';
import { Language, DeliveryZone } from '../types';
import heroImage from '../assets/images/luxury_watch_hero_1782107472977.jpg';

interface HeroProps {
  lang: Language;
  onExplore: () => void;
  onBookViewing?: () => void;
}

const DUBAI_ZONES: DeliveryZone[] = [
  { id: '1', nameEn: 'Downtown Dubai & Burj District', nameAr: 'وسط مدينة دبي ومنطقة برج خليفة', feeAED: 50, estimatedDays: 'Within 3 Hours', estimatedDaysAr: 'خلال ٣ ساعات' },
  { id: '2', nameEn: 'Palm Jumeirah & Dubai Marina', nameAr: 'نخلة جميرا ومرسى دبي', feeAED: 75, estimatedDays: 'Within 4 Hours', estimatedDaysAr: 'خلال ٤ ساعات' },
  { id: '3', nameEn: 'Emirates Hills & Jumeirah Golf Estates', nameAr: 'تلال الإمارات وعقارات جميرا للجولف', feeAED: 100, estimatedDays: 'Within 4 Hours', estimatedDaysAr: 'خلال ٤ ساعات' },
  { id: '4', nameEn: 'Dubai Hills Estate & Meydan', nameAr: 'دبي هيلز ستيت وميدان', feeAED: 50, estimatedDays: 'Same Day (Order before 4 PM)', estimatedDaysAr: 'نفس اليوم (قبل ٤ مساءً)' }
];

export default function Hero({ lang, onExplore, onBookViewing }: HeroProps) {
  const isRTL = lang === 'ar';
  
  // Interactive mini calculator states for the UX engagement
  const [selectedZone, setSelectedZone] = useState<string>(DUBAI_ZONES[0].id);
  const [estimatePrice, setEstimatePrice] = useState<number>(15000); // 15,000 AED representative watch buy

  const currentZone = DUBAI_ZONES.find(z => z.id === selectedZone) || DUBAI_ZONES[0];
  
  // UAE VAT is 5%
  const vatAmount = estimatePrice * 0.05;
  const deliveryFee = currentZone.feeAED;
  const totalPrice = estimatePrice + vatAmount + deliveryFee;

  return (
    <section 
      id="luxury-hero-section" 
      className="relative min-h-[92vh] w-full bg-luxury-black overflow-hidden flex flex-col justify-between"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      
      {/* Background Hero Image with custom dual masks */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Styles & Grace Luxury Hero" 
          className="w-full h-full object-cover object-center opacity-45 scale-105 animate-[pulse_12s_infinite_alternate]"
          referrerPolicy="no-referrer"
        />
        {/* Dark radial and linear gradients to blend premium watch and details seamlessly */}
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-black/90 to-transparent md:block hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/60 to-luxury-black/90" />
      </div>

      {/* Floating Sparkles decorative effect */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-gold opacity-30 rounded-full blur-sm animate-ping" />
      <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-gold opacity-40 rounded-full blur-xs animate-pulse" />

      {/* Main Grid Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Brand Message */}
          <div className="lg:col-span-7 space-y-8 text-start">
            
            {/* Top Tagline Badglet */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 space-x-reverse rounded-full border border-gold/30 bg-gold/5 px-4.5 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-gold animate-[spin_4s_linear_infinite]" />
              <span className="font-serif text-xs font-semibold tracking-[0.25em] text-gold uppercase">
                {isRTL ? 'معيار الفخامة الإماراتية' : 'The Standard of Emirati Luxury'}
              </span>
            </motion.div>

            {/* Glowing Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="space-y-4"
            >
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6.5xl font-extrabold tracking-tight leading-tight text-white">
                {isRTL ? (
                  <>
                    اكتشف ذروة <br />
                    <span className="bg-gradient-to-r from-gold via-gold-light to-gold-dark bg-clip-text text-transparent filter drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)]">
                      الفخامة والبريق في دبي
                    </span>
                  </>
                ) : (
                  <>
                    Define the Pinnacle of <br />
                    <span className="bg-gradient-to-r from-gold via-gold-light to-gold-dark bg-clip-text text-transparent filter drop-shadow-[0_2px_15px_rgba(212,175,55,0.3)]">
                      Dubai Prestigious Style
                    </span>
                  </>
                )}
              </h1>
              
              <p className="max-w-xl text-base sm:text-lg text-luxury-cream/80 leading-relaxed font-sans">
                {isRTL 
                  ? 'وصول حصري لأرقى تشكيلة من الفضة الإيطالية عيار ٩٢٥ والمجوهرات المقاومة لتغير اللون، العطور الفاخرة، الساعات، والمحافظ والنظارات والأحزمة الراقية.'
                  : 'Exclusive access to premium 925 Italian Silver & non-tarnish jewelry, bespoke luxury perfumes, exquisite watches, leather wallets, sunglasses, and belts curated for you.'
                }
              </p>
            </motion.div>

            {/* Premium CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className={`flex flex-wrap gap-4 ${isRTL ? 'justify-start' : 'justify-start'}`}
            >
              <button
                id="explore-collection-btn"
                onClick={onExplore}
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-4 font-serif text-sm font-bold tracking-widest uppercase text-luxury-black shadow-[0_4px_25px_rgba(212,175,55,0.3)] transition-all duration-300 hover:shadow-[0_6px_35px_rgba(212,175,55,0.5)] active:scale-95 flex items-center"
              >
                {isRTL ? 'تسوق المجموعة' : 'Shop Collection'}
                {isRTL ? <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1.5 transition-transform" /> : <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />}
              </button>

              <button
                id="bespoke-viewing-btn"
                onClick={onBookViewing}
                className="rounded-md border border-gold/40 bg-luxury-black/40 px-8 py-4 font-serif text-sm font-bold tracking-widest uppercase text-gold backdrop-blur-sm transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-white cursor-pointer"
              >
                {isRTL ? 'احجز عرضاً خاصاً في دبي' : 'Book Private Viewing'}
              </button>
            </motion.div>

            {/* Quick trust flags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`pt-6 border-t border-gold/10 grid grid-cols-2 gap-4 text-xs tracking-wider text-luxury-cream/70 uppercase font-serif`}
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <ShieldCheck className="h-4.5 w-4.5 text-gold flex-shrink-0" />
                <span>{isRTL ? 'ضمان أصلي بنسبة ١٠٠٪' : '100% Certified Genuine'}</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <MapPin className="h-4.5 w-4.5 text-gold flex-shrink-0" />
                <span>{isRTL ? 'توصيل مدرع آمن في دبي' : 'Secure Armored Escrow Delivery'}</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Interactive UAE Pricing & Dubai Delivery Zone Calculator widget */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="rounded-xl border border-gold/20 bg-luxury-dark/95 p-6 shadow-2xl backdrop-blur-xl relative"
            >
              <div className="absolute top-0 right-0 h-16 w-16 bg-gold/5 rounded-tr-xl rounded-bl-full pointer-events-none" />
              
              <div className="mb-5 border-b border-gold/10 pb-4">
                <h3 className="font-serif text-lg font-bold text-gold tracking-wide">
                  {isRTL ? 'حاسبة الشراء والتوصيل الفاخر' : 'Luxury Purchase Estimator'}
                </h3>
                <p className="text-xs text-luxury-cream/60">
                  {isRTL 
                    ? 'احسب ضريبة القيمة المضافة لخدمة كبار الشخصيات واكتشف سرعة الطواقم في دبي' 
                    : 'Configure white-glove UAE VAT & direct-to-suite dispatch service'
                  }
                </p>
              </div>

              {/* Slider for representative item value */}
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-xs tracking-wider">
                  <span className="text-luxury-cream/80 uppercase font-serif">{isRTL ? 'قيمة القطعة التقديرية' : 'Estimated Item Price'}</span>
                  <span className="text-gold font-mono font-bold">{estimatePrice.toLocaleString()} AED</span>
                </div>
                <input
                  id="price-range-slider"
                  type="range"
                  min="5000"
                  max="100000"
                  step="5000"
                  value={estimatePrice}
                  onChange={(e) => setEstimatePrice(Number(e.target.value))}
                  className="w-full accent-gold bg-luxury-black h-1 rounded"
                />
                <div className="flex justify-between text-[10px] text-luxury-cream/50 font-mono">
                  <span>5,000 AED</span>
                  <span>100,000 AED</span>
                </div>
              </div>

              {/* District Area Selector */}
              <div className="space-y-3 mb-6">
                <label className="block text-xs uppercase font-serif tracking-wider text-luxury-cream/80">
                  {isRTL ? 'اختر منطقة التسليم الفاخر في دبي' : 'Select Premium Dubai Delivery District'}
                </label>
                <div className="relative">
                  <select
                    id="delivery-zone-selector"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-luxury-black/95 text-xs text-luxury-cream border border-gold/20 rounded-md p-3 focus:outline-none focus:border-gold cursor-pointer"
                  >
                    {DUBAI_ZONES.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {isRTL ? zone.nameAr : zone.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Calculation breakdown */}
              <div className="bg-luxury-black/70 rounded-lg p-4 space-y-3 border border-gold/5 text-xs text-luxury-cream/70 font-sans">
                <div className="flex justify-between">
                  <span>{isRTL ? 'قيمة القطعة الأساسية' : 'Curated Value'}</span>
                  <span className="font-mono">{estimatePrice.toLocaleString()} AED</span>
                </div>
                
                {/* 5% standard Dubai VAT */}
                <div className="flex justify-between items-center text-luxury-cream/60">
                  <span className="flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-gold" />
                    {isRTL ? 'ضريبة القيمة المضافة للإمارات (٥٪)' : 'UAE VAT Standard rate (5%)'}
                  </span>
                  <span className="font-mono">+{vatAmount.toLocaleString()} AED</span>
                </div>

                <div className="flex justify-between items-center text-luxury-cream/60">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gold" />
                    {isRTL ? 'خدمة الشحن والتأمين المصفح' : 'Secured Armored Shipping'}
                  </span>
                  <span className="font-mono">{deliveryFee === 0 ? 'Free' : `+${deliveryFee} AED`}</span>
                </div>

                {/* Estimate Speed */}
                <div className="border-t border-gold/10 pt-3 mt-1 flex justify-between items-center">
                  <span className="text-gold font-serif tracking-wider uppercase text-[11px]">{isRTL ? 'السرعة المتوقعة للتوصيل' : 'Delivery Lead Time'}</span>
                  <span className="text-white font-serif font-bold text-[11px] bg-gold/10 border border-gold/20 px-2 py-0.5 rounded">
                    {isRTL ? currentZone.estimatedDaysAr : currentZone.estimatedDays}
                  </span>
                </div>

                {/* Secure Total */}
                <div className="border-t border-gold/20 pt-4 mt-2 flex justify-between items-center text-sm font-serif">
                  <span className="text-white font-bold">{isRTL ? 'مجموع الاستثمار الكلي المجدول' : 'Secured Investment total'}</span>
                  <span className="text-gold font-mono font-bold text-base filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                    {totalPrice.toLocaleString()} AED
                  </span>
                </div>
              </div>

              {/* Footer pledge warning */}
              <div className="mt-4 text-[10px] text-center text-luxury-cream/40 italic">
                {isRTL 
                  ? '* متاح النقل مجاناً للطلبيات فوق ٥٠,٠٠٠ درهم شاملة الحماية الدبلوماسية.'
                  : '* Complementary diplomatic courier for transactions exceeding 50,000 AED.'
                }
              </div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* Decorative Golden Ambient Footer Strip */}
      <div className="w-full bg-gradient-to-r from-gold-dark/10 via-gold/25 to-gold-dark/10 h-[1px]" />
    </section>
  );
}
