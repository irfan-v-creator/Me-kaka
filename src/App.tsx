import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Globe, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import AdminPortal from './components/AdminPortal';
import SEOManager from './components/SEOManager';
import LoginModal from './components/LoginModal';
import { Language, Product } from './types';
import { LUXURY_PRODUCTS } from './data';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activePage, setActivePage] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>(LUXURY_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Professional Session & Role-Based Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

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
            <ProductShowcase lang={lang} products={products} searchQuery={searchQuery} />
          </div>
        ) : activePage === 'shop' ? (
          <div className="py-6">
            <ProductShowcase lang={lang} products={products} searchQuery={searchQuery} />
          </div>
        ) : activePage === 'admin-portal' ? (
          <AdminPortal
            lang={lang}
            products={products}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            isAuthenticated={isLoggedIn && isAdmin}
            onLogout={handleLogout}
            onLogin={handleLoginRaw}
          />
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
              className="mt-4 font-serif text-xs font-semibold tracking-widest uppercase text-gold hover:text-white border-b border-gold hover:border-white pb-1 transition-all duration-300"
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
              <span>+971 4 555 LUXE (5893)</span>
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
