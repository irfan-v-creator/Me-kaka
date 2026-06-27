import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, Flame, Star, Clock, Heart, Eye, X, Send, CheckCircle2 } from 'lucide-react';
import { Product, Language } from '../types';
import { LUXURY_PRODUCTS } from '../data';
import ProductReviews from './ProductReviews';


interface HomepageGridsProps {
  lang: Language;
  onAddToCart: (product: Product) => void;
  onPlaceOrder: (product: Product, customerPhone: string) => void;
  favorites: string[];
  onToggleFavorite: (productId: string) => void;
  vatPercentage: number;
}

export default function HomepageGrids({
  lang,
  onAddToCart,
  onPlaceOrder,
  favorites,
  onToggleFavorite,
  vatPercentage
}: HomepageGridsProps) {
  const isRTL = lang === 'ar';
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // States for Quick Checkout/Reservation Modal inside homepage
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Countdown timer for Deal of the Day (counts down to end of day)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 34, seconds: 12 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  // Map products
  const dealProduct = LUXURY_PRODUCTS.find(p => p.id === 'prod_4') || LUXURY_PRODUCTS[0]; // Grace Elite Chronograph Steel Watch
  const trendingProducts = LUXURY_PRODUCTS.filter(p => p.id === 'prod_1' || p.id === 'prod_2'); // Royal Band & Neck-Chain
  const newArrivals = LUXURY_PRODUCTS.filter(p => p.id === 'prod_3' || p.id === 'prod_5' || p.id === 'prod_6'); // Oud, Wallet, Sunglasses

  // Quick order handler
  const handleQuickCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !checkoutName || !checkoutPhone || !checkoutAddress) return;

    const orderData = {
      ...selectedProduct,
      quantity: 1,
      selectedSize: 'One Size'
    };

    onPlaceOrder(orderData, checkoutPhone);
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setShowCheckoutModal(false);
      setSelectedProduct(null);
      // Reset fields
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCheckoutNotes('');
    }, 2500);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  return (
    <div className="space-y-24 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="homepage-luxury-grids">
      
      {/* SECTION 1: DEAL OF THE DAY / LIMITED SPOTLIGHT */}
      <section className="relative">
        {/* Glow Background */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-gold/20 via-gold-light/5 to-gold/20 opacity-30 blur-xl pointer-events-none" />
        
        <div className="relative bg-gradient-to-br from-[#0f0f0f] to-[#050505] border border-gold/30 rounded-2xl p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden">
          {/* Decorative Gold lines */}
          <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-l from-gold to-transparent" />
          <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-gradient-to-r from-gold to-transparent" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Countdown / Product Image Area (Left) */}
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-xl border border-gold/20 overflow-hidden bg-luxury-black aspect-square max-w-md mx-auto">
                <img 
                  src={dealProduct.image} 
                  alt={dealProduct.nameEn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                
                {/* Countdown overlay */}
                <div className="absolute bottom-4 inset-x-4 bg-luxury-black/90 border border-gold/40 rounded-lg p-3.5 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gold">
                    <Clock className="h-4 w-4 animate-spin-slow" />
                    <span className="text-[10px] tracking-widest uppercase font-mono font-bold">
                      {isRTL ? 'ينتهي العرض خلال:' : 'DEAL EXPIRES IN:'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-white text-xs sm:text-sm font-black">
                    <span className="bg-gold/10 border border-gold/30 px-2 py-1 rounded text-gold">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-gold/10 border border-gold/30 px-2 py-1 rounded text-gold">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span>:</span>
                    <span className="bg-gold/10 border border-gold/30 px-2 py-1 rounded text-gold">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Copy Area (Right) */}
            <div className="lg:col-span-7 space-y-6 text-start">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-red-950/40 border border-red-500/30 text-red-400 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full font-bold">
                  <Flame className="h-3 w-3 animate-pulse text-red-400" />
                  {isRTL ? 'محدود لفترة وجيزة' : 'LIMITED SPOTLIGHT'}
                </span>
                <span className="inline-flex items-center gap-1 bg-gold/10 border border-gold/30 text-gold text-[10px] uppercase font-serif px-2.5 py-1 rounded-full font-bold">
                  <Star className="h-3 w-3 text-gold" />
                  {isRTL ? 'صفقة اليوم المميزة' : 'DEAL OF THE DAY'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-wide uppercase leading-tight">
                  {isRTL ? dealProduct.nameAr : dealProduct.nameEn}
                </h3>
                <p className="text-[10px] text-gold tracking-widest uppercase font-mono">
                  {isRTL ? dealProduct.categoryAr : dealProduct.categoryEn}
                </p>
              </div>

              <p className="text-luxury-cream/70 text-xs sm:text-sm leading-relaxed tracking-wide font-light">
                {isRTL ? dealProduct.descriptionAr : dealProduct.descriptionEn}
              </p>

              {/* Pricing section with original and deal price */}
              <div className="flex items-end gap-4 border-y border-gold/10 py-4 max-w-sm">
                <div>
                  <span className="block text-[8px] uppercase tracking-widest text-luxury-cream/40 font-mono mb-0.5">
                    {isRTL ? 'السعر الأصلي' : 'ORIGINAL PRICE'}
                  </span>
                  <span className="text-xs sm:text-sm text-luxury-cream/50 line-through font-mono">
                    AED {formatPrice(dealProduct.priceAED)}
                  </span>
                </div>
                <div className="text-gold">
                  <span className="block text-[8px] uppercase tracking-widest text-gold/60 font-mono mb-0.5 font-bold">
                    {isRTL ? 'سعر العرض الخاص' : 'EXCLUSIVE DEAL PRICE'}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#e5c158]">
                    AED {formatPrice(Math.round(dealProduct.priceAED * 0.9))}
                  </span>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded px-2 py-0.5 text-emerald-400 text-[10px] font-bold font-mono">
                  {isRTL ? 'وفّر ١٠٪' : 'SAVE 10%'}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onAddToCart(dealProduct)}
                  className="px-6 py-3 rounded bg-gradient-to-r from-[#e5c158] to-[#cba33f] text-luxury-black font-serif font-black text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(229,193,88,0.3)] flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{isRTL ? 'أضف لحقيبة الاقتناء' : 'ACQUIRE NOW'}</span>
                </button>
                <button
                  onClick={() => setSelectedProduct(dealProduct)}
                  className="px-6 py-3 rounded border border-gold/30 bg-luxury-black/40 hover:border-gold hover:bg-gold/5 text-gold font-serif font-bold text-xs sm:text-sm tracking-widest uppercase transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  <span>{isRTL ? 'معاينة تفصيلية' : 'INSPECT DETAIL'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 2: TRENDING NOW (Bento/Premium Grid) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gold/10 pb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-gold animate-pulse" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-white uppercase">
              {isRTL ? 'الأكثر طلباً ورواجاً الآن' : 'TRENDING NOW'}
            </h2>
          </div>
          <span className="text-[10px] tracking-[0.2em] font-mono text-gold uppercase hidden sm:inline">
            {isRTL ? 'مجموعة دبي الحصرية' : 'DUBAI ELITE PICKS'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trendingProducts.map((product) => {
            const isFav = favorites.includes(product.id);
            return (
              <div 
                key={product.id}
                className="group relative bg-[#0b0b0b] border border-gold/20 rounded-xl p-5 overflow-hidden transition-all duration-500 hover:border-gold hover:shadow-[0_0_20px_rgba(229,193,88,0.1)] flex flex-col justify-between text-start"
              >
                {/* Heart wishlist toggle absolute button */}
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full border border-gold/15 bg-black/60 text-luxury-cream hover:text-red-400 hover:border-gold transition-colors duration-300 cursor-pointer"
                >
                  <Heart className={`h-4 w-4 ${isFav ? 'fill-gold text-gold' : ''}`} />
                </button>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-full sm:w-1/3 aspect-square rounded-lg border border-gold/10 overflow-hidden bg-black shrink-0 relative">
                    <img 
                      src={product.image} 
                      alt={product.nameEn}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-gold text-luxury-black font-mono text-[8px] uppercase font-bold px-1.5 py-0.5 rounded">
                      {isRTL ? 'رائج' : 'HOT'}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-white uppercase tracking-wide group-hover:text-gold transition-colors duration-300">
                        {isRTL ? product.nameAr : product.nameEn}
                      </h3>
                      <p className="text-[9px] text-gold font-mono uppercase tracking-widest">
                        {isRTL ? product.categoryAr : product.categoryEn}
                      </p>
                      <p className="text-luxury-cream/60 text-xs font-light line-clamp-3 leading-relaxed mt-2">
                        {isRTL ? product.descriptionAr : product.descriptionEn}
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <span className="text-base font-bold font-mono text-[#e5c158]">
                        AED {formatPrice(product.priceAED)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gold/10 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onAddToCart(product)}
                    className="flex-1 py-2 rounded bg-gold/10 border border-gold/30 text-gold hover:bg-gold hover:text-luxury-black font-serif font-bold text-xs tracking-widest uppercase transition-all duration-300 cursor-pointer text-center"
                  >
                    {isRTL ? 'أضف للحقيبة' : 'ADD TO BAG'}
                  </button>
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="py-2 px-3.5 rounded border border-gold/15 hover:border-gold/40 text-luxury-cream/70 hover:text-gold transition-all duration-300 cursor-pointer text-xs"
                    title="Quick Inspect"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: NEW ARRIVALS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-gold/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold animate-pulse" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-widest text-white uppercase">
              {isRTL ? 'القطع الفنية المضافة حديثاً' : 'NEW ARRIVALS'}
            </h2>
          </div>
          <span className="text-[10px] tracking-[0.2em] font-mono text-gold uppercase hidden sm:inline">
            {isRTL ? 'مقتنيات الموسم الجديد' : 'SEASONAL MASTERWORKS'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {newArrivals.map((product) => {
            const isFav = favorites.includes(product.id);
            return (
              <div 
                key={product.id}
                className="group relative bg-[#090909] border border-gold/20 rounded-xl overflow-hidden transition-all duration-500 hover:border-gold hover:shadow-[0_0_20px_rgba(229,193,88,0.1)] flex flex-col justify-between text-start"
              >
                {/* Heart wishlist toggle */}
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full border border-gold/15 bg-black/60 text-luxury-cream hover:text-red-400 hover:border-gold transition-colors duration-300 cursor-pointer"
                >
                  <Heart className={`h-4 w-4 ${isFav ? 'fill-gold text-gold' : ''}`} />
                </button>

                <div className="relative aspect-square overflow-hidden bg-black border-b border-gold/10">
                  <img 
                    src={product.image} 
                    alt={product.nameEn}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="px-4 py-2 bg-luxury-black/90 border border-gold/40 text-gold text-xs uppercase tracking-widest font-serif rounded flex items-center gap-1.5 hover:bg-gold hover:text-luxury-black transition-all cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{isRTL ? 'معاينة القطعة' : 'Inspect Creation'}</span>
                    </button>
                  </div>
                  <div className="absolute top-4 left-4 bg-gold/10 border border-gold/40 text-gold font-mono text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full">
                    {isRTL ? 'جديد' : 'NEW'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="block text-[8px] text-gold uppercase tracking-widest font-mono">
                      {isRTL ? product.categoryAr : product.categoryEn}
                    </span>
                    <h3 className="font-serif text-base font-bold text-white uppercase tracking-wide group-hover:text-gold transition-colors duration-300 truncate">
                      {isRTL ? product.nameAr : product.nameEn}
                    </h3>
                    <p className="text-luxury-cream/50 text-xs font-light line-clamp-2 leading-relaxed">
                      {isRTL ? product.descriptionAr : product.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gold/10 mt-4 flex items-center justify-between">
                    <span className="text-base font-bold font-mono text-[#e5c158]">
                      AED {formatPrice(product.priceAED)}
                    </span>
                    <button
                      onClick={() => onAddToCart(product)}
                      className="py-1.5 px-4 rounded bg-[#e5c158] hover:bg-gold text-luxury-black font-serif font-black text-[10px] tracking-widest uppercase transition-colors cursor-pointer"
                    >
                      {isRTL ? 'اقتناء سريع' : 'ACQUIRE'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* DYNAMIC DETAILED INSPECTION MODAL */}
      <AnimatePresence>
        {selectedProduct && !showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedProduct(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#090909] border border-gold/30 rounded-2xl shadow-2xl p-6 sm:p-10 overflow-y-auto max-h-[90vh] text-start z-10"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 rounded-full border border-gold/15 hover:border-gold hover:bg-gold/10 text-gold transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                {/* Image panel */}
                <div className="relative aspect-square rounded-xl border border-gold/20 overflow-hidden bg-black max-w-sm mx-auto w-full">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.nameEn}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-luxury-black/90 border border-gold/30 rounded px-3 py-1 text-gold text-[10px] font-mono font-bold">
                    {isRTL ? selectedProduct.stockStatusAr : selectedProduct.stockStatus}
                  </div>
                </div>

                {/* Information panel */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="block text-[10px] text-gold uppercase tracking-[0.2em] font-mono">
                      {isRTL ? selectedProduct.categoryAr : selectedProduct.categoryEn}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-black text-white uppercase tracking-wide leading-tight">
                      {isRTL ? selectedProduct.nameAr : selectedProduct.nameEn}
                    </h2>
                    <div className="w-12 h-[1px] bg-gold" />
                  </div>

                  <p className="text-luxury-cream/80 text-xs sm:text-sm leading-relaxed font-light tracking-wide">
                    {isRTL ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                  </p>

                  <div className="space-y-2 border-t border-b border-gold/10 py-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-luxury-cream/40">{isRTL ? 'قيمة التحفة الفنية:' : 'Sovereign Value:'}</span>
                      <span className="text-xl font-bold text-[#e5c158]">
                        AED {formatPrice(selectedProduct.priceAED)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-sans text-luxury-cream/50">
                      <span>{isRTL ? 'شامل ضريبة القيمة المضافة ومصاريف التوصيل المصفّح:' : 'Incl. VAT & armored premium transport:'}</span>
                      <span>AED {formatPrice(Math.round(selectedProduct.priceAED * (1 + vatPercentage / 100)))}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        onAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3 rounded bg-gradient-to-r from-[#e5c158] to-[#cba33f] text-luxury-black font-serif font-black text-xs sm:text-sm tracking-widest uppercase transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(229,193,88,0.25)] cursor-pointer text-center"
                    >
                      {isRTL ? 'إضافة لحقيبة التسوق' : 'ADD TO SHOPPING VAULT'}
                    </button>
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      className="flex-1 py-3 rounded border border-gold/30 bg-luxury-black text-gold hover:bg-gold/5 font-serif font-bold text-xs sm:text-sm tracking-widest uppercase transition-colors cursor-pointer text-center"
                    >
                      {isRTL ? 'امتلاك فوري آمن' : 'IMMEDIATE ACQUISITION'}
                    </button>
                  </div>
                </div>
              </div>

              <ProductReviews productId={selectedProduct.id} lang={lang} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IMMEDIATE CHECKOUT / QUICK PURCHASE MODAL */}
      <AnimatePresence>
        {showCheckoutModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowCheckoutModal(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#0d0d0d] border border-gold/40 rounded-xl p-6 sm:p-8 text-start z-10"
            >
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full border border-gold/15 text-gold hover:bg-gold/10 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {checkoutSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-[#e5c158] mx-auto animate-bounce" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white uppercase tracking-wider">
                    {isRTL ? 'تم تسجيل حيازتكم بنجاح' : 'Acquisition Registered'}
                  </h3>
                  <p className="text-xs text-luxury-cream/70 leading-relaxed max-w-xs mx-auto">
                    {isRTL 
                      ? 'نشكر ذوقكم الرفيع. سيقوم مستشارو ستايلز آند جريس بالتواصل معكم هاتفياً لترتيب الشحن والمصفح.' 
                      : 'Our concierge suite has registered your sovereign purchase. We will contact you shortly to coordinate armored delivery.'
                    }
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuickCheckoutSubmit} className="space-y-5">
                  <div className="border-b border-gold/10 pb-3">
                    <span className="block text-[8px] text-gold uppercase tracking-[0.2em] font-mono">
                      {isRTL ? 'بوابة الاقتناء الآمن والمباشر' : 'DIRECT SOVEREIGN ACQUISITION GATEWAY'}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-white uppercase mt-1 truncate">
                      {isRTL ? selectedProduct.nameAr : selectedProduct.nameEn}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-gold/80 font-mono mb-1">
                        {isRTL ? 'الاسم الكامل للمقتني الكريم' : 'Collector\'s Full Name *'}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder={isRTL ? 'مثال: سمو الشيخ أحمد آل مكتوم' : 'e.g. Robert Vance'}
                        className="w-full bg-luxury-black border border-gold/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-gold/80 font-mono mb-1">
                        {isRTL ? 'رقم الهاتف (الواتساب للمتابعة)' : 'Contact Number (WhatsApp Enabled) *'}
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        placeholder="e.g. +971 58 825 7372"
                        className="w-full bg-luxury-black border border-gold/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-gold/80 font-mono mb-1">
                        {isRTL ? 'العنوان وتفاصيل القصر أو المنزل' : 'Armored Delivery Residence Address *'}
                      </label>
                      <textarea 
                        required
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        rows={2}
                        placeholder={isRTL ? 'مثال: دبي، تلال الإمارات، فيلا ٤٢' : 'e.g. Villa 42, Emirates Hills, Dubai'}
                        className="w-full bg-luxury-black border border-gold/20 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest text-gold/40 font-mono mb-1">
                        {isRTL ? 'تعليمات خاصة للخدمة الدبلوماسية' : 'Bespoke Concierge Instructions (Optional)'}
                      </label>
                      <input 
                        type="text" 
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder={isRTL ? 'مثال: يرجى التوصيل بعد الساعة ٥ مساءً' : 'e.g. Deliver after 5:00 PM'}
                        className="w-full bg-luxury-black border border-gold/15 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  <div className="bg-gold/5 border border-gold/20 p-3 rounded text-center">
                    <span className="block text-[10px] text-luxury-cream/60">
                      {isRTL ? 'القيمة الإجمالية المعتمدة:' : 'Sovereign Authorized Total:'}
                    </span>
                    <span className="text-lg font-bold text-[#e5c158] font-mono">
                      AED {formatPrice(Math.round(selectedProduct.priceAED * (1 + vatPercentage / 100)))}
                    </span>
                    <span className="block text-[8px] text-luxury-cream/40 uppercase font-mono mt-0.5">
                      {isRTL ? 'الدفع نقداً أو بالبطاقة عند الاستلام الآمن' : 'PAYMENT ON ARMORED SECURE DELIVERY'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="flex-1 py-2.5 rounded border border-gold/20 hover:border-gold/50 text-luxury-cream/70 text-xs tracking-widest font-serif uppercase cursor-pointer text-center"
                    >
                      {isRTL ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded bg-gradient-to-r from-[#e5c158] to-[#cba33f] text-luxury-black text-xs font-serif font-black tracking-widest uppercase transition-transform hover:scale-103 cursor-pointer text-center"
                    >
                      {isRTL ? 'تأكيد الحيازة الملكية' : 'CONFIRM ACQUISITION'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
