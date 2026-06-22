import React, { useState } from 'react';
import { Menu, X, Globe, ShoppingBag, User } from 'lucide-react';
import { Language, NavItem } from '../types';

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onNavigate: (page: string) => void;
  activePage: string;
}

export const navItems: NavItem[] = [
  { labelEn: 'Shop Collection', labelAr: 'تسوق المجموعة', href: 'shop' },
  { labelEn: 'Categories', labelAr: 'الفئات', href: 'categories' },
  { labelEn: 'Bespoke Experience', labelAr: 'التجربة الخاصة', href: 'bespoke' },
  { labelEn: 'About Luxora', labelAr: 'عن لوكسورا', href: 'about' }
];

export default function Navbar({ lang, setLang, onNavigate, activePage }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  const isRTL = lang === 'ar';

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
              className="flex flex-col items-start text-left focus:outline-none"
            >
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-gold hover:text-gold-light transition-all duration-300">
                LUXORA
              </span>
              <span className={`text-[9px] font-mono tracking-[0.4em] uppercase text-luxury-cream/60 ${isRTL ? 'mr-0.5' : 'ml-0.5'}`}>
                {isRTL ? 'دبي' : 'DUBAI'}
              </span>
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

            {/* Profile Placeholder (Luxury UI) */}
            <button 
              id="user-profile-btn"
              className="text-luxury-cream/80 hover:text-gold transition-colors duration-300"
              title={isRTL ? 'حسابي' : 'My Account'}
            >
              <User className="h-5 w-5" />
            </button>

            {/* Cart Button */}
            <button
              id="cart-btn"
              onClick={() => onNavigate('cart')}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300"
              title={isRTL ? 'حقيبة التسوق' : 'Shopping Bag'}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-luxury-black">
                1
              </span>
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

            <button
              id="cart-btn-mobile"
              onClick={() => onNavigate('cart')}
              className="relative text-luxury-cream/80 hover:text-gold transition-colors duration-300"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[8px] font-bold text-luxury-black">
                1
              </span>
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

              <div className="flex space-x-4 space-x-reverse">
                <button 
                  id="mobile-user-profile-btn"
                  className="rounded-full bg-luxury-dark p-2 text-luxury-cream border border-gold/15"
                >
                  <User className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
