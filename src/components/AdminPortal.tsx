import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, ShieldAlert, CheckCircle, Plus, Sparkles, TrendingUp, DollarSign, Coins, Eye, Image, Trash2, X, FileText, Shield, Phone, MapPin, Check } from 'lucide-react';
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
  onDispatchOrder?: (id: string) => void;
  vatPercentage?: number;
  onUpdateVatPercentage?: (vat: number) => void;
}

export default function AdminPortal({ 
  lang, 
  onAddProduct, 
  products, 
  orders = [],
  onDeleteProduct,
  isAuthenticated,
  onLogout,
  onLogin,
  onDispatchOrder,
  vatPercentage = 5,
  onUpdateVatPercentage
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

  // Sovereign selected order for luxury detail view
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Parse and calculate separate line items with their subtotals
  const getSelectedOrderItems = () => {
    if (!selectedOrder) return [];
    const rawName = selectedOrder.productName || '';
    
    // Split by comma
    const parsedItems = rawName.split(',').map(itemStr => {
      const trimmed = itemStr.trim();
      // Match quantities in formats: (x2), x2, x 2, (2), × 2, * 2 at the end of the item
      const qtyMatch = trimmed.match(/(?:\(?\s*[\*x×]\s*(\d+)\s*\)?|\(\s*(\d+)\s*\))$/i);
      if (qtyMatch) {
        const quantity = parseInt(qtyMatch[1] || qtyMatch[2], 10);
        const name = trimmed.replace(/(?:\(?\s*[\*x×]\s*(\d+)\s*\)?|\(\s*(\d+)\s*\))$/i, '').trim();
        return { name, quantity };
      }
      return { name: trimmed, quantity: 1 };
    });

    const subtotalVal = selectedOrder.priceAED / (1 + vatPercentage / 100);

    const itemsWithPrices = parsedItems.map(item => {
      const matchingProduct = products.find(
        p => p.nameEn.toLowerCase() === item.name.toLowerCase() || 
             p.nameAr.toLowerCase() === item.name.toLowerCase()
      );
      
      let price = matchingProduct ? matchingProduct.priceAED : 0;
      return {
        ...item,
        price,
        resolvedName: matchingProduct ? (isRTL ? matchingProduct.nameAr : matchingProduct.nameEn) : item.name
      };
    });

    const foundPricesSum = itemsWithPrices.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return itemsWithPrices.map((item) => {
      let finalSubtotal = item.price * item.quantity;
      if (foundPricesSum === 0) {
        finalSubtotal = (subtotalVal / parsedItems.length);
      } else if (item.price === 0) {
        const remaining = Math.max(0, subtotalVal - foundPricesSum);
        finalSubtotal = remaining / itemsWithPrices.filter(i => i.price === 0).length;
      } else {
        finalSubtotal = (item.price * item.quantity / foundPricesSum) * subtotalVal;
      }
      return {
        ...item,
        subtotal: finalSubtotal
      };
    });
  };

  const finalItems = getSelectedOrderItems();

  // Hardcoded premium stats with real-time increments from the live state orders array
  const liveOrdersCount = orders ? orders.length : 0;
  const liveOrdersRevenue = orders ? orders.reduce((sum, o) => sum + o.priceAED, 0) : 0;

  const stats = {
    monthlyRevenue: 3450000 + liveOrdersRevenue,
    activeOrders: 28 + liveOrdersCount,
    vatCollected: 172500 + Math.round(liveOrdersRevenue * (vatPercentage / (100 + vatPercentage)))
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

        {/* Card 3: Dynamic VAT collected */}
        <div className="bg-luxury-dark/90 border border-gold/15 p-6 rounded-xl flex items-center justify-between relative overflow-hidden text-start">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-serif tracking-widest text-luxury-cream/50">
              {isRTL ? `مجموع ضريبة القيمة المضافة المحسوبة (${vatPercentage}٪)` : `Dubai VAT Retained (${vatPercentage}%)`}
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

      {/* Royal Configuration & Policies Section */}
      <div className="bg-luxury-dark/95 border border-gold/15 rounded-xl p-6 relative overflow-hidden backdrop-blur-md text-start space-y-4">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-white tracking-widest uppercase flex items-center gap-2">
              <Coins className="h-4.5 w-4.5 text-gold" />
              <span>{isRTL ? 'إعدادات النظام والضريبة الملكية' : 'Sovereign Configuration & Royal Policies'}</span>
            </h3>
            <p className="text-xs text-luxury-cream/60">
              {isRTL ? 'إدارة نسبة ضريبة القيمة المضافة لدولة الإمارات المطبقة على مبيعات المعروضات الثمينة.' : 'Manage UAE regulatory VAT parameters applied across all digital showrooms.'}
            </p>
          </div>
        </div>

        <div className="max-w-md pt-2">
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-mono tracking-widest text-gold/85">
              {isRTL ? 'تعديل نسبة ضريبة القيمة المضافة (%) *' : 'Set VAT Percentage (%) *'}
            </label>
            <div className="relative flex items-center">
              <input
                id="vat-percentage-input"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={vatPercentage}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (onUpdateVatPercentage) {
                    onUpdateVatPercentage(isNaN(val) ? 0 : val);
                  }
                }}
                className="w-full bg-luxury-black/80 border border-gold/20 text-sm text-luxury-cream rounded px-4 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-mono pr-12 transition-all duration-300"
                placeholder="5"
              />
              <span className="absolute right-4 text-xs font-mono text-gold-light pointer-events-none">
                %
              </span>
            </div>
            <p className="text-[10px] text-luxury-cream/40 italic">
              {isRTL ? 'التعديل يطبق فوراً في سلة المشتريات ومستندات تدقيق الطلبات الإلكترونية.' : 'Modifications propagate instantly to client carts and financial audit logs.'}
            </p>
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
                onClick={() => setSelectedOrder(order)}
                className="group relative bg-luxury-black/40 border border-gold/10 hover:border-gold/30 p-3.5 rounded-lg flex justify-between items-start transition-all duration-300 cursor-pointer hover:bg-luxury-black/60 hover:shadow-[0_0_15px_rgba(212,175,55,0.1)] pointer-events-auto"
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
                  <div className="pt-1 flex items-center gap-2">
                    <span className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded font-mono font-semibold ${
                      order.status === 'Dispatched'
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse'
                    }`}>
                      {order.status === 'Dispatched'
                        ? (isRTL ? 'تم الإرسال' : 'Dispatched')
                        : (isRTL ? 'قيد المعالجة' : 'Processing Feed')}
                    </span>
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

      {/* Sovereign Order Details View Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop with blurred background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 z-[100] bg-luxury-black/90 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto cursor-default"
            >
              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-luxury-dark border-2 border-gold/30 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.25)] flex flex-col justify-between text-luxury-cream text-start font-sans"
              >
                {/* Royal Accent Header Bar */}
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />

                {/* Header Section */}
                <div className="p-6 border-b border-gold/10 flex justify-between items-center bg-luxury-black/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-full border border-gold/20 bg-gold/10 text-gold">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-luxury-black bg-gold px-2 py-0.5 rounded">
                          {selectedOrder.id}
                        </span>
                        <span className="text-[10px] text-luxury-cream/40 font-mono">
                          {selectedOrder.orderTime}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-white tracking-widest uppercase mt-1">
                        {isRTL ? 'تفاصيل الحجز الملكي' : 'Sovereign Order Audit'}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-luxury-cream/50 hover:text-gold p-1.5 rounded-full border border-gold/10 hover:border-gold/30 transition-all duration-300"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Content Details Grid */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                  {/* Status Banner */}
                  <div className={`p-3 rounded-lg border flex items-center justify-between text-xs font-serif ${
                    selectedOrder.status === 'Dispatched' 
                      ? 'bg-gold/10 border-gold/30 text-gold' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="uppercase tracking-widest font-semibold text-[10px]">
                        {isRTL ? 'حالة الحجز الجاري:' : 'Logistics Security State:'}
                      </span>
                    </div>
                    <span className="font-mono font-bold uppercase tracking-widest text-[9px]">
                      {selectedOrder.status === 'Dispatched' 
                        ? (isRTL ? 'تم الإرسال والترخيص' : 'Dispatched & Cleared') 
                        : (isRTL ? 'قيد الحراسة والمعالجة' : 'Armed Processing')}
                    </span>
                  </div>

                  {/* Client Identity */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-gold/80 border-b border-gold/10 pb-1">
                      {isRTL ? 'هوية العميل الكريم' : 'VIP Client Identity'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-luxury-black/30 p-3 rounded-lg border border-gold/5">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 block">
                          {isRTL ? 'الاسم الكامل:' : 'Full Name:'}
                        </span>
                        <span className="text-xs font-serif font-bold text-white">
                          {selectedOrder.clientName || (isRTL ? 'عميل لوكسورا الموقر' : 'Sovereign Luxora Patron')}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 block">
                          {isRTL ? 'رقم الاتصال المباشر:' : 'Direct Phone Contact:'}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-gold">
                          <Phone className="h-3 w-3" />
                          <span>{selectedOrder.customerPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logistics / Dispatch Coordinates */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-gold/80 border-b border-gold/10 pb-1">
                      {isRTL ? 'تفاصيل الخدمات اللوجستية المصفحة' : 'Logistics & Secure Dispatch'}
                    </h5>
                    <div className="space-y-3 bg-luxury-black/30 p-3.5 rounded-lg border border-gold/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-luxury-cream/40">
                          <MapPin className="h-3 w-3 text-gold" />
                          <span>{isRTL ? 'إحداثيات وموقع التوصيل الآمن:' : 'Armored Delivery Coordinates:'}</span>
                        </div>
                        <p className="text-xs text-luxury-cream/80 leading-relaxed pl-4 font-serif">
                          {selectedOrder.deliveryCoordinates || (isRTL ? 'تسليم يدوي مباشر في دبي كبار الشخصيات' : 'Direct Hand-Delivery Handover, Dubai VIP')}
                        </p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-gold/5">
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-luxury-cream/40">
                          <Shield className="h-3 w-3 text-gold" />
                          <span>{isRTL ? 'شروط الحراسة والطلبات الخاصة:' : 'Bespoke Guard Requirements & Notes:'}</span>
                        </div>
                        <p className="text-xs text-luxury-cream/80 leading-relaxed pl-4 italic font-sans font-light">
                          {selectedOrder.bespokeNotes || (isRTL ? 'لم يتم إدراج متطلبات حراسة مخصصة' : 'Standard secure elite courier transit scheduled.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Audit breakdown */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] font-mono uppercase tracking-widest text-gold/80 border-b border-gold/10 pb-1">
                      {isRTL ? 'التدقيق المالي الشامل' : 'Financial Investment Audit'}
                    </h5>
                    <div className="bg-luxury-black/40 border border-gold/10 rounded-lg p-4 space-y-3 font-mono text-xs">
                      {/* Product Detail lines mapped properly */}
                      <div className="space-y-2 pb-2 border-b border-gold/10">
                        {finalItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-start gap-4 text-[11px]">
                            <span className="text-luxury-cream/70 font-serif leading-tight">
                              {item.resolvedName}{item.quantity > 1 ? ` × ${item.quantity}` : ''}
                            </span>
                            <span className="text-white font-bold text-right flex-shrink-0">
                              {item.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} AED
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Financial Sum list */}
                      <div className="space-y-1.5 pt-1 text-[11px]">
                        <div className="flex justify-between text-luxury-cream/50">
                          <span>{isRTL ? 'القيمة الأساسية (قبل الضريبة):' : 'Bespoke Subtotal:'}</span>
                          <span>{((selectedOrder.priceAED) / (1 + vatPercentage / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })} AED</span>
                        </div>
                        <div className="flex justify-between text-luxury-cream/50">
                          <span>{isRTL ? `ضريبة القيمة المضافة لدولة الإمارات (${vatPercentage}٪):` : `UAE VAT (${vatPercentage}%):`}</span>
                          <span>{(selectedOrder.priceAED * vatPercentage / (100 + vatPercentage)).toLocaleString(undefined, { maximumFractionDigits: 2 })} AED</span>
                        </div>
                        <div className="flex justify-between text-gold font-bold text-xs pt-2 border-t border-gold/10 font-serif">
                          <span className="uppercase tracking-widest">{isRTL ? 'الإجمالي النهائي الموثق:' : 'Sovereign Grand Total:'}</span>
                          <span>{selectedOrder.priceAED.toLocaleString()} AED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gold/10 bg-luxury-black/60 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="w-full sm:w-1/3 py-2.5 border border-gold/15 text-luxury-cream/70 hover:text-white hover:border-gold/30 rounded-lg text-xs font-serif uppercase tracking-widest transition-all duration-300 cursor-pointer"
                  >
                    {isRTL ? 'إغلاق المراجعة' : 'Close Audit'}
                  </button>

                  {selectedOrder.status !== 'Dispatched' && (
                    <button
                      onClick={() => {
                        if (onDispatchOrder) {
                          onDispatchOrder(selectedOrder.id);
                        }
                        // Instantly reflect state locally so the dispatch change is immediate in modal too
                        setSelectedOrder({
                          ...selectedOrder,
                          status: 'Dispatched'
                        });
                      }}
                      className="w-full sm:w-2/3 py-2.5 bg-gold hover:bg-gold-light text-luxury-black hover:text-black rounded-lg text-xs font-serif uppercase font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.2)] cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>{isRTL ? 'تأكيد إرسال الطلب وحراسته' : 'Mark as Dispatched'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}
