import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ShieldCheck, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';
import { Language } from '../types';
import { auth } from '../lib/firebase';
import { 
  fetchProductReviews, 
  submitProductReview, 
  checkUserCanSubmitReview, 
  ProductReview 
} from '../lib/firebaseService';

interface ProductReviewsProps {
  productId: string;
  lang: Language;
}

export default function ProductReviews({ productId, lang }: ProductReviewsProps) {
  const isRTL = lang === 'ar';
  
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [canReview, setCanReview] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = auth.currentUser;

  // Load reviews and check review capability
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const fetchedReviews = await fetchProductReviews(productId);
        setReviews(fetchedReviews);

        if (currentUser) {
          const allowed = await checkUserCanSubmitReview(currentUser.uid, productId);
          setCanReview(allowed);
        } else {
          setCanReview(false);
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId, currentUser]);

  // Handle review submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!reviewText.trim()) {
      setMessage({
        type: 'error',
        text: isRTL ? 'يرجى كتابة تعليق قبل الإرسال.' : 'Please enter a comment before submitting.'
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      await submitProductReview(
        productId,
        currentUser.uid,
        currentUser.email || 'vip-guild@stylesandgrace4.gmail.com',
        rating,
        reviewText.trim()
      );

      // Refresh reviews list
      const updatedReviews = await fetchProductReviews(productId);
      setReviews(updatedReviews);
      
      // Reset form
      setReviewText('');
      setRating(5);
      
      setMessage({
        type: 'success',
        text: isRTL ? 'شكرًا لك! تم تسجيل تقييمك الملكي الموثق بنجاح.' : 'Thank you! Your verified royal feedback is recorded.'
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      setMessage({
        type: 'error',
        text: isRTL ? 'حدث خطأ أثناء إرسال المراجعة.' : 'An error occurred while submitting your review.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)) 
    : 0;

  // Distribution helper
  const getRatingCount = (stars: number) => reviews.filter(r => r.rating === stars).length;
  const getRatingPercentage = (stars: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((getRatingCount(stars) / totalReviews) * 100);
  };

  return (
    <div id={`product-reviews-${productId}`} className="border-t border-gold/10 mt-12 pt-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Title */}
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-gold" />
        <h3 className="font-serif text-lg font-bold tracking-widest text-gold uppercase">
          {isRTL ? 'سجل آراء النخبة والمقتنين' : 'Customer Reviews'}
        </h3>
      </div>

      {/* Aggregate feedback grid mimicking Amazon/Flipkart style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-luxury-black/40 border border-gold/10 rounded-xl p-6">
        {/* Average column */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-gold/10 pb-6 md:pb-0">
          <span className="font-serif text-5xl font-bold text-luxury-cream font-mono">
            {averageRating > 0 ? averageRating : '—'}
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? 'text-[#e5c158] fill-[#e5c158]' : 'text-luxury-cream/10'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-luxury-cream/50 font-serif">
            {isRTL 
              ? `بناءً على ${totalReviews} تقييم ملكي` 
              : `Based on ${totalReviews} verified acquisitions`
            }
          </span>
        </div>

        {/* Rating breakdown bars */}
        <div className="col-span-1 md:col-span-2 space-y-2">
          <h4 className="text-xs font-serif font-bold tracking-wider text-gold/80 mb-3">
            {isRTL ? 'توزيع درجات الرضا الملكية' : 'Rating Distribution'}
          </h4>
          {[5, 4, 3, 2, 1].map((stars) => {
            const pct = getRatingPercentage(stars);
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-luxury-cream/60 flex items-center gap-1 font-serif">
                  {stars} <Star className="h-3 w-3 text-[#e5c158] fill-[#e5c158]" />
                </span>
                <div className="flex-1 h-2 bg-luxury-black/90 border border-gold/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-gold via-gold-light to-gold transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-luxury-cream/40 font-mono">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        <h4 className="text-xs font-serif font-bold tracking-widest text-gold uppercase border-b border-gold/10 pb-2">
          {isRTL ? 'ملاحظات وتجارب المقتنين' : 'Historical Experience Ledger'}
        </h4>

        {loading ? (
          <div className="py-8 text-center text-luxury-cream/40 text-xs">
            <span className="inline-block h-5 w-5 border-2 border-gold border-t-transparent rounded-full animate-spin mr-2 align-middle" />
            <span>{isRTL ? 'جاري استرداد سجلات النخبة...' : 'Retrieving diplomatic logs...'}</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-12 text-center bg-luxury-black/20 border border-gold/5 rounded-xl text-luxury-cream/40 text-xs font-serif space-y-2">
            <MessageSquare className="h-6 w-6 text-gold/30 mx-auto" />
            <p>{isRTL ? 'لا توجد ملاحظات مسجلة لهذه القطعة الفنية بعد.' : 'No historic curatorial reviews logged for this masterpiece yet.'}</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-luxury-black/30 border border-gold/5 hover:border-gold/10 rounded-xl p-5 space-y-3 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-serif font-bold text-luxury-cream">
                        {rev.userEmail.split('@')[0]}
                      </span>
                      <div className="flex items-center gap-0.5 bg-gold/10 px-1.5 py-0.5 rounded text-[10px] text-gold font-serif font-semibold border border-gold/20">
                        <ShieldCheck className="h-3 w-3 text-[#e5c158]" />
                        <span>{isRTL ? 'مقتني موثق' : 'Verified Owner'}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-luxury-cream/40 font-mono">
                      {new Date(rev.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-AE' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= rev.rating ? 'text-[#e5c158] fill-[#e5c158]' : 'text-luxury-cream/10'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-luxury-cream/80 leading-relaxed font-sans">
                  {rev.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Area with Verification Rules */}
      <div className="bg-[#0c0c0c] border border-gold/15 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-gold/10 pb-3">
          <Award className="h-4 w-4 text-gold" />
          <h4 className="font-serif text-xs font-bold tracking-widest text-gold uppercase">
            {isRTL ? 'إضافة تجربة المقتني الموثقة' : 'Submit Royal Experience Notes'}
          </h4>
        </div>

        {currentUser ? (
          canReview ? (
            <form onSubmit={handleSubmit} className="space-y-4 text-start">
              {message && (
                <div className={`p-3.5 rounded-lg text-xs border ${
                  message.type === 'success' 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                    : 'bg-red-950/20 border-red-500/30 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Star Rating Select */}
              <div className="space-y-1.5">
                <span className="block text-[10px] uppercase tracking-widest text-gold/60 font-serif">
                  {isRTL ? 'درجة الرضا الملكية' : 'Product Rating'}
                </span>
                <div className="flex items-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="text-2xl transition-all active:scale-[0.85] cursor-pointer"
                      >
                        <Star 
                          className={`h-6 w-6 transition-colors ${
                            isFilled ? 'text-[#e5c158] fill-[#e5c158]' : 'text-luxury-cream/15 border-none'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Text Area */}
              <div className="space-y-1.5">
                <span className="block text-[10px] uppercase tracking-widest text-gold/60 font-serif">
                  {isRTL ? 'ملاحظاتكم الاستثنائية' : 'Review / Comments'}
                </span>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={isRTL ? 'شاركنا تفاصيل تجربتك الاستثنائية مع هذه التحفة الملكية...' : 'Share your experience with this product...'}
                  className="w-full min-h-[90px] bg-[#121212] border border-[#262626] focus:border-[#e5c158]/50 text-white rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#e5c158]/30 transition-all font-sans resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-gold via-gold-light to-gold text-luxury-black font-serif text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded-lg shadow-lg hover:shadow-gold/15 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <span className="h-4 w-4 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isRTL ? 'إرسال التقييم الموثق' : 'Publish Verified Review'}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="flex gap-3 bg-luxury-black/30 border border-gold/10 rounded-xl p-5 text-start items-start">
              <Lock className="h-5 w-5 text-gold/60 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-serif text-xs font-bold text-gold tracking-wider">
                  {isRTL ? 'تم حظر التقييم - يلزم اقتناء القطعة' : 'Submission Locked - Verified Owners Only'}
                </h5>
                <p className="text-[11px] text-luxury-cream/60 leading-relaxed font-sans">
                  {isRTL 
                    ? 'في ستايلز آند جريس دبي، نلتزم بأعلى معايير المصداقية. لا يمكن تقديم تقييم إلا بعد إتمام الاستحواذ بنجاح على هذه القطعة الفنية المحددة وتأكيد تسليمها.' 
                    : 'At Styles & Grace Dubai, we uphold absolute authenticity. Review submission is strictly reserved for patrons with completed, verified acquisitions of this specific timepiece/masterpiece.'
                  }
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex gap-3 bg-luxury-black/30 border border-gold/10 rounded-xl p-5 text-start items-start">
            <Lock className="h-5 w-5 text-gold/60 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-serif text-xs font-bold text-gold tracking-wider">
                {isRTL ? 'يلزم تسجيل الدخول للتقييم' : 'Authentication Required'}
              </h5>
              <p className="text-[11px] text-luxury-cream/60 leading-relaxed font-sans">
                {isRTL 
                  ? 'يرجى تسجيل الدخول إلى حساب VIP الموثق الخاص بك للتحقق من أهليتك واقتنائك للقطع قبل تقديم المراجعة.' 
                  : 'Please sign into your verified VIP account to check acquisition eligibility before presenting review notes.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
