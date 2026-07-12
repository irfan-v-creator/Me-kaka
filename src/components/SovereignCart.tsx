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
    const itemsToCheckout = selectedItems.length > 0 ? selectedItems : cart;
    if (itemsToCheckout.length === 0) return;
    onProceedToCheckout(itemsToCheckout);
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

          {/* Luxury Slide-over Panel - Now bounded as a compact floating panel */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -40 : 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: isRTL ? -40 : 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed top-[15vh] ${
              isRTL ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
            } z-50 w-[calc(100vw-32px)] sm:w-[380px] h-[65vh] max-h-[65vh] bg-luxury-dark/98 border border-gold/20 shadow-[0_25px_60px_rgba(0,0,0,0.95)] rounded-2xl backdrop-blur-md flex flex-col justify-between overflow-hidden text-luxury-cream`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Top Frame Gold Line Accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

            {/* Header section */}
            <div className="p-3.5 border-b border-gold/10 flex justify-between items-center bg-luxury-black/40">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5 text-gold animate-pulse" />
                <div>
                  <h2 className="font-serif text-xs font-bold text-white tracking-wider uppercase">
                    {isRTL ? 'حقيبة الاقتناء الملوكية' : 'Your Shopping Cart'}
                  </h2>
                  <p className="text-[8px] uppercase tracking-wider text-gold font-mono leading-none mt-0.5">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    {isRTL ? 'تحفة فنية مختارة' : 'item(s)'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="text-luxury-cream/60 hover:text-gold p-1 rounded-full border border-gold/10 hover:border-gold/30 transition-all duration-300 animate-none cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Main Content Area - Scrollable internal view */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2.5 py-6">
                  <div className="h-8 w-8 rounded-full border border-gold/10 flex items-center justify-center text-gold bg-luxury-black/20">
                    <ShoppingBag className="h-3.5 w-3.5 opacity-40" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="font-serif text-[11px] font-bold text-white uppercase tracking-wider">
                      {isRTL ? 'حقيبة الاقتناء فارغة حالياً' : 'Cart Empty'}
                    </h3>
                    <p className="text-[10px] text-luxury-cream/40 max-w-xs mx-auto leading-relaxed">
                      {isRTL
                        ? 'اكتشف إبداعات حصرية لربيع وصيف ٢٠٢٦ المعززة بسبائك الذهب عيار ٢٤ قيراط لضمها لثرواتكم.'
                        : 'Explore our collections to select and save high-quality jewelry and watches.'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-3 py-1 border border-gold/20 text-gold text-[8px] font-serif uppercase tracking-widest hover:bg-gold hover:text-luxury-black transition-all duration-300 cursor-pointer"
                  >
                    {isRTL ? 'العودة للمجموعة' : 'Continue Shopping'}
                  </button>
                </div>
              ) : (
                /* Item list view - now scrolls within the parent container */
                <div className="space-y-2">
                  {cart.map((item) => {
                    const itemTotal = item.product.priceAED * item.quantity;
                    const isChecked = checkedIds[item.product.id] !== false;
                    return (
                      <div 
                        key={item.product.id}
                        className={`group relative rounded-lg border p-2 flex items-center gap-2 transition-all overflow-hidden ${
                          isChecked 
                            ? 'border-gold/20 bg-luxury-dark/40 shadow-inner' 
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
                            className="w-3 h-3 rounded border-gold/30 text-gold bg-luxury-black/60 focus:ring-gold focus:ring-offset-luxury-dark accent-[#e5c158] cursor-pointer"
                          />
                        </div>

                        {/* Image */}
                        <div className="w-10 h-10 rounded border border-gold/10 bg-luxury-black/80 flex-shrink-0 overflow-hidden relative">
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
                              <h4 className="font-serif text-[10px] font-semibold text-white tracking-wide truncate leading-tight">
                                {isRTL ? item.product.nameAr : item.product.nameEn}
                              </h4>
                              <p className="text-[7.5px] text-gold font-mono uppercase tracking-wider leading-none mt-0.5">
                                {isRTL ? item.product.categoryAr : item.product.categoryEn}
                              </p>
                            </div>
                            <button
                              onClick={() => onRemoveFromCart(item.product.id)}
                              className="text-luxury-cream/40 hover:text-red-400 p-0.5 cursor-pointer transition-colors"
                              title={isRTL ? 'إزالة' : 'Remove item'}
                            >
                              <Trash2 className="h-2.5 w-2.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-center mt-1 pt-1 border-t border-gold/5">
                            {/* Quantity */}
                            <div className="flex items-center border border-gold/15 rounded bg-luxury-black/40 overflow-hidden scale-80 origin-left">
                              <button 
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-1 py-0.5 text-gold hover:bg-gold/10 font-bold cursor-pointer"
                              >
                                <Minus className="h-2 w-2" />
                              </button>
                              <span className="px-1.5 text-[9px] font-mono text-white">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-1 py-0.5 text-gold hover:bg-gold/10 font-bold cursor-pointer"
                              >
                                <Plus className="h-2 w-2" />
                              </button>
                            </div>
                            
                            {/* Price */}
                            <span className="text-[10px] text-gold font-mono font-medium">
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
              <div className="p-3 border-t border-gold/10 bg-luxury-black/60 space-y-2">
                {/* Pricing breakdown */}
                <div className="space-y-1 text-[10px] font-mono">
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

                  <div className="flex justify-between text-luxury-cream/50 text-[9px]">
                    <span>{isRTL ? `ضريبة القيمة المضافة للإمارات (${vatPercentage}٪):` : `UAE VAT (${vatPercentage}%):`}</span>
                    <span>{vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
                  </div>

                  <div className="flex justify-between text-white font-serif text-[11px] font-bold pt-1 border-t border-gold/10">
                    <span className="text-gold tracking-wider">{isRTL ? 'قيمة الاستثمار الإجمالي:' : 'Grand Total:'}</span>
                    <span className="text-gold font-mono">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
                  </div>
                </div>

                {/* Secure checkout info */}
                <div className="flex items-center gap-1 justify-center text-[7.5px] uppercase tracking-widest text-gold/60 font-mono">
                  <Lock className="h-2 w-2 text-gold" />
                  <span>{isRTL ? 'إثبات حيازة وحجز آمن' : 'Secure Vault Booking'}</span>
                </div>

                {/* CTAs */}
                <button
                  id="cart-checkout-btn-whatsapp"
                  onClick={handleProceed}
                  style={{ backgroundColor: '#D4AF37' }}
                  className="w-full py-2 px-3 rounded-lg shadow-lg transition-all duration-300 active:scale-95 cursor-pointer text-center font-serif text-[10px] font-black tracking-widest uppercase text-black hover:bg-white hover:text-black filter drop-shadow-[0_2px_6px_rgba(212,175,55,0.15)] hover:drop-shadow-[0_4px_12px_rgba(255,255,255,0.25)]"
                >
                  {isRTL ? 'إجراء الطلب عبر واتساب' : 'Place Order via WhatsApp'}
                </button>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
