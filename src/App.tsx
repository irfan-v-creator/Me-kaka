import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Globe, Sparkles, Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Send, Check } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import AdminPortal from './components/AdminPortal';
import SEOManager from './components/SEOManager';
import LoginModal from './components/LoginModal';
import { Language, Product, CartItem, Order } from './types';
import { LUXURY_PRODUCTS } from './data';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activePage, setActivePage] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>(LUXURY_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Professional E-commerce Cart State with secure localStorage synchronization
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to sync shopping vault bag:', e);
    }
  }, [cart]);

  // Professional Orders Log state with localStorage synchronization
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_orders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // safe fallback
    }
    return [
      {
        id: 'ORD-8429',
        productName: 'Royal Oud Absolue Vial',
        priceAED: 125000,
        customerPhone: '7510447887',
        orderTime: '6/22/2026, 11:24 PM'
      },
      {
        id: 'ORD-1094',
        productName: 'Swiss Chronograf Golden Sovereign',
        priceAED: 185000,
        customerPhone: '7510447887',
        orderTime: '6/22/2026, 9:15 PM'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to sync orders ledger:', e);
    }
  }, [orders]);

  // Professional Session & Role-Based Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Exquisite Shopping Cart Form input state controls
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ name?: boolean; phone?: boolean; address?: boolean }>({});

  const handleLoginSuccess = (email: string, adminStatus: boolean) => {
    setIsLoggedIn(true);
    setIsAdmin(adminStatus);
    setUserEmail(email);
    
    if (adminStatus) {
      setActivePage('admin-portal');
      window.location.hash = '#/admin-portal';
    } else {
      setActivePage('shop');
      if (window.location.hash) {
        window.location.hash = '';
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail(null);
    setActivePage('home');
    if (window.location.hash) {
      window.location.hash = '';
    }
  };

  const handleLoginRaw = (email: string, pass: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === 'owner@luxoradubai.ae' && pass === 'DubaiLuxury2026') {
      handleLoginSuccess(normalizedEmail, true);
      return true;
    } else if (normalizedEmail && pass.length >= 4) {
      handleLoginSuccess(normalizedEmail, false);
      return true;
    }
    return false;
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const nextCart = [...prev];
        nextCart[existingIdx] = {
          ...nextCart[existingIdx],
          quantity: nextCart[existingIdx].quantity + 1,
        };
        return nextCart;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handlePlaceOrder = (product: Product, customerPhone: string) => {
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: product.nameEn,
      priceAED: product.priceAED,
      customerPhone: customerPhone.trim(),
      orderTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' - ' + new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleWhatsAppCheckout = () => {
    // Basic validation
    const errors: { name?: boolean; phone?: boolean; address?: boolean } = {};
    if (!checkoutName.trim()) errors.name = true;
    if (!checkoutPhone.trim()) errors.phone = true;
    if (!checkoutAddress.trim()) errors.address = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const subtotal = cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0);
    const discount = (isLoggedIn && !isAdmin) ? (subtotal * 0.10) : 0;
    const taxable = subtotal - discount;
    const vat = taxable * 0.05;
    const total = taxable + vat;

    // Create the order in standard model format for local and Admin Control Suite tracking
    const orderItemsDesc = cart.map((item) => `${item.product.nameEn} (x${item.quantity})`).join(', ');
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: orderItemsDesc || 'VIP Pieces Portfolio Selection',
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
      vatAED: vat
    };

    // Push new order object to state array to instantly update admin dashboard stats and incoming logs
    setOrders((prev) => [newOrder, ...prev]);

    const lineDivider = '════════════════════════════';
    
    let msg = `⚜️ *LUXORA DUBAI - ROYAL ORDER REQUEST* ⚜️\n`;
    msg += `${lineDivider}\n\n`;
    msg += `👤 *Client / العميل الكريم:* ${checkoutName.trim()}\n`;
    msg += `📞 *Phone / الاتصال:* ${checkoutPhone.trim()}\n`;
    if (isLoggedIn && userEmail) {
      msg += `✉️ *VIP Account / بريد النخبة:* ${userEmail}\n`;
    }
    msg += `📍 *Armored Dispatch / عنوان التوصيل:* ${checkoutAddress.trim()}\n`;
    if (checkoutNotes.trim()) {
      msg += `📝 *Bespoke Requests / طلبات خاصة:* ${checkoutNotes.trim()}\n`;
    }
    msg += `📅 *Date / التاريخ:* ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
    msg += `🛍️ *SELECTED MASTERPIECES / القطع الفنية المختارة:*\n`;
    
    cart.forEach((item, index) => {
      const totalItemVal = item.product.priceAED * item.quantity;
      msg += `❖ *${index + 1}. ${item.product.nameEn}* (${item.product.nameAr})\n`;
      msg += `   • Quantity / الكمية: ${item.quantity}x\n`;
      msg += `   • Unit Price / سعر الحبة: ${item.product.priceAED.toLocaleString()} AED\n`;
      msg += `   • Total / المجموع: ${totalItemVal.toLocaleString()} AED\n\n`;
    });

    msg += `${lineDivider}\n`;
    msg += `❖ *SOVEREIGN INVESTMENT SUMMARY / ملخص قيمة الاستثمار:*\n`;
    msg += `   • Subtotal / القيمة الأساسية: ${subtotal.toLocaleString()} AED\n`;
    
    if (discount > 0) {
      msg += `   • VIP Elite 10% Discount / خصم كبار الشخصيات: -${discount.toLocaleString()} AED\n`;
    }
    
    msg += `   • UAE VAT 5% / ضريبة القيمة المضافة: ${vat.toLocaleString()} AED\n`;
    msg += `   • *Grand Total / الإجمالي النهائي:* *${total.toLocaleString()} AED*\n`;
    msg += `${lineDivider}\n\n`;
    msg += `✨ _This sovereign dispatch request is locked and certified under Emirati high-jewelry protection guidelines. A luxury client director will contact you on WhatsApp shortly to complete transaction details._`;

    // Target Phone Number is updated directly as requested: 7510447887
    const whatsappUrl = `https://wa.me/7510447887?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');

    // Clean up states for completing experience
    setCart([]);
    setCheckoutName('');
    setCheckoutPhone('');
    setCheckoutAddress('');
    setCheckoutNotes('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query && activePage !== 'home' && activePage !== 'shop' && activePage !== 'admin-portal') {
      setActivePage('shop');
    }
  };

  // Hash Routing support for secure unadvertised owner admin route
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin-portal' || hash === '#/admin-portal') {
        setActivePage('admin-portal');
      } else if (hash === '#home' || hash === '#/home' || !hash) {
        setActivePage('home');
      }
    };
    handleHashChange(); // Trigger once on mount
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Multi-lingual RTL alignment management on document root
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (lang === 'ar') {
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.classList.add('rtl-active');
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.classList.remove('rtl-active');
    }
  }, [lang]);

  const isRTL = lang === 'ar';

  // State handlers to mutate products collection immediately on admin demand
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const productWithId: Product = {
      ...newProduct,
      id: `prod_${Date.now()}`
    };
    setProducts((prev) => [productWithId, ...prev]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Handle CTA explore buttons or other page switches
  const handleNavigate = (page: string) => {
    if (page === 'admin-portal') {
      window.location.hash = '#/admin-portal';
    } else {
      setActivePage(page);
      if (window.location.hash) {
        window.location.hash = '';
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="luxora-app-root" className="min-h-screen bg-luxury-black text-luxury-cream selection:bg-gold selection:text-luxury-black font-sans">
      <SEOManager lang={lang} />
      
      {/* Impeccable Header Bar with elevated auth states */}
      <Navbar 
        lang={lang} 
        setLang={setLang} 
        onNavigate={handleNavigate} 
        activePage={activePage} 
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userEmail={userEmail}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      />

      {/* Exquisite VIP Access Banner Info */}
      {isLoggedIn && !isAdmin && (
        <div id="vip-gold-banner" className="bg-gold/10 border-b border-gold/25 text-gold text-xs py-3 px-4 text-center tracking-widest uppercase font-serif flex items-center justify-center gap-2 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-gold flex-shrink-0" />
          <span>
            {isRTL 
              ? `الملف الشخصي الفاخر نشط لـ (${userEmail}) • تم تفعيل خصم النخبة المضمون بنسبة ١٠٪`
              : `Bespoke Sovereign VIP Session Active for ${userEmail} • Verified Member Discount Engaged`
            }
          </span>
          <button 
            id="vip-signout-banner-btn"
            onClick={handleLogout}
            className={`font-serif underline text-[9px] hover:text-white transition-colors uppercase ${isRTL ? 'mr-4' : 'ml-4'} cursor-pointer`}
          >
            {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
          </button>
        </div>
      )}

      {/* Main Dynamic Viewport Container */}
      <main id="luxora-main-content">
        {activePage === 'home' ? (
          <div>
            {/* Majestic Hero Display */}
            <Hero lang={lang} onExplore={() => handleNavigate('shop')} />
            
            {/* Elegant Welcome Note Section */}
            <section className="bg-luxury-dark py-20 px-4 sm:px-6 lg:px-8 border-t border-gold/5 text-center">
              <div className="max-w-3xl mx-auto space-y-6">
                <Sparkles className="h-6 w-6 text-gold mx-auto animate-pulse" />
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-white uppercase">
                  {isRTL ? 'إرث من الأصالة والفخامة المطلقة' : 'A Legacy of Pure Heritage & Distinction'}
                </h2>
                <div className="w-16 h-[1px] bg-gold mx-auto" />
                <p className="text-luxury-cream/70 text-sm sm:text-base leading-relaxed tracking-wide font-light">
                  {isRTL 
                    ? 'نرحب بكم في عصر جديد للتسوق المترف. إن لوكسورا دبي هي بوابتكم لنخبة المنتجات المنسوجة والمرصعة بالذهب الخالص والماس. سيتم قريبًا الكشف عن المجموعة الحصرية لربيع وصيف ٢٠٢٦.' 
                    : 'We welcome you to a new dawn in elite luxury e-commerce. LUXORA Dubai is your private portal to solid-gold timepieces and diamond-studded high jewelry. The full preview of our curated Spring/Summer 2026 collection is coming next in our grand launch.'
                  }
                </p>
              </div>
            </section>
 
            {/* Dynamic Product Catalog Gallery */}
            <ProductShowcase lang={lang} products={products} searchQuery={searchQuery} onAddToCart={handleAddToCart} onPlaceOrder={handlePlaceOrder} />
          </div>
        ) : activePage === 'shop' ? (
          <div className="py-6">
            <ProductShowcase lang={lang} products={products} searchQuery={searchQuery} onAddToCart={handleAddToCart} onPlaceOrder={handlePlaceOrder} />
          </div>
        ) : activePage === 'admin-portal' ? (
          <AdminPortal
            lang={lang}
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            isAuthenticated={isLoggedIn && isAdmin}
            onLogout={handleLogout}
            onLogin={handleLoginRaw}
          />
        ) : activePage === 'cart' ? (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-up" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Header section with back button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-gold/10">
              <div>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="group flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-white transition-all mb-2 cursor-pointer bg-transparent border-none"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>{isRTL ? 'مواصلة تصفح المجموعة' : 'Continue Shopping'}</span>
                </button>
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-white uppercase flex items-center gap-2 mt-1">
                  <ShoppingBag className="h-6 w-6 text-gold animate-pulse" />
                  <span>{isRTL ? 'حقيبة الاقتناء الملوكية' : 'Royal Selection Bag'}</span>
                </h1>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-luxury-cream/40 font-mono">
                  {isRTL ? 'إثبات حيازة آمن' : 'Secured Shopping Vault Session'}
                </p>
                <p className="text-xs text-gold font-mono">{cart.reduce((sum, item) => sum + item.quantity, 0)} {isRTL ? 'تحفة فنية مختارة' : 'Masterpiece(s)'}</p>
              </div>
            </div>

            {cart.length === 0 ? (
              /* Empty state container styled as fine velvet jeweler box */
              <div className="text-center py-20 px-4 max-w-xl mx-auto rounded-xl border border-gold/10 bg-luxury-dark/40 shadow-2xl relative overflow-hidden">
                <span className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                <div className="rounded-full bg-gold/5 border border-gold/20 p-5 w-fit mx-auto mb-6">
                  <ShoppingBag className="h-8 w-8 text-gold/60" />
                </div>
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-white mb-2">
                  {isRTL ? 'حقيبة الاقتناء فارغة حالياً' : 'Your Shopping Bag is Empty'}
                </h3>
                <p className="text-xs text-luxury-cream/60 leading-relaxed mb-8 max-w-md mx-auto">
                  {isRTL
                    ? 'اكتشف إبداعات حصرية لربيع وصيف ٢٠٢٦ المعززة بسبائك الذهب عيار ٢٤ قيراط لضمها لثرواتكم ومجموعتكم الفاخرة.'
                    : 'Establish your selection from our private catalog of solid gold watch designs and diamond-set works to enrich your estate portfolio.'
                  }
                </p>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="bg-gold hover:bg-white text-luxury-black text-xs uppercase font-serif font-bold tracking-widest px-8 py-3.5 rounded-md transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  {isRTL ? 'تصفح المجموعة بالكامل' : 'Explore Curated Masterpieces'}
                </button>
              </div>
            ) : (
              /* Full-grid majestic e-commerce list */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left column - item cards */}
                <div className="lg:col-span-7 space-y-4">
                  {cart.map((item) => {
                    const itemTotal = item.product.priceAED * item.quantity;
                    
                    return (
                      <div 
                        key={item.product.id}
                        className="group relative rounded-xl border border-gold/10 bg-luxury-dark/30 p-4 flex gap-4 transition-all hover:border-gold/35 overflow-hidden"
                      >
                        {/* Decorative dynamic gold glow on card hover */}
                        <div className="absolute inset-0 bg-radial-gradient from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        {/* Image Frame */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-gold/15 bg-luxury-black/90 flex-shrink-0 relative">
                          <img 
                            src={item.product.image} 
                            alt={item.product.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                        </div>
                        
                        {/* Summary Details */}
                        <div className="flex-grow flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] font-mono uppercase tracking-widest text-gold bg-gold/5 border border-gold/15 px-1.5 py-0.5 rounded">
                                  {item.product.category}
                                </span>
                                <h3 className="font-serif text-sm sm:text-base font-medium text-white tracking-wide mt-1.5">
                                  {isRTL ? item.product.nameAr : item.product.nameEn}
                                </h3>
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveFromCart(item.product.id)}
                                className="p-1 px-2 border border-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500/10 rounded transition-all cursor-pointer flex items-center justify-center bg-transparent"
                                title={isRTL ? 'إزالة من الحقيبة' : 'Remove masterpiece'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            <p className="text-[11px] text-luxury-cream/50 mt-1 line-clamp-1">
                              {isRTL ? item.product.descriptionAr : item.product.descriptionEn}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap justify-between items-center gap-3 pt-3 mt-2 border-t border-gold/5">
                            {/* Quantity Controllers */}
                            <div className="flex items-center border border-gold/30 rounded bg-luxury-black/40 overflow-hidden divide-x divide-gold/15 divide-solid">
                              <button 
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-2.5 py-1 text-gold hover:bg-gold/10 hover:text-white transition-all cursor-pointer font-serif text-xs font-bold"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3.5 py-1 text-xs font-mono text-white font-semibold bg-luxury-dark/40">{item.quantity}</span>
                              <button 
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-2.5 py-1 text-gold hover:bg-gold/10 hover:text-white transition-all cursor-pointer font-serif text-xs font-bold"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Investment value output */}
                            <div className="text-right">
                              <p className="text-[10px] text-luxury-cream/40 uppercase font-mono">
                                {isRTL ? 'الاستثمار المجموع' : 'Total Value'}
                              </p>
                              <p className="text-xs sm:text-sm text-gold font-mono font-medium">
                                {itemTotal.toLocaleString()} AED
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Right Column - Receipt summary & secure order checkout form */}
                <div className="lg:col-span-5">
                  <div className="rounded-xl border border-gold/15 bg-luxury-dark/40 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                    <span className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2 pb-3 border-b border-gold/15 font-semibold">
                      <Sparkles className="h-4 w-4 text-gold animate-pulse" />
                      <span>{isRTL ? 'بوابة الحجز والمرافقة الملكيّة' : 'Royal Booking Concierge'}</span>
                    </h3>

                    {/* Member VIP Discount activation box status */}
                    {isLoggedIn && !isAdmin ? (
                      <div className="bg-gold/5 border border-gold/30 rounded-lg p-3 text-[10px] text-gold tracking-wider flex items-center gap-2 mb-6 font-serif uppercase">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-gold flex-shrink-0" />
                        <span>
                          {isRTL 
                            ? 'تم رصد وتفعيل خصم كبار الشخصيات بنسبة ١٠٪' 
                            : 'Verified VIP Member: Elite 10% Discount active'
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="bg-luxury-black/35 border border-gold/10 rounded-lg p-3 text-[10px] text-luxury-cream/60 flex items-center justify-between gap-1 mb-6 font-serif">
                        <span>
                          {isRTL 
                            ? 'سجل كعضو كبار الشخصيات لتطبيق خصم ١٠٪' 
                            : 'Sign in to claim 10% sovereign discount'
                          }
                        </span>
                        <button 
                          type="button"
                          onClick={() => setShowLoginModal(true)}
                          className="text-[9px] uppercase tracking-wider text-gold font-serif underline hover:text-white cursor-pointer font-bold bg-transparent border-none"
                        >
                          {isRTL ? 'تفويض الدخول' : 'Sign In'}
                        </button>
                      </div>
                    )}

                    {/* Sovereign Deed Invoice calculations breakdown */}
                    <div className="space-y-3 text-xs mb-6 pb-4 border-b border-gold/10 font-mono">
                      <div className="flex justify-between text-luxury-cream/75">
                        <span>{isRTL ? 'قيمة المجموعة الأساسية:' : 'Sovereign Subtotal:'}</span>
                        <span>{cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0).toLocaleString()} AED</span>
                      </div>
                      
                      {isLoggedIn && !isAdmin && (
                        <div className="flex justify-between text-emerald-400">
                          <span>{isRTL ? 'خصم النخبة (١٠٪)-' : 'Elite Loyalty Benefit (-10%):'}</span>
                          <span>-{(cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) * 0.10).toLocaleString()} AED</span>
                        </div>
                      )}

                      <div className="flex justify-between text-luxury-cream/50">
                        <span>{isRTL ? 'ضريبة القيمة المضافة للإمارات (٥٪):' : 'UAE VAT Regulatory (5%):'}</span>
                        <span>
                          {((cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) - (isLoggedIn && !isAdmin ? cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) * 0.10 : 0)) * 0.05).toLocaleString()} AED
                        </span>
                      </div>

                      <div className="flex justify-between text-white font-bold pt-2 border-t border-gold/10 font-serif text-sm">
                        <span className="text-gold tracking-widest font-semibold">{isRTL ? 'قيمة الاستثمار الإجمالي:' : 'SOVEREIGN GRAND TOTAL:'}</span>
                        <span className="text-gold font-mono font-semibold">
                          {(
                            (cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) - (isLoggedIn && !isAdmin ? cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) * 0.10 : 0)) * 1.05
                          ).toLocaleString()} AED
                        </span>
                      </div>
                    </div>

                    {/* Elegant Client Input Form Fields */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'اسم العميل الموقّر *' : 'Client Full Name *'}
                        </label>
                        <input 
                          type="text"
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          placeholder={isRTL ? 'مثال: سمو الشيخ أحمد بن راشد' : 'Example: His Highness, Ambassador Philip'}
                          className={`w-full bg-luxury-black/60 border rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans ${formErrors.name ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                        />
                        {formErrors.name && (
                          <p className="text-[10px] text-red-400 font-sans mt-1">
                            {isRTL ? 'يرجى إدخال الاسم لتنسيق سجل الاقتناء.' : 'Client identity registration required.'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'رقم الهاتف للاتصال الجارٍ *' : 'Direct Mobile Number *'}
                        </label>
                        <input 
                          type="tel"
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          placeholder={isRTL ? 'مثال: 7510447887' : 'Example: 7510447887'}
                          className={`w-full bg-luxury-black/60 border rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-mono ${formErrors.phone ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                        />
                        {formErrors.phone && (
                          <p className="text-[10px] text-red-400 font-sans mt-1">
                            {isRTL ? 'يرجى تزويدنا برقم هاتف للتنسيق الفوري.' : 'Registered customer mobile number required.'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'عنوان التسليم الآمن أو المجلس *' : 'Armored Delivery Coordinates *'}
                        </label>
                        <textarea 
                          rows={2}
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          placeholder={isRTL ? 'مجلس قصر زعبيل، نخلة الجميرا، فندق برج العرب...' : 'Zabeel Palace Majlis, Palm Jumeirah Estate, or Burj Al Arab Suite...'}
                          className={`w-full bg-luxury-black/60 border rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans resize-none ${formErrors.address ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                        />
                        {formErrors.address && (
                          <p className="text-[10px] text-red-400 font-sans mt-1">
                            {isRTL ? 'يرجى تحديد إحداثيات التسجيل والتفريغ.' : 'Delivery coordinate points required.'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'متطلبات وعلامات مرافقة خاصة (اختياري)' : 'Bespoke Guard Requirements (Optional)'}
                        </label>
                        <input 
                          type="text"
                          value={checkoutNotes}
                          onChange={(e) => setCheckoutNotes(e.target.value)}
                          placeholder={isRTL ? 'نقش أحرف العائلة بالذهب، سيارة دبلوماسية مرافقة...' : 'Double velvet layer box, customized secure armor transport...'}
                          className="w-full bg-luxury-black/60 border border-gold/20 rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                    </div>

                    {/* Checkout on WhatsApp button */}
                    <div className="mt-6">
                      <button 
                        id="whatsapp-checkout-btn"
                        onClick={handleWhatsAppCheckout}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-4 rounded-md shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/20"
                      >
                        <Send className="h-4 w-4" />
                        <span>{isRTL ? 'تأكيد وحجز الوتساب المباشر' : 'Secure Checkout on WhatsApp'}</span>
                      </button>
                      
                      <p className="text-[9px] text-luxury-cream/40 italic text-center mt-3">
                        {isRTL 
                          ? '* بمجرد النقر، سيتم توجيه مكالمتكم مباشرة للبدء في إجراء الفحص والصياغة.' 
                          : '* Requests are guarded securely under family-office bank level privacy.'
                        }
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          /* Elegant placeholder view layout for modularly built future steps */
          <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center space-y-6 animate-slide-up">
            <div className="rounded-full bg-gold/5 border border-gold/20 p-5 mb-2">
              <Sparkles className="h-8 w-8 text-gold animate-[spin_8s_linear_infinite]" />
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-widest text-white uppercase">
              {isRTL ? (
                <>قريباً | <span className="text-gold">لوكسورا دبي</span></>
              ) : (
                <>Coming Soon | <span className="text-gold">LUXORA DUBAI</span></>
              )}
            </h2>
            <div className="w-12 h-[1px] bg-gold" />
            <p className="text-luxury-cream/70 max-w-lg text-sm leading-relaxed">
              {isRTL 
                ? `جاري الآن تهيئة صفحة "${activePage.toUpperCase()}" بالتعاون مع دور الموضة والصياغة الفلورانسيّة والسويسرية من رتبة كبار المقتنين.`
                : `We are hand-assembling the bespoke module for "${activePage.toUpperCase()}" with Florence or Swiss high artisans to host your private viewing session.`
              }
            </p>
            <button
              onClick={() => handleNavigate('home')}
              className="mt-4 font-serif text-xs font-semibold tracking-widest uppercase text-gold hover:text-white border-b border-gold hover:border-white pb-1 transition-all duration-300 bg-transparent border-none"
            >
              {isRTL ? 'العودة للصفحة الرئيسية' : 'Return to Master Collection'}
            </button>
          </section>
        )}
      </main>

      {/* Classic High-End Brand Footer */}
      <footer id="brand-footer-section" className="bg-luxury-black border-t border-gold/15 py-12 px-4 sm:px-6 lg:px-8 text-xs tracking-wider font-light text-luxury-cream/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-start" dir={isRTL ? 'rtl' : 'ltr'}>
          
          {/* Brand Col */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg tracking-[0.2em] font-extrabold text-gold">LUXORA</h4>
            <p className="max-w-xs mx-auto md:mx-0">
              {isRTL 
                ? 'الوجهة الموثوقة الأولى لاقتناء أفخر السلع والمجوهرات الحصرية في دولة الإمارات العربية المتحدة.'
                : 'The premier destination for certified fine horology, bespoke gems, and elite products in the United Arab Emirates.'
              }
            </p>
          </div>

          {/* Quick Contact info */}
          <div className="space-y-2 flex flex-col items-center md:items-start text-luxury-cream/70">
            <span className="font-serif text-[11px] font-bold text-gold uppercase tracking-widest mb-1">{isRTL ? 'تواصل معنا' : 'Concierge Desk'}</span>
            <div className="flex items-center space-x-2 space-x-reverse justify-center md:justify-start">
              <Phone className="h-3.5 w-3.5 text-gold" />
              <span>7510447887</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse justify-center md:justify-start">
              <Mail className="h-3.5 w-3.5 text-gold" />
              <span>vVIP@luxoradubai.ae</span>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-2 flex flex-col items-center md:items-start text-luxury-cream/70">
            <span className="font-serif text-[11px] font-bold text-gold uppercase tracking-widest mb-1">{isRTL ? 'موقعنا' : 'Bespoke Lounge'}</span>
            <div className="flex items-center space-x-2 space-x-reverse justify-center md:justify-start text-center md:text-start">
              <MapPin className="h-3.5 w-3.5 text-gold flex-shrink-0" />
              <span>{isRTL ? 'بوليفارد الشيخ محمد بن راشد، وسط مدينة دبي، الإمارات العربية المتحدة' : 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, United Arab Emirates'}</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gold/10 mt-10 pt-6 text-center text-[10px] text-luxury-cream/35 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            © {new Date().getFullYear()} LUXORA DUBAI. {isRTL ? 'جميع الحقوق محفوظة.' : 'All Sovereign Rights Reserved.'}
          </p>
          <div className="flex space-x-6 space-x-reverse text-gold/60">
            <a href="#" className="hover:text-gold transition-colors">{isRTL ? 'الشروط والأحكام' : 'Terms of Use'}</a>
            <a href="#" className="hover:text-gold transition-colors">{isRTL ? 'سياسة الخصوصية' : 'Privacy & Security Protocol'}</a>
          </div>
        </div>
      </footer>

      {/* Render the Luxury Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        lang={lang}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
