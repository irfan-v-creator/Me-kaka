import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Shield, RefreshCw, X, ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product, Language } from '../types';
import { LUXURY_PRODUCTS } from '../data';

interface ProductShowcaseProps {
  lang: Language;
  products: Product[];
  searchQuery?: string;
  onAddToCart?: (product: Product) => void;
  onPlaceOrder?: (product: Product, customerPhone: string) => void;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  vatPercentage?: number;
}

export default function ProductShowcase({ 
  lang, 
  products, 
  searchQuery = '', 
  onAddToCart, 
  onPlaceOrder,
  favorites: propFavorites,
  onToggleFavorite,
  vatPercentage = 5
}: ProductShowcaseProps) {
  const isRTL = lang === 'ar';
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [localFavorites, setLocalFavorites] = useState<string[]>([]);
  
  const favorites = propFavorites || localFavorites;
  
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    } else {
      if (localFavorites.includes(id)) {
        setLocalFavorites(localFavorites.filter(f => f !== id));
      } else {
        setLocalFavorites([...localFavorites, id]);
      }
    }
  };

  const [inquirySubmitted, setInquirySubmitted] = useState<boolean>(false);
  const [addedToBag, setAddedToBag] = useState<boolean>(false);
  const [clientPhone, setClientPhone] = useState<string>('');
  const [validationError, setValidationError] = useState<boolean>(false);

  React.useEffect(() => {
    if (selectedProduct) {
      setClientPhone('');
      setInquirySubmitted(false);
      setValidationError(false);
    }
  }, [selectedProduct]);

  // Filter translation keys
  const categoriesTranslation: Record<string, { en: string; ar: string }> = {
    'All': { en: 'All Masterworks', ar: 'كل النفائس' },
    'Watches': { en: 'Sovereign Watches', ar: 'ساعات السيادة' },
    'Jewelry': { en: 'High Jewelry', ar: 'مجوهرات فاخرة' },
    'Fragrance': { en: 'Royal Fragrances', ar: 'عطور ملكية' },
    'Accessories': { en: 'Silk & Gold Accessories', ar: 'إكسسوارات النخبة' }
  };

  const categories = ['All', 'Watches', 'Jewelry', 'Fragrance', 'Accessories'];

  const filteredProducts = products.filter(p => {
    // Check category filter
    const matchesCategory = selectedCategory === 'All' || p.categoryEn === selectedCategory;
    
    // Check search query
    if (!searchQuery) return matchesCategory;
    
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = p.nameEn.toLowerCase().includes(query) || p.nameAr.includes(query);
    const categoryMatch = p.categoryEn.toLowerCase().includes(query) || p.categoryAr.includes(query);
    const descMatch = p.descriptionEn.toLowerCase().includes(query) || p.descriptionAr.includes(query);
    
    return matchesCategory && (nameMatch || categoryMatch || descMatch);
  });

  return (
    <section 
      id="product-showcase-section" 
      className="py-24 bg-luxury-black text-luxury-cream border-t border-gold/15 relative"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Decorative Aura */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 space-x-reverse text-gold">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="font-serif text-xs tracking-[0.25em] uppercase font-semibold">
              {isRTL ? 'معرض المقتنيات الحصرية' : 'Curated Masterpiece Catalog'}
            </span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-wide">
            {isRTL ? 'تحف فنية للذواقة' : 'Sovereign Creations'}
          </h2>
          
          <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          
          <p className="text-sm text-luxury-cream/70 leading-relaxed font-sans">
            {isRTL 
              ? 'تصفح تشكيلتنا المصممة بعناية فائقة لتلائم أنماط الحياة المترفة في قلب دبي الجميل.'
              : 'Immerse in unparalleled artisanship available for immediate bespoke armored dispatch with diplomatic standards.'
            }
          </p>
        </div>

        {/* Category Filter Pills (Horizontal luxury track) */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`filter-pill-${cat}`}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs font-serif tracking-widest uppercase transition-all duration-300 border ${
                  isActive 
                    ? 'bg-gradient-to-r from-gold to-gold-dark text-luxury-black border-gold/80 shadow-[0_4px_15px_rgba(212,175,55,0.25)] font-bold' 
                    : 'bg-luxury-dark/60 text-luxury-cream/80 border-gold/10 hover:border-gold/40 hover:text-white'
                }`}
              >
                {isRTL ? categoriesTranslation[cat].ar : categoriesTranslation[cat].en}
              </button>
            );
          })}
        </div>

        {/* Products Matrix / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="col-span-full py-20 px-4 text-center space-y-5 rounded-2xl border border-gold/15 bg-luxury-dark/30 backdrop-blur-md max-w-lg mx-auto"
              >
                <div className="text-gold text-4xl font-serif">⚜</div>
                <h3 className="font-serif text-xl font-bold text-white tracking-widest uppercase">
                  {isRTL ? 'لم يتم العثور على قطع تطابق بحثك' : 'No Exquisite Creations Found'}
                </h3>
                <div className="w-12 h-[1px] bg-gold/50 mx-auto" />
                <p className="text-luxury-cream/60 text-xs leading-relaxed max-w-sm mx-auto">
                  {isRTL 
                    ? 'نأسف لعدم العثور على قطع تتوافق مع مدخلات البحث الحالية. يرجى مراجعة التهجئة أو استخدام تعبيرات أخرى مثل "ساعة" أو "أقراط" أو "عود".'
                    : 'Our elite vault currently has no masterworks matching this filter criteria. Please revise your search keywords or seek adjacent bespoke terms.'}
                </p>
              </motion.div>
            ) : (
              filteredProducts.map((product) => {
                const isFav = favorites.includes(product.id);
                return (
                  <motion.div
                    key={product.id}
                    id={`product-card-${product.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    onClick={() => setSelectedProduct(product)}
                    className="group relative rounded-xl border border-gold/10 bg-luxury-dark/45 hover:bg-luxury-dark/90 p-4 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-between"
                  >
                    {/* Subtle Gold Shimmer Border on Hover */}
                    <span className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent scale-0 group-hover:scale-100 transition-transform duration-750" />
                    <span className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-gold to-transparent scale-0 group-hover:scale-100 transition-transform duration-750 delay-75" />
                    <span className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-l from-transparent via-gold to-transparent scale-0 group-hover:scale-100 transition-transform duration-750 delay-150" />
                    <span className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-t from-transparent via-gold to-transparent scale-0 group-hover:scale-100 transition-transform duration-750 delay-225" />

                    {/* Top features: Premium badge and Favorite button */}
                    <div className="relative z-10 flex justify-between items-center mb-3">
                      {product.isPremium ? (
                        <span className="bg-gold/10 border border-gold/30 text-[9px] font-serif font-semibold text-gold tracking-widest px-2 py-0.5 rounded uppercase">
                          {isRTL ? 'إصدار ملكي' : 'Royal Edition'}
                        </span>
                      ) : (
                        <span className="text-transparent text-[9px] px-2 py-0.5 select-none font-serif">Empty</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          id={`add-bag-quick-${product.id}`}
                          disabled={product.stockStatus === 'Out of Stock'}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.stockStatus === 'Out of Stock') return;
                            if (onAddToCart) onAddToCart(product);
                          }}
                          className={`transition-colors duration-300 p-1.5 rounded-full hover:bg-gold/5 cursor-pointer ${
                            product.stockStatus === 'Out of Stock'
                              ? 'text-neutral-700 cursor-not-allowed opacity-50'
                              : 'text-luxury-cream/40 hover:text-gold'
                          }`}
                          title={product.stockStatus === 'Out of Stock' ? (isRTL ? 'نفذت الكمية' : 'Out of Stock') : (isRTL ? 'إضافة إلى حقيبة الاقتناء' : 'Add to Shopping Vault Bag')}
                        >
                          <ShoppingBag className="h-4.5 w-4.5" />
                        </button>

                        <button
                          id={`fav-btn-${product.id}`}
                          onClick={(e) => toggleFavorite(product.id, e)}
                          className="text-luxury-cream/40 hover:text-gold transition-colors duration-300 cursor-pointer"
                        >
                          <Heart className={`h-4.5 w-4.5 ${isFav ? 'fill-gold text-gold scale-110' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Image container with subtle parallax/slight zoom */}
                    <div className="relative h-64 w-full rounded-lg overflow-hidden bg-luxury-black mb-4">
                      <img
                        src={product.image}
                        alt={lang === 'ar' ? product.nameAr : product.nameEn}
                        className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ${
                          product.stockStatus === 'Out of Stock' ? 'opacity-40 grayscale' : ''
                        }`}
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Out of Stock overlay ribbon */}
                      {product.stockStatus === 'Out of Stock' && (
                        <div className="absolute top-3 left-3 bg-red-600/95 text-white text-[9px] uppercase tracking-widest font-serif font-bold px-2.5 py-1 rounded shadow-lg">
                          {isRTL ? 'نفذت الكمية' : 'Sold Out'}
                        </div>
                      )}
                      
                      {/* Dark gradient overlay showing only on hover */}
                      {product.stockStatus !== 'Out of Stock' ? (
                        <div className="absolute inset-0 bg-luxury-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="rounded-full bg-gold text-luxury-black px-4 py-2 font-serif text-xs font-bold tracking-widest uppercase flex items-center space-x-2 space-x-reverse shadow-lg">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{isRTL ? 'عرض التفاصيل والضمان' : 'Assess Creation'}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-luxury-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 px-4 py-2 font-serif text-xs font-bold tracking-widest uppercase flex items-center space-x-2 space-x-reverse shadow-lg">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{isRTL ? 'تفاصيل المنتج' : 'Inspect Details'}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Brand Meta & Info */}
                    <div className="space-y-1.5 flex-grow flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-serif tracking-[0.2em] text-gold">
                          {isRTL ? product.categoryAr : product.categoryEn}
                        </p>
                        
                        <h3 className="font-serif text-base font-bold text-white tracking-wide group-hover:text-gold transition-colors line-clamp-1">
                          {isRTL ? product.nameAr : product.nameEn}
                        </h3>

                        <p className="text-xs text-luxury-cream/65 line-clamp-2 mt-1 leading-relaxed font-sans">
                          {isRTL ? product.descriptionAr : product.descriptionEn}
                        </p>
                      </div>

                      {/* Stock Status + Value Area */}
                      <div className="pt-3 border-t border-gold/5 mt-3 flex items-center justify-between">
                        <div className="flex flex-col text-start">
                          <span className="text-[9px] text-luxury-cream/40 uppercase font-mono tracking-wider">{isRTL ? 'المبلغ التقديري' : 'Investment Value'}</span>
                          <span className="font-mono text-[15px] font-bold text-gold">
                            {product.priceAED.toLocaleString()} AED
                          </span>
                        </div>

                        {/* Stock badge with light bullet */}
                        <span className={`text-[10px] font-serif tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5 ${
                          product.stockStatus === 'In Stock' 
                            ? 'text-emerald-400 bg-emerald-950/10' 
                            : 'text-amber-400 bg-amber-950/10'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${product.stockStatus === 'In Stock' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {isRTL ? product.stockStatusAr : product.stockStatus}
                        </span>
                      </div>
                    </div>

                    {/* Action view details Button for accessibility */}
                    <button 
                      id={`view-details-${product.id}`}
                      name="view-details"
                      className="mt-4 w-full text-center py-2 text-xs border border-gold/20 hover:border-gold hover:bg-gold/5 text-luxury-cream tracking-widest font-serif uppercase rounded"
                    >
                      {isRTL ? 'معاينة التحفة الفنية' : 'Inspect Creation'}
                    </button>

                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Detailed Inspection Modal Popup */}
        <AnimatePresence>
          {selectedProduct && (
            <div id="inspector-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                className="bg-luxury-dark border border-gold/30 rounded-xl max-w-3xl w-full p-6 sm:p-8 relative overflow-hidden"
                id="luxury-product-inspector"
              >
                {/* Visual aesthetic gold strip */}
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

                {/* Close Button */}
                <button
                  id="close-inspector-btn"
                  onClick={() => {
                    setSelectedProduct(null);
                    setInquirySubmitted(false);
                  }}
                  className="absolute top-5 right-5 text-luxury-cream/40 hover:text-gold transition-colors focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  {/* Left Column: Product Image Frame */}
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-gold/10 bg-luxury-black max-h-[340px]">
                      <img
                        src={selectedProduct.image}
                        alt={isRTL ? selectedProduct.nameAr : selectedProduct.nameEn}
                        className="w-full h-full object-cover object-center aspect-square"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {/* Escrow note */}
                    <div className="bg-luxury-black/40 border border-gold/5 rounded p-3 text-[11px] text-luxury-cream/60 flex items-center gap-2">
                      <Shield className="h-4.5 w-4.5 text-gold flex-shrink-0" />
                      <p>
                        {isRTL 
                          ? 'صك ملكية قانوني مؤمن بالخط اليدوي وصندوق حماية دبلوماسي مجاني في دبي.'
                          : 'Includes certified unique security deed & solid vault lacquer presentation boxes.'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Premium Purchase Details */}
                  <div className="flex flex-col justify-between py-1 text-start">
                    <div>
                      <div className="inline-flex items-center space-x-1.5 space-x-reverse text-gold mb-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="font-serif text-[10px] tracking-widest uppercase font-bold">
                          {isRTL ? selectedProduct.categoryAr : selectedProduct.categoryEn}
                        </span>
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-white leading-tight mb-2">
                        {isRTL ? selectedProduct.nameAr : selectedProduct.nameEn}
                      </h3>

                      <p className="text-xs text-luxury-cream/80 leading-relaxed font-light mb-4">
                        {isRTL ? selectedProduct.descriptionAr : selectedProduct.descriptionEn}
                      </p>

                      {/* VAT computation spec card */}
                      <div className="bg-luxury-black/80 rounded border border-gold/10 p-4 space-y-2 mb-6">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-luxury-cream/50 uppercase tracking-widest font-serif">{isRTL ? 'قيمة القطعة الأساسية' : 'Investment Value'}</span>
                          <span className="font-mono text-sm text-luxury-cream font-bold">{selectedProduct.priceAED.toLocaleString()} AED</span>
                        </div>
                        
                        {/* Dynamic UAE VAT */}
                        <div className="flex justify-between items-center text-[11px] text-luxury-cream/40">
                          <span>{isRTL ? `ضريبة القيمة المضافة للإمارات (${vatPercentage}٪)` : `UAE VAT ${vatPercentage}% Included`}</span>
                          <span className="font-mono">{(selectedProduct.priceAED * (vatPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
                        </div>

                        <div className="border-t border-gold/10 pt-2 flex justify-between items-center text-xs">
                          <span className="text-gold font-serif uppercase tracking-widest">{isRTL ? 'مجموع المبلغ الشامل' : 'Total Investment'}</span>
                          <span className="font-mono font-bold text-white text-base">
                            {(selectedProduct.priceAED * (1 + vatPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Elite Booking Inquiry Area */}
                    <div>
                      {inquirySubmitted ? (
                        <div className="bg-gold/10 border border-gold/30 rounded p-4 text-center space-y-2 animate-fade-in text-xs text-gold">
                          <p className="font-serif font-bold tracking-widest uppercase">
                            {isRTL ? 'تهانينا! تم تسجيل الطلب الملكي' : 'CONCIERGE CONTACTED'}
                          </p>
                          <p className="text-[11px] text-luxury-cream/80">
                            {isRTL
                              ? 'سيتواصل معك خبير الفخامة بمكالمة مشفرة آمنة خلال ساعة لإتمام التفاصيل.'
                              : 'Our Luxury Concierge will contact you within the hour via secure encrypted link.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              id="client-phone-input"
                              type="tel"
                              disabled={selectedProduct.stockStatus === 'Out of Stock'}
                              value={clientPhone}
                              onChange={(e) => {
                                setClientPhone(e.target.value);
                                setValidationError(false);
                              }}
                              placeholder={selectedProduct.stockStatus === 'Out of Stock' ? (isRTL ? 'المنتج غير متوفر حالياً' : 'Product Out of Stock') : (isRTL ? 'رقم الهاتف (7510447887)' : 'Direct Mobile Number (7510447887)')}
                              className={`bg-luxury-black border text-xs text-luxury-cream rounded-md p-3 flex-grow focus:outline-none focus:border-gold font-mono ${
                                selectedProduct.stockStatus === 'Out of Stock' ? 'opacity-50 cursor-not-allowed border-neutral-800' : validationError ? 'border-red-500 bg-red-950/10' : 'border-gold/20'
                              }`}
                            />
                            
                            <button
                              id="submit-inquiry-btn"
                              disabled={selectedProduct.stockStatus === 'Out of Stock'}
                              onClick={() => {
                                if (!clientPhone.trim()) {
                                  setValidationError(true);
                                  return;
                                }
                                if (selectedProduct) {
                                  if (onPlaceOrder) {
                                    onPlaceOrder(selectedProduct, clientPhone);
                                  }
                                  setInquirySubmitted(true);
                                  setValidationError(false);

                                  // WhatsApp Fast Alert
                                  const formattedMsg = `✨ *LUXORA Dubai - New Order Alert* ✨\n\nProduct: ${selectedProduct.nameEn}\nValue: ${selectedProduct.priceAED.toLocaleString()} AED\nCustomer Contact: ${clientPhone.trim()}`;
                                  const whatsappUrl = `https://wa.me/917510447887?text=${encodeURIComponent(formattedMsg)}`;
                                  window.open(whatsappUrl, '_blank');
                                }
                              }}
                              className={`font-serif text-xs font-bold tracking-widest uppercase px-5 py-3 rounded-md shadow-lg transition-all flex-shrink-0 cursor-pointer ${
                                selectedProduct.stockStatus === 'Out of Stock'
                                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                                  : 'bg-gradient-to-r from-gold to-gold-dark text-luxury-black hover:shadow-gold/20 active:scale-95'
                              }`}
                            >
                              {selectedProduct.stockStatus === 'Out of Stock' ? (isRTL ? 'نفذت' : 'Sold Out') : (isRTL ? 'طلب الآن' : 'Acquire')}
                            </button>
                          </div>
                          {validationError && (
                            <p className="text-[10px] text-red-400 font-sans mt-0.5">
                              {isRTL ? 'يرجى إدخال رقم الهاتف للتنسيق الآمن.' : 'Mobile phone number required.'}
                            </p>
                          )}

                          <div className="pt-2">
                            <button
                              id="add-to-bag-modal-btn"
                              disabled={selectedProduct.stockStatus === 'Out of Stock'}
                              onClick={() => {
                                if (onAddToCart) {
                                  onAddToCart(selectedProduct);
                                  setAddedToBag(true);
                                  setTimeout(() => setAddedToBag(false), 2000);
                                }
                              }}
                              className={`w-full py-3 rounded-md text-xs font-serif font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                selectedProduct.stockStatus === 'Out of Stock'
                                  ? 'bg-neutral-800/50 text-neutral-500 border border-neutral-800 cursor-not-allowed'
                                  : addedToBag 
                                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' 
                                  : 'bg-gold text-luxury-black hover:bg-white hover:text-luxury-black'
                              }`}
                            >
                              <ShoppingBag className="h-4 w-4" />
                              <span>
                                {selectedProduct.stockStatus === 'Out of Stock'
                                  ? (isRTL ? 'نفذت الكمية ⚜' : 'Out of Stock ⚜')
                                  : addedToBag 
                                  ? (isRTL ? 'تمت الإضافة بنجاح! ⚜' : 'Added to Bag! ⚜')
                                  : (isRTL ? 'إضافة إلى حقيبة الاقتناء' : 'Add to Shopping Bag')
                                }
                              </span>
                            </button>
                          </div>
                          
                          <p className="text-[9px] text-luxury-cream/40 italic">
                            {isRTL 
                              ? '* نضمن الخصوصية والمحافظة على السرية التامة بنسبة ١٠٠٪.' 
                              : '* Complete discretion in alignment with Emirati family office codes.'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
