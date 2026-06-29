import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { Product, Language } from '../types';

interface SovereignWishlistProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  favorites: string[];
  products: Product[];
  onToggleFavorite: (id: string) => void;
  onMoveToCart: (product: Product) => void;
}

export default function SovereignWishlist({
  isOpen,
  onClose,
  lang,
  favorites,
  products,
  onToggleFavorite,
  onMoveToCart
}: SovereignWishlistProps) {
  const isRTL = lang === 'ar';
  
  // Resolve favorited products
  const favoritedProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-luxury-black/80 backdrop-blur-sm pointer-events-auto cursor-pointer"
          />

          {/* Luxury Slide-over Panel */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed inset-y-0 ${
              isRTL ? 'left-0 border-r' : 'right-0 border-l'
            } z-50 w-full sm:max-w-md bg-luxury-dark/95 border-gold/15 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col justify-between overflow-hidden text-luxury-cream`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Top Frame Gold Line Accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* Header section */}
            <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-luxury-black/40">
              <div className="flex items-center gap-2.5">
                <Heart className="h-5 w-5 text-gold fill-gold animate-pulse" />
                <div>
                  <h2 className="font-serif text-lg font-bold text-white tracking-widest uppercase">
                    {isRTL ? 'قائمة الأمنيات الملكية' : 'My Wishlist'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-gold font-mono leading-none mt-1">
                    {favoritedProducts.length}{' '}
                    {isRTL ? 'تحف فنية مختارة' : 'Saved Items'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-luxury-cream/60 hover:text-gold p-1.5 rounded-full border border-gold/10 hover:border-gold/30 transition-all duration-300"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Wishlist Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {favoritedProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full border border-gold/10 flex items-center justify-center text-gold bg-luxury-black/20">
                    <Heart className="h-5 w-5 opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                      {isRTL ? 'القائمة الملكية فارغة حالياً' : 'Wishlist Empty'}
                    </h3>
                    <p className="text-xs text-luxury-cream/40 max-w-xs mx-auto">
                      {isRTL
                        ? 'تصفح تشكيلتنا الحصرية وقم بتمييز المقتنيات بالضغط على رمز القلب لحفظها هنا.'
                        : 'Save your favorite items from our collections to easily find them later.'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 border border-gold/20 text-gold text-[10px] font-serif uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all duration-300"
                  >
                    {isRTL ? 'متابعة الاستكشاف' : 'Explore Collections'}
                  </button>
                </div>
              ) : (
                favoritedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-luxury-black/40 border border-gold/10 hover:border-gold/25 p-4 rounded-xl flex gap-4 items-center group transition-colors duration-300"
                  >
                    {/* Item Image */}
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-luxury-dark border border-gold/10 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={isRTL ? product.nameAr : product.nameEn}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-serif text-xs font-bold text-white truncate">
                        {isRTL ? product.nameAr : product.nameEn}
                      </h4>
                      <div className="font-mono text-xs font-bold text-gold">
                        {product.priceAED.toLocaleString()} AED
                      </div>
                      <span className="inline-block text-[9px] uppercase tracking-widest text-luxury-cream/40 bg-luxury-dark/60 border border-gold/5 px-1.5 py-0.5 rounded">
                        {isRTL ? product.categoryAr : product.categoryEn}
                      </span>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-col gap-2 items-end justify-center">
                      <button
                        onClick={() => onToggleFavorite(product.id)}
                        className="text-luxury-cream/40 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10 transition-colors cursor-pointer"
                        title={isRTL ? 'إزالة' : 'Remove item'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                       <button
                        onClick={() => onMoveToCart(product)}
                        className="bg-gold/10 hover:bg-gold hover:text-luxury-black text-gold text-[10px] font-serif uppercase tracking-widest px-2.5 py-1.5 rounded border border-gold/20 hover:border-gold/0 transition-all flex items-center gap-1.5 cursor-pointer"
                        title={isRTL ? 'نقل إلى حقيبة الاقتناء' : 'Move to Cart'}
                      >
                        <ShoppingBag className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {isRTL ? 'اقتناء' : 'Cart'}
                        </span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Bottom Footer Section */}
            {favoritedProducts.length > 0 && (
              <div className="p-6 border-t border-gold/10 bg-luxury-black/40 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-luxury-cream/60">
                    {isRTL ? 'إجمالي القيمة التقديرية:' : 'Total Value:'}
                  </span>
                  <span className="font-mono font-bold text-sm text-gold">
                    {favoritedProducts.reduce((sum, p) => sum + p.priceAED, 0).toLocaleString()} AED
                  </span>
                </div>
                
                <p className="text-[10px] text-center text-luxury-cream/40 leading-relaxed">
                  {isRTL 
                    ? 'الأسعار تشمل الحراسة الخاصة والشحن المصفح الدبلوماسي.' 
                    : 'Prices include shipping and standard delivery.'}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
