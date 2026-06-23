import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, ShieldAlert, CheckCircle, Plus, Sparkles, TrendingUp, DollarSign, Coins, Eye, Image, Trash2 } from 'lucide-react';
import { Product, Language, Order } from '../types';

interface AdminPortalProps {
  lang: Language;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  products: Product[];
  orders?: Order[];
  onDeleteProduct: (id: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  onLogin: (email: string, pass: string) => boolean;
}

export default function AdminPortal({ 
  lang, 
  onAddProduct, 
  products, 
  orders = [],
  onDeleteProduct,
  isAuthenticated,
  onLogout,
  onLogin
}: AdminPortalProps) {
  const isRTL = lang === 'ar';

  // Login inputs if not already authenticated
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Form states for adding products
  const [nameEn, setNameEn] = useState<string>('');
  const [nameAr, setNameAr] = useState<string>('');
  const [priceAED, setPriceAED] = useState<number>(0);
  const [categoryEn, setCategoryEn] = useState<string>('Watches');
  const [categoryAr, setCategoryAr] = useState<string>('ساعات');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [image, setImage] = useState<string>('');
  const [stockStatus, setStockStatus] = useState<'In Stock' | 'Low Stock' | 'Out of Stock'>('In Stock');
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  // Hardcoded premium stats with real-time increments from the live state orders array
  const liveOrdersCount = orders ? orders.length : 0;
  const liveOrdersRevenue = orders ? orders.reduce((sum, o) => sum + o.priceAED, 0) : 0;

  const stats = {
    monthlyRevenue: 3450000 + liveOrdersRevenue,
    activeOrders: 28 + liveOrdersCount,
    vatCollected: 172500 + Math.round(liveOrdersRevenue * 0.05)
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = onLogin(email, password);
    if (isSuccess) {
      setLoginError('');
    } else {
      setLoginError(isRTL ? 'بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.' : 'Invalid sovereign credentials. Access restricted.');
    }
  };

  const mapCategoryArabic = (enCat: string): string => {
    switch (enCat) {
      case 'Watches': return 'ساعات';
      case 'Jewelry': return 'مجوهرات';
      case 'Fragrance': return 'عطور';
      case 'Accessories': return 'إكسسوارات';
      default: return 'ساعات';
    }
  };

  const mapStockArabic = (enStock: 'In Stock' | 'Low Stock' | 'Out of Stock'): 'متوفر' | 'كمية محدودة' | 'نفذت الكمية' => {
    switch (enStock) {
      case 'In Stock': return 'متوفر';
      case 'Low Stock': return 'كمية محدودة';
      case 'Out of Stock': return 'نفذت الكمية';
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn || !priceAED || !image) {
      alert(isRTL ? 'يرجى ملء جميع الحقول المطلوبة بالذهب والأسعار الموقرة.' : 'Please provide at least a Product Name, Price, and Image Reference.');
      return;
    }

    const resolvedCategoryAr = mapCategoryArabic(categoryEn);
    const resolvedStockAr = mapStockArabic(stockStatus);

    onAddProduct({
      nameEn,
      nameAr: nameAr || nameEn,
      priceAED: Number(priceAED),
      image,
      categoryEn,
      categoryAr: resolvedCategoryAr,
      descriptionEn,
      descriptionAr: descriptionAr || descriptionEn,
      stockStatus,
      stockStatusAr: resolvedStockAr,
      isPremium: priceAED >= 50000
    });

    // Reset Form
    setNameEn('');
    setNameAr('');
    setPriceAED(0);
    setDescriptionEn('');
    setDescriptionAr('');
    setImage('');
    setStockStatus('In Stock');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  // Preset Luxury Image Templates for Easy Use
  const luxuryPlaceholders = [
    { name: 'Swiss Chronograf', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' },
    { name: 'Diamond Set', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600' },
    { name: 'Oud Crystal Vial', url: 'https://images.unsplash.com/photo-1528740564264-7a96894d4187?auto=format&fit=crop&q=80&w=600' },
    { name: 'Gold Leather Handbag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' }
  ];

  if (!isAuthenticated) {
    return (
      <section 
        id="admin-login-view"
        className="min-h-[85vh] flex items-center justify-center py-20 px-4 bg-luxury-black text-luxury-cream"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-md w-full bg-luxury-dark/95 border border-gold/20 p-8 rounded-xl shadow-2xl space-y-6 relative">
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
          
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-2">
              <Lock className="h-5 w-5 text-gold animate-[pulse_2s_infinite]" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-widest text-white uppercase">
              {isRTL ? 'بوابة المالك الخاصة' : 'Owner Sovereign Vault'}
            </h2>
            <p className="text-xs text-luxury-cream/60">
              {isRTL 
                ? 'يرجى إدخال رمز الأمان الخاص بك لتعديل تشكيلة لوكسورا دبي.' 
                : 'Cryptographic credentials required to execute catalog modifications.'
              }
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-start">
            {loginError && (
              <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-xs p-3 rounded flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-serif tracking-widest text-luxury-cream">{isRTL ? 'البريد الإلكتروني للمشرف' : 'Administrative Email'}</label>
              <div className="relative">
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@luxoradubai.ae"
                  className="w-full bg-luxury-black/80 border border-gold/20 text-sm text-luxury-cream rounded px-4 py-3 focus:outline-none focus:border-gold font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs uppercase font-serif tracking-widest text-luxury-cream">{isRTL ? 'كلمة المرور' : 'Security Secret Phrase'}</label>
              <div className="relative">
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-luxury-black/80 border border-gold/20 text-sm text-luxury-cream rounded px-4 py-3 focus:outline-none focus:border-gold font-mono"
                />
              </div>
            </div>

            {/* Helper Credential Notice */}
            <div className="rounded bg-gold/5 p-3 text-[10px] text-gold/80 leading-relaxed font-sans border border-gold/10">
              <span className="font-bold underline">{isRTL ? 'ملاحظة الفحص' : 'Verification Credentials'}:</span><br />
              Email: <span className="font-mono">owner@luxoradubai.ae</span><br />
              Password: <span className="font-mono">DubaiLuxury2026</span>
            </div>

            <button
              id="admin-submit"
              type="submit"
              className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded shadow-lg hover:shadow-gold/10 active:scale-[0.98] transition-all"
            >
              {isRTL ? 'فك تشفير وبوابة الدخول' : 'Decrypt & Enter Vault'}
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="dashboard-container"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 bg-luxury-black text-luxury-cream animate-fade-in"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold/20 pb-6 gap-4">
        <div className="text-start">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400">
              {isRTL ? 'قناة اتصال مشفرة نشطة' : 'Encrypted Client Terminal Active'}
            </span>
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-white tracking-widest uppercase">
            {isRTL ? 'لوحة تحكم الإدارة الملكية' : 'Sovereign Control Suite'}
          </h2>
          <p className="text-xs text-luxury-cream/60">
            {isRTL ? 'مرحبًا بك، المالك الموقر لمجموعة لوكسورا.' : 'Welcome back, Private Administrator.'}
          </p>
        </div>

        <button
          id="logout-btn"
          onClick={onLogout}
          className="rounded border border-gold/30 hover:border-gold px-4 py-1.5 text-xs font-serif tracking-widest lowercase text-luxury-cream/80 hover:text-gold transition-colors cursor-pointer"
        >
          {isRTL ? 'قفل الخزنة (تسجيل الخروج)' : 'Lock Vault (Logout)'}
        </button>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Revenue */}
        <div className="bg-luxury-dark/90 border border-gold/15 p-6 rounded-xl flex items-center justify-between relative overflow-hidden text-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-serif tracking-widest text-luxury-cream/50">
              {isRTL ? 'إيرادات الشهر الحالي التقديرية' : 'Monthly Premium Revenue'}
            </span>
            <h4 className="text-2xl font-mono font-bold text-gold">
              {stats.monthlyRevenue.toLocaleString()} AED
            </h4>
            <span className="text-[9px] text-emerald-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {isRTL ? '+١٨٪ عن الربع الماضي' : '+18% vs Last Quarter'}
            </span>
          </div>
          <div className="p-4 bg-gold/5 border border-gold/10 rounded-lg text-gold">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="absolute top-0 right-0 h-10 w-10 bg-gold/5 rounded-bl-full" />
        </div>

        {/* Card 2: Orders */}
        <div className="bg-luxury-dark/90 border border-gold/15 p-6 rounded-xl flex items-center justify-between relative overflow-hidden text-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-serif tracking-widest text-luxury-cream/50">
              {isRTL ? 'حجوزات الحسابات الخاصة النشطة' : 'Private Portfolio Orders'}
            </span>
            <h4 className="text-2xl font-mono font-bold text-white">
              {stats.activeOrders}
            </h4>
            <span className="text-[9px] text-luxury-cream/40">
              {isRTL ? 'تم شحنها بمركبات مدرعة بالكامل' : 'Armored dispatch logs ready'}
            </span>
          </div>
          <div className="p-4 bg-gold/5 border border-gold/10 rounded-lg text-gold">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: 5% VAT collected */}
        <div className="bg-luxury-dark/90 border border-gold/15 p-6 rounded-xl flex items-center justify-between relative overflow-hidden text-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-serif tracking-widest text-luxury-cream/50">
              {isRTL ? 'مجموع ضريبة القيمة المضافة المحسوبة (٥٪)' : 'Dubai VAT Retained (5%)'}
            </span>
            <h4 className="text-2xl font-mono font-bold text-gold">
              {stats.vatCollected.toLocaleString()} AED
            </h4>
            <span className="text-[9px] text-gold-light">
              {isRTL ? 'جاهز للتقرير الضريبي الإلكتروني' : 'Direct e-file format compatible'}
            </span>
          </div>
          <div className="p-4 bg-gold/5 border border-gold/10 rounded-lg text-gold">
            <Coins className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Sovereign Live Incoming Orders Vault */}
      <div className="bg-luxury-dark/95 border border-gold/15 rounded-xl p-6 relative overflow-hidden backdrop-blur-md text-start space-y-4">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/10 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-gold animate-pulse" />
              <span>{isRTL ? 'منصة توثيق الحجوزات والطلبات الواردة' : 'Sovereign Control Suite: Incoming Orders'}</span>
            </h3>
            <p className="text-xs text-luxury-cream/60">
              {isRTL ? 'تتبع فوري لمبيعات القطع الثمينة وقنوات الاتصال المباشرة مع كبار الشخصيات.' : 'Instantly track, monitor and clear incoming client dispatches.'}
            </p>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase tracking-widest animate-pulse font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-[pulse_1.5s_infinite]" />
            <span>{isRTL ? 'اتصال آمن نشط' : 'Sovereign Feeds Active'}</span>
          </span>
        </div>

        {(!orders || orders.length === 0) ? (
          <div className="text-center py-8 text-luxury-cream/40 text-xs tracking-wider">
            {isRTL ? 'لا توجد طلبات جارية حالياً في هذه الجلسة.' : 'No incoming portfolio orders detected.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[280px] overflow-y-auto pr-1">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="group relative bg-luxury-black/40 border border-gold/10 hover:border-gold/30 p-3.5 rounded-lg flex justify-between items-start transition-all duration-300"
              >
                <div className="space-y-1 text-start">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-luxury-black font-bold bg-gold px-1.5 py-0.5 rounded">
                      {order.id}
                    </span>
                    <span className="text-[9px] text-luxury-cream/40 font-mono">
                      {order.orderTime}
                    </span>
                  </div>
                  <h4 className="font-serif text-xs font-bold text-white leading-tight mt-1 line-clamp-1">{order.productName}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-luxury-cream/60">
                    <span className="uppercase tracking-widest text-[9px] text-luxury-cream/40">{isRTL ? 'الهاتف:' : 'Phone:'}</span>
                    <span className="font-mono text-gold leading-none">{order.customerPhone}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-widest text-luxury-cream/30 font-mono block mb-0.5">
                    {isRTL ? 'القيمة المشفرة' : 'Secure Value'}
                  </span>
                  <span className="font-mono text-xs font-bold text-gold">
                    {order.priceAED.toLocaleString()} AED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Form & Catalog Manager Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-start">
        
        {/* Form Column - Left */}
        <div className="lg:col-span-7 bg-luxury-dark border border-gold/15 p-6 sm:p-8 rounded-xl space-y-6">
          <div className="border-b border-gold/10 pb-4">
            <h3 className="font-serif text-lg font-bold text-gold tracking-wide flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {isRTL ? 'إدراج تحفة أو قطعة جديدة' : 'Adorn Catalog (Add Product)'}
            </h3>
            <p className="text-xs text-luxury-cream/60">
              {isRTL ? 'املأ التفاصيل بعناية لنشر وتحديث واجهة المتجر على الفور.' : 'Populate properties below. High-net worth metadata logic applies automatically.'}
            </p>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-4">
            
            {formSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
                <span>{isRTL ? 'تم الإدراج بنجاح! تم تحديث صالة العرض بالكامل.' : 'Creation authenticated and fully compiled to home catalog!'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">Product Name (EN) *</label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Royal Emerald Perpetual"
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">اسم المنتج (العربية)</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: ساعة الزمرد الملكية"
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">Price in AED *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={priceAED || ''}
                  onChange={(e) => setPriceAED(Number(e.target.value))}
                  placeholder="e.g. 185000"
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">Category</label>
                <select
                  value={categoryEn}
                  onChange={(e) => setCategoryEn(e.target.value)}
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="Watches">Watches (ساعات)</option>
                  <option value="Jewelry">Jewelry (مجوهرات)</option>
                  <option value="Fragrance">Fragrance (عطور)</option>
                  <option value="Accessories">Accessories (إكسسوارات)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">Stock Status</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value as any)}
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="In Stock">In Stock (متوفر)</option>
                  <option value="Low Stock">Low Stock (كمية محدودة)</option>
                  <option value="Out of Stock">Out of Stock (نفذت الكمية)</option>
                </select>
              </div>

              {/* Premium image reference selector helper */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">Interactive Image URL *</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold font-mono"
                />
              </div>
            </div>

            {/* Premium quick choices helper buttons */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-serif text-gold/80">{isRTL ? 'قوالب صور فاخرة سريعة' : 'Preset Ultra-HD Curated Images (Quick Select)'}</label>
              <div className="flex flex-wrap gap-2">
                {luxuryPlaceholders.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className="bg-luxury-black border border-gold/15 hover:border-gold px-2.5 py-1 text-[10px] text-luxury-cream/80 hover:text-white rounded transition-colors flex items-center gap-1"
                  >
                    <Image className="h-3.5 w-3.5 text-gold" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">Description (EN)</label>
                <textarea
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Masterpiece description, raw accents..."
                  rows={2}
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wide font-serif text-luxury-cream">الوصف (العربية)</label>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="وصف المنتج لعملاء النخبة والمجالس الراقية..."
                  rows={2}
                  className="w-full bg-luxury-black border border-gold/20 rounded p-2.5 text-xs text-luxury-cream focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <button
              id="submit-product-creation"
              type="submit"
              className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3 rounded shadow-lg active:scale-95 transition-all mt-4"
            >
              {isRTL ? 'إدراج المنتج ونشره على الموقع' : 'Authorize & Broadcast Creation'}
            </button>
          </form>
        </div>

        {/* Existing Products List - Right */}
        <div className="lg:col-span-5 bg-luxury-dark border border-gold/15 p-6 rounded-xl space-y-6">
          <div className="border-b border-gold/10 pb-4">
            <h3 className="font-serif text-lg font-bold text-white tracking-wide">
              {isRTL ? 'قائمة المعروضات النشطة' : 'Active Catalog Master List'}
            </h3>
            <p className="text-xs text-luxury-cream/60">
              {isRTL ? 'تحكّم وأزل القطع غير المتوفرة لحفظ هيبة التشكيلة.' : 'Configure status or permanently retire creations.'}
            </p>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {products.map((p) => (
              <div
                key={p.id}
                id={`admin-product-row-${p.id}`}
                className="flex items-center gap-4 bg-luxury-black/60 border border-gold/10 hover:border-gold/25 p-3 rounded-lg transition-colors"
              >
                <img
                  src={p.image}
                  alt={p.nameEn}
                  className="h-12 w-12 rounded object-cover border border-gold/10"
                  referrerPolicy="no-referrer"
                />
                
                <div className="flex-grow text-start">
                  <h5 className="font-serif text-xs font-bold text-white tracking-wide leading-tight line-clamp-1">{isRTL ? p.nameAr : p.nameEn}</h5>
                  <p className="text-[10px] text-gold font-mono">{p.priceAED.toLocaleString()} AED</p>
                  <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40">{isRTL ? p.categoryAr : p.categoryEn}</span>
                </div>

                <button
                  id={`retire-btn-${p.id}`}
                  onClick={() => onDeleteProduct(p.id)}
                  className="text-luxury-cream/35 hover:text-red-500 p-2 transition-colors transition-transform active:scale-90"
                  title={isRTL ? 'حذف المنتج' : 'Retire Asset'}
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
