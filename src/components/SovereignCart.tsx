import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Sparkles, Minus, Plus, Send, Lock } from 'lucide-react';
import { Product, Language, CartItem } from '../types';

interface SovereignCartProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cart: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateCartQuantity: (productId: string, quantity: number) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  onOpenLogin: () => void;
  vatPercentage: number;
  checkoutName: string;
  setCheckoutName: (val: string) => void;
  checkoutPhone: string;
  setCheckoutPhone: (val: string) => void;
  checkoutAddress: string;
  setCheckoutAddress: (val: string) => void;
  checkoutNotes: string;
  setCheckoutNotes: (val: string) => void;
  formErrors: { name?: boolean; phone?: boolean; address?: boolean };
  onWhatsAppCheckout: () => void;
}

export default function SovereignCart({
  isOpen,
  onClose,
  lang,
  cart,
  onRemoveFromCart,
  onUpdateCartQuantity,
  isLoggedIn,
  isAdmin,
  userEmail,
  onOpenLogin,
  vatPercentage,
  checkoutName,
  setCheckoutName,
  checkoutPhone,
  setCheckoutPhone,
  checkoutAddress,
  setCheckoutAddress,
  checkoutNotes,
  setCheckoutNotes,
  formErrors,
  onWhatsAppCheckout
}: SovereignCartProps) {
  const isRTL = lang === 'ar';
  const [showCheckoutForm, setShowCheckoutForm] = useState<boolean>(false);

  // Math totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0);
  const discount = (isLoggedIn && !isAdmin) ? (subtotal * 0.10) : 0;
  const taxable = subtotal - discount;
  const vat = taxable * (vatPercentage / 100);
  const total = taxable + vat;

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
                <ShoppingBag className="h-5 w-5 text-gold animate-pulse" />
                <div>
                  <h2 className="font-serif text-lg font-bold text-white tracking-widest uppercase">
                    {isRTL ? 'حقيبة الاقتناء الملوكية' : 'Your Shopping Cart'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-wider text-gold font-mono leading-none mt-1">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    {isRTL ? 'تحفة فنية مختارة' : 'item(s)'}
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

            {/* Main Content Area */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="h-12 w-12 rounded-full border border-gold/10 flex items-center justify-center text-gold bg-luxury-black/20">
                    <ShoppingBag className="h-5 w-5 opacity-40" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-bold text-white uppercase tracking-wider">
                      {isRTL ? 'حقيبة الاقتناء فارغة حالياً' : 'Cart Empty'}
                    </h3>
                    <p className="text-xs text-luxury-cream/40 max-w-xs mx-auto">
                      {isRTL
                        ? 'اكتشف إبداعات حصرية لربيع وصيف ٢٠٢٦ المعززة بسبائك الذهب عيار ٢٤ قيراط لضمها لثرواتكم.'
                        : 'Explore our collections to select and save high-quality jewelry and watches.'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-5 py-2 border border-gold/20 text-gold text-[10px] font-serif uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all duration-300"
                  >
                    {isRTL ? 'العودة للمجموعة' : 'Continue Shopping'}
                  </button>
                </div>
              ) : !showCheckoutForm ? (
                /* Item list view */
                <div className="space-y-4">
                  {cart.map((item) => {
                    const itemTotal = item.product.priceAED * item.quantity;
                    return (
                      <div 
                        key={item.product.id}
                        className="group relative rounded-lg border border-gold/10 bg-luxury-dark/30 p-3.5 flex gap-3.5 transition-all hover:border-gold/30 overflow-hidden"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded border border-gold/10 bg-luxury-black/80 flex-shrink-0 overflow-hidden relative">
                          <img 
                            src={item.product.image} 
                            alt={item.product.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        
                        {/* Info */}
                        <div className="flex-grow flex flex-col justify-between min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <div className="min-w-0">
                              <h4 className="font-serif text-xs font-semibold text-white tracking-wide truncate">
                                {isRTL ? item.product.nameAr : item.product.nameEn}
                              </h4>
                              <p className="text-[9px] text-gold font-mono uppercase tracking-wider leading-none mt-1">
                                {isRTL ? item.product.categoryAr : item.product.categoryEn}
                              </p>
                            </div>
                            <button
                              onClick={() => onRemoveFromCart(item.product.id)}
                              className="text-luxury-cream/40 hover:text-red-400 p-0.5"
                              title={isRTL ? 'إزالة' : 'Remove item'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-gold/5">
                            {/* Quantity */}
                            <div className="flex items-center border border-gold/25 rounded bg-luxury-black/40 overflow-hidden scale-90 origin-left">
                              <button 
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-2 py-0.5 text-gold hover:bg-gold/10 font-bold"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="px-3 text-xs font-mono text-white">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-2 py-0.5 text-gold hover:bg-gold/10 font-bold"
                              >
                                <Plus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                            
                            {/* Price */}
                            <span className="text-xs text-gold font-mono">
                              {itemTotal.toLocaleString()} AED
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Checkout Form View */
                <div className="space-y-4 animate-fade-in">
                  <button
                    onClick={() => setShowCheckoutForm(false)}
                    className="text-xs text-gold hover:text-white underline uppercase tracking-wider font-serif"
                  >
                    {isRTL ? '← العودة للمنتجات' : '← Back to Products'}
                  </button>

                  <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2 pb-2 border-b border-gold/10">
                    <Sparkles className="h-4 w-4 text-gold animate-pulse" />
                    <span>{isRTL ? 'بوابة الحجز والمرافقة الملكيّة' : 'Royal Booking Concierge'}</span>
                  </h3>

                  {isLoggedIn && !isAdmin ? (
                    <div className="bg-gold/5 border border-gold/30 rounded p-2.5 text-[9px] text-gold tracking-wider flex items-center gap-2 font-serif uppercase">
                      <Sparkles className="h-3 w-3 animate-pulse text-gold flex-shrink-0" />
                      <span>{isRTL ? 'خصم كبار الشخصيات نشط (١٠٪)' : 'VIP Member: 10% Discount Active'}</span>
                    </div>
                  ) : (
                    <div className="bg-luxury-black/35 border border-gold/10 rounded p-2.5 text-[9px] text-luxury-cream/60 flex items-center justify-between gap-1 font-serif">
                      <span>{isRTL ? 'سجل كعضو كبار الشخصيات لتطبيق خصم ١٠٪' : 'Sign in to get 10% off your order'}</span>
                      <button 
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenLogin();
                        }}
                        className="text-[9px] uppercase tracking-wider text-gold font-bold underline bg-transparent"
                      >
                        {isRTL ? 'تسجيل' : 'Sign In'}
                      </button>
                    </div>
                  )}

                  {/* Fields */}
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                        {isRTL ? 'اسم العميل الموقّر *' : 'Client Full Name *'}
                      </label>
                      <input 
                        type="text"
                        value={checkoutName}
                        onChange={(e) => setCheckoutName(e.target.value)}
                        placeholder={isRTL ? 'مثال: سمو الشيخ أحمد بن راشد' : 'Example: His Highness, Ambassador Philip'}
                        className={`w-full bg-luxury-black/60 border rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans ${formErrors.name ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                        {isRTL ? 'رقم الهاتف للاتصال الجارٍ *' : 'Direct Mobile Number *'}
                      </label>
                      <input 
                        type="tel"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        placeholder="7510447887"
                        className={`w-full bg-luxury-black/60 border rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans ${formErrors.phone ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                        {isRTL ? 'عنوان التوصيل (المنزل/المكتب) *' : 'Delivery Address *'}
                      </label>
                      <textarea 
                        rows={2}
                        value={checkoutAddress}
                        onChange={(e) => setCheckoutAddress(e.target.value)}
                        placeholder={isRTL ? 'العنوان في دبي' : 'Address in Dubai'}
                        className={`w-full bg-luxury-black/60 border rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans ${formErrors.address ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                        {isRTL ? 'طلبات الصياغة والمرافقة الخاصة' : 'Bespoke Custom Requests (Notes)'}
                      </label>
                      <textarea 
                        rows={2}
                        value={checkoutNotes}
                        onChange={(e) => setCheckoutNotes(e.target.value)}
                        placeholder={isRTL ? 'أوراق التغليف الفاخرة المذهبة' : 'Premium gilded custom engraving notes...'}
                        className="w-full bg-luxury-black/60 border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & CTA area */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gold/10 bg-luxury-black/60 space-y-4">
                {/* Pricing breakdown */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-luxury-cream/70">
                    <span>{isRTL ? 'قيمة المجموعة الأساسية:' : 'Subtotal:'}</span>
                    <span>{subtotal.toLocaleString()} AED</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{isRTL ? 'خصم كبار الشخصيات (-١٠٪):' : 'VIP Discount (-10%):'}</span>
                      <span>-{discount.toLocaleString()} AED</span>
                    </div>
                  )}

                  <div className="flex justify-between text-luxury-cream/50 text-[11px]">
                    <span>{isRTL ? `ضريبة القيمة المضافة للإمارات (${vatPercentage}٪):` : `UAE VAT (${vatPercentage}%):`}</span>
                    <span>{vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
                  </div>

                  <div className="flex justify-between text-white font-serif text-sm font-bold pt-2 border-t border-gold/10">
                    <span className="text-gold tracking-wider">{isRTL ? 'قيمة الاستثمار الإجمالي:' : 'Grand Total:'}</span>
                    <span className="text-gold font-mono">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
                  </div>
                </div>

                {/* Secure checkout info */}
                <div className="flex items-center gap-1.5 justify-center text-[10px] uppercase tracking-widest text-gold/60 font-mono">
                  <Lock className="h-3 w-3 text-gold" />
                  <span>{isRTL ? 'إثبات حيازة وحجز آمن' : 'Secure Vault Booking'}</span>
                </div>

                {/* CTAs */}
                {!showCheckoutForm ? (
                  <button
                    onClick={() => setShowCheckoutForm(true)}
                    className="w-full bg-gold hover:bg-white text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded shadow-lg transition-all active:scale-97 cursor-pointer text-center"
                  >
                    {isRTL ? 'متابعة تفاصيل الحجز' : 'Proceed to Checkout'}
                  </button>
                ) : (
                  <button
                    onClick={onWhatsAppCheckout}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/20"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isRTL ? 'تأكيد وحجز الوتساب المباشر' : 'Secure Checkout on WhatsApp'}</span>
                  </button>
                )}
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
