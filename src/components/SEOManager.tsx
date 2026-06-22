import React from 'react';
import { Language } from '../types';

interface SEOManagerProps {
  lang: Language;
}

/**
 * SEOManager leverages React 19's native metadata hoisting capabilities.
 * Any <title>, <meta>, or <link> elements rendered here are automatically
 * hoisted directly into the document's real <head> by the browser runtime,
 * dynamically reflecting correct multi-lingual status.
 */
export default function SEOManager({ lang }: SEOManagerProps) {
  const isRTL = lang === 'ar';
  
  const title = isRTL 
    ? "لوكسورا دبي | ساعات فاخرة وعطور راقية بدبي عيار ٢٤" 
    : "LUXORA Dubai | Premium Luxury Watches & Haute Perfumery";
    
  const description = isRTL 
    ? "اكتشف البوابة الأولى والحصرية لأفخر الساعات السويسرية والماس عيار ٢٤ قيراط والعطور المخصصة لنخبة مجتمع دبي والخليج العربي مع خدمة التوصيل المصفح الآمن في دوان تاون دبي."
    : "Immerse in Dubai's premier elite portal for 24K solid gold Swiss watches, custom eternity diamond jewelry, and royal Oud fragrances. Serving Downtown Dubai with secure armored escrows.";

  const keywords = isRTL
    ? "ساعات دبي الفاخرة, عطور عود نادرة, مجوهرات دوان تاون, سلع ملكية دبي Mall, توصيل مصفح مجوهرات دبي, Luxora Dubai, ساعات رولكس دبي, عطور عود فاخرة"
    : "Luxury watches UAE, luxury watches Dubai, bespoke jewelry Downtown Dubai, premium Oud fragrances, gift sets Dubai Mall boutique, Swiss tourbillon Dubai, Luxora Dubai, gold watches Middle East";

  // A breathtaking high-resolution curated cover image suited for Open Graph rich previews (1200 x 630 pixels)
  const ogImageUrl = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1200&h=630";
  const siteUrl = "https://luxoradubai.ae";

  return (
    <>
      {/* React 19 Document Title Hoisting */}
      <title>{title}</title>
      
      {/* Standard Meta Tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="LUXORA Dubai Corporate Office" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#0A0A0A" />
      
      {/* Open Graph / Facebook & Professional Rich Messenger Previews */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:site_name" content="LUXORA Dubai" />
      <meta property="og:locale" content={isRTL ? "ar_AE" : "en_US"} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* UAE Geographic Localized Tags for Search Optimization targeting Downtown Burj District & DM */}
      <meta name="geo.region" content="AE-DU" />
      <meta name="geo.placename" content="Dubai, Downtown Burj District" />
      <meta name="geo.position" content="25.1972;55.2744" />
      <meta name="ICBM" content="25.1972, 55.2744" />
    </>
  );
}
