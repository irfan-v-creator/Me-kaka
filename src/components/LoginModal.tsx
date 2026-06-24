import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, User, ShieldCheck, Crown, ExternalLink, Calendar, CreditCard, LogOut, Award, Clock } from 'lucide-react';
import { Language, Order } from '../types';

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
  onLogout?: () => void;
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
  onLogout
}: LoginModalProps) {
  if (!isOpen) return null;

  const isRTL = lang === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

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

  // Filter orders by current logged-in email
  const userOrders = orders.filter(order => {
    if (isAdmin) return true; // Admins see all orders in full ledger
    return order.userEmail?.toLowerCase() === userEmail?.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Premium backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-500" 
      />

      {/* Main Luxury Modal Body */}
      <div 
        className="relative w-full max-w-lg bg-luxury-dark/95 border border-gold/30 rounded-2xl shadow-[0_15px_50px_rgba(212,175,55,0.15)] overflow-hidden animate-slide-up"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Subtle royal golden top streak */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

        {/* Close Button styling */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-cream/50 hover:text-gold transition-colors p-2 rounded-full hover:bg-gold/5 z-55"
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
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-serif font-bold transition-all border-b-2 text-center ${
                  activeTab === 'profile'
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream'
                }`}
              >
                {isRTL ? 'امتيازات الرتبة' : 'Privileges & Status'}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-serif font-bold transition-all border-b-2 text-center flex items-center justify-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream'
                }`}
              >
                <span>{isRTL ? 'سجل الفواتير' : 'Order History'}</span>
                {userOrders.length > 0 && (
                  <span className="bg-gold text-luxury-black text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold">
                    {userOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tabs content area */}
            <div className="min-h-[220px] max-h-[350px] overflow-y-auto pr-1">
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
                /* Tab 2: User Order History */
                <div className="space-y-3 text-start">
                  {isAdmin && (
                    <div className="bg-gold/10 border border-gold/20 p-2 rounded text-[10px] text-gold/90 font-mono tracking-wide text-center">
                      ⚡ {isRTL ? 'عرض لوحة التحكم الإدارية لكافة الفواتير النشطة' : 'ADMIN VIEW: Displaying master sovereign invoice register'}
                    </div>
                  )}

                  {userOrders.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <ShieldAlert className="h-8 w-8 text-gold/30 mx-auto" />
                      <p className="text-xs text-luxury-cream/50 font-serif uppercase tracking-wider">
                        {isRTL ? 'لا توجد فواتير سابقة في سجلاتك السيادية' : 'No previous invoices registered'}
                      </p>
                      <p className="text-[10px] text-luxury-cream/35">
                        {isRTL ? 'القطع المقتناة مستقبلاً ستظهر هنا تلقائياً.' : 'Acquisitions placed under this email will register here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {userOrders.map((order) => (
                        <div 
                          key={order.id}
                          className="bg-luxury-black/90 border border-gold/15 hover:border-gold/35 rounded-xl p-4 transition-all space-y-3 shadow-lg hover:shadow-gold/5"
                        >
                          {/* Card top */}
                          <div className="flex justify-between items-start border-b border-gold/10 pb-2">
                            <div>
                              <span className="text-[10px] font-mono text-gold font-bold tracking-widest">{order.id}</span>
                              <div className="flex items-center gap-1.5 text-[9px] text-luxury-cream/50 font-mono mt-0.5">
                                <Clock className="h-3 w-3" />
                                <span>{order.orderTime}</span>
                              </div>
                            </div>
                            <span className="bg-gold/10 border border-gold/30 text-[9px] text-gold uppercase px-1.5 py-0.5 rounded font-mono">
                              {order.checkoutMethod || 'QuickBuy'}
                            </span>
                          </div>

                          {/* Card Content */}
                          <div>
                            <span className="block text-[10px] uppercase tracking-widest text-luxury-cream/40 font-serif mb-1">
                              {isRTL ? 'التحف الفنية المقتناة' : 'Curated masterpieces'}
                            </span>
                            <p className="text-xs text-white font-medium line-clamp-2 leading-relaxed">
                              {order.productName}
                            </p>
                          </div>

                          {/* Card bottom */}
                          <div className="flex justify-between items-center pt-2 border-t border-gold/10">
                            <div>
                              <span className="block text-[8px] uppercase tracking-widest text-luxury-cream/45">{isRTL ? 'قيمة الاستثمار' : 'Grand Total'}</span>
                              <span className="text-xs font-serif font-bold text-gold">
                                {order.priceAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                              </span>
                            </div>

                            {onReopenInvoice && (
                              <button
                                onClick={() => {
                                  onReopenInvoice(order);
                                  onClose();
                                }}
                                className="bg-gold hover:bg-gold-light text-luxury-black text-[9px] font-serif uppercase tracking-widest font-bold px-3 py-2 rounded transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>{isRTL ? 'عرض الفاتورة الملكية' : 'Open Invoice'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
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
                className="mt-6 w-full bg-gradient-to-r from-gold via-gold-light to-gold text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded-lg shadow-lg hover:shadow-gold/15 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
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
    </div>
  );
}
