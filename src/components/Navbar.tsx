import React, { useState } from 'react';
import { Menu, X, Globe, ShoppingBag, User, Search, LogOut, Crown, ShieldAlert, Sparkles, Heart, Award } from 'lucide-react';
import { Language, NavItem } from '../types';
import { LUXURY_PRODUCTS } from '../data';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onNavigate: (page: string) => void;
  activePage: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  favoritesCount?: number;
  onOpenWishlist?: () => void;
  onOpenAcquisitions?: () => void;
}

export const navItems: NavItem[] = [
  { labelEn: 'Silver Collection', labelAr: 'المقتنيات الفضية', href: 'silver' },
  { labelEn: 'Luxury Timepieces', labelAr: 'الساعات الفاخرة', href: 'watches' },
  { labelEn: 'Aromatics/Perfumes', labelAr: 'النفحات العطرية', href: 'fragrances' },
  { labelEn: 'Contact Us', labelAr: 'تواصل معنا', href: 'contact' }
];

export default function Navbar({ 
  lang, 
  setLang, 
  onNavigate, 
  activePage, 
  searchQuery, 
  setSearchQuery,
  isLoggedIn,
  isAdmin,
  userEmail,
  onOpenLogin,
  onLogout,
  favoritesCount = 0,
  onOpenWishlist,
  onOpenAcquisitions
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  const isRTL = lang === 'ar';

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setShowProfileDropdown((prev) => !prev);
    } else {
      onOpenLogin();
    }
  };

  const handleLogoutClick = () => {
    setShowProfileDropdown(false);
    onLogout();
  };

  // Filter products for dynamic auto-suggest dropdown
  const suggestions = searchQuery.trim()
    ? LUXURY_PRODUCTS.filter(p =>
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nameAr && p.nameAr.includes(searchQuery)) ||
        p.categoryEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.categoryAr && p.categoryAr.includes(searchQuery))
      ).slice(0, 5)
    : [];

  return (
    <nav 
      id="main-navbar" 
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-[#0d0d0d] border-gold/20 shadow-lg py-1' 
          : 'bg-luxury-black/95 backdrop-blur-md border-gold/10 py-2.5'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          
          {/* Brand/Logo & Navigation Links Right Next To It */}
          <div className="flex items-center gap-6 lg:gap-8">
            <button 
              id="brand-logo-btn"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2.5 text-left focus:outline-none group ${isRTL ? 'flex-row-reverse text-right' : 'flex-row'}`}
            >
              <Crown className="h-6 w-6 text-[#e5c158] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.08em] text-gold hover:text-gold-light transition-all duration-300">
                  Styles & Grace
                </span>
                <span className={`text-[8px] font-mono tracking-[0.2em] uppercase text-luxury-cream/60 ${isRTL ? 'mr-0.5' : 'ml-0.5'}`}>
                  {isRTL ? 'الكرامة - دبي' : 'KARAMA - DUBAI'}
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links (Mega Menu style) next to Logo */}
            <div className="hidden xl:flex items-center">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'}`}>
                {navItems.map((item) => {
                  const isActive = activePage === item.href;
                  return (
                    <button
                      key={item.href}
                      id={`nav-link-${item.href}`}
                      onClick={() => onNavigate(item.href)}
                      className={`relative py-2 font-serif text-[11px] lg:text-xs tracking-widest uppercase transition-all duration-300 hover:text-gold whitespace-nowrap cursor-pointer ${
                        isActive ? 'text-gold font-bold' : 'text-luxury-cream/70 hover:text-gold'
                      }`}
                    >
                      {isRTL ? item.labelAr : item.labelEn}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 h-[1.5px] w-full bg-gold shadow-[0_1px_8px_rgba(212,175,55,0.6)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Centered Prominent Search Bar with Auto-suggest */}
          <div className="hidden md:block flex-1 max-w-md mx-auto relative group">
            <div className="relative flex items-center bg-black/60 border border-gold/25 hover:border-gold/50 rounded-full py-2 px-4 transition-all duration-300 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/30 focus-within:shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Search className={`h-4 w-4 text-gold shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <input
                id="luxury-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                placeholder={isRTL ? 'ابحث عن الإبداعات الفاخرة...' : 'Search luxury creations...'}
                className="w-full bg-transparent text-xs text-luxury-cream placeholder:text-luxury-cream/40 focus:outline-none border-none py-1 focus:ring-0 focus:border-transparent"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="text-luxury-cream/40 hover:text-gold transition-colors p-1 shrink-0 cursor-pointer"
                  title={isRTL ? 'مسح البحث' : 'Clear Search'}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Auto-suggest UI Dropdown container */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                className={`absolute top-full left-0 right-0 mt-2 bg-[#0d0d0d] border border-gold/30 rounded-lg shadow-2xl overflow-hidden z-50 text-start animate-fade-in`} 
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <div className="p-2.5 border-b border-gold/10 bg-gold/5">
                  <span className="text-[9px] tracking-widest text-gold uppercase font-serif font-bold">
                    {isRTL ? 'مقترحات حصرية' : 'Exclusive Suggestions'}
                  </span>
                </div>
                <div className="divide-y divide-gold/10 max-h-[350px] overflow-y-auto">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => {
                        setSearchQuery(product.nameEn);
                        setShowSuggestions(false);
                        onNavigate('home');
                        setTimeout(() => {
                          const el = document.getElementById('product-showcase-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 100);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gold/10 text-left transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded bg-luxury-dark border border-gold/20 flex items-center justify-center text-gold shrink-0 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.nameEn} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-[11px] text-white font-medium truncate">
                          {isRTL ? product.nameAr : product.nameEn}
                        </h4>
                        <p className="text-[8px] text-gold font-mono uppercase">
                          {isRTL ? product.categoryAr : product.categoryEn}
                        </p>
                      </div>
                      <div className="text-[10px] text-gold font-mono shrink-0">
                        AED {product.priceAED}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Luxury Utility Tools: Language, Cart, Profile */}
          <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-5' : 'space-x-5'}`}>
            {/* Language Toggle Button */}
            <button
              id="lang-toggle-desktop"
              onClick={toggleLanguage}
              className="group flex items-center space-x-1.5 space-x-reverse rounded-full border border-gold/20 bg-luxury-dark px-3 py-1.5 text-xs tracking-wider text-luxury-cream transition-all duration-300 hover:border-gold hover:bg-gold/5 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5 text-gold group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium text-[10px]">
                {lang === 'en' ? 'العربية' : 'English'}
              </span>
            </button>

            {/* Elegant Profile Authenticated Status & User Trigger */}
            {isLoggedIn && (
              <button
                id="nav-link-desktop-acquisitions"
                onClick={() => {
                  if (onOpenAcquisitions) {
                    onOpenAcquisitions();
                  } else {
                    onOpenLogin();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 hover:border-gold hover:bg-gold/15 text-gold text-[10px] uppercase tracking-widest font-serif font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(229,193,88,0.05)]"
              >
                <Award className="h-3.5 w-3.5" />
                <span>{isRTL ? 'مقتنياتي' : 'MY ORDERS'}</span>
              </button>
            )}

            {isLoggedIn && userEmail?.toLowerCase().trim() === 'konami5miv@gmail.com' && (
              <button
                id="nav-link-desktop-admin-portal"
                onClick={() => onNavigate('admin-portal')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold hover:text-luxury-black text-[#e5c158] hover:text-luxury-black text-[10px] uppercase tracking-widest font-serif font-bold transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              >
                <Crown className="h-3.5 w-3.5 text-gold" />
                <span>{isRTL ? 'الخزنة الملكية' : 'Admin Panel'}</span>
              </button>
            )}

            <div className="relative">
              <button 
                id="user-profile-btn"
                onClick={handleProfileClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/15 transition-all duration-300 hover:border-gold hover:bg-gold/5 cursor-pointer ${
                  isLoggedIn ? 'text-gold' : 'text-luxury-cream/80 hover:text-gold'
                }`}
                title={isRTL ? 'حسابي وبوابتي' : 'My Account & Gateway'}
              >
                <User className="h-4 w-4 text-gold" />
                {isLoggedIn ? (
                  <>
                    <span className="text-[10px] uppercase tracking-widest font-serif max-w-[85px] truncate">
                      {userEmail?.toLowerCase().trim() === 'konami5miv@gmail.com' ? (isRTL ? 'صاحب المتجر' : 'Owner') : (isRTL ? 'عضو نخبة' : 'VIP Member')}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </>
                ) : (
                  <span className="text-[10px] uppercase tracking-widest font-serif font-bold text-gold">
                    {isRTL ? 'تسجيل الدخول' : 'Sign In / Login'}
                  </span>
                )}
              </button>

              {/* Magnificent Dropdown Menu */}
              {showProfileDropdown && isLoggedIn && (
                <div 
                  className={`absolute top-full mt-3 ${isRTL ? 'left-0' : 'right-0'} w-64 bg-luxury-dark/95 border border-gold/30 rounded-xl shadow-2xl p-5 z-50 text-start space-y-4`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-gold/30 via-gold to-gold/30 rounded-t-xl" />
                  
                  {/* Account Header */}
                  <div className="space-y-1">
                    <span className="block text-[8px] uppercase tracking-widest text-gold/60 font-mono">
                      {isRTL ? 'بيانات الجلسة المعتمدة' : 'VIP SESSION ACTIVE'}
                    </span>
                    <h5 className="font-serif text-xs font-bold text-white max-w-[200px] truncate">
                      {userEmail}
                    </h5>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 bg-gold/10 border border-gold/30 text-[9px] text-gold uppercase px-1.5 py-0.5 font-serif rounded">
                        <Crown className="h-2.5 w-2.5" />
                        {isRTL ? 'المالك الموقر' : 'Admin'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-950/20 border border-emerald-500/30 text-[9px] text-emerald-400 uppercase px-1.5 py-0.5 font-sans rounded">
                        <Sparkles className="h-2.5 w-2.5 text-gold" />
                        {isRTL ? 'رتبة كبار المقتنين VIP' : 'VIP Account'}
                      </span>
                    )}
                  </div>

                  <div className="w-full h-[1px] bg-gold/10" />

                  {/* View Profile Button */}
                  <button
                    onClick={() => {
                      setShowProfileDropdown(false);
                      onOpenLogin();
                    }}
                    className="w-full text-center bg-gold/10 hover:bg-gold/20 border border-gold/30 hover:border-gold rounded py-2 text-xs font-serif font-bold uppercase tracking-widest text-gold hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>{isRTL ? 'الملف وسجل الفواتير' : 'Profile & Orders'}</span>
                  </button>

                  {/* Context Links */}
                  <div className="space-y-2">
                    {isLoggedIn && userEmail?.toLowerCase().trim() === 'konami5miv@gmail.com' && (
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          onNavigate('admin-portal');
                        }}
                        className="w-full text-start text-xs font-serif text-luxury-cream hover:text-gold transition-colors block py-1 cursor-pointer"
                      >
                        {isRTL ? '⚙️ فتح لوحة التحكم الرئيسية' : '⚙️ Admin Dashboard'}
                      </button>
                    )}
                    
                    {!isAdmin && (
                      <div className="rounded bg-gold/5 p-2 text-[10px] text-gold/80 leading-relaxed font-sans border border-gold/10">
                        <strong className="block mb-1">{isRTL ? 'امتيازات العضو VIP:' : 'VIP Benefits:'}</strong>
                        <ul className="list-disc pl-3 space-y-0.5 text-luxury-cream/80 text-[9px]" dir={isRTL ? 'rtl' : 'ltr'}>
                          <li>{isRTL ? 'تصفح مخزون الخزنة الملكية الخاص' : 'Exclusive product items'}</li>
                          <li>{isRTL ? 'دخول صالات كبار الشخصيات بنادي دبي مول' : 'Priority customer support'}</li>
                          <li>{isRTL ? 'توصيل مصفح ومؤمّن مجانيّ بالكامل' : 'Free courier delivery'}</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Sign Out Action */}
                  <button
                    onClick={handleLogoutClick}
                    className="w-full bg-red-950/20 hover:bg-red-950/60 border border-red-500/20 hover:border-red-500/50 rounded p-2 text-[10px] font-serif uppercase tracking-widest text-red-400 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>{isRTL ? 'إنهاء الجلسة الآمنة' : 'Logout'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300 pointer-events-auto cursor-pointer"
              title={isRTL ? 'قائمة الأمنيات الملكية' : 'Wishlist'}
            >
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-luxury-black animate-pulse shadow-[0_0_8px_#e5c158]">
                  {favoritesCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Action Button */}
          <div className="flex md:hidden items-center space-x-3 space-x-reverse">
            {/* Mobile language switch shortcut */}
            <button
              id="lang-toggle-mobile"
              onClick={toggleLanguage}
              className="rounded-full border border-gold/20 px-2 py-0.5 text-[10px] uppercase text-gold"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>

            {/* Mobile Wishlist Button */}
            <button
              id="wishlist-btn-mobile"
              onClick={onOpenWishlist}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300 cursor-pointer"
              title={isRTL ? 'قائمة الأمنيات الملكية' : 'Wishlist'}
            >
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-luxury-black">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-luxury-cream hover:text-gold focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile-only Search Bar */}
      <div className="mx-auto max-w-7xl px-4 pb-4 md:hidden">
        <div className="max-w-md mx-auto relative group">
          <div className="relative flex items-center bg-black/40 border border-gold/25 hover:border-gold/50 rounded-full py-1.5 px-4 transition-all duration-300 focus-within:border-gold">
            <Search className={`h-4 w-4 text-gold shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <input
              id="luxury-search-input-mobile"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن الإبداعات الفاخرة...' : 'Search luxury creations...'}
              className="w-full bg-transparent text-xs text-luxury-cream placeholder:text-luxury-cream/40 focus:outline-none border-none py-1 focus:ring-0 focus:border-transparent"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {searchQuery && (
              <button
                id="clear-search-btn-mobile"
                onClick={() => setSearchQuery('')}
                className="text-luxury-cream/40 hover:text-gold transition-colors p-1 shrink-0 cursor-pointer"
                title={isRTL ? 'مسح البحث' : 'Clear Search'}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div id="mobile-drawer" className="md:hidden border-t border-gold/10 bg-luxury-black px-4 py-6 animate-fade-in">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => {
              const isActive = activePage === item.href;
              return (
                <button
                  key={item.href}
                  id={`nav-link-mobile-${item.href}`}
                  onClick={() => {
                    onNavigate(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-3 text-start font-serif text-base tracking-widest uppercase border-b border-gold/5 ${
                    isActive ? 'text-gold font-bold' : 'text-luxury-cream/80'
                  }`}
                >
                  {isRTL ? item.labelAr : item.labelEn}
                </button>
              );
            })}
            
            {isLoggedIn && (
              <button
                id="nav-link-mobile-acquisitions"
                onClick={() => {
                  if (onOpenAcquisitions) {
                    onOpenAcquisitions();
                  } else {
                    onOpenLogin();
                  }
                  setMobileMenuOpen(false);
                }}
                className="py-3 text-start font-serif text-base tracking-widest uppercase border-b border-gold/5 text-luxury-cream/80 hover:text-gold transition-all duration-300"
              >
                {isRTL ? 'مقتنياتي الملكية' : 'MY ORDERS'}
              </button>
            )}

            {isLoggedIn && userEmail?.toLowerCase().trim() === 'konami5miv@gmail.com' && (
              <button
                id="nav-link-mobile-admin-portal"
                onClick={() => {
                  onNavigate('admin-portal');
                  setMobileMenuOpen(false);
                }}
                className="py-3 text-start font-serif text-base tracking-widest uppercase border-b border-gold/5 text-gold hover:text-white transition-all duration-300"
              >
                {isRTL ? 'الخزنة الملكية' : 'SOVEREIGN VAULT'}
              </button>
            )}
            
            <div className="pt-4 flex items-center justify-between">
              <button
                id="lang-toggle-mobile-drawer"
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 space-x-reverse rounded-full border border-gold/30 bg-luxury-dark px-4 py-2 text-sm text-gold"
              >
                <Globe className="h-4 w-4" />
                <span>{lang === 'en' ? 'العربية (Arabic)' : 'English'}</span>
              </button>

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onOpenLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-start focus:outline-none"
                    >
                      <User className="h-4 w-4 text-gold" />
                      <div className="text-start">
                        <span className="block text-[8px] uppercase text-gold tracking-widest font-mono">{isAdmin ? (isRTL ? 'المالك الموقر' : 'ROYAL OWNER') : (isRTL ? 'عضو كبار الشخصيات' : 'VIP MEMBER')}</span>
                        <span className="block text-[10px] text-white/70 max-w-[100px] truncate">{userEmail}</span>
                      </div>
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          onNavigate('admin-portal');
                          setMobileMenuOpen(false);
                        }}
                        className="p-2 border border-gold/20 rounded-full text-gold bg-gold/5 cursor-pointer"
                        title="Control Suite"
                      >
                        <Crown className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        handleLogoutClick();
                        setMobileMenuOpen(false);
                      }}
                      className="p-2 border border-red-500/30 rounded-full text-red-400 bg-red-950/20 cursor-pointer"
                      title={isRTL ? 'تسجيل الخروج' : 'Log Out'}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    id="mobile-user-profile-btn"
                    onClick={() => {
                      onOpenLogin();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-luxury-dark text-luxury-cream border border-gold/35 rounded-full text-xs font-serif uppercase tracking-widest cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5 text-gold" />
                    <span>{isRTL ? 'دخول' : 'Sign In'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
