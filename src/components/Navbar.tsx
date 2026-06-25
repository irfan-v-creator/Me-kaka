import React, { useState } from 'react';
import { Menu, X, Globe, ShoppingBag, User, Search, LogOut, Crown, ShieldAlert, Sparkles, Heart, Award } from 'lucide-react';
import { Language, NavItem } from '../types';

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
  cartCount?: number;
  favoritesCount?: number;
  onOpenWishlist?: () => void;
  onOpenAcquisitions?: () => void;
}

export const navItems: NavItem[] = [
  { labelEn: 'Shop Collection', labelAr: 'تسوق المجموعة', href: 'shop' },
  { labelEn: 'Categories', labelAr: 'الفئات', href: 'categories' },
  { labelEn: 'Bespoke Experience', labelAr: 'التجربة الخاصة', href: 'bespoke' },
  { labelEn: 'About Styles & Grace', labelAr: 'عن ستايلز آند جريس', href: 'about' }
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
  cartCount = 0,
  favoritesCount = 0,
  onOpenWishlist,
  onOpenAcquisitions
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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

  return (
    <nav 
      id="main-navbar" 
      className="sticky top-0 z-50 w-full border-b border-gold/10 bg-luxury-black/90 backdrop-blur-md transition-all duration-300"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Brand/Logo */}
          <div className="flex items-center">
            <button 
              id="brand-logo-btn"
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-2.5 text-left focus:outline-none group ${isRTL ? 'flex-row-reverse text-right' : 'flex-row'}`}
            >
              <Crown className="h-6 w-6 text-[#e5c158] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 shrink-0" />
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.08em] text-gold hover:text-gold-light transition-all duration-300">
                  Styles & Grace
                </span>
                <span className={`text-[8px] font-mono tracking-[0.2em] uppercase text-luxury-cream/60 ${isRTL ? 'mr-0.5' : 'ml-0.5'}`}>
                  {isRTL ? 'الكرامة - دبي' : 'KARAMA - DUBAI'}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
              {navItems.map((item) => {
                const isActive = activePage === item.href;
                return (
                  <button
                    key={item.href}
                    id={`nav-link-${item.href}`}
                    onClick={() => onNavigate(item.href)}
                    className={`relative py-2 font-serif text-sm tracking-widest uppercase transition-colors duration-300 hover:text-gold ${
                      isActive ? 'text-gold' : 'text-luxury-cream/80'
                    }`}
                  >
                    {isRTL ? item.labelAr : item.labelEn}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 h-[1px] w-full bg-gold shadow-[0_1px_8px_rgba(212,175,55,0.6)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Luxury Utility Tools: Language, Cart, Profile */}
          <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse space-x-6' : 'space-x-6'}`}>
            {/* Language Toggle Button */}
            <button
              id="lang-toggle-desktop"
              onClick={toggleLanguage}
              className="group flex items-center space-x-2 space-x-reverse rounded-full border border-gold/20 bg-luxury-dark px-4 py-1.5 text-xs tracking-wider text-luxury-cream transition-all duration-300 hover:border-gold hover:bg-gold/5"
            >
              <Globe className="h-3.5 w-3.5 text-gold group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-medium">
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gold/20 bg-gold/5 hover:border-gold hover:bg-gold/15 text-gold text-xs uppercase tracking-widest font-serif font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(229,193,88,0.05)] hover:shadow-[0_0_15px_rgba(229,193,88,0.15)]"
              >
                <Award className="h-3.5 w-3.5" />
                <span>{isRTL ? 'مقتنياتي' : 'MY ACQUISITIONS'}</span>
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
                <User className="h-4.5 w-4.5" />
                {isLoggedIn && (
                  <span className="text-[10px] uppercase tracking-widest font-serif max-w-[85px] truncate">
                    {isAdmin ? (isRTL ? 'صاحب المتجر' : 'Owner') : (isRTL ? 'عضو نخبة' : 'VIP Member')}
                  </span>
                )}
                {isLoggedIn && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse animate-duration-1000" />
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
                      {isRTL ? 'بيانات الجلسة المعتمدة' : 'SECURED SESSION ACTIVE'}
                    </span>
                    <h5 className="font-serif text-xs font-bold text-white max-w-[200px] truncate">
                      {userEmail}
                    </h5>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 bg-gold/10 border border-gold/30 text-[9px] text-gold uppercase px-1.5 py-0.5 font-serif rounded">
                        <Crown className="h-2.5 w-2.5" />
                        {isRTL ? 'المالك الموقر' : 'Royal Administrator'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-emerald-950/20 border border-emerald-500/30 text-[9px] text-emerald-400 uppercase px-1.5 py-0.5 font-sans rounded">
                        <Sparkles className="h-2.5 w-2.5 text-gold" />
                        {isRTL ? 'رتبة كبار المقتنين VIP' : 'Emerald Sovereign VIP'}
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
                    <span>{isRTL ? 'الملف وسجل الفواتير' : 'Profile & Invoices'}</span>
                  </button>

                  {/* Context Links */}
                  <div className="space-y-2">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          onNavigate('admin-portal');
                        }}
                        className="w-full text-start text-xs font-serif text-luxury-cream hover:text-gold transition-colors block py-1 cursor-pointer"
                      >
                        {isRTL ? '⚙️ فتح لوحة التحكم الرئيسية' : '⚙️ Launch Control Suite'}
                      </button>
                    )}
                    
                    {!isAdmin && (
                      <div className="rounded bg-gold/5 p-2 text-[10px] text-gold/80 leading-relaxed font-sans border border-gold/10">
                        <strong className="block mb-1">{isRTL ? 'امتيازات العضو VIP:' : 'VIP Privileges Secured:'}</strong>
                        <ul className="list-disc pl-3 space-y-0.5 text-luxury-cream/80 text-[9px]" dir={isRTL ? 'rtl' : 'ltr'}>
                          <li>{isRTL ? 'تصفح مخزون الخزنة الملكية الخاص' : 'Access Royal Vault items'}</li>
                          <li>{isRTL ? 'دخول صالات كبار الشخصيات بنادي دبي مول' : 'Dubai Mall VIP Lounge access'}</li>
                          <li>{isRTL ? 'توصيل مصفح ومؤمّن مجانيّ بالكامل' : 'Complimentary armored delivery'}</li>
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
                    <span>{isRTL ? 'إنهاء الجلسة الآمنة' : 'Terminate Secure Session'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              id="wishlist-btn"
              onClick={onOpenWishlist}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300 pointer-events-auto cursor-pointer"
              title={isRTL ? 'قائمة الأمنيات الملكية' : 'Sovereign Wishlist'}
            >
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-luxury-black animate-pulse">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-btn"
              onClick={() => onNavigate('cart')}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300 pointer-events-auto cursor-pointer"
              title={isRTL ? 'حقيبة التسوق' : 'Shopping Bag'}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-luxury-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Action Button */}
          <div className="flex md:hidden items-center space-x-4 space-x-reverse">
            {/* Mobile language switch shortcut */}
            <button
              id="lang-toggle-mobile"
              onClick={toggleLanguage}
              className="rounded-full border border-gold/20 px-2 py-1 text-[10px] uppercase text-gold"
            >
              {lang === 'en' ? 'AR' : 'EN'}
            </button>

            {/* Mobile Wishlist Button */}
            <button
              id="wishlist-btn-mobile"
              onClick={onOpenWishlist}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300 cursor-pointer"
              title={isRTL ? 'قائمة الأمنيات الملكية' : 'Sovereign Wishlist'}
            >
              <Heart className="h-5 w-5" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-luxury-black">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              id="cart-btn-mobile"
              onClick={() => onNavigate('cart')}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300 cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-luxury-black">
                  {cartCount}
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

      {/* Premium Minimalist Luxury Search Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-md mx-auto relative group">
          <div className="relative flex items-center bg-black/40 border border-gold/25 hover:border-gold/50 rounded-full py-1 px-4 transition-all duration-300 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold/30 focus-within:shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Search className={`h-4 w-4 text-gold shrink-0 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <input
              id="luxury-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن الإبداعات الفاخرة...' : 'Search luxury creations...'}
              className="w-full bg-transparent text-xs text-luxury-cream placeholder:text-luxury-cream/40 focus:outline-none border-none py-1.5 focus:ring-0 focus:border-transparent"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="text-luxury-cream/40 hover:text-gold transition-colors p-1 shrink-0"
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
                {isRTL ? 'مقتنياتي الملكية' : 'MY ACQUISITIONS'}
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
