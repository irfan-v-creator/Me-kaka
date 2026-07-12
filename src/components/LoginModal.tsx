import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, Sparkles, User, ShieldCheck, Crown, ExternalLink, Calendar, CreditCard, LogOut, Award, Clock, Eye, Share2, Star, Truck, Check, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Order } from '../types';
import { loginUser, registerUser, updateOrderStatus, signInWithGoogle, unifiedAuth, getUserOrders } from '../lib/firebaseService';
import { db, auth } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLoginSuccess: (email: string, isAdmin: boolean) => void;
  isLoggedIn?: boolean;
  userEmail?: string | null;
  isAdmin?: boolean;
  orders?: Order[];
  onReopenInvoice?: (order: Order) => void;
  onCancelOrder?: (orderId: string) => void;
  onLogout?: () => void;
  vatPercentage?: number;
  initialTab?: 'profile' | 'orders';
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  lang, 
  onLoginSuccess,
  isLoggedIn = false,
  userEmail = null,
  isAdmin = false,
  orders = [],
  onReopenInvoice,
  onCancelOrder,
  onLogout,
  vatPercentage = 5,
  initialTab = 'profile'
}: LoginModalProps) {
  const isRTL = lang === 'ar';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>(initialTab);
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [sharingOrderId, setSharingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [expandedTracking, setExpandedTracking] = useState<Record<string, boolean>>({});
  const [orderTrackingStages, setOrderTrackingStages] = useState<Record<string, 'Transit' | 'Delivered'>>(() => {
    try {
      const saved = localStorage.getItem('luxora_order_tracking');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [orderReviews, setOrderReviews] = useState<Record<string, { rating: number; review: string; timestamp: string }>>(() => {
    try {
      const saved = localStorage.getItem('luxora_reviews');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackReview, setFeedbackReview] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getOrderTrackingStage = (orderId: string): 'Transit' | 'Delivered' => {
    return orderTrackingStages[orderId] || 'Transit';
  };

  const updateOrderTrackingStage = (orderId: string, stage: 'Transit' | 'Delivered') => {
    const updated = { ...orderTrackingStages, [orderId]: stage };
    setOrderTrackingStages(updated);
    localStorage.setItem('luxora_order_tracking', JSON.stringify(updated));
  };

  const [isFetchingOrders, setIsFetchingOrders] = useState<boolean>(false);

  const fetchOrdersFromFirestore = async () => {
    if (!isLoggedIn) return;
    setIsFetchingOrders(true);
    try {
      let targetUid = '';
      if (auth.currentUser) {
        targetUid = auth.currentUser.uid;
      } else {
        const savedFallbackUser = localStorage.getItem('luxora_fallback_user');
        if (savedFallbackUser) {
          const parsed = JSON.parse(savedFallbackUser);
          if (parsed && parsed.uid) {
            targetUid = parsed.uid;
          }
        }
      }

      let fetchedOrders: Order[] = [];

      if (isAdmin) {
        // Admins fetch all orders from Firestore
        const ordersCol = collection(db, 'orders');
        const querySnapshot = await getDocs(ordersCol);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          fetchedOrders.push({
            id: data.id || docSnap.id,
            productName: data.productName,
            priceAED: data.priceAED,
            customerPhone: data.customerPhone,
            orderTime: data.orderTime,
            clientName: data.clientName,
            deliveryCoordinates: data.deliveryCoordinates,
            bespokeNotes: data.bespokeNotes,
            vatAED: data.vatAED,
            status: data.status || 'Pending',
            checkoutMethod: data.checkoutMethod || 'QuickBuy',
            userEmail: data.userEmail,
            customerEmail: data.customerEmail,
            items: data.items,
            subtotal: data.subtotal,
            discount: data.discount
          } as Order);
        });
      } else if (targetUid) {
        // Fetch only for current logged in user
        fetchedOrders = await getUserOrders(targetUid);
      } else if (userEmail) {
        // Fallback email matching if uid is not resolved yet
        const ordersCol = collection(db, 'orders');
        const querySnapshot = await getDocs(ordersCol);
        const emailToMatch = userEmail.toLowerCase().trim();
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const cEmail = data.customerEmail?.toLowerCase().trim();
          const uEmail = data.userEmail?.toLowerCase().trim();
          if (cEmail === emailToMatch || uEmail === emailToMatch) {
            fetchedOrders.push({
              id: data.id || docSnap.id,
              productName: data.productName,
              priceAED: data.priceAED,
              customerPhone: data.customerPhone,
              orderTime: data.orderTime,
              clientName: data.clientName,
              deliveryCoordinates: data.deliveryCoordinates,
              bespokeNotes: data.bespokeNotes,
              vatAED: data.vatAED,
              status: data.status || 'Pending',
              checkoutMethod: data.checkoutMethod || 'QuickBuy',
              userEmail: data.userEmail,
              customerEmail: data.customerEmail,
              items: data.items,
              subtotal: data.subtotal,
              discount: data.discount
            } as Order);
          }
        });
      }

      // Sort descending
      fetchedOrders.sort((a, b) => b.id.localeCompare(a.id));
      
      setLocalOrders(fetchedOrders);
      
      // Update selectedOrder if none is selected, or if the currently selected one is updated
      if (fetchedOrders.length > 0) {
        setSelectedOrder(prev => {
          if (prev) {
            const updated = fetchedOrders.find(o => o.id === prev.id);
            if (updated) return updated;
          }
          return fetchedOrders[0];
        });
      } else {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error('Error fetching orders from Firestore:', err);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  const renderStatusBadge = (status: Order['status']) => {
    const s = status || 'Pending';
    switch (s) {
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />
            {isRTL ? 'ملغي ومسترد' : 'Cancelled'}
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e5c158]/15 border border-[#e5c158]/40 text-[#e5c158] text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1 w-1 rounded-full bg-[#e5c158] animate-pulse" />
            {isRTL ? 'تم التسليم باليد' : 'Delivered'}
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
            {isRTL ? 'نقل مدرع نشط' : 'In Armored Transit'}
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
            {isRTL ? 'قيد التحضير الفني' : 'Bespoke Preparation'}
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1 w-1 rounded-full bg-yellow-400 animate-ping" />
            {isRTL ? 'انتظار التأمين' : 'Pending Secured'}
          </span>
        );
    }
  };

  const renderPreviewStatusBadge = (status: Order['status']) => {
    const s = status || 'Pending';
    switch (s) {
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-500 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {isRTL ? 'ملغي ومسترد' : 'Cancelled'}
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e5c158]/15 border border-[#e5c158]/40 text-[#e5c158] text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e5c158]" />
            {isRTL ? 'تم التسليم باليد VVIP' : 'Hand-delivered VVIP'}
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            {isRTL ? 'نقل مدرع نشط' : 'In Armored Transit'}
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {isRTL ? 'قيد التحضير الفني' : 'Bespoke Preparation'}
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-[9px] font-mono font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
            {isRTL ? 'انتظار التأمين' : 'Pending Secured'}
          </span>
        );
    }
  };

  const isStageActive = (order: Order, stage: 1 | 2 | 3 | 4) => {
    if (order.status === 'Cancelled') return false;
    const status = order.status || 'Pending';
    const simulated = getOrderTrackingStage(order.id);

    if (stage === 1) return true;
    if (stage === 2) {
      return status === 'Processing' || status === 'Shipped' || status === 'Delivered';
    }
    if (stage === 3) {
      return status === 'Shipped' || status === 'Delivered' || simulated === 'Delivered' || simulated === 'Transit';
    }
    if (stage === 4) {
      return status === 'Delivered' || simulated === 'Delivered';
    }
    return false;
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    
    try {
      // Update in Firebase Firestore
      await updateOrderStatus(orderToCancel.id, { status: 'Cancelled' });

      const saved = localStorage.getItem('luxora_orders');
      if (saved) {
        const parsed = JSON.parse(saved) as Order[];
        if (Array.isArray(parsed)) {
          const updated = parsed.map(o => {
            if (o.id === orderToCancel.id) {
              return { ...o, status: 'Cancelled' as const };
            }
            return o;
          });
          localStorage.setItem('luxora_orders', JSON.stringify(updated));
        }
      }

      if (onCancelOrder) {
        onCancelOrder(orderToCancel.id);
      }

      setLocalOrders(prev => prev.map(o => {
        if (o.id === orderToCancel.id) {
          return { ...o, status: 'Cancelled' as const };
        }
        return o;
      }));

      setSelectedOrder(prev => {
        if (prev && prev.id === orderToCancel.id) {
          return { ...prev, status: 'Cancelled' as const };
        }
        return prev;
      });

    } catch (err) {
      console.error('Error cancelling order:', err);
    } finally {
      setOrderToCancel(null);
    }
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackOrder) return;

    try {
      const savedReviewsStr = localStorage.getItem('luxora_reviews') || '{}';
      const savedReviews = JSON.parse(savedReviewsStr);

      savedReviews[feedbackOrder.id] = {
        rating: feedbackRating,
        review: feedbackReview,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('luxora_reviews', JSON.stringify(savedReviews));
      setOrderReviews(savedReviews);

      // Show toast
      setToastMessage(isRTL ? 'تم حفظ تقييمك الملكي بنجاح!' : 'Your royal feedback has been preserved!');
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);

    } catch (err) {
      console.error('Error saving feedback:', err);
    } finally {
      setFeedbackOrder(null);
    }
  };

  // Sync activeTab with initialTab when opened
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Load fast initial fallback from localStorage and also fetch fresh from Firestore
  React.useEffect(() => {
    if (isOpen && isLoggedIn && userEmail) {
      // 1. First set fast local state so the user gets immediate response
      try {
        const saved = localStorage.getItem('luxora_orders');
        let allOrders: Order[] = [];
        if (saved) {
          const parsed = JSON.parse(saved) as Order[];
          if (Array.isArray(parsed)) {
            allOrders = parsed;
          }
        } else if (orders && orders.length > 0) {
          allOrders = orders;
        }

        const emailToMatch = userEmail.toLowerCase().trim();
        const filtered = allOrders.filter(order => {
          if (isAdmin) return true; // Sovereign owner sees all
          const cEmail = order.customerEmail?.toLowerCase().trim();
          const uEmail = order.userEmail?.toLowerCase().trim();
          return cEmail === emailToMatch || uEmail === emailToMatch;
        });

        setLocalOrders(filtered);
        if (filtered.length > 0) {
          setSelectedOrder(prev => {
            if (prev) {
              const updated = filtered.find(o => o.id === prev.id);
              if (updated) return updated;
            }
            return filtered[0];
          });
        } else {
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error('Error loading initial orders:', err);
      }

      // 2. Query Firestore asynchronously for direct, fresh updates
      fetchOrdersFromFirestore();
    }
  }, [isOpen, isLoggedIn, userEmail, isAdmin, activeTab]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { user, profile } = await signInWithGoogle();
      const emailVal = user.email || '';
      const isBypassedAdmin = emailVal.toLowerCase().trim() === 'konami5miv@gmail.com';
      onLoginSuccess(emailVal, profile.role === 'admin' || isBypassedAdmin);
      onClose();
    } catch (err: any) {
      console.error('Google Auth error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError(isRTL 
          ? 'تم حظر النافذة المنبثقة لتسجيل الدخول من Google بواسطة متصفحك. يرجى تفعيل النوافذ المنبثقة لهذا الموقع من شريط العنوان (ابحث عن رمز حظر النوافذ المنبثقة 🚫 في أعلى اليمين) أو قم بفتح التطبيق في علامة تبويب جديدة ثم حاول مجدداً.' 
          : 'The Google Sign-In popup was blocked by your browser. Please allow popups for this site in your browser\'s address bar (look for the blocked pop-up icon 🚫 or settings) or open this application in a new tab to sign in securely.'
        );
      } else if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('auth/unauthorized-domain'))) {
        const hostname = window.location.hostname;
        setError(isRTL
          ? `خطأ نطاق غير مصرح به: هذا النطاق (${hostname}) غير مصرح به للمصادقة في مشروع Firebase الخاص بك. يرجى إضافة هذا النطاق إلى قائمة "Authorized Domains" في وحدة تحكم Firebase (Authentication > Settings > Authorized domains).`
          : `Unauthorized Domain Error: This domain (${hostname}) is not authorized for authentication in your Firebase project. Please add this domain to the "Authorized Domains" list in your Firebase Console (Authentication > Settings > Authorized domains) to enable Google Sign-In.`
        );
      } else {
        setError(isRTL 
          ? 'فشل تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.' 
          : 'Google Sign-In failed. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const normalizedEmail = email.toLowerCase().trim();
    const isBypassedAdmin = normalizedEmail === 'konami5miv@gmail.com';

    try {
      const { profile } = await unifiedAuth(normalizedEmail, password);
      onLoginSuccess(normalizedEmail, profile.role === 'admin' || isBypassedAdmin);
      onClose();
    } catch (err: any) {
      console.error('Unified Auth error:', err);
      let errorMsg = isRTL 
        ? 'حدث خطأ أثناء المصادقة. يرجى التحقق من تفاصيل الدخول.' 
        : 'An error occurred during authentication. Please check your credentials.';
      
      if (err.code === 'auth/configuration-not-found') {
        errorMsg = isRTL
          ? 'المشرف السيادي: لم يتم تمكين تسجيل الدخول بالبريد الإلكتروني وكلمة المرور في لوحة تحكم Firebase بعد. يرجى تمكين "Email/Password" في لوحة تحكم Firebase (Authentication > Sign-in method)، أو استخدام خيار تسجيل الدخول الآمن من Google أدناه.'
          : 'Admin Notice: The Email/Password sign-in method is not enabled in your Firebase console. Please go to Firebase Console > Authentication > Sign-in method and enable "Email/Password", or use the secure Google Sign-In option below.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = isRTL 
          ? 'كلمة المرور غير صحيحة.' 
          : 'Incorrect password';
      } else if (err.code === 'auth/user-not-found') {
        errorMsg = isRTL 
          ? 'البريد الإلكتروني غير مسجل.' 
          : 'Email is not registered.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = isRTL 
          ? 'كلمة المرور ضعيفة للغاية. يرجى استخدام كلمة مرور أقوى.' 
          : 'Password is too weak. Please use a stronger passcode.';
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-share PDF Generation and Web Share API flow
  const handleShareInvoiceForOrder = async (order: Order) => {
    setSharingOrderId(order.id);
    try {
      // Dynamically import to prevent React fiber reconciliation mismatches on startup
      const { pdf } = await import('@react-pdf/renderer');
      const { InvoicePDFDocument } = await import('./InvoicePDFDocument');

      // 1. Generate PDF Blob Dynamically
      const doc = React.createElement(InvoicePDFDocument, {
        order: order,
        items: order.items || [],
        vatPercentage: vatPercentage
      });
      const blob = await pdf(doc).toBlob();

      // 2. Convert to File Object
      const file = new File([blob], `Styles_Grace_Invoice_${order.id}.pdf`, { type: 'application/pdf' });

      // 3. Implement Web Share API for Files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Styles & Grace Invoice ${order.id}`,
          text: isRTL 
            ? `فاتورة مقتنياتك رقم ${order.id} من ستايلز آند جريس دبي.` 
            : `Your invoice ${order.id} from Styles & Grace Dubai.`
        });
      } else {
        // Fallback: If native file sharing is not supported by the browser, trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Styles_Grace_Invoice_${order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing invoice:', err);
    } finally {
      setSharingOrderId(null);
    }
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
        className={`relative w-full bg-luxury-dark/95 border border-gold/30 rounded-2xl shadow-[0_15px_50px_rgba(212,175,55,0.15)] overflow-hidden animate-slide-up transition-all duration-300 ${
          isLoggedIn && activeTab === 'orders' && localOrders.length > 0
            ? 'max-w-[95%] md:max-w-2xl lg:max-w-5xl' 
            : 'max-w-[95%] md:max-w-lg'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Subtle royal golden top streak */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

        {/* Close Button styling */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-cream/50 hover:text-gold transition-colors p-2 rounded-full hover:bg-gold/5 z-55 cursor-pointer"
          title={isRTL ? 'إغلاق' : 'Close'}
        >
          <X className="h-5 w-5" />
        </button>

        {isLoggedIn ? (
          /* =========================================================
             AUTHENTICATED VIP USER PROFILE VIEW
             ========================================================= */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Identity banner */}
            <div className="text-center space-y-2">
              <div className="h-14 w-14 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center mx-auto mb-2 shadow-[0_0_15px_rgba(229,193,88,0.2)]">
                {isAdmin ? (
                  <Crown className="h-6 w-6 text-gold animate-[pulse_3s_infinite]" />
                ) : (
                  <Sparkles className="h-6 w-6 text-gold animate-[pulse_3s_infinite]" />
                )}
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-widest text-white uppercase">
                {isAdmin 
                  ? (isRTL ? 'الخزينة والتحكم السيادي' : 'Admin Dashboard') 
                  : (isRTL ? 'محفظة مقتنيات النخبة' : 'VIP Account')
                }
              </h2>
              <p className="text-xs text-luxury-cream/70 font-mono tracking-wide">
                {userEmail}
              </p>
            </div>

            {/* Premium Gold/Glass Tabs selector */}
            <div className="flex border-b border-gold/15">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-serif font-bold transition-all border-b-2 text-center cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream'
                }`}
              >
                {isRTL ? 'ملفي الشخصي' : 'My Profile'}
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 text-xs uppercase tracking-widest font-serif font-bold transition-all border-b-2 text-center cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-luxury-cream/50 hover:text-luxury-cream'
                }`}
              >
                <span>{isRTL ? 'سجل الطلبات' : 'Order History'}</span>
                {localOrders.length > 0 && (
                  <span className="bg-gold text-luxury-black text-[9px] px-1.5 py-0.5 rounded-full font-sans font-bold">
                    {localOrders.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tabs content area */}
            <div className={`transition-all duration-300 pr-1 ${
              activeTab === 'orders' && localOrders.length > 0
                ? 'min-h-[320px] max-h-[600px] overflow-y-auto' 
                : 'min-h-[220px] max-h-[350px] overflow-y-auto'
            }`}>
              {activeTab === 'profile' ? (
                /* Tab 1: Account Status & Privileges */
                <div className="space-y-4 text-start">
                  <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-gold">
                      <Award className="h-4 w-4" />
                      <span className="text-xs uppercase font-serif tracking-widest font-bold">
                        {isAdmin ? (isRTL ? 'رتبة المالك الملكي' : 'Administrator') : (isRTL ? 'رتبة كبار المقتنين VIP' : 'VIP Account')}
                      </span>
                    </div>
                    <p className="text-xs text-luxury-cream/80 leading-relaxed font-sans">
                      {isAdmin 
                        ? (isRTL 
                          ? 'تتمتع بصلاحيات وصول مطلقة وغير مقيدة لكامل سجل المعرض ومؤشرات الاستثمار والطلبات الواردة.' 
                          : 'Equipped with admin access to manage products and view customer orders.')
                        : (isRTL 
                          ? 'مرحباً بك في مجلس النخبة. حسابك المعتمد يمنحك امتيازات حصرية مبرمجة ومفعلة تلقائياً في صالة العرض.' 
                          : 'Welcome back! Your VIP account unlocks automatic discounts and free delivery.')
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] uppercase font-serif tracking-widest text-gold/60">{isRTL ? 'الامتيازات النشطة' : 'Secured Member Benefits'}</h4>
                    <ul className="space-y-2 text-xs text-luxury-cream/80">
                      <li className="flex items-start gap-2 bg-luxury-cream/5 p-2 rounded border border-gold/5">
                        <span className="text-gold font-bold">✓</span>
                        <div>
                          <strong className="block text-white text-[11px]">{isRTL ? 'خصم النخبة المضمون ١٠٪' : 'Guaranteed 10% VIP Discount'}</strong>
                          <span className="text-[10px] text-luxury-cream/60">{isRTL ? 'يطبق تلقائياً على جميع المجوهرات والقطع النادرة.' : 'Instantly integrated during any premium checkout.'}</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 bg-luxury-cream/5 p-2 rounded border border-gold/5">
                        <span className="text-gold font-bold">✓</span>
                        <div>
                          <strong className="block text-white text-[11px]">{isRTL ? 'توصيل مصفح مؤمّن مجاني' : 'Complimentary Armored Courier'}</strong>
                          <span className="text-[10px] text-luxury-cream/60">{isRTL ? 'توصيل سري بحراسة مسلحة لكافة إمارات الدولة.' : 'Priority discrete diplomatic transport for high-value acquisitions.'}</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 bg-luxury-cream/5 p-2 rounded border border-gold/5">
                        <span className="text-gold font-bold">✓</span>
                        <div>
                          <strong className="block text-white text-[11px]">{isRTL ? 'دخول صالة دبي مول VVIP' : 'Dubai Mall VIP Private Suite Access'}</strong>
                          <span className="text-[10px] text-luxury-cream/60">{isRTL ? 'جلسات خاصة مع مستشاري الفخامة لطلب القطع النادرة.' : 'Exclusive entry to private showroom viewing suites.'}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Tab 2: User Order History with Desktop Side-by-side Invoice Preview */
                <div className="space-y-3.5 text-start">
                  <div className="flex justify-between items-center bg-[#0d0d0d] border border-[#e5c158]/10 p-3 rounded-xl">
                    <div>
                      <h3 className="font-serif text-xs font-bold tracking-widest text-white uppercase">
                        {isRTL ? 'سجل الطلبات السيادية' : 'Sovereign Order History'}
                      </h3>
                      <p className="text-[9px] text-[#e5c158]/70 font-mono">
                        {isRTL ? 'متصل ومحمي بواسطة Firestore' : 'Secured connection to Firestore DB'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetchOrdersFromFirestore();
                      }}
                      disabled={isFetchingOrders}
                      className="flex items-center gap-1.5 bg-[#e5c158]/10 hover:bg-[#e5c158]/20 disabled:opacity-50 text-[#e5c158] text-[10px] font-serif uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-[#e5c158]/20 transition-all cursor-pointer select-none"
                    >
                      <RotateCw className={`h-3 w-3 ${isFetchingOrders ? 'animate-spin' : ''}`} />
                      <span>{isFetchingOrders ? (isRTL ? 'جاري التحديث...' : 'Syncing...') : (isRTL ? 'تحديث' : 'Refresh')}</span>
                    </button>
                  </div>

                  {isAdmin && (
                    <div className="bg-[#e5c158]/10 border border-[#e5c158]/20 p-2.5 rounded-lg text-[10px] text-[#e5c158] font-mono tracking-wide text-center mb-2">
                      ⚡ {isRTL ? 'عرض لوحة التحكم الإدارية لكافة الفواتير النشطة' : 'ADMIN VIEW: Customer Orders'}
                    </div>
                  )}

                  {localOrders.length === 0 ? (
                    <div className="text-center py-12 space-y-3 bg-[#0d0d0d] border border-[#262626] rounded-xl p-6">
                      <ShieldAlert className="h-8 w-8 text-[#e5c158]/40 mx-auto animate-pulse" />
                      <p className="text-xs text-[#e5c158] font-serif uppercase tracking-widest font-bold">
                        {isRTL ? 'خزنتك السيادية فارغة.' : 'You have no orders yet.'}
                      </p>
                      <p className="text-[10px] text-luxury-cream/40">
                        {isRTL ? 'القطع التي ستقتنيها مستقبلاً ستظهر هنا في سجلاتك المحمية.' : 'Your orders will be listed here once you make a purchase.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left side: Orders list (mobile single column / desktop sidebar) */}
                      <div className="lg:col-span-5 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                        {localOrders.map((order) => (
                          <div 
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className={`bg-[#0d0d0d] border rounded-xl p-4 transition-all space-y-4 shadow-lg hover:shadow-[#e5c158]/5 group cursor-pointer text-start ${
                              selectedOrder?.id === order.id ? 'border-[#e5c158] shadow-[#e5c158]/10' : 'border-[#262626] hover:border-[#e5c158]/30'
                            }`}
                          >
                            {/* Card Top Block */}
                            <div className="flex justify-between items-start gap-2 border-b border-[#262626] pb-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-mono text-[#e5c158] font-bold tracking-widest">{order.id}</span>
                                  {renderStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-luxury-cream/50 font-mono">
                                  <Clock className="h-3.5 w-3.5 text-[#e5c158]/60" />
                                  <span>{order.orderTime}</span>
                                </div>
                              </div>
                              <span className="bg-[#e5c158]/10 border border-[#e5c158]/20 text-[9px] text-[#e5c158] uppercase px-2 py-0.5 rounded font-mono tracking-wider shrink-0">
                                {order.checkoutMethod || 'QuickBuy'}
                              </span>
                            </div>

                            {/* Curated Masterpiece Description */}
                            <div>
                              <span className="block text-[9px] uppercase tracking-widest text-luxury-cream/40 font-serif mb-1">
                                {isRTL ? 'التحف الفنية المقتناة' : 'Curated masterpieces'}
                              </span>
                              <p className="text-xs text-white font-medium line-clamp-2 leading-relaxed font-sans">
                                {order.productName}
                              </p>
                            </div>

                            {/* Grand Total Value */}
                            <div className="flex justify-between items-center pt-3 border-t border-[#262626] gap-2 flex-wrap">
                              <div>
                                <span className="block text-[8px] uppercase tracking-widest text-luxury-cream/45">{isRTL ? 'قيمة الاستثمار' : 'Grand Total'}</span>
                                <span className="text-xs font-serif font-bold text-[#e5c158]">
                                  {order.priceAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                                </span>
                              </div>

                              {/* Actions Group */}
                              <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                                {onReopenInvoice && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent setting selection
                                      onReopenInvoice(order);
                                      onClose();
                                    }}
                                    className="bg-transparent hover:bg-[#e5c158]/10 border border-[#e5c158]/30 hover:border-[#e5c158] text-[#e5c158] text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                                    title={isRTL ? 'عرض الفاتورة الملكية' : 'View Invoice'}
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span className="hidden sm:inline">{isRTL ? 'عرض' : 'View'}</span>
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // prevent setting selection
                                    handleShareInvoiceForOrder(order);
                                  }}
                                  disabled={sharingOrderId === order.id}
                                  className="bg-[#e5c158] hover:bg-[#e5c158]/90 disabled:opacity-50 text-luxury-black text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                                  title={isRTL ? 'إعادة مشاركة PDF' : 'Re-share PDF Invoice'}
                                >
                                  {sharingOrderId === order.id ? (
                                    <span className="h-3 w-3 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Share2 className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {sharingOrderId === order.id 
                                      ? (isRTL ? 'مشاركة...' : 'Sharing...') 
                                      : (isRTL ? 'إعادة مشاركة' : 'Re-share')
                                    }
                                  </span>
                                </button>

                                {order.status !== 'Cancelled' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent setting selection
                                      setOrderToCancel(order);
                                    }}
                                    className="bg-transparent hover:bg-red-950/30 border border-red-900 text-red-500 text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0"
                                    title={isRTL ? 'إلغاء هذا الطلب السيادي' : 'Cancel This Order'}
                                  >
                                    <span className="text-[10px] font-bold">✕</span>
                                    <span>{isRTL ? 'إلغاء' : 'Cancel'}</span>
                                  </button>
                                )}

                                {order.status !== 'Cancelled' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedTracking(prev => ({ ...prev, [order.id]: !prev[order.id] }));
                                    }}
                                    className={`bg-transparent hover:bg-[#e5c158]/10 border text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0 ${
                                      expandedTracking[order.id] 
                                        ? 'border-[#e5c158] bg-[#e5c158]/10 text-[#e5c158]' 
                                        : 'border-[#e5c158]/40 hover:border-[#e5c158] text-[#e5c158]'
                                    }`}
                                    title={isRTL ? 'تتبع الشحنة الفاخرة' : 'Track Luxury Shipment'}
                                  >
                                    <Truck className="h-3 w-3" />
                                    <span>{isRTL ? 'تتبع الشحنة' : 'Track'}</span>
                                  </button>
                                )}

                                {order.status !== 'Cancelled' && (order.status === 'Delivered' || getOrderTrackingStage(order.id) === 'Delivered') && (
                                  <div className="shrink-0">
                                    {orderReviews[order.id] ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-[#e5c158]/10 border border-[#e5c158]/20 text-[#e5c158] text-[9px] font-mono uppercase tracking-wider font-bold">
                                        <Star className="h-2.5 w-2.5 fill-[#e5c158] text-[#e5c158]" />
                                        <span>{isRTL ? 'تم التقييم' : 'Rated'}</span>
                                      </span>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setFeedbackOrder(order);
                                          setFeedbackRating(5);
                                          setHoverRating(0);
                                          setFeedbackReview('');
                                        }}
                                        className="bg-[#e5c158]/15 hover:bg-[#e5c158]/25 border border-[#e5c158]/60 hover:border-[#e5c158] text-[#e5c158] text-[9px] font-serif uppercase tracking-widest font-bold px-2 py-1.5 rounded-md transition-all active:scale-95 flex items-center gap-1 cursor-pointer shrink-0 animate-pulse"
                                        title={isRTL ? 'تقديم تقييم للتحفة' : 'Provide Masterpiece Feedback'}
                                      >
                                        <Star className="h-3 w-3 fill-[#e5c158]" />
                                        <span>{isRTL ? 'تقييم الخدمة' : 'Feedback'}</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Timeline Accordion Expansion */}
                            <AnimatePresence initial={false}>
                              {expandedTracking[order.id] && order.status !== 'Cancelled' && (
                                <motion.div
                                  key={`tracking-${order.id}`}
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                                  className="overflow-hidden border-t border-[#262626]/60 mt-3 pt-3"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="bg-black/40 border border-gold/15 rounded-lg p-3.5 space-y-3.5">
                                    <div className="flex justify-between items-center border-b border-[#262626]/60 pb-2">
                                      <span className="text-[10px] font-serif uppercase tracking-widest text-[#e5c158] font-bold">
                                        {isRTL ? 'تتبع الشحنة السيادية' : 'Order Tracking'}
                                      </span>
                                      {getOrderTrackingStage(order.id) !== 'Delivered' && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateOrderTrackingStage(order.id, 'Delivered');
                                          }}
                                          className="text-[9px] font-mono text-[#e5c158] hover:text-white border border-[#e5c158]/30 hover:border-[#e5c158] rounded px-2 py-0.5 transition-colors cursor-pointer shrink-0"
                                        >
                                          {isRTL ? 'محاكاة الوصول' : 'Simulate Arrival'}
                                        </button>
                                      )}
                                    </div>
                                    
                                    <div className={`relative ${isRTL ? 'pr-6' : 'pl-6'} space-y-4 text-start`}>
                                      {/* Thin gold connecting line */}
                                      <div className={`absolute ${isRTL ? 'right-[9px]' : 'left-[9px]'} top-1.5 bottom-1.5 w-0.5 bg-[#a99260]/20`}>
                                        <div 
                                          className="absolute top-0 left-0 w-full bg-[#a99260] transition-all duration-500" 
                                          style={{ 
                                            height: isStageActive(order, 4) 
                                              ? '100%' 
                                              : isStageActive(order, 3) 
                                                ? '66%' 
                                                : isStageActive(order, 2) 
                                                  ? '33%' 
                                                  : '0%' 
                                          }}
                                        />
                                      </div>

                                      {/* Stage 1: Order Confirmed */}
                                      <div className="flex gap-3 items-start relative">
                                        <div className={`absolute ${isRTL ? '-right-[22px]' : '-left-[22px]'} flex items-center justify-center`}>
                                          <div className="h-[18px] w-[18px] rounded-full bg-[#0d0d0d] border border-[#e5c158] flex items-center justify-center text-[#e5c158] z-10">
                                            <Check className="h-3 w-3" />
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-[11px] font-serif font-bold text-[#e5c158]">
                                            {isRTL ? 'تأكيد الطلب السيادي' : 'Order Confirmed'}
                                          </p>
                                          <p className="text-[9px] text-luxury-cream/50 leading-relaxed">
                                            {isRTL ? 'تم حجز المستند المالي وتأمينه بنجاح' : 'Your order is confirmed and is being processed'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Stage 2: Processing */}
                                      <div className="flex gap-3 items-start relative">
                                        <div className={`absolute ${isRTL ? '-right-[22px]' : '-left-[22px]'} flex items-center justify-center`}>
                                          {isStageActive(order, 2) ? (
                                            <div className="h-[18px] w-[18px] rounded-full bg-[#0d0d0d] border border-[#e5c158] flex items-center justify-center text-[#e5c158] z-10">
                                              <Check className="h-3 w-3" />
                                            </div>
                                          ) : (
                                            <div className="h-[18px] w-[18px] rounded-full bg-[#0d0d0d] border border-[#262626] flex items-center justify-center text-luxury-cream/30 z-10">
                                              <span className="h-1.5 w-1.5 rounded-full bg-luxury-cream/30 animate-pulse" />
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <p className={`text-[11px] font-serif font-bold ${isStageActive(order, 2) ? 'text-[#e5c158]' : 'text-luxury-cream/30'}`}>
                                            {isRTL ? 'معالجة وتحضير التحفة' : 'Order Processing'}
                                          </p>
                                          <p className="text-[9px] text-luxury-cream/50 leading-relaxed">
                                            {isRTL ? 'تدقيق وفحص جودة التحفة الفنية قبل النقل' : 'Quality inspection and packaging complete'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Stage 3: Armored Transit */}
                                      <div className="flex gap-3 items-start relative">
                                        <div className={`absolute ${isRTL ? '-right-[22px]' : '-left-[22px]'} flex items-center justify-center`}>
                                          {isStageActive(order, 3) ? (
                                            <div className="h-[18px] w-[18px] rounded-full bg-[#0d0d0d] border border-[#e5c158] flex items-center justify-center text-[#e5c158] z-10">
                                              <Check className="h-3 w-3" />
                                            </div>
                                          ) : (
                                            <div className="h-[18px] w-[18px] rounded-full bg-[#0d0d0d] border border-[#262626] flex items-center justify-center text-luxury-cream/30 z-10">
                                              <span className="h-1.5 w-1.5 rounded-full bg-luxury-cream/30" />
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <p className={`text-[11px] font-serif font-bold ${isStageActive(order, 3) ? 'text-[#e5c158]' : 'text-luxury-cream/30'}`}>
                                            {isRTL ? 'نقل مدرع ودبلوماسي' : 'Shipped & In Transit'}
                                          </p>
                                          <p className="text-[9px] text-luxury-cream/50 leading-relaxed">
                                            {isRTL ? 'التحفة في طريقها بمرافقة دبلوماسية خاصة' : 'En route to your delivery address'}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Stage 4: Delivered */}
                                      <div className="flex gap-3 items-start relative">
                                        <div className={`absolute ${isRTL ? '-right-[22px]' : '-left-[22px]'} flex items-center justify-center`}>
                                          {isStageActive(order, 4) ? (
                                            <div className="h-[18px] w-[18px] rounded-full bg-[#0d0d0d] border border-[#e5c158] flex items-center justify-center text-[#e5c158] z-10">
                                              <Check className="h-3 w-3" />
                                            </div>
                                          ) : (
                                            <div className="h-[18px] w-[18px] rounded-full bg-[#0d0d0d] border border-[#262626] flex items-center justify-center text-luxury-cream/30 z-10">
                                              <div className="h-1.5 w-1.5 rounded-full bg-luxury-cream/30" />
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <p className={`text-[11px] font-serif font-bold ${isStageActive(order, 4) ? 'text-gold' : 'text-luxury-cream/30'}`}>
                                            {isRTL ? 'تم التسليم باليد' : 'Delivered'}
                                          </p>
                                          <p className="text-[9px] text-luxury-cream/50 leading-relaxed">
                                            {isStageActive(order, 4) 
                                              ? (isRTL ? 'تم تسليم التحفة المنسقة بنجاح إلى المقر' : 'Secure handover finalized with signature') 
                                              : (isRTL ? 'في انتظار وصول الشحنة والمرافقة' : 'Awaiting arrival at destination coordinates')
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>

                      {/* Right side: Detailed Invoice Preview (Desktop only) */}
                      <div className="hidden lg:block lg:col-span-7 bg-[#0a0a0a]/90 border border-gold/15 rounded-xl p-6 max-h-[500px] overflow-y-auto space-y-5 shadow-[inset_0_0_20px_rgba(229,193,88,0.03)] text-start relative">
                        {selectedOrder ? (
                          <div className="space-y-4">
                            {/* Elegant Header */}
                            <div className="flex justify-between items-center border-b border-gold/20 pb-3">
                              <div>
                                <h4 className="font-serif text-sm font-bold tracking-widest text-gold uppercase">
                                  Styles & Grace
                                </h4>
                                <span className="text-[9px] uppercase tracking-wider text-luxury-cream/50 font-mono">
                                  {isRTL ? 'معاينة المستند المالي' : 'Invoice Preview'}
                                </span>
                              </div>
                              {renderPreviewStatusBadge(selectedOrder.status)}
                            </div>

                            {/* Metadata Fields */}
                            <div className="grid grid-cols-2 gap-4 text-[11px] bg-[#0d0d0d] p-3 rounded-lg border border-[#262626]">
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'رقم المعاملة' : 'Order Reference'}
                                </span>
                                <span className="font-mono text-white font-bold tracking-wider">{selectedOrder.id}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'تاريخ الاستحواذ' : 'Order Date'}
                                </span>
                                <span className="font-mono text-luxury-cream/80">{selectedOrder.orderTime}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'قناة التسوية' : 'Payment Method'}
                                </span>
                                <span className="text-gold font-serif uppercase tracking-widest text-[9px]">{selectedOrder.checkoutMethod || 'QuickBuy'}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] uppercase tracking-wider text-luxury-cream/40 mb-0.5">
                                  {isRTL ? 'إحداثيات الشحن' : 'Coordinates'}
                                </span>
                                <span className="text-white truncate block max-w-[180px]" title={selectedOrder.deliveryCoordinates}>
                                  {selectedOrder.deliveryCoordinates || (isRTL ? 'الشحن الجوي السري' : 'Standard Shipping')}
                                </span>
                              </div>
                            </div>

                            {/* Client details if present */}
                            {(selectedOrder.clientName || selectedOrder.customerPhone || selectedOrder.bespokeNotes) && (
                              <div className="text-[11px] bg-[#0c0c0c] border border-[#262626] p-3 rounded-lg space-y-1.5">
                                <span className="block text-[8px] uppercase tracking-widest text-gold/60 font-serif mb-1">
                                  {isRTL ? 'بيانات العميل الكريم والتسليم' : 'Customer & Delivery'}
                                </span>
                                {selectedOrder.clientName && (
                                  <div className="flex justify-between">
                                    <span className="text-luxury-cream/40">{isRTL ? 'العميل الكريم:' : 'Customer Name:'}</span>
                                    <span className="text-white font-medium">{selectedOrder.clientName}</span>
                                  </div>
                                )}
                                {selectedOrder.customerPhone && (
                                  <div className="flex justify-between">
                                    <span className="text-luxury-cream/40">{isRTL ? 'رقم الاتصال:' : 'Contact Phone:'}</span>
                                    <span className="text-white font-mono">{selectedOrder.customerPhone}</span>
                                  </div>
                                )}
                                {selectedOrder.bespokeNotes && (
                                  <div className="flex justify-between border-t border-[#262626] pt-1.5 mt-1.5">
                                    <span className="text-luxury-cream/40">{isRTL ? 'مرافقة خاصة:' : 'Delivery Notes:'}</span>
                                    <span className="text-gold italic font-serif">{selectedOrder.bespokeNotes}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Ledger Table */}
                            <div className="space-y-2">
                              <span className="block text-[9px] uppercase tracking-widest text-gold/60 font-serif">
                                {isRTL ? 'تحف الفواتير وجدول المقتنيات' : 'Order Items'}
                              </span>
                              <div className="border border-[#262626] rounded-lg overflow-hidden bg-[#0d0d0d]">
                                <table className="w-full text-left border-collapse text-[11px]">
                                  <thead>
                                    <tr className="border-b border-[#262626] bg-[#0c0c0c] text-gold uppercase font-serif tracking-widest text-[9px]">
                                      <th className="py-2.5 px-3 text-start">{isRTL ? 'البيان والتحفة' : 'Masterpiece'}</th>
                                      <th className="py-2.5 px-2 text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                                      <th className="py-2.5 px-3 text-right">{isRTL ? 'القيمة' : 'Value'}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#262626] text-luxury-cream/90">
                                    {(selectedOrder.items || [{
                                      product: {
                                        nameEn: selectedOrder.productName,
                                        nameAr: selectedOrder.productName,
                                        priceAED: selectedOrder.subtotal || selectedOrder.priceAED,
                                        category: 'Bespoke Creation'
                                      },
                                      quantity: 1
                                    }]).map((item: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-gold/5 transition-colors">
                                        <td className="py-2.5 px-3">
                                          <span className="font-semibold text-white block">
                                            {isRTL ? (item.product.nameAr || item.product.nameEn) : item.product.nameEn}
                                          </span>
                                          <span className="text-[9px] text-luxury-cream/40 uppercase font-mono tracking-wider">
                                            {item.product.category}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-2 text-center font-mono text-white font-bold">
                                          {item.quantity}
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-mono text-[#e5c158] font-semibold">
                                          {(item.product.priceAED * item.quantity).toLocaleString()} AED
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Financial breakdown */}
                            <div className="bg-[#0c0c0c] border border-[#262626] p-4 rounded-lg space-y-2 text-[11px]">
                              <div className="flex justify-between text-luxury-cream/60">
                                <span className="uppercase tracking-wider">{isRTL ? 'المجموع قبل الضريبة' : 'Subtotal'}</span>
                                <span className="font-mono text-white">{(selectedOrder.subtotal || selectedOrder.priceAED).toLocaleString()} AED</span>
                              </div>
                              {selectedOrder.discount && selectedOrder.discount > 0 ? (
                                <div className="flex justify-between text-gold">
                                  <span className="uppercase tracking-wider">{isRTL ? 'خصم عضوية النخبة' : 'VIP Discount'}</span>
                                  <span className="font-mono font-bold">-{selectedOrder.discount.toLocaleString()} AED</span>
                                </div>
                              ) : null}
                              
                              <div className="flex justify-between text-luxury-cream/40 border-t border-[#262626] pt-2">
                                <span className="uppercase tracking-wider">{isRTL ? `ضريبة القيمة المضافة (${vatPercentage}%)` : `VAT (${vatPercentage}%)`}</span>
                                <span className="font-mono text-white">
                                  {(((selectedOrder.subtotal || selectedOrder.priceAED) - (selectedOrder.discount || 0)) * (vatPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                                </span>
                              </div>

                              <div className="flex justify-between text-[#e5c158] font-serif font-bold border-t border-gold/20 pt-2.5 text-xs">
                                <span className="uppercase tracking-widest">{isRTL ? 'قيمة الاستثمار الإجمالية' : 'Grand Total'}</span>
                                <span className="font-mono text-[#e5c158]">{selectedOrder.priceAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED</span>
                              </div>
                            </div>

                            {/* Extra interactive visual action trigger inside preview */}
                            <div className="flex justify-end gap-2.5 pt-2 flex-wrap">
                              {selectedOrder.status !== 'Cancelled' && (selectedOrder.status === 'Delivered' || getOrderTrackingStage(selectedOrder.id) === 'Delivered') && (
                                <>
                                  {orderReviews[selectedOrder.id] ? (
                                    <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#e5c158]/10 border border-[#e5c158]/20 text-[#e5c158] text-[10px] font-mono uppercase tracking-wider font-bold">
                                      <Star className="h-3.5 w-3.5 fill-[#e5c158] text-[#e5c158]" />
                                      <span>{isRTL ? 'تم التقييم الملكي' : 'Review Submitted'}</span>
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setFeedbackOrder(selectedOrder);
                                        setFeedbackRating(5);
                                        setHoverRating(0);
                                        setFeedbackReview('');
                                      }}
                                      className="bg-[#e5c158]/15 hover:bg-[#e5c158]/25 border border-[#e5c158]/60 hover:border-[#e5c158] text-[#e5c158] text-[10px] font-serif uppercase tracking-widest font-bold px-4 py-2.5 rounded-lg transition-all active:scale-[0.97] flex items-center gap-1.5 cursor-pointer animate-pulse"
                                      title={isRTL ? 'تقديم تقييم للتحفة' : 'Review Order'}
                                    >
                                      <Star className="h-4 w-4 fill-[#e5c158]" />
                                      <span>{isRTL ? 'تقييم التحفة' : 'Provide Feedback'}</span>
                                    </button>
                                  )}
                                </>
                              )}
                              {selectedOrder.status !== 'Cancelled' && (
                                <button
                                  onClick={() => setOrderToCancel(selectedOrder)}
                                  className="bg-transparent hover:bg-red-950/30 border border-red-900 text-red-500 text-[10px] font-serif uppercase tracking-widest font-bold px-4 py-2.5 rounded-lg transition-all active:scale-[0.97] flex items-center gap-1.5 cursor-pointer"
                                  title={isRTL ? 'إلغاء هذا المعاملة السيادية' : 'Cancel This Order'}
                                >
                                  <span>✕</span>
                                  <span>{isRTL ? 'إلغاء الطلب' : 'Cancel Order'}</span>
                                </button>
                              )}
                              {onReopenInvoice && (
                                <button
                                  onClick={() => {
                                    onReopenInvoice(selectedOrder);
                                    onClose();
                                  }}
                                  className="bg-transparent hover:bg-[#e5c158]/10 border border-[#e5c158]/30 hover:border-[#e5c158] text-[#e5c158] text-[10px] font-serif uppercase tracking-widest font-bold px-4 py-2.5 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                  title={isRTL ? 'عرض الفاتورة الملكية الكاملة' : 'View Full Document'}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>{isRTL ? 'عرض الفاتورة الكاملة' : 'View Full Document'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                            <ShieldAlert className="h-8 w-8 text-[#e5c158]/30 animate-pulse" />
                            <p className="text-xs text-luxury-cream/40 font-serif uppercase tracking-widest">
                              {isRTL ? 'يرجى اختيار معاملة لعرض الفاتورة' : 'Select a transaction to view its invoice'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sign Out Trigger at bottom */}
            {onLogout && (
              <div className="border-t border-gold/10 pt-4 flex justify-between items-center">
                <span className="text-[9px] text-luxury-cream/40 uppercase tracking-widest font-mono">
                  {isRTL ? 'الدرع الأمني النشط' : 'SECURITY SHIELD ACTIVE'}
                </span>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="bg-red-950/20 hover:bg-red-950/60 border border-red-500/25 text-red-400 hover:text-white px-3 py-1.5 rounded text-[10px] font-serif uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isRTL ? 'إنهاء الجلسة الآمنة' : 'Logout'}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================
             STANDARD GUEST SECURE SIGN IN FLOW
             ========================================================= */
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto mb-2">
                <Crown className="h-5 w-5 text-[#e5c158] animate-[pulse_3s_infinite]" />
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-widest text-white uppercase">
                {isRTL ? 'بوابة النخبة والخدمة الذاتية' : 'Login / Sign Up'}
              </h2>
              <p className="text-xs text-luxury-cream/60">
                {isRTL 
                  ? 'سجل دخولك أو أنشئ حساباً جديداً تلقائياً للاستمتاع بخصم ١٠٪ وحفظ حقيبتك وتتبع طلباتك.' 
                  : 'Sign in or create an account to get 10% off, save your cart, and track orders.'
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
                  {isRTL ? 'البريد الإلكتروني المعتمد' : 'Email Address'}
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
                    placeholder={isRTL ? 'الملك أو العضو الموقر' : 'Email'}
                    className="w-full bg-luxury-black/90 border border-gold/20 text-sm text-luxury-cream placeholder:text-luxury-cream/35 rounded-lg px-4 py-3 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 font-sans tracking-wide"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-serif tracking-widest text-gold/80">
                  {isRTL ? 'العبارة السرية الآمنة' : 'Password'}
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
                className="mt-6 w-full bg-gradient-to-r from-gold via-gold-light to-gold text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded-lg shadow-lg hover:shadow-gold/15 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="h-4 w-4 border-2 border-luxury-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>
                      {isRTL ? 'تسجيل الدخول / إنشاء حساب' : 'Login / Sign Up'}
                    </span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gold/10"></div>
                <span className="flex-shrink mx-4 text-gold/40 text-[10px] uppercase font-serif tracking-widest">{isRTL ? 'أو' : 'OR'}</span>
                <div className="flex-grow border-t border-gold/10"></div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-white/5 hover:bg-white/10 border border-gold/20 text-luxury-cream font-serif text-xs font-bold tracking-widest uppercase py-3.5 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>{isRTL ? 'تسجيل الدخول بواسطة Google' : 'Sign In with Google'}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {orderToCancel && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setOrderToCancel(null)} />
          <div className="relative w-full max-w-md bg-[#0a0a0a] border border-red-900/40 rounded-xl shadow-[0_10px_40px_rgba(239,68,68,0.1)] overflow-hidden p-6 text-center space-y-5 animate-slide-up" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="h-12 w-12 rounded-full bg-red-950/30 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 text-xl font-bold">
              ✕
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold tracking-widest text-red-500 uppercase">
                {isRTL ? 'إلغاء الاستحواذ السيادي' : 'Cancel Order'}
              </h3>
              <p className="text-xs text-luxury-cream/70 leading-relaxed font-serif">
                {isRTL 
                  ? 'هل أنت متأكد من رغبتك في إلغاء هذا الاستحواذ السيادي؟ لا يمكن التراجع عن هذا الإجراء.' 
                  : 'Are you sure you want to cancel this order? This action cannot be undone.'
                }
              </p>
            </div>

            {/* Selected Order Detail mini-card */}
            <div className="bg-[#121212] border border-[#262626] rounded-lg p-3 text-start text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-luxury-cream/40 font-mono">{isRTL ? 'رقم المعاملة:' : 'Reference ID:'}</span>
                <span className="text-[#e5c158] font-mono font-bold">{orderToCancel.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-cream/40">{isRTL ? 'التحفة:' : 'Product:'}</span>
                <span className="text-white truncate max-w-[200px] font-medium">{orderToCancel.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-cream/40">{isRTL ? 'قيمة الاستثمار:' : 'Total Price:'}</span>
                <span className="text-white font-mono font-bold">{orderToCancel.priceAED.toLocaleString()} AED</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setOrderToCancel(null)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-luxury-cream/20 text-luxury-cream text-xs font-serif uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {isRTL ? 'تراجع' : 'Cancel'}
              </button>
              <button
                onClick={handleCancelConfirm}
                className="flex-1 bg-red-950/40 hover:bg-red-900 border border-red-500/30 text-red-400 hover:text-white text-xs font-serif uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {isRTL ? 'إلغاء الاستحواذ' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackOrder && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setFeedbackOrder(null)} />
          <div className="relative w-full max-w-md bg-[#0d0d0d] border border-[#e5c158]/40 rounded-xl shadow-[0_10px_40px_rgba(229,193,88,0.1)] overflow-hidden p-6 text-center space-y-5 animate-slide-up" dir={isRTL ? 'rtl' : 'ltr'}>
            <button 
              onClick={() => setFeedbackOrder(null)}
              className="absolute top-4 right-4 text-luxury-cream/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold tracking-widest text-[#e5c158] uppercase">
                {isRTL ? 'تقييم التحفة الاستثنائية' : 'Product Feedback'}
              </h3>
              <p className="text-xs text-luxury-cream/70 leading-relaxed font-serif">
                {isRTL 
                  ? 'رأيكم الكريم يساهم في الحفاظ على أعلى معايير الفخامة والخدمة السيادية لدينا.' 
                  : 'Your feedback helps us maintain our high quality and service standards.'
                }
              </p>
            </div>

            {/* Selected Masterpiece Detail Mini Card */}
            <div className="bg-[#121212] border border-[#262626] rounded-lg p-3 text-start text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-luxury-cream/40">{isRTL ? 'التحفة المقتناة:' : 'Product:'}</span>
                <span className="text-white truncate max-w-[220px] font-medium font-serif">{feedbackOrder.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-cream/40 font-mono">{isRTL ? 'الرقم المرجعي:' : 'Reference ID:'}</span>
                <span className="text-[#e5c158] font-mono font-bold">{feedbackOrder.id}</span>
              </div>
            </div>

            {/* Interactive 5-Star Rating */}
            <div className="space-y-1.5">
              <span className="block text-[10px] uppercase tracking-widest text-gold/60 font-serif">
                {isRTL ? 'درجة الرضا الملكية' : 'Product Rating'}
              </span>
              <div className="flex items-center justify-center gap-2.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || feedbackRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFeedbackRating(star)}
                      className="text-2xl transition-all active:scale-[0.85] cursor-pointer"
                    >
                      <Star 
                        className={`h-7 w-7 transition-colors ${
                          isFilled ? 'text-[#e5c158] fill-[#e5c158]' : 'text-luxury-cream/15 border-none'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea review */}
            <div className="space-y-1.5 text-start">
              <span className="block text-[10px] uppercase tracking-widest text-gold/60 font-serif">
                {isRTL ? 'ملاحظاتكم الاستثنائية' : 'Review / Comments'}
              </span>
              <textarea
                value={feedbackReview}
                onChange={(e) => setFeedbackReview(e.target.value)}
                placeholder={isRTL ? 'شاركنا تفاصيل تجربتك الاستثنائية مع هذه التحفة الملكية...' : 'Share your experience with this product...'}
                className="w-full min-h-[90px] bg-[#121212] border border-[#262626] focus:border-[#e5c158]/50 text-white rounded-lg p-3 text-xs outline-none focus:ring-1 focus:ring-[#e5c158]/30 transition-all font-sans resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setFeedbackOrder(null)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-luxury-cream/20 text-luxury-cream text-xs font-serif uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleFeedbackSubmit}
                className="flex-1 bg-[#e5c158] hover:bg-[#e5c158]/90 text-luxury-black text-xs font-serif uppercase tracking-widest font-bold py-2.5 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                {isRTL ? 'إرسال التقييم' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-120 flex items-center gap-3 bg-[#0d0d0d] border border-[#e5c158]/50 px-5 py-3.5 rounded-xl shadow-[0_4px_20px_rgba(229,193,88,0.15)] animate-slide-up" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="h-6 w-6 rounded-full bg-[#e5c158]/10 border border-[#e5c158]/30 flex items-center justify-center text-[#e5c158] text-xs">
            ✓
          </div>
          <div>
            <p className="text-xs text-white font-serif font-bold tracking-wider">
              {isRTL ? 'تأكيد التقييم الملكي' : 'Royal Feedback Confirmed'}
            </p>
            <p className="text-[10px] text-luxury-cream/60 font-sans">
              {toastMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
