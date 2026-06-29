import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import { Language } from '../types';

interface HeroCarouselProps {
  lang: Language;
  onExplore: () => void;
}

export default function HeroCarousel({ lang, onExplore }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isRTL = lang === 'ar';

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200',
      badgeEn: 'PREMIUM SILVER COLLECTION',
      badgeAr: 'فضة إيطالية فاخرة عيار ٩٢٥',
      titleEn: 'TIMELESS CRAFTSMANSHIP IN DUBAI',
      titleAr: 'حرفية خالدة وفضة ملكية في دبي',
      descEn: 'Discover our exclusive selection of premium Italian silver jewelry in Dubai. Beautifully designed, completely non-tarnish, with a lifetime guarantee of brilliance.',
      descAr: 'اكتشف مجموعتنا السيادية المنسقة من الفضة الإيطالية الفاخرة عيار ٩٢٥ والمجوهرات الراقية في دبي، والمحمية يدوياً بالكامل ضد تغير اللون مدى الحياة.',
      ctaEn: 'EXPLORE COLLECTION',
      ctaAr: 'تصفح الصياغة الملوكية'
    },
    {
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=1200',
      badgeEn: 'PREMIUM TIMEPIECES',
      badgeAr: 'ساعات الكرونوجراف السيادية الحصرية',
      titleEn: 'EXCLUSIVE LUXURY WATCHES',
      titleAr: 'ساعات يد استثنائية للنخبة',
      descEn: 'Premium mechanical watches of unrivaled quality. Engineered with timeless craftsmanship, Swiss accuracy, and free courier delivery.',
      descAr: 'ساعات يد ميكانيكية فاخرة لا تضاهى. صُممت بحرفية متناهية ودقة خالدة لتعكس هيبتك، مع خدمة توصيل مصفّح خاص في دبي.',
      ctaEn: 'SHOP WATCHES',
      ctaAr: 'اقتنِ الساعات الفخمة'
    },
    {
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200',
      badgeEn: 'PREMIUM FRAGRANCES',
      badgeAr: 'دهن العود والعبير الفاخر',
      titleEn: 'EXCLUSIVE DUBAI OUD & PERFUMES',
      titleAr: 'خلاصات العود والنفحات الحصرية',
      descEn: 'Experience pure Cambodian agarwood and exquisite French perfumes. Intense, long-lasting fragrances designed for any occasion.',
      descAr: 'خلاصات العود الكمبودي النقي والعطور الباريسية الفاخرة المصنوعة يدوياً. ثبات وقوة فوحان استثنائية تعبر عن مهابة حضورك ونبالته.',
      ctaEn: 'SHOP FRAGRANCES',
      ctaAr: 'اكتشف عبير النخبة'
    }
  ];

  // Autoplay feature
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[450px] overflow-hidden bg-black border-b border-gold/15" dir="ltr">
      {/* Slide Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0.4, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.4, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Unsplash Background */}
          <img
            src={slides[currentIndex].image}
            alt={slides[currentIndex].titleEn}
            className="w-full h-full object-cover object-center opacity-40 select-none"
            referrerPolicy="no-referrer"
          />
          {/* Elegant Dark Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/90 via-transparent to-luxury-black/90" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container (Perfect Responsive Layout) */}
      <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-12 lg:px-24">
        <div className="max-w-4xl text-center space-y-4 sm:space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
          {/* Animated Seasonal Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[9px] sm:text-[11px] tracking-[0.2em] uppercase font-mono shadow-[0_0_15px_rgba(229,193,88,0.1)]"
          >
            <Sparkles className="h-3 w-3 animate-pulse text-gold" />
            <span>{isRTL ? slides[currentIndex].badgeAr : slides[currentIndex].badgeEn}</span>
          </motion.div>

          {/* Animated Header */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-serif text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-[0.05em] uppercase leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
          >
            {isRTL ? slides[currentIndex].titleAr : slides[currentIndex].titleEn}
          </motion.h1>

          {/* Animated Subtitle Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-luxury-cream/80 text-xs sm:text-base max-w-2xl mx-auto font-light leading-relaxed tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            {isRTL ? slides[currentIndex].descAr : slides[currentIndex].descEn}
          </motion.p>

          {/* Animated Call-to-action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="pt-2"
          >
            <button
              onClick={onExplore}
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded bg-gradient-to-r from-[#e5c158] to-[#cba33f] text-luxury-black text-xs sm:text-sm tracking-widest font-serif font-black uppercase transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(229,193,88,0.4)] cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span>{isRTL ? slides[currentIndex].ctaAr : slides[currentIndex].ctaEn}</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full border border-gold/15 bg-luxury-black/60 hover:border-gold/50 hover:bg-gold/10 text-gold transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 z-10"
        title="Previous Offer"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2.5 rounded-full border border-gold/15 bg-luxury-black/60 hover:border-gold/50 hover:bg-gold/10 text-gold transition-all duration-300 cursor-pointer shadow-lg hover:scale-105 z-10"
        title="Next Offer"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Navigation Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-6 bg-gold' : 'w-2 bg-gold/20 hover:bg-gold/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
