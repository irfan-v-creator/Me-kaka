import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, User, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (email: string, isAdmin: boolean) => void;
}

export default function LoginModal({ isOpen, onClose, lang, onLoginSuccess }: LoginModalProps) {
  if (!isOpen) return null;

  const isRTL = lang === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Premium backdrop Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-500" 
      />

      {/* Main Luxury Modal Body */}
      <div 
        className="relative w-full max-w-md bg-luxury-dark/95 border border-gold/30 rounded-2xl shadow-[0_15px_50px_rgba(212,175,55,0.15)] overflow-hidden animate-slide-up"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Subtle royal golden top streak */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

        {/* Close Button styling */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-cream/50 hover:text-gold transition-colors p-2 rounded-full hover:bg-gold/5"
          title={isRTL ? 'إغلاق' : 'Close'}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content Area */}
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
      </div>
    </div>
  );
}
