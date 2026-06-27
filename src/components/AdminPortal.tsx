import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ShieldAlert, CheckCircle, Plus, Sparkles, TrendingUp, DollarSign, Coins, Eye, Image, Trash2, X, FileText, Shield, Phone, MapPin, Check, Bell } from 'lucide-react';
import { Product, Language, Order } from '../types';
import { loginUser, signInWithGoogle, logoutUser } from '../lib/firebaseService';


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
  onUpdateProduct?: (product: Product) => void;
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
  onUpdateVatPercentage,
  onUpdateProduct
}: AdminPortalProps) {
  const isRTL = lang === 'ar';

  // Login inputs if not already authenticated
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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

  // Active toast notifications state
  interface AdminToast {
    id: string;
    order: Order;
  }
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const initialOrderIds = useRef<Set<string>>(new Set());
  const [isNotificationMounted, setIsNotificationMounted] = useState<boolean>(false);

  useEffect(() => {
    // Save existing order IDs on mount so we don't alert for preexisting orders
    initialOrderIds.current = new Set(orders.map((o) => o.id));
    setIsNotificationMounted(true);
  }, []);

  useEffect(() => {
    if (!isNotificationMounted) return;

    // Detect new orders that were placed via WhatsApp checkout and are not yet in our known list
    const newOrders = orders.filter(
      (order) => !initialOrderIds.current.has(order.id) && order.checkoutMethod === 'WhatsApp'
    );

    if (newOrders.length > 0) {
      const newToasts = newOrders.map((o) => ({
        id: `toast-${o.id}-${Date.now()}-${Math.random()}`,
        order: o,
      }));

      setToasts((prev) => [...newToasts, ...prev]);

      // Add them to the set of known orders so we do not notify again
      newOrders.forEach((o) => initialOrderIds.current.add(o.id));
    }
  }, [orders, isNotificationMounted]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

  const handleGoogleSignIn = async () => {
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const { profile } = await signInWithGoogle();
      if (profile.role === 'admin') {
        setLoginError('');
      } else {
        setLoginError(isRTL ? 'هذا الحساب ليس لديه صلاحيات الإدارة.' : 'This Google account does not have administrator privileges.');
        await logoutUser();
      }
    } catch (err: any) {
      console.error('Admin Google sign-in error:', err);
      if (err.code === 'auth/popup-blocked') {
        setLoginError(isRTL 
          ? 'تم حظر النافذة المنبثقة بواسطة متصفحك. يرجى تفعيل النوافذ المنبثقة لهذا الموقع من شريط العنوان (ابحث عن رمز حظر النوافذ المنبثقة 🚫 في أعلى اليمين) أو قم بفتح هذا التطبيق في علامة تبويب جديدة ثم حاول مجدداً.' 
          : 'The Google Sign-In popup was blocked by your browser. Please allow popups for this site in your browser\'s address bar (look for the blocked pop-up icon 🚫 or settings) or open this application in a new tab to sign in securely.'
        );
      } else {
        setLoginError(isRTL 
          ? 'فشل تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.' 
          : 'Google Sign-In failed. Please try again.'
        );
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      const { profile } = await loginUser(email, password);
      if (profile.role === 'admin') {
        setLoginError('');
      } else {
        setLoginError(isRTL ? 'هذا الحساب ليس لديه صلاحيات الإدارة.' : 'This account does not have administrator privileges.');
        await logoutUser();
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      if (err.code === 'auth/configuration-not-found') {
        setLoginError(isRTL
          ? 'المشرف السيادي: لم يتم تمكين تسجيل الدخول بالبريد الإلكتروني وكلمة المرور في لوحة تحكم Firebase بعد. يرجى تمكين "Email/Password" في لوحة تحكم Firebase (Authentication > Sign-in method)، أو استخدام خيار تسجيل الدخول الآمن من Google أدناه.'
          : 'Sovereign Admin: The Email/Password sign-in method is not enabled in your Firebase console. Please go to Firebase Console > Authentication > Sign-in method and enable "Email/Password", or use the secure Google Sign-In option below.');
      } else {
        setLoginError(isRTL ? 'بيانات الاعتماد غير صالحة. يرجى المحاولة مرة أخرى.' : 'Invalid credentials or passcode.');
      }
    } finally {
      setIsLoggingIn(false);
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
                  placeholder="konami5miv@gmail.com"
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
              Email: <span className="font-mono">konami5miv@gmail.com</span><br />
              Password: <span className="font-mono">DubaiLuxury2026</span>
            </div>

            <button
              id="admin-submit"
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-gold via-gold-light to-gold text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded shadow-lg hover:shadow-gold/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <span className="h-4 w-4 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
              ) : (
                isRTL ? 'فك تشفير وبوابة الدخول' : 'Decrypt & Enter Vault'
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gold/10"></div>
              <span className="flex-shrink mx-4 text-gold/40 text-[10px] uppercase font-serif tracking-widest">{isRTL ? 'أو' : 'OR'}</span>
              <div className="flex-grow border-t border-gold/10"></div>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full bg-white/5 hover:bg-white/10 border border-gold/20 text-luxury-cream font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>{isRTL ? 'الدخول بواسطة Google للمشرف' : 'Google Admin Sign In'}</span>
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

      {/* Manage Vault Inventory Section */}
      <div className="bg-luxury-dark/95 border border-gold/15 rounded-xl p-6 relative overflow-hidden backdrop-blur-md text-start space-y-4">
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="border-b border-gold/10 pb-4">
          <h3 className="font-serif text-lg font-bold text-gold tracking-wide flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-gold animate-pulse" />
            <span>{isRTL ? 'إدارة المخزون الملكي' : 'Manage Vault Inventory'}</span>
          </h3>
          <p className="text-xs text-luxury-cream/60">
            {isRTL ? 'لوحة تحكم كبار المشرفين لتعديل كميات وأسعار المعروضات الثمينة فورياً.' : 'Owner Master Dashboard to update asset prices, modify stock levels, and toggle immediate client availability.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gold/20 text-gold uppercase font-serif tracking-widest">
                <th className="py-3 px-3 text-start">{isRTL ? 'البيان والتحفة' : 'Masterpiece Description'}</th>
                <th className="py-3 px-3">{isRTL ? 'سعر الاستثمار' : 'Investment Price'}</th>
                <th className="py-3 px-3">{isRTL ? 'الكمية النشطة' : 'Active Stock'}</th>
                <th className="py-3 px-3">{isRTL ? 'الحالة والتوفر' : 'Availability'}</th>
                <th className="py-3 px-3 text-end">{isRTL ? 'الإجراء الملكي' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {products.map((p) => (
                <InventoryItemRow
                  key={p.id}
                  product={p}
                  lang={lang}
                  onUpdateProduct={onUpdateProduct || (() => {})}
                />
              ))}
            </tbody>
          </table>
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
                          {selectedOrder.clientName || (isRTL ? 'عميل ستايلز آند جريس الموقر' : 'Styles & Grace Patron')}
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

      {/* Toast Notification Container */}
      <div 
        id="admin-toasts-portal"
        className={`fixed top-24 z-[100] space-y-3 max-w-sm w-[calc(100%-2rem)] sm:w-90 ${
          isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
        }`}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <AdminToastCard
              key={t.id}
              toast={t}
              isRTL={isRTL}
              onDismiss={dismissToast}
              onSelectOrder={setSelectedOrder}
            />
          ))}
        </AnimatePresence>
      </div>

    </section>
  );
}

interface InventoryItemRowProps {
  key?: any;
  product: Product;
  lang: Language;
  onUpdateProduct: (product: Product) => void;
}

function InventoryItemRow({ product, lang, onUpdateProduct }: InventoryItemRowProps) {
  const isRTL = lang === 'ar';
  
  // Initialize state from product data
  const [price, setPrice] = useState<number>(product.priceAED);
  const [stock, setStock] = useState<number>(product.stock !== undefined ? product.stock : (product.stockStatus === 'Out of Stock' ? 0 : 5));
  const [isAvailable, setIsAvailable] = useState<boolean>(product.stockStatus !== 'Out of Stock');
  const [success, setSuccess] = useState<boolean>(false);

  // Sync state if product changes externally
  useEffect(() => {
    setPrice(product.priceAED);
    setStock(product.stock !== undefined ? product.stock : (product.stockStatus === 'Out of Stock' ? 0 : 5));
    setIsAvailable(product.stockStatus !== 'Out of Stock');
  }, [product]);

  const handleStockChange = (newStock: number) => {
    const val = Math.max(0, newStock);
    setStock(val);
    if (val === 0) {
      setIsAvailable(false);
    } else {
      setIsAvailable(true);
    }
  };

  const handleToggleAvailable = () => {
    const nextAvailable = !isAvailable;
    setIsAvailable(nextAvailable);
    if (!nextAvailable) {
      setStock(0);
    } else if (stock === 0) {
      setStock(5); // default to 5 if made available
    }
  };

  const handleUpdate = () => {
    let resolvedStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    let resolvedStatusAr: 'متوفر' | 'كمية محدودة' | 'نفذت الكمية' = 'متوفر';

    if (!isAvailable || stock === 0) {
      resolvedStatus = 'Out of Stock';
      resolvedStatusAr = 'نفذت الكمية';
    } else if (stock <= 5) {
      resolvedStatus = 'Low Stock';
      resolvedStatusAr = 'كمية محدودة';
    } else {
      resolvedStatus = 'In Stock';
      resolvedStatusAr = 'متوفر';
    }

    onUpdateProduct({
      ...product,
      priceAED: price,
      stock: stock,
      stockStatus: resolvedStatus,
      stockStatusAr: resolvedStatusAr
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <tr className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
      <td className="py-4 px-3 flex items-center gap-3">
        <img
          src={product.image}
          alt={product.nameEn}
          className="h-10 w-10 rounded object-cover border border-gold/10 flex-shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="text-start">
          <p className="font-serif text-xs font-bold text-white line-clamp-1">
            {isRTL ? product.nameAr : product.nameEn}
          </p>
          <span className="text-[9px] uppercase tracking-wider text-luxury-cream/40 font-mono">
            {isRTL ? product.categoryAr : product.categoryEn}
          </span>
        </div>
      </td>

      {/* Price Input */}
      <td className="py-4 px-3">
        <div className="relative max-w-[130px]">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
            className="w-full bg-luxury-black border border-gold/20 text-xs font-mono text-gold rounded p-1.5 focus:outline-none focus:border-gold text-start pr-8"
          />
          <span className="absolute right-2 top-2 text-[9px] font-mono text-gold/60 pointer-events-none">AED</span>
        </div>
      </td>

      {/* Stock Counter */}
      <td className="py-4 px-3">
        <div className="flex items-center gap-1.5 max-w-[120px]">
          <button
            type="button"
            onClick={() => handleStockChange(stock - 1)}
            className="w-7 h-7 bg-luxury-black border border-gold/25 hover:bg-gold/10 text-gold flex items-center justify-center rounded cursor-pointer active:scale-90 transition-all text-xs font-bold"
          >
            -
          </button>
          <input
            type="number"
            value={stock}
            onChange={(e) => handleStockChange(Math.max(0, Number(e.target.value)))}
            className="w-12 text-center bg-luxury-black border border-gold/20 text-xs font-mono text-white rounded p-1"
          />
          <button
            type="button"
            onClick={() => handleStockChange(stock + 1)}
            className="w-7 h-7 bg-luxury-black border border-gold/25 hover:bg-gold/10 text-gold flex items-center justify-center rounded cursor-pointer active:scale-90 transition-all text-xs font-bold"
          >
            +
          </button>
        </div>
      </td>

      {/* Availability Toggle */}
      <td className="py-4 px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAvailable}
            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAvailable ? 'bg-gold' : 'bg-neutral-800'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-luxury-black shadow ring-0 transition duration-200 ease-in-out ${
                isAvailable ? (isRTL ? 'translate-x-0' : 'translate-x-5') : (isRTL ? 'translate-x-5' : 'translate-x-0')
              }`}
            />
          </button>
          <span className={`text-[10px] font-serif uppercase tracking-wider ${isAvailable ? 'text-emerald-400' : 'text-neutral-500'}`}>
            {isAvailable 
              ? (isRTL ? 'متوفر' : 'In Stock') 
              : (isRTL ? 'نفذت الكمية' : 'Sold Out')
            }
          </span>
        </div>
      </td>

      {/* Update Action Button */}
      <td className="py-4 px-3 text-end">
        <button
          type="button"
          onClick={handleUpdate}
          className={`px-3 py-1.5 font-serif text-[10px] font-bold tracking-widest uppercase rounded transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
            success 
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50' 
              : 'bg-gold text-luxury-black hover:brightness-110 shadow-lg shadow-gold/5'
          }`}
        >
          {success ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>{isRTL ? 'تم التحديث' : 'Synced'}</span>
            </>
          ) : (
            <span>{isRTL ? 'تحديث المخزن' : 'Update Inventory'}</span>
          )}
        </button>
      </td>
    </tr>
  );
}

interface AdminToastCardProps {
  key?: any;
  toast: { id: string; order: Order };
  isRTL: boolean;
  onDismiss: (id: string) => void;
  onSelectOrder: (order: Order) => void;
}

function AdminToastCard({ toast, isRTL, onDismiss, onSelectOrder }: AdminToastCardProps) {
  const { order } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 10000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      id={`new-order-toast-${order.id}`}
      initial={{ opacity: 0, y: -20, scale: 0.9, x: isRTL ? -50 : 50 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="bg-luxury-dark/95 border border-gold/40 rounded-xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col gap-2.5 text-start"
    >
      {/* Golden top gradient line */}
      <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-gold via-gold-light to-gold" />
      
      {/* Background radial gold glow for premium look */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
            <Bell className="h-3.5 w-3.5 text-gold animate-[bounce_1s_infinite]" />
          </div>
          <span className="font-serif text-[10px] uppercase tracking-widest font-bold text-gold">
            {isRTL ? 'طلب ملكي جديد' : 'New Royal Order Request'}
          </span>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="text-luxury-cream/40 hover:text-gold transition-colors duration-200 p-1 rounded hover:bg-gold/5 cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <div className="flex justify-between items-baseline gap-2">
          <p className="font-serif text-xs font-bold text-white">
            {order.clientName || (isRTL ? 'عميل كبار الشخصيات' : 'VIP Patron')}
          </p>
          <span className="font-mono text-[10px] text-gold/80 font-semibold bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20">
            {order.id}
          </span>
        </div>
        <p className="text-[10px] text-luxury-cream/60 line-clamp-2">
          {order.productName}
        </p>
        <div className="flex justify-between items-center pt-1 border-t border-gold/10 mt-1">
          <span className="text-[9px] text-luxury-cream/40 uppercase tracking-widest font-mono">
            {isRTL ? 'إجمالي الاستثمار' : 'Total Investment'}
          </span>
          <span className="font-mono text-xs font-bold text-gold">
            {order.priceAED.toLocaleString()} AED
          </span>
        </div>
      </div>

      {/* Action */}
      <button
        onClick={() => {
          onSelectOrder(order);
          onDismiss(toast.id);
        }}
        className="w-full bg-gold text-luxury-black font-serif text-[10px] font-bold tracking-widest uppercase py-1.5 rounded transition-all active:scale-[0.98] hover:brightness-110 flex items-center justify-center gap-1.5 shadow-lg shadow-gold/5 cursor-pointer"
      >
        <Eye className="h-3 w-3" />
        <span>{isRTL ? 'عرض تفاصيل الطلب' : 'Assess Royal Request'}</span>
      </button>
    </motion.div>
  );
}
