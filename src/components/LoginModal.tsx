import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, User, ShieldCheck, Crown, ExternalLink, Calendar, CreditCard, LogOut, Award, Clock, Eye, Share2 } from 'lucide-react';
import { Language, Order } from '../types';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDFDocument } from './InvoicePDFDocument';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (email: string, isAdmin: boolean) => void;
  isLoggedIn?: boolean;
  userEmail?: string | null;
  isAdmin?: boolean;
  orders?: Order[];
  onReopenInvoice?: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
  onLogout?: () => void;
  vatPercentage?: number;
  initialTab?: 'profile' | 'orders';
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  lang, 
  onLoginSuccess,
  isLoggedIn = false,
  userEmail = null,
  isAdmin = false,
  orders = [],
  onReopenInvoice,
  onCancelOrder,
  onLogout,
  vatPercentage = 5,
  initialTab = 'profile'
}: LoginModalProps) {
  if (!isOpen) return null;

  const isRTL = lang === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [sharingOrderId, setSharingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  const handleCancelConfirm = () => {
    if (!orderToCancel) return;
    
    try {
      const saved = localStorage.getItem('luxora_orders');
      if (saved) {
        const parsed = JSON.parse(saved) as Order[];
        if (Array.isArray(parsed)) {
          const updated = parsed.map(o => {
            if (o.id === orderToCancel.id) {
              return { ...o, status: 'Cancelled' as const };
            }
            return o;
          });
          localStorage.setItem('luxora_orders', JSON.stringify(updated));
        }
      }

      if (onCancelOrder) {
        onCancelOrder(orderToCancel.id);
      }

      setLocalOrders(prev => prev.map(o => {
        if (o.id === orderToCancel.id) {
          return { ...o, status: 'Cancelled' as const };
        }
        return o;
      }));

      setSelectedOrder(prev => {
        if (prev && prev.id === orderToCancel.id) {
          return { ...prev, status: 'Cancelled' as const };
        }
        return prev;
      });

    } catch (err) {
      console.error('Error cancelling order:', err);
    } finally {
      setOrderToCancel(null);
    }
  };

  // Sync activeTab with initialTab when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Fetch & Filter dynamically from localStorage when orders tab is active or modal is open
  React.useEffect(() => {
    if (isOpen && isLoggedIn && userEmail) {
      try {
        const saved = localStorage.getItem('luxora_orders');
        let allOrders: Order[] = [];
        if (saved) {
          const parsed = JSON.parse(saved) as Order[];
          if (Array.isArray(parsed)) {
            allOrders = parsed;
          }
        } else if (orders && orders.length > 0) {
          allOrders = orders;
        }

        const emailToMatch = userEmail.toLowerCase().trim();
        const filtered = allOrders.filter(order => {
          if (isAdmin) return true; // Sovereign owner sees all
          const cEmail = order.customerEmail?.toLowerCase().trim();
          const uEmail = order.userEmail?.toLowerCase().trim();
          return cEmail === emailToMatch || uEmail === emailToMatch;
        });

        setLocalOrders(filtered);
        if (filtered.length > 0) {
          setSelectedOrder(prev => {
            if (prev) {
              const updated = filtered.find(o => o.id === prev.id);
              if (updated) return updated;
            }
            return filtered[0];
          });
        } else {
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error('Error fetching orders from localStorage:', err);
      }
    }
  }, [isOpen, isLoggedIn, userEmail, isAdmin, orders, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate an ultra-premium cryptographic delay
    setTimeout(() => {
      const normalizedEmail = email.toLowerCase().trim();
      
      if (normalizedEmail === 'owner@luxoradubai.ae' && password === 'DubaiLuxury2026') {
        onLoginSuccess(normalizedEmail, true);
        setIsLoading(false);
        onClose();
      } else if (normalizedEmail && password.length >= 4) {
        // Any other authentic looking user is a Customer VIP Guest
        onLoginSuccess(normalizedEmail, false);
        setIsLoading(false);
        onClose();
      } else {
        setError(isRTL 
          ? 'يرجى إدخال بريد إلكتروني صحيح وكلمة مرور من ٤ خانات على الأقل.' 
          : 'Please enter a valid email and a password with at least 4 characters.'
        );
        setIsLoading(false);
      }
    }, 850);
  };

  const handleQuickFill = (role: 'owner' | 'vip') => {
    if (role === 'owner') {
      setEmail('owner@luxoradubai.ae');
      setPassword('DubaiLuxury2026');
    } else {
      setEmail('guild.vip@luxoradubai.ae');
      setPassword('VIP2026');
    }
    setError('');
  };

  // Re-share PDF Generation and Web Share API flow
  const handleShareInvoiceForOrder = async (order: Order) => {
    setSharingOrderId(order.id);
    try {
      // 1. Generate PDF Blob Dynamically
      const doc = (
        <InvoicePDFDocument
          order={order}
          items={order.items || []}
          vatPercentage={vatPercentage}
        />
      );
      const blob = await pdf(doc).toBlob();

      // 2. Convert to File Object
      const file = new File([blob], `LUXORA_Sovereign_Invoice_${order.id}.pdf`, { type: 'application/pdf' });

      // 3. Implement Web Share API for Files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `LUXORA Sovereign Invoice ${order.id}`,
          text: isRTL 
            ? `فاتورة مقتنياتك الملكية رقم ${order.id} من لوكسورا دبي.` 
            : `Your curated masterpiece invoice ${order.id} from LUXORA Dubai.`
        });
      } else {
        // Fallback: If native file sharing is not supported by the browser, trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LUXORA_Sovereign_Invoice_${order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing invoice:', err);
    } finally {
      setSharingOrderId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Premium backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-500" 
      />

      {/* Main Luxury Modal Body */}
      <div 
        className={`relative w-full bg-luxury-dark/95 border border-gold/30 rounded-2xl shadow-[0_15px_50px_rgba(212,175,55,0.15)] overflow-hidden animate-slide-up transition-all duration-300 ${
          isLoggedIn && activeTab === 'orders' && localOrders.length > 0
            ? 'max-w-[95%] md:max-w-2xl lg:max-w-5xl' 
            : 'max-w-[95%] md:max-w-lg'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Subtle royal golden top streak */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

        {/* Close Button styling */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-cream/50 hover:text-gold transition-colors p-2 rounded-full hover:bg-gold/5 z-55 cursor-pointer"
          title={isRTL ? 'إغلاق' : 'Close'}
        >
          <X className="h-5 w-5" />
        </button>

        {isLoggedIn ? (
          /* =========================================================
             AUTHENTICATED VIP USER PROFILE VIEW
             ========================================================= */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Identity banner */}
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(229,193,88,0.2)]">
                {isAdmin ? (
                  <Crown className="h-6 w-6 text-gold animate-[pulse_3s_infinite]" />
                ) : (
                  <Sparkles className="h-6 w-6 text-gold animate-[pulse_3s_infinite]" />
                )}
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-widest text-white uppercase">
                {isAdmin 
                  ? (isRTL ? 'الخزينة والتحكم السيادي' : 'Sovereign Control Vault') 
                  : (isRTL ? 'محفظة مقتنيات النخبة' : 'VIP Patron Portfolio')
                }
              </h2>
              <p className="text-xs text-luxury-cream/70 font-mono tracking-wide">
                {userEmail}
              </p>
            </div>

            {/* Premium Gold/Glass Tabs selector */}
            <div className="flex border-b border-gold/15">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-serif font-bold transition-all border-b-2 text-center cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream'
                }`}
              >
                {isRTL ? 'ملفي الشخصي' : 'My Profile'}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-serif font-bold transition-all border-b-2 text-center cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream'
                }`}
              >
                <span>{isRTL ? 'سجل الطلبات' : 'Order History'}</span>
                {localOrders.length > 0 && (
                  <span className="bg-gold text-luxury-black text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold">
                    {localOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tabs content area */}
            <div className={`transition-all duration-300 pr-1 ${
              activeTab === 'orders' && localOrders.length > 0
                ? 'min-h-[320px] max-h-[600px] overflow-y-auto' 
                : 'min-h-[220px] max-h-[350px] overflow-y-auto'
            }`}>
              {activeTab === 'profile' ? (
                /* Tab 1: Account Status & Privileges */
                <div className="space-y-4 text-start">
                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-gold">
                      <Award className="h-4 w-4" />
                      <span className="text-xs uppercase font-serif tracking-widest font-bold">
                        {isAdmin ? (isRTL ? 'رتبة المالك الملكي' : 'Royal Administrator Status') : (isRTL ? 'رتبة كبار المقتنين VIP' : 'Emerald Sovereign VIP Class')}
                      </span>
                    </div>
                    <p className="text-xs text-luxury-cream/80 leading-relaxed font-sans">
                      {isAdmin 
                        ? (isRTL 
                          ? 'تتمتع بصلاحيات وصول مطلقة وغير مقيدة لكامل سجل المعرض ومؤشرات الاستثمار والطلبات الواردة.' 
                          : 'Equipped with absolute administrative authorization. Unrestricted access to full catalog stock and sovereign customer invoices.')
                        : (isRTL 
                          ? 'مرحباً بك في مجلس النخبة. حسابك المعتمد يمنحك امتيازات حصرية مبرمجة ومفعلة تلقائياً في صالة العرض.' 
                          : 'Welcome back to the elite guild. Your secured VIP guest credentials unlock automated high-jewelry discounts and priority assistance.')
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-serif tracking-widest text-gold/60">{isRTL ? 'الامتيازات النشطة' : 'Secured Member Benefits'}</h4>
                    <ul className="space-y-2 text-xs text-luxury-cream/80">
                      <li className="flex items-start gap-2 bg-luxury-cream/5 p-2 rounded border border-gold/5">
                        <span className="text-gold font-bold">✓</span>
                        <div>
                          <strong className="block text-white text-[11px]">{isRTL ? 'خصم النخبة المضمون ١٠٪' : 'Guaranteed 10% VIP Discount'}</strong>
                          <span className="text-[10px] text-luxury-cream/60">{isRTL ? 'يطبق تلقائياً على جميع المجوهرات والقطع النادرة.' : 'Instantly integrated during any premium checkout.'}</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 bg-luxury-cream/5 p-2 rounded border border-gold/5">
                        <span className="text-gold font-bold">✓</span>
                        <div>
                          <strong className="block text-white text-[11px]">{isRTL ? 'توصيل مصفح مؤمّن مجاني' : 'Complimentary Armored Courier'}</strong>
                          <span className="text-[10px] text-luxury-cream/60">{isRTL ? 'توصيل سري بحراسة مسلحة لكافة إمارات الدولة.' : 'Priority discrete diplomatic transport for high-value acquisitions.'}</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 bg-luxury-cream/5 p-2 rounded border border-gold/5">
                        <span className="text-gold font-bold">✓</span>
                        <div>
                          <strong className="block text-white text-[11px]">{isRTL ? 'دخول صالة دبي مول VVIP' : 'Dubai Mall VIP Private Suite Access'}</strong>
                          <span className="text-[10px] text-luxury-cream/60">{isRTL ? 'جلسات خاصة مع مستشاري الفخامة لطلب القطع النادرة.' : 'Exclusive entry to private showroom viewing suites.'}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Tab 2: User Order History with Desktop Side-by-side Invoice Preview */
                <div className="space-y-3.5 text-start">
                  {isAdmin && (
                    <div className="bg-[#e5c158]/10 border border-[#e5c158]/20 p-2.5 rounded-lg text-[10px] text-[#e5c158] font-mono tracking-wide text-center mb-2">
                      ⚡ {isRTL ? 'عرض لوحة التحكم الإدارية لكافة الفواتير النشطة' : 'ADMIN VIEW: Master Sovereign Invoice Register'}
                    </div>
                  )}

                  {localOrders.length === 0 ? (
                    <div className="text-center py-12 space-y-3 bg-[#0d0d0d] border border-[#262626] rounded-xl p-6">
                      <ShieldAlert className="h-8 w-8 text-[#e5c158]/40 mx-auto animate-pulse" />
                      <p className="text-xs text-[#e5c158] font-serif uppercase tracking-widest font-bold">
                        {isRTL ? 'خزنتك السيادية فارغة.' : 'Your sovereign vault is empty.'}
                      </p>
                      <p className="text-[10px] text-luxury-cream/40">
                        {isRTL ? 'القطع التي ستقتنيها مستقبلاً ستظهر هنا في سجلاتك المحمية.' : 'Your prestigious acquisitions will be securely registered here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left side: Orders list (mobile single column / desktop sidebar) */}
                      <div className="lg:col-span-5 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                        {localOrders.map((order) => (
                          <div 
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`bg-[#0d0d0d] border rounded-xl p-4 transition-all space-y-4 shadow-lg hover:shadow-[#e5c158]/5 group cursor-pointer text-start ${
                              selectedOrder?.id === order.id ? 'border-[#e5c158] shadow-[#e5c158]/10' : 'border-[#262626] hover:border-[#e5c158]/30'
                            }`}
                          >
                            {/* Card Top Block */}
                            <div className="flex justify-between items-start gap-2 border-b border-[#262626] pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-mono text-[#e5c158] font-bold tracking-widest">{order.id}</span>
                                  {order.status === 'Cancelled' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 text-[9px] font-mono font-bold uppercase tracking-wider">
                                      <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
                                      {isRTL ? 'ملغي ومسترد' : 'Cancelled & Revoked'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-[9px] font-mono font-bold uppercase tracking-wider">
                                      <span className="h-1 w-1 rounded-full bg-[#10b981] animate-ping" />
                                      {isRTL ? 'مؤمن' : 'Secured'}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-luxury-cream/50 font-mono">
                                  <Clock className="h-3.5 w-3.5 text-[#e5c158]/60" />
                                  <span>{order.orderTime}</span>
                                </div>
                              </div>
                              <span className="bg-[#e5c158]/10 border border-[#e5c158]/20 text-[9px] text-[#e5c158] uppercase px-2 py-0.5 rounded font-mono tracking-wider shrink-0">
                                {order.checkoutMethod || 'QuickBuy'}
                              </span>
                            </div>

                            {/* Curated Masterpiece Description */}
                            <div>
                              <span className="block text-[9px] uppercase tracking-widest text-luxury-cream/40 font-serif mb-1">
                                {isRTL ? 'التحف الفنية المقتناة' : 'Curated masterpieces'}
                              </span>
                              <p className="text-xs text-white font-medium line-clamp-2 leading-relaxed font-sans">
                                {order.productName}
                              </p>
                            </div>

                            {/* Grand Total Value */}
                            <div className="flex justify-between items-center pt-3 border-t border-[#262626] gap-2 flex-wrap">
                              <div>
                                <span className="block text-[8px] uppercase tracking-widest text-luxury-cream/45">{isRTL ? 'قيمة الاستثمار' : 'Grand Total'}</span>
                                <span className="text-xs font-serif font-bold text-[#e5c158]">
                                  {order.priceAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                                </span>
                              </div>

                              {/* Actions Group */}
                              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                                {onReopenInvoice && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent setting selection
                                      onReopenInvoice(order);
                                      onClose();
                                    }}
                                    className="bg-transparent hover:bg-[#e5c158]/10 border border-[#e5c158]/30 hover:border-[#e5c158] text-[#e5c158] text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                                    title={isRTL ? 'عرض الفاتورة الملكية' : 'View Invoice'}
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span className="hidden sm:inline">{isRTL ? 'عرض' : 'View'}</span>
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent setting selection
                                    handleShareInvoiceForOrder(order);
                                  }}
                                  disabled={sharingOrderId === order.id}
                                  className="bg-[#e5c158] hover:bg-[#e5c158]/90 disabled:opacity-50 text-luxury-black text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                                  title={isRTL ? 'إعادة مشاركة PDF' : 'Re-share PDF Invoice'}
                                >
                                  {sharingOrderId === order.id ? (
                                    <span className="h-3 w-3 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Share2 className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {sharingOrderId === order.id 
                                      ? (isRTL ? 'مشاركة...' : 'Sharing...') 
                                      : (isRTL ? 'إعادة مشاركة' : 'Re-share')
                                    }
                                  </span>
                                </button>

                                {order.status !== 'Cancelled' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent setting selection
                                      setOrderToCancel(order);
                                    }}
                                    className="bg-transparent hover:bg-red-950/30 border border-red-900 text-red-500 text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                                    title={isRTL ? 'إلغاء هذا الطلب السيادي' : 'Cancel This Sovereign Order'}
                                  >
                                    <span className="text-[10px] font-bold">✕</span>
                                    <span>{isRTL ? 'إلغاء' : 'Cancel'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Right side: Detailed Invoice Preview (Desktop only) */}
                      <div className="hidden lg:block lg:col-span-7 bg-[#0a0a0a]/90 border border-gold/15 rounded-xl p-6 max-h-[500px] overflow-y-auto space-y-5 shadow-[inset_0_0_20px_rgba(229,193,88,0.03)] text-start relative">
                        {selectedOrder ? (
                          <div className="space-y-4">
                            {/* Elegant Header */}
                            <div className="flex justify-between items-center border-b border-gold/20 pb-3">
                              <div>
                                <h4 className="font-serif text-sm font-bold tracking-widest text-gold uppercase">
                                  LUXORA DUBAI
                                </h4>
                                <span className="text-[9px] uppercase tracking-wider text-luxury-cream/50 font-mono">
                                  {isRTL ? 'معاينة المستند المالي' : 'Sovereign Deed Preview'}
                                </span>
                              </div>
                              {selectedOrder.status === 'Cancelled' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 text-[9px] font-mono font-bold uppercase tracking-wider">
                                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                  {isRTL ? 'ملغي ومسترد' : 'Cancelled & Revoked'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-[9px] font-mono font-bold uppercase tracking-wider">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-ping" />
                                  {isRTL ? 'معتمد ومؤمن' : 'Secured & Sealed'}
                                </span>
                              )}
                            </div>

                            {/* Metadata Fields */}
                            <div className="grid grid-cols-2 gap-4 text-[11px] bg-[#0d0d0d] p-3 rounded-lg border border-[#262626]">
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'رقم المعاملة' : 'Deed Reference'}
                                </span>
                                <span className="font-mono text-white font-bold tracking-wider">{selectedOrder.id}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'تاريخ الاستحواذ' : 'Acquisition Date'}
                                </span>
                                <span className="font-mono text-luxury-cream/80">{selectedOrder.orderTime}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'قناة التسوية' : 'Settlement Channel'}
                                </span>
                                <span className="text-gold font-serif uppercase tracking-widest text-[9px]">{selectedOrder.checkoutMethod || 'QuickBuy'}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'إحداثيات الشحن' : 'Coordinates'}
                                </span>
                                <span className="text-white truncate block max-w-[180px]" title={selectedOrder.deliveryCoordinates}>
                                  {selectedOrder.deliveryCoordinates || (isRTL ? 'الشحن الجوي السري' : 'Discrete Air Transit')}
                                </span>
                              </div>
                            </div>

                            {/* Client details if present */}
                            {(selectedOrder.clientName || selectedOrder.customerPhone || selectedOrder.bespokeNotes) && (
                              <div className="text-[11px] bg-[#0c0c0c] border border-[#262626] p-3 rounded-lg space-y-1.5">
                                <span className="block text-[8px] uppercase tracking-widest text-gold/60 font-serif mb-1">
                                  {isRTL ? 'بيانات العميل الكريم والتسليم' : 'VIP Patron & Delivery'}
                                </span>
                                {selectedOrder.clientName && (
                                  <div className="flex justify-between">
                                    <span className="text-luxury-cream/40">{isRTL ? 'العميل الكريم:' : 'VIP Client:'}</span>
                                    <span className="text-white font-medium">{selectedOrder.clientName}</span>
                                  </div>
                                )}
                                {selectedOrder.customerPhone && (
                                  <div className="flex justify-between">
                                    <span className="text-luxury-cream/40">{isRTL ? 'رقم الاتصال:' : 'Contact Phone:'}</span>
                                    <span className="text-white font-mono">{selectedOrder.customerPhone}</span>
                                  </div>
                                )}
                                {selectedOrder.bespokeNotes && (
                                  <div className="flex justify-between border-t border-[#262626] pt-1.5 mt-1.5">
                                    <span className="text-luxury-cream/40">{isRTL ? 'مرافقة خاصة:' : 'Bespoke Escort:'}</span>
                                    <span className="text-gold italic font-serif">{selectedOrder.bespokeNotes}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Ledger Table */}
                            <div className="space-y-2">
                              <span className="block text-[9px] uppercase tracking-widest text-gold/60 font-serif">
                                {isRTL ? 'تحف الفواتير وجدول المقتنيات' : 'Curated Masterpiece Ledger'}
                              </span>
                              <div className="border border-[#262626] rounded-lg overflow-hidden bg-[#0d0d0d]">
                                <table className="w-full text-left border-collapse text-[11px]">
                                  <thead>
                                    <tr className="border-b border-[#262626] bg-[#0c0c0c] text-gold uppercase font-serif tracking-widest text-[9px]">
                                      <th className="py-2.5 px-3 text-start">{isRTL ? 'البيان والتحفة' : 'Masterpiece'}</th>
                                      <th className="py-2.5 px-2 text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                                      <th className="py-2.5 px-3 text-right">{isRTL ? 'القيمة' : 'Value'}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#262626] text-luxury-cream/90">
                                    {(selectedOrder.items || [{
                                      product: {
                                        nameEn: selectedOrder.productName,
                                        nameAr: selectedOrder.productName,
                                        priceAED: selectedOrder.subtotal || selectedOrder.priceAED,
                                        category: 'Bespoke Creation'
                                      },
                                      quantity: 1
                                    }]).map((item: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-gold/5 transition-colors">
                                        <td className="py-2.5 px-3">
                                          <span className="font-semibold text-white block">
                                            {isRTL ? (item.product.nameAr || item.product.nameEn) : item.product.nameEn}
                                          </span>
                                          <span className="text-[9px] text-luxury-cream/40 uppercase font-mono tracking-wider">
                                            {item.product.category}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-center font-mono text-white font-bold">
                                          {item.quantity}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[#e5c158] font-semibold">
                                          {(item.product.priceAED * item.quantity).toLocaleString()} AED
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Financial breakdown */}
                            <div className="bg-[#0c0c0c] border border-[#262626] p-4 rounded-lg space-y-2 text-[11px]">
                              <div className="flex justify-between text-luxury-cream/60">
                                <span className="uppercase tracking-wider">{isRTL ? 'المجموع قبل الضريبة' : 'Acquisition Price'}</span>
                                <span className="font-mono text-white">{(selectedOrder.subtotal || selectedOrder.priceAED).toLocaleString()} AED</span>
                              </div>
                              {selectedOrder.discount && selectedOrder.discount > 0 ? (
                                <div className="flex justify-between text-gold">
                                  <span className="uppercase tracking-wider">{isRTL ? 'خصم عضوية النخبة' : 'VIP Elite Rebate'}</span>
                                  <span className="font-mono font-bold">-{selectedOrder.discount.toLocaleString()} AED</span>
                                </div>
                              ) : null}
                              
                              <div className="flex justify-between text-luxury-cream/40 border-t border-[#262626] pt-2">
                                <span className="uppercase tracking-wider">{isRTL ? `ضريبة القيمة المضافة (${vatPercentage}%)` : `UAE VAT Regulatory (${vatPercentage}%)`}</span>
                                <span className="font-mono text-white">
                                  {(((selectedOrder.subtotal || selectedOrder.priceAED) - (selectedOrder.discount || 0)) * (vatPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                                </span>
                              </div>

                              <div className="flex justify-between text-[#e5c158] font-serif font-bold border-t border-gold/20 pt-2.5 text-xs">
                                <span className="uppercase tracking-widest">{isRTL ? 'قيمة الاستثمار الإجمالية' : 'Sovereign Total'}</span>
                                <span className="font-mono text-[#e5c158]">{selectedOrder.priceAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
                              </div>
                            </div>

                            {/* Extra interactive visual action trigger inside preview */}
                            <div className="flex justify-end gap-2.5 pt-2">
                              {selectedOrder.status !== 'Cancelled' && (
                                <button
                                  onClick={() => setOrderToCancel(selectedOrder)}
                                  className="bg-transparent hover:bg-red-950/30 border border-red-900 text-red-500 text-[10px] font-serif uppercase tracking-widest font-bold px-4 py-2.5 rounded-lg transition-all active:scale-[0.97] flex items-center gap-1.5 cursor-pointer"
                                  title={isRTL ? 'إلغاء هذا المعاملة السيادية' : 'Cancel This Sovereign Transaction'}
                                >
                                  <span>✕</span>
                                  <span>{isRTL ? 'إلغاء الطلب' : 'Cancel Order'}</span>
                                </button>
                              )}
                              {onReopenInvoice && (
                                <button
                                  onClick={() => {
                                    onReopenInvoice(selectedOrder);
                                    onClose();
                                  }}
                                  className="bg-transparent hover:bg-[#e5c158]/10 border border-[#e5c158]/30 hover:border-[#e5c158] text-[#e5c158] text-[10px] font-serif uppercase tracking-widest font-bold px-4 py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                  title={isRTL ? 'عرض الفاتورة الملكية الكاملة' : 'View Full Document'}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>{isRTL ? 'عرض الفاتورة الكاملة' : 'View Full Document'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                            <ShieldAlert className="h-8 w-8 text-[#e5c158]/30 animate-pulse" />
                            <p className="text-xs text-luxury-cream/40 font-serif uppercase tracking-widest">
                              {isRTL ? 'يرجى اختيار معاملة لعرض الفاتورة' : 'Select a transaction to view its invoice'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sign Out Trigger at bottom */}
            {onLogout && (
              <div className="border-t border-gold/10 pt-4 flex justify-between items-center">
                <span className="text-[9px] text-luxury-cream/40 uppercase tracking-widest font-mono">
                  {isRTL ? 'الدرع الأمني النشط' : 'SECURITY SHIELD ACTIVE'}
                </span>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="bg-red-950/20 hover:bg-red-950/60 border border-red-500/25 text-red-400 hover:text-white px-3 py-1.5 rounded text-[10px] font-serif uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isRTL ? 'إنهاء الجلسة الآمنة' : 'Terminate Session'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================
             STANDARD GUEST SECURE SIGN IN FLOW
             ========================================================= */
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="h-5 w-5 text-gold animate-[pulse_3s_infinite]" />
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-widest text-white uppercase">
                {isRTL ? 'بوابة النخبة والأعضاء' : 'Elite Vault & Entry'}
              </h2>
              <p className="text-xs text-luxury-cream/60">
                {isRTL 
                  ? 'قم بتسجيل الدخول كمالك للوصول للمعرض، أو كعضو VIP لعروض خاصة.' 
                  : 'Sign in under Royal Owner credentials or as a premium VIP Guild Member.'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              {error && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-serif tracking-widest text-gold/80">
                  {isRTL ? 'البريد الإلكتروني المعتمد' : 'Authorized Credentials'}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gold/30`}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isRTL ? 'الملك أو العضو الموقر' : 'Sovereign or VIP Member Email'}
                    className="w-full bg-luxury-black/90 border border-gold/20 text-sm text-luxury-cream placeholder:text-luxury-cream/35 rounded-lg px-4 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 font-sans tracking-wide"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-serif tracking-widest text-gold/80">
                  {isRTL ? 'العبارة السرية الآمنة' : 'Secure Passcode'}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'left-3' : 'right-3'} flex items-center pointer-events-none text-gold/30`}>
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-luxury-black/90 border border-gold/20 text-sm text-luxury-cream placeholder:text-luxury-cream/35 rounded-lg px-4 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 font-sans tracking-wide"
                  />
                </div>
              </div>

              {/* Premium Gold Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full bg-gradient-to-r from-gold via-gold-light to-gold text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded-lg shadow-lg hover:shadow-gold/15 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="h-4 w-4 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>{isRTL ? 'اعتماد الدخول وبدء الجلسة' : 'Authorize Secure Session'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Luxury Quick Demo Testing Helper Panel */}
            <div className="border-t border-gold/10 pt-4 space-y-3">
              <span className="block text-[9px] uppercase font-mono tracking-widest text-luxury-cream/45 text-center">
                {isRTL ? 'روابط الوصول التجريبي السريع' : 'Quick Sovereign Sandbox Access'}
              </span>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <button
                  onClick={() => handleQuickFill('owner')}
                  className="bg-gold/5 hover:bg-gold/15 border border-gold/20 hover:border-gold/50 rounded-lg p-2.5 text-center transition-all cursor-pointer group space-y-1"
                >
                  <span className="block font-serif font-bold text-gold group-hover:text-white transition-colors">
                    {isRTL ? 'صاحب المتجر (المالك)' : 'Store Owner (Admin)'}
                  </span>
                  <span className="block text-luxury-cream/40 font-mono text-[9px]">owner@luxoradubai.ae</span>
                </button>

                <button
                  onClick={() => handleQuickFill('vip')}
                  className="bg-luxury-cream/5 hover:bg-luxury-cream/10 border border-luxury-cream/15 hover:border-gold/30 rounded-lg p-2.5 text-center transition-all cursor-pointer group space-y-1"
                >
                  <span className="block font-serif font-bold text-luxury-cream/80 group-hover:text-gold transition-colors">
                    {isRTL ? 'عضو كبار الشخصيات' : 'VIP Guild Guest'}
                  </span>
                  <span className="block text-luxury-cream/40 font-mono text-[9px]">guild.vip@luxoradubai.ae</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {orderToCancel && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setOrderToCancel(null)} />
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-red-900/40 rounded-xl shadow-[0_10px_40px_rgba(239,68,68,0.1)] overflow-hidden p-6 text-center space-y-5 animate-slide-up" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="h-12 w-12 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 text-xl font-bold">
              ✕
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold tracking-widest text-red-500 uppercase">
                {isRTL ? 'إلغاء الاستحواذ السيادي' : 'Revoke Sovereign Deed'}
              </h3>
              <p className="text-xs text-luxury-cream/70 leading-relaxed font-serif">
                {isRTL 
                  ? 'هل أنت متأكد من رغبتك في إلغاء هذا الاستحواذ السيادي؟ لا يمكن التراجع عن هذا الإجراء.' 
                  : 'Are you sure you want to revoke this sovereign acquisition? This action cannot be undone.'
                }
              </p>
            </div>

            {/* Selected Order Detail mini-card */}
            <div className="bg-[#121212] border border-[#262626] rounded-lg p-3 text-start text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-luxury-cream/40 font-mono">{isRTL ? 'رقم المعاملة:' : 'Reference ID:'}</span>
                <span className="text-[#e5c158] font-mono font-bold">{orderToCancel.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-cream/40">{isRTL ? 'التحفة:' : 'Masterpiece:'}</span>
                <span className="text-white truncate max-w-[200px] font-medium">{orderToCancel.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-cream/40">{isRTL ? 'قيمة الاستثمار:' : 'Investment Value:'}</span>
                <span className="text-white font-mono font-bold">{orderToCancel.priceAED.toLocaleString()} AED</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-luxury-cream/20 text-luxury-cream text-xs font-serif uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {isRTL ? 'تراجع' : 'Cancel'}
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white text-xs font-serif uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {isRTL ? 'إلغاء الاستحواذ' : 'Revoke Deed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
