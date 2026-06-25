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
    ? "ستايلز آند جريس دبي | فضة إيطالية ٩٢٥ ومجوهرات راقية وعطور" 
    : "Styles & Grace | 925 Italian Silver & Luxury Perfumes Dubai";
    
  const description = isRTL 
    ? "اكتشف تشكيلة ستايلز آند جريس من الفضة الإيطالية عيار ٩٢٥، المجوهرات المقاومة لتغير اللون، العطور الفاخرة، الساعات، المحافظ، النظارات الشمسية، والأحزمة الراقية في دبي الكرامة."
    : "Discover Styles & Grace collection: 925 Italian Silver & non-tarnish jewelry, premium perfumes, luxury watches, leather wallets, sunglasses, and belts in Al Attar Shopping Mall, Karama, Dubai.";

  const keywords = isRTL
    ? "فضة إيطالية ٩٢٥ دبي, مجوهرات مقاومة لتغير اللون الكرامة, عطور فاخرة, ساعات يد دبي, محافظ جلدية, نظارات شمسية دبي, أحزمة راقية, ستايلز آند جريس"
    : "925 Italian Silver Dubai, non-tarnish jewelry Karama, luxury perfumes Dubai, watches UAE, premium leather wallets, designer sunglasses Dubai, luxury belts Al Attar Mall";

  // A breathtaking high-resolution curated cover image suited for Open Graph rich previews (1200 x 630 pixels)
  const ogImageUrl = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1200&h=630";
  const siteUrl = "https://stylesandgrace.ae";

  return (
    <>
      {/* React 19 Document Title Hoisting */}
      <title>{title}</title>
      
      {/* Standard Meta Tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Styles & Grace Trading L.L.C" />
      <meta name="robots" content="index, follow" />
      <meta name="theme-color" content="#0A0A0A" />
      
      {/* Open Graph / Facebook & Professional Rich Messenger Previews */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:site_name" content="Styles & Grace" />
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
