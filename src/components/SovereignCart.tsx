import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Minus, Plus, Lock } from 'lucide-react';
import { CartItem, Language } from '../types';

interface SovereignCartProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cart: CartItem[];
  onRemoveFromCart: (productId: string) => void;
  onUpdateCartQuantity: (productId: string, quantity: number) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  vatPercentage: number;
  onProceedToCheckout: (selectedItems: CartItem[]) => void;
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
  vatPercentage,
  onProceedToCheckout
}: SovereignCartProps) {
  const isRTL = lang === 'ar';

  // Keep track of which item IDs are selected (checked)
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  // Initialize and default all items as checked when cart contents change
  useEffect(() => {
    if (cart.length > 0) {
      setCheckedIds(prev => {
        const next = { ...prev };
        cart.forEach(item => {
          if (next[item.product.id] === undefined) {
            next[item.product.id] = true;
          }
        });
        return next;
      });
    }
  }, [cart]);

  // Selected items are those that are checked (not explicitly set to false)
  const selectedItems = cart.filter(item => checkedIds[item.product.id] !== false);

  // Pricing calculations based only on selected items
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0);
  const discount = (isLoggedIn && !isAdmin) ? (subtotal * 0.10) : 0;
  const taxable = subtotal - discount;
  const vat = taxable * (vatPercentage / 100);
  const total = taxable + vat;

  const handleProceed = () => {
    if (selectedItems.length === 0) return;
    onProceedToCheckout(selectedItems);
  };

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
                className="text-luxury-cream/60 hover:text-gold p-1.5 rounded-full border border-gold/10 hover:border-gold/30 transition-all duration-300 animate-none cursor-pointer"
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
                    className="px-5 py-2 border border-gold/20 text-gold text-[10px] font-serif uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all duration-300 cursor-pointer"
                  >
                    {isRTL ? 'العودة للمجموعة' : 'Continue Shopping'}
                  </button>
                </div>
              ) : (
                /* Item list view */
                <div className="space-y-4">
                  {cart.map((item) => {
                    const itemTotal = item.product.priceAED * item.quantity;
                    const isChecked = checkedIds[item.product.id] !== false;
                    return (
                      <div 
                        key={item.product.id}
                        className={`group relative rounded-lg border p-3.5 flex items-center gap-3.5 transition-all overflow-hidden ${
                          isChecked 
                            ? 'border-gold/25 bg-luxury-dark/40 shadow-inner' 
                            : 'border-neutral-800/40 bg-luxury-dark/10 opacity-60'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="flex-shrink-0 flex items-center justify-center z-10">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              setCheckedIds(prev => ({
                                ...prev,
                                [item.product.id]: e.target.checked
                              }));
                            }}
                            className="w-4 h-4 rounded border-gold/30 text-gold bg-luxury-black/60 focus:ring-gold focus:ring-offset-luxury-dark accent-[#e5c158] cursor-pointer"
                          />
                        </div>

                        {/* Image */}
                        <div className="w-14 h-14 rounded border border-gold/10 bg-luxury-black/80 flex-shrink-0 overflow-hidden relative">
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
                              className="text-luxury-cream/40 hover:text-red-400 p-0.5 cursor-pointer"
                              title={isRTL ? 'إزالة' : 'Remove item'}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-gold/5">
                            {/* Quantity */}
                            <div className="flex items-center border border-gold/25 rounded bg-luxury-black/40 overflow-hidden scale-90 origin-left">
                              <button 
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-2 py-0.5 text-gold hover:bg-gold/10 font-bold cursor-pointer"
                              >
                                <Minus className="h-2.5 w-2.5" />
                              </button>
                              <span className="px-3 text-xs font-mono text-white">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-2 py-0.5 text-gold hover:bg-gold/10 font-bold cursor-pointer"
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
                <button
                  disabled={selectedItems.length === 0}
                  onClick={handleProceed}
                  className={`w-full py-4 rounded-xl shadow-lg transition-all duration-300 active:scale-95 cursor-pointer text-center font-serif text-xs font-black tracking-widest uppercase ${
                    selectedItems.length === 0
                      ? 'bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed'
                      : 'bg-gold hover:bg-white text-luxury-black font-extrabold filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.3)] hover:drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)]'
                  }`}
                >
                  {isRTL ? 'إتمام الطلب عبر واتساب' : 'COMPLETE ORDER ON WHATSAPP'}
                </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
