import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Lock, ShoppingBag } from 'lucide-react';
import { Product, Language, Order, CartItem } from '../types';
import { auth } from '../lib/firebase';

// The target WhatsApp phone number in international format for order dispatch (e.g. 971XXXXXXXXX)
export const WHATSAPP_PHONE_NUMBER = '971553957591';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  product?: Product | null;
  cartItems?: CartItem[] | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  onOpenLogin: () => void;
  vatPercentage: number;
  onPlaceOrder: (order: Order) => Promise<void>;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  lang,
  product = null,
  cartItems = null,
  isLoggedIn,
  isAdmin,
  userEmail,
  onOpenLogin,
  vatPercentage,
  onPlaceOrder
}: CheckoutModalProps) {
  const isRTL = lang === 'ar';
  
  // State for form fields
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form errors state
  const [formErrors, setFormErrors] = useState<{ name?: boolean; phone?: boolean; address?: boolean }>({});

  // Reset states when open/close or product/cartItems change
  useEffect(() => {
    if (isOpen) {
      setCheckoutName('');
      setCheckoutPhone('');
      setCheckoutAddress('');
      setCheckoutNotes('');
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, isLoggedIn, product, cartItems]);

  if (!isOpen || (!product && (!cartItems || cartItems.length === 0))) return null;

  // Pricing calculations
  const subtotal = product 
    ? product.priceAED 
    : (cartItems ? cartItems.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) : 0);
  const discount = (isLoggedIn && !isAdmin) ? (subtotal * 0.10) : 0;
  const taxable = subtotal - discount;
  const vat = taxable * (vatPercentage / 100);
  const total = taxable + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors: { name?: boolean; phone?: boolean; address?: boolean } = {};
    if (!checkoutName.trim()) errors.name = true;
    if (!checkoutPhone.trim()) errors.phone = true;
    if (!checkoutAddress.trim()) errors.address = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    const items = product 
      ? [{ product, quantity: 1 }] 
      : (cartItems || []);

    const orderName = product 
      ? (isRTL ? product.nameAr : product.nameEn)
      : (cartItems 
          ? cartItems.map(item => `${isRTL ? item.product.nameAr : item.product.nameEn} (x${item.quantity})`).join(', ') 
          : '');

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: orderName,
      priceAED: total,
      customerPhone: checkoutPhone.trim(),
      orderTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' - ' + new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      clientName: checkoutName.trim(),
      deliveryCoordinates: checkoutAddress.trim(),
      bespokeNotes: checkoutNotes.trim(),
      vatAED: vat,
      checkoutMethod: 'QuickBuy',
      userEmail: isLoggedIn && userEmail ? userEmail : undefined,
      customerEmail: isLoggedIn && userEmail ? userEmail : undefined,
      items: items,
      subtotal: subtotal,
      discount: discount,
      status: 'Pending'
    };

    try {
      // Construct beautifully formatted order summary for WhatsApp
      const waItemsText = items.map(item => {
        const name = isRTL ? item.product.nameAr : item.product.nameEn;
        const price = item.product.priceAED.toLocaleString();
        return `• ${name} (x${item.quantity}) - ${price} AED`;
      }).join('\n');

      const waNotesText = checkoutNotes.trim() 
        ? (isRTL ? `📝 *طلبات صياغة خاصة:* ${checkoutNotes.trim()}` : `📝 *Bespoke Notes:* ${checkoutNotes.trim()}`) 
        : '';

      const waMessage = isRTL
        ? `*✨ طلب جديد مخصص - بوتيك الفخامة ✨*\n\n` +
          `👤 *العميل الموقر:* ${checkoutName.trim()}\n` +
          `📞 *رقم الهاتف:* ${checkoutPhone.trim()}\n` +
          `📍 *عنوان التسليم:* ${checkoutAddress.trim()}\n` +
          (waNotesText ? `${waNotesText}\n` : '') +
          `\n🛍️ *القطع المطلوبة:*\n${waItemsText}\n\n` +
          `💰 *المجموع الكلي للاقتناء:* ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`
        : `*✨ New Bespoke Order - Luxury Boutique ✨*\n\n` +
          `👤 *Client:* ${checkoutName.trim()}\n` +
          `📞 *Phone:* ${checkoutPhone.trim()}\n` +
          `📍 *Delivery Coordinates:* ${checkoutAddress.trim()}\n` +
          (waNotesText ? `${waNotesText}\n` : '') +
          `\n🛍️ *Items Ordered:*\n${waItemsText}\n\n` +
          `💰 *Grand Total:* ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED`;

      const waUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(waMessage)}`;

      // Fire-and-forget order creation in the background so database latency/errors never block the WhatsApp redirect
      onPlaceOrder(newOrder).catch(err => console.error('Background order save error:', err));
      
      // Open the WhatsApp API link in a new tab safely
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      onClose();
    } catch (err) {
      console.error('Failed to submit order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/85 backdrop-blur-md">
        {/* Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 pointer-events-auto cursor-pointer"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative z-10 w-full max-w-lg bg-luxury-dark/95 border border-gold/15 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden text-luxury-cream flex flex-col"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Top Frame Gold Line Accent */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />

          {/* Header */}
          <div className="p-5 border-b border-gold/10 flex justify-between items-center bg-luxury-black/40">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-gold animate-pulse" />
              <div>
                <h2 className="font-serif text-base font-bold text-white tracking-widest uppercase">
                  {isRTL ? 'تفاصيل حجز القطعة الفاخرة' : 'BESPOKE ORDER CHECKOUT'}
                </h2>
                <p className="text-[9px] uppercase tracking-wider text-gold font-mono leading-none mt-1">
                  {isRTL ? 'اقتناء مباشر وحصري' : 'DIRECT VIP PURCHASE'}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-luxury-cream/60 hover:text-gold p-1.5 rounded-full border border-gold/10 hover:border-gold/30 transition-all duration-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-5 space-y-4">
            {/* Prefilled Product Card(s) */}
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {product ? (
                <div className="rounded-lg border border-gold/10 bg-luxury-dark/40 p-3 flex gap-3.5 overflow-hidden">
                  <div className="w-16 h-16 rounded border border-gold/10 bg-luxury-black flex-shrink-0 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={isRTL ? product.nameAr : product.nameEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center min-w-0">
                    <h4 className="font-serif text-xs font-semibold text-white tracking-wide truncate">
                      {isRTL ? product.nameAr : product.nameEn}
                    </h4>
                    <p className="text-[9px] text-gold font-mono uppercase tracking-wider mt-1">
                      {isRTL ? product.categoryAr : product.categoryEn}
                    </p>
                    <div className="text-xs text-gold font-mono font-medium mt-1">
                      {product.priceAED.toLocaleString()} AED
                    </div>
                  </div>
                </div>
              ) : (
                cartItems && cartItems.map((item) => (
                  <div key={item.product.id} className="rounded-lg border border-gold/10 bg-luxury-dark/40 p-2.5 flex gap-3.5 overflow-hidden">
                    <div className="w-12 h-12 rounded border border-gold/10 bg-luxury-black flex-shrink-0 overflow-hidden">
                      <img 
                        src={item.product.image} 
                        alt={isRTL ? item.product.nameAr : item.product.nameEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-center min-w-0">
                      <h4 className="font-serif text-xs font-semibold text-white tracking-wide truncate">
                        {isRTL ? item.product.nameAr : item.product.nameEn}
                      </h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-gold font-mono">
                          {item.product.priceAED.toLocaleString()} AED x {item.quantity}
                        </span>
                        <span className="text-[10px] text-white/80 font-mono">
                          {(item.product.priceAED * item.quantity).toLocaleString()} AED
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* VIP Promo Info */}
            {isLoggedIn && !isAdmin ? (
              <div className="bg-gold/5 border border-gold/30 rounded p-2.5 text-[9px] text-gold tracking-wider flex items-center gap-2 font-serif uppercase">
                <Sparkles className="h-3 w-3 animate-pulse text-gold flex-shrink-0" />
                <span>{isRTL ? 'تم تفعيل خصم كبار الشخصيات بنجاح (١٠٪)' : 'VIP Privilege Activated: 10% Membership Discount'}</span>
              </div>
            ) : (
              <div className="bg-luxury-black/35 border border-gold/10 rounded p-2.5 text-[9px] text-luxury-cream/60 flex items-center justify-between gap-1 font-serif">
                <span>{isRTL ? 'سجل دخول كعضو كبار شخصيات للحصول على خصم ١٠٪' : 'Sign in as a VIP member to receive an instant 10% discount. '}</span>
                <button 
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="text-[9px] uppercase tracking-wider text-gold font-bold underline bg-transparent cursor-pointer"
                >
                  {isRTL ? 'دخول العضوية' : 'VIP SIGN IN'}
                </button>
              </div>
            )}

            {/* Customer Inputs */}
            <div className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                  {isRTL ? 'اسم العميل الموقّر *' : 'CLIENT FULL NAME *'}
                </label>
                <input 
                  type="text"
                  required
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  placeholder={isRTL ? 'مثال: سمو الشيخ أحمد بن راشد' : 'Example: His Highness, Ambassador Philip'}
                  className={`w-full bg-luxury-black/60 border rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans ${formErrors.name ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                />
                {formErrors.name && (
                  <p className="text-[9px] text-red-400 font-sans mt-0.5">
                    {isRTL ? 'يرجى إدخال الاسم الموقر للتنسيق الحصري.' : 'Client name is required.'}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                  {isRTL ? 'رقم الهاتف للاتصال الجاري والآمن *' : 'DIRECT MOBILE NUMBER *'}
                </label>
                <input 
                  type="tel"
                  required
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  placeholder="0501234567"
                  className={`w-full bg-luxury-black/60 border rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-mono ${formErrors.phone ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                />
                {formErrors.phone && (
                  <p className="text-[9px] text-red-400 font-sans mt-0.5">
                    {isRTL ? 'يرجى إدخال رقم هاتف للتنسيق والتواصل.' : 'Mobile phone number is required.'}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                  {isRTL ? 'عنوان التسليم الفاخر أو المجلس المخصص *' : 'ARMORED DELIVERY COORDINATES *'}
                </label>
                <textarea 
                  rows={2}
                  required
                  value={checkoutAddress}
                  onChange={(e) => setCheckoutAddress(e.target.value)}
                  placeholder={isRTL ? 'نخلة جميرا، فيلا رقم ٧، دبي' : 'Palm Jumeirah, Villa No. 7, Dubai'}
                  className={`w-full bg-luxury-black/60 border rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans resize-none ${formErrors.address ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                />
                {formErrors.address && (
                  <p className="text-[9px] text-red-400 font-sans mt-0.5">
                    {isRTL ? 'يرجى تحديد إحداثيات التسليم لتنسيق الرحلة.' : 'Delivery address coordinates are required.'}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/50">
                  {isRTL ? 'طلبات صياغة أو نقوش خاصة (اختياري)' : 'BESPOKE CUSTOM REQUESTS (OPTIONAL)'}
                </label>
                <textarea 
                  rows={1}
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder={isRTL ? 'مثال: نقش الأحرف الأولى بالذهب عيار ٢٤...' : 'Example: Premium gold-leaf monogramming...'}
                  className="w-full bg-luxury-black/60 border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans resize-none"
                />
              </div>
            </div>

            {/* Calculations Area */}
            <div className="pt-3 border-t border-gold/10 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-luxury-cream/70">
                <span>{isRTL ? 'قيمة القطعة الاستثمارية:' : 'Investment Subtotal:'}</span>
                <span>{subtotal.toLocaleString()} AED</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>{isRTL ? 'خصم النخبة (-١٠٪):' : 'VIP Discount (-10%):'}</span>
                  <span>-{discount.toLocaleString()} AED</span>
                </div>
              )}

              <div className="flex justify-between text-luxury-cream/50 text-[10px]">
                <span>{isRTL ? `ضريبة القيمة المضافة للإمارات (${vatPercentage}٪):` : `UAE VAT (${vatPercentage}%):`}</span>
                <span>{vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
              </div>

              <div className="flex justify-between text-white font-serif text-sm font-bold pt-2 border-t border-gold/10">
                <span className="text-gold tracking-wider">{isRTL ? 'المجموع الكلي للاقتناء:' : 'Grand Total:'}</span>
                <span className="text-gold font-mono">{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-white text-luxury-black font-serif text-xs font-black tracking-widest uppercase py-3.5 rounded shadow-lg transition-all active:scale-97 cursor-pointer text-center"
              >
                {isSubmitting ? (isRTL ? 'جاري توثيق حجزكم...' : 'Securing Vault Entry...') : (isRTL ? 'تأكيد وحجز طلب الاقتناء' : 'CONFIRM BESPOKE PURCHASE')}
              </button>

              <div className="flex items-center justify-center text-[9px] uppercase tracking-widest text-gold/60 font-mono">
                <span>{isRTL ? '🔒 رحلة تسليم مؤمنة مخصصة عائلية' : '🔒 GUARDED DIRECT COURIER DISPATCH'}</span>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
