import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Globe, Sparkles, Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Send, Check, Share2, Printer, X, FileText, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HeroCarousel from './components/HeroCarousel';
import HomepageGrids from './components/HomepageGrids';
import ProductShowcase from './components/ProductShowcase';
import AdminPortal from './components/AdminPortal';
import SEOManager from './components/SEOManager';
import LoginModal from './components/LoginModal';
import SovereignWishlist from './components/SovereignWishlist';
import { Language, Product, CartItem, Order } from './types';
import { LUXURY_PRODUCTS } from './data';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  getUserProfile, 
  getCartFromFirestore, 
  saveCartToFirestore, 
  getUserOrders, 
  createOrderInFirestore, 
  updateOrderStatus, 
  logoutUser 
} from './lib/firebaseService';


const DUBAI_ZONES = [
  { id: '1', nameEn: 'Downtown Dubai & Burj District', nameAr: 'وسط مدينة دبي ومنطقة برج خليفة', feeAED: 50, estimatedDays: 'Within 3 Hours', estimatedDaysAr: 'خلال ٣ ساعات' },
  { id: '2', nameEn: 'Palm Jumeirah & Dubai Marina', nameAr: 'نخلة جميرا ومرسى دبي', feeAED: 75, estimatedDays: 'Within 4 Hours', estimatedDaysAr: 'خلال ٤ ساعات' },
  { id: '3', nameEn: 'Emirates Hills & Jumeirah Golf Estates', nameAr: 'تلال الإمارات وعقارات جميرا للجولف', feeAED: 100, estimatedDays: 'Within 4 Hours', estimatedDaysAr: 'خلال ٤ ساعات' },
  { id: '4', nameEn: 'Dubai Hills Estate & Meydan', nameAr: 'دبي هيلز ستيت وميدان', feeAED: 50, estimatedDays: 'Same Day (Order before 4 PM)', estimatedDaysAr: 'نفس اليوم (قبل ٤ مساءً)' }
];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const isRTL = lang === 'ar';
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginModalInitialTab, setLoginModalInitialTab] = useState<'profile' | 'orders'>('profile');
  const [activePage, setActivePage] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>(LUXURY_PRODUCTS);

  // Sovereign Wishlist State with localStorage synchronization
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to sync favorites/wishlist:', e);
    }
  }, [favorites]);

  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);

  const handleToggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  const handleMoveToCart = (product: Product) => {
    handleAddToCart(product);
    setFavorites(favorites.filter(favId => favId !== product.id));
  };
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Professional E-commerce Cart State with secure localStorage synchronization
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_cart', JSON.stringify(cart));
      if (isLoggedIn && auth.currentUser) {
        saveCartToFirestore(auth.currentUser.uid, cart);
      }
    } catch (e) {
      console.error('Failed to sync shopping vault bag:', e);
    }
  }, [cart, isLoggedIn]);


  // Professional Orders Log state with localStorage synchronization
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('luxora_orders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // safe fallback
    }
    return [
      {
        id: 'ORD-8429',
        productName: LUXURY_PRODUCTS[0]?.nameEn || 'The Golden Sovereign Chronometer',
        priceAED: 137025,
        customerPhone: '+971 50 123 4567',
        orderTime: '11:24 PM - Jun 22, 2026',
        clientName: 'VIP Member Guild',
        deliveryCoordinates: 'Penthouse 4, Address Boulevard, Downtown Dubai',
        bespokeNotes: 'Escorted armored courier requested.',
        userEmail: 'vip@stylesandgrace.ae',
        customerEmail: 'vip@stylesandgrace.ae',
        items: [{ product: LUXURY_PRODUCTS[0], quantity: 1 }],
        subtotal: 145000,
        discount: 14500,
        vatAED: 6525,
        checkoutMethod: 'QuickBuy'
      },
      {
        id: 'ORD-1094',
        productName: LUXURY_PRODUCTS[2]?.nameEn || 'Burj Oud Intense Bespoke Scent',
        priceAED: 3969,
        customerPhone: '+971 50 123 4567',
        orderTime: '09:15 PM - Jun 22, 2026',
        clientName: 'VIP Member Guild',
        deliveryCoordinates: 'Penthouse 4, Address Boulevard, Downtown Dubai',
        bespokeNotes: 'Deliver after sunset.',
        userEmail: 'vip@stylesandgrace.ae',
        customerEmail: 'vip@stylesandgrace.ae',
        items: [{ product: LUXURY_PRODUCTS[2], quantity: 1 }],
        subtotal: 4200,
        discount: 420,
        vatAED: 189,
        checkoutMethod: 'WhatsApp'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('luxora_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to sync orders ledger:', e);
    }
  }, [orders]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'luxora_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setOrders(parsed);
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email);
        
        const isBypassedAdmin = user.email?.toLowerCase().trim() === 'konami5miv@gmail.com';
        setIsAdmin(isBypassedAdmin); // Only konami5miv@gmail.com is granted admin privileges
        
        if (isBypassedAdmin) {
          setActivePage('admin-portal');
          window.location.hash = '#/admin-portal';
        }
        
        // Fetch cart and orders from Firestore
        try {
          // Sync cart from Firestore
          const dbCart = await getCartFromFirestore(user.uid);
          if (dbCart && dbCart.length > 0) {
            setCart(dbCart);
          }
          
          // Fetch orders from Firestore (1-year history)
          const dbOrders = await getUserOrders(user.uid);
          setOrders(dbOrders);
        } catch (err) {
          console.error('Error fetching user cart/orders from Firestore:', err);
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenLogin = (tab: 'profile' | 'orders' = 'profile') => {
    setLoginModalInitialTab(tab);
    setShowLoginModal(true);
  };

  // Exquisite Shopping Cart Form input state controls
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{ name?: boolean; phone?: boolean; address?: boolean }>({});

  // Dynamic VAT percentage configuration
  const [vatPercentage, setVatPercentage] = useState<number>(() => {
    const saved = localStorage.getItem('luxora_vat_percentage');
    return saved !== null ? Number(saved) : 5;
  });

  // Interactive mini calculator states for the UX engagement (Estimator)
  const [selectedZone, setSelectedZone] = useState<string>('1');
  const [estimatePrice, setEstimatePrice] = useState<number>(15000); // 15,000 AED representative watch buy

  // Invoice states for post-purchase success screen
  const [placedOrderInvoice, setPlacedOrderInvoice] = useState<Order | null>(null);
  const [invoiceCartItems, setInvoiceCartItems] = useState<CartItem[]>([]);
  const [invoiceDiscount, setInvoiceDiscount] = useState<number>(0);
  const [invoiceSubtotal, setInvoiceSubtotal] = useState<number>(0);
  const [isPdfExporting, setIsPdfExporting] = useState<boolean>(false);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  const handleUpdateVatPercentage = (value: number) => {
    setVatPercentage(value);
    localStorage.setItem('luxora_vat_percentage', String(value));
  };

  const handleLoginSuccess = (email: string, adminStatus: boolean) => {
    setIsLoggedIn(true);
    const isBypassedAdmin = email.toLowerCase().trim() === 'konami5miv@gmail.com';
    setIsAdmin(isBypassedAdmin); // Strictly enforce only konami5miv@gmail.com as admin
    setUserEmail(email);
    
    if (isBypassedAdmin) {
      setActivePage('admin-portal');
      window.location.hash = '#/admin-portal';
    } else {
      // Regular customer should never see the Admin Vault screen
      if (activePage === 'admin-portal') {
        setActivePage('home');
        if (window.location.hash) {
          window.location.hash = '';
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Failed to logout of Firebase:', err);
    }
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUserEmail(null);
    setCart([]); // Clear cart upon logout to protect user privacy
    setActivePage('home');
    if (window.location.hash) {
      window.location.hash = '';
    }
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: 'Cancelled' };
      }
      return order;
    }));

    setPlacedOrderInvoice(prev => {
      if (prev && prev.id === orderId) {
        return { ...prev, status: 'Cancelled' };
      }
      return prev;
    });
  };

  const handleLoginRaw = (email: string, pass: string): boolean => {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail === 'konami5miv@gmail.com' && pass === 'DubaiLuxury2026') {
      handleLoginSuccess(normalizedEmail, true);
      return true;
    } else if (normalizedEmail && pass.length >= 4) {
      handleLoginSuccess(normalizedEmail, false);
      return true;
    }
    return false;
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.id === product.id);
      if (existingIdx > -1) {
        const nextCart = [...prev];
        nextCart[existingIdx] = {
          ...nextCart[existingIdx],
          quantity: nextCart[existingIdx].quantity + 1,
        };
        return nextCart;
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handlePlaceOrder = async (product: Product, customerPhone: string) => {
    const subtotalVal = product.priceAED;
    const discountVal = (isLoggedIn && !isAdmin) ? (subtotalVal * 0.10) : 0;
    const taxableVal = subtotalVal - discountVal;
    const vatVal = taxableVal * (vatPercentage / 100);
    const totalVal = taxableVal + vatVal;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: product.nameEn,
      priceAED: totalVal, // standard total inclusive of configured VAT
      customerPhone: customerPhone.trim(),
      orderTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' - ' + new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      clientName: isRTL ? 'عميل خاص كبار الشخصيات' : 'VIP Patron Sovereign Suite',
      deliveryCoordinates: isRTL ? 'موقع تسليم دبلوماسي - دبي' : 'Diplomatic Sovereign Coordinates, Dubai',
      bespokeNotes: isRTL ? 'مطلوب مرافقة حراسة مسلحة دائمًا للقطع الثمينة' : 'Armed sovereign escort mandated at all times.',
      vatAED: vatVal,
      checkoutMethod: 'QuickBuy',
      userEmail: isLoggedIn && userEmail ? userEmail : undefined,
      customerEmail: isLoggedIn && userEmail ? userEmail : undefined,
      items: [{ product, quantity: 1 }],
      subtotal: subtotalVal,
      discount: discountVal,
      status: 'Pending'
    };

    try {
      if (isLoggedIn && auth.currentUser) {
        await createOrderInFirestore(newOrder, auth.currentUser.uid);
      } else {
        await createOrderInFirestore(newOrder);
      }
    } catch (err) {
      console.error('Failed to create order in Firestore:', err);
    }

    setOrders((prev) => [newOrder, ...prev]);

    // Save states for post-purchase invoice display
    setPlacedOrderInvoice(newOrder);
    setInvoiceCartItems([{ product, quantity: 1 }]);
    setInvoiceDiscount(discountVal);
    setInvoiceSubtotal(subtotalVal);
  };

  const handleWhatsAppCheckout = async () => {
    // Basic validation
    const errors: { name?: boolean; phone?: boolean; address?: boolean } = {};
    if (!checkoutName.trim()) errors.name = true;
    if (!checkoutPhone.trim()) errors.phone = true;
    if (!checkoutAddress.trim()) errors.address = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const subtotal = cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0);
    const discount = (isLoggedIn && !isAdmin) ? (subtotal * 0.10) : 0;
    const taxable = subtotal - discount;
    const vat = taxable * (vatPercentage / 100);
    const total = taxable + vat;

    // Create the order in standard model format for local and Admin Control Suite tracking
    const orderItemsDesc = cart.map((item) => `${item.product.nameEn} (x${item.quantity})`).join(', ');
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: orderItemsDesc || 'VIP Pieces Portfolio Selection',
      priceAED: total,
      customerPhone: checkoutPhone.trim(),
      orderTime: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' - ' + new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      clientName: checkoutName.trim(),
      deliveryCoordinates: checkoutAddress.trim(),
      bespokeNotes: checkoutNotes.trim(),
      vatAED: vat,
      checkoutMethod: 'WhatsApp',
      userEmail: isLoggedIn && userEmail ? userEmail : undefined,
      customerEmail: isLoggedIn && userEmail ? userEmail : undefined,
      items: [...cart],
      subtotal: subtotal,
      discount: discount,
      status: 'Pending'
    };

    try {
      if (isLoggedIn && auth.currentUser) {
        await createOrderInFirestore(newOrder, auth.currentUser.uid);
      } else {
        await createOrderInFirestore(newOrder);
      }
    } catch (err) {
      console.error('Failed to create order in Firestore:', err);
    }

    // Push new order object to state array to instantly update admin dashboard stats and incoming logs
    setOrders((prev) => [newOrder, ...prev]);

    const lineDivider = '════════════════════════════';
    
    let msg = `⚜️ *STYLES & GRACE - ORDER REQUEST* ⚜️\n`;
    msg += `${lineDivider}\n\n`;
    msg += `👤 *Client / العميل الكريم:* ${checkoutName.trim()}\n`;
    msg += `📞 *Phone / الاتصال:* ${checkoutPhone.trim()}\n`;
    if (isLoggedIn && userEmail) {
      msg += `✉️ *VIP Account / بريد النخبة:* ${userEmail}\n`;
    }
    msg += `📍 *Armored Dispatch / عنوان التوصيل:* ${checkoutAddress.trim()}\n`;
    if (checkoutNotes.trim()) {
      msg += `📝 *Bespoke Requests / طلبات خاصة:* ${checkoutNotes.trim()}\n`;
    }
    msg += `📅 *Date / التاريخ:* ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n`;
    msg += `🛍️ *SELECTED MASTERPIECES / القطع الفنية المختارة:*\n`;
    
    cart.forEach((item, index) => {
      const totalItemVal = item.product.priceAED * item.quantity;
      msg += `❖ *${index + 1}. ${item.product.nameEn}* (${item.product.nameAr})\n`;
      msg += `   • Quantity / الكمية: ${item.quantity}x\n`;
      msg += `   • Unit Price / سعر الحبة: ${item.product.priceAED.toLocaleString()} AED\n`;
      msg += `   • Total / المجموع: ${totalItemVal.toLocaleString()} AED\n\n`;
    });

    msg += `${lineDivider}\n`;
    msg += `❖ *SOVEREIGN INVESTMENT SUMMARY / ملخص قيمة الاستثمار:*\n`;
    msg += `   • Subtotal / القيمة الأساسية: ${subtotal.toLocaleString()} AED\n`;
    
    if (discount > 0) {
      msg += `   • VIP Elite 10% Discount / خصم كبار الشخصيات: -${discount.toLocaleString()} AED\n`;
    }
    
    msg += `   • UAE VAT ${vatPercentage}% / ضريبة القيمة المضافة: ${vat.toLocaleString()} AED\n`;
    msg += `   • *Grand Total / الإجمالي النهائي:* *${total.toLocaleString()} AED*\n`;
    msg += `${lineDivider}\n\n`;
    msg += `✨ _This dispatch request is locked and certified under Styles & Grace protection guidelines. A luxury client director will contact you on WhatsApp shortly to complete transaction details._`;

    // Target Phone Number is updated directly as requested: +971 58 825 7372
    const whatsappUrl = `https://wa.me/971588257372?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');

    // Save states for post-purchase invoice display
    setPlacedOrderInvoice(newOrder);
    setInvoiceCartItems([...cart]);
    setInvoiceDiscount(discount);
    setInvoiceSubtotal(subtotal);

    // Clean up states for completing experience
    setCart([]);
    setCheckoutName('');
    setCheckoutPhone('');
    setCheckoutAddress('');
    setCheckoutNotes('');
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
      const isBypassedAdmin = userEmail?.toLowerCase().trim() === 'konami5miv@gmail.com';

      if (isLoggedIn && isBypassedAdmin) {
        // Admin must ALWAYS be on admin-portal
        if (activePage !== 'admin-portal') {
          setActivePage('admin-portal');
        }
        if (hash !== '#/admin-portal' && hash !== '#admin-portal') {
          window.location.hash = '#/admin-portal';
        }
        return;
      }

      if (hash === '#admin-portal' || hash === '#/admin-portal' || hash === '#admin' || hash === '#/admin') {
        // Guests or non-admin users must NEVER access the admin page
        setActivePage('home');
        window.location.hash = '';
      } else if (hash === '#home' || hash === '#/home' || !hash) {
        setActivePage('home');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isLoggedIn, userEmail, activePage]);

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

  const handleShareInvoice = async () => {
    if (!placedOrderInvoice) return;

    setIsSharing(true);
    try {
      // Dynamically import to prevent React fiber reconciliation mismatches on startup
      const { pdf } = await import('@react-pdf/renderer');
      const { InvoicePDFDocument } = await import('./components/InvoicePDFDocument');

      const doc = React.createElement(InvoicePDFDocument, {
        order: placedOrderInvoice,
        items: invoiceCartItems,
        vatPercentage: vatPercentage
      });
      const blob = await pdf(doc).toBlob();
      const file = new File([blob], 'Styles_Grace_Invoice.pdf', { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isRTL ? 'فاتورة ستايلز آند جريس دبي' : 'Styles & Grace Invoice',
          text: isRTL 
            ? 'فاتورة مشترياتك من ستايلز آند جريس دبي.' 
            : 'Your invoice from Styles & Grace Dubai.'
        });
      } else {
        // Fallback: If native file sharing is not supported by the browser, automatically trigger a direct file download as fallback.
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Styles_Grace_Invoice.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error sharing invoice:', err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!placedOrderInvoice) return;

    setIsPdfExporting(true);

    try {
      // Dynamically import to prevent React fiber reconciliation mismatches on startup
      const { pdf } = await import('@react-pdf/renderer');
      const { InvoicePDFDocument } = await import('./components/InvoicePDFDocument');

      const doc = React.createElement(InvoicePDFDocument, {
        order: placedOrderInvoice,
        items: invoiceCartItems,
        vatPercentage: vatPercentage
      });
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Styles_Grace_Invoice.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsPdfExporting(false);
    }
  };

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

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p))
    );
  };

  const handleDispatchOrder = async (id: string) => {
    try {
      await updateOrderStatus(id, { status: 'Dispatched' });
    } catch (err) {
      console.error('Failed to update order status in Firestore:', err);
    }
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: 'Dispatched' } : order
      )
    );
  };

  // Handle CTA explore buttons or other page switches
  const handleNavigate = (page: string) => {
    if (page === 'admin-portal') {
      window.location.hash = '#/admin-portal';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'silver') {
      setSelectedCategory('Jewelry');
      setActivePage('home');
      setTimeout(() => {
        const el = document.getElementById('product-showcase-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    if (page === 'watches') {
      setSelectedCategory('Watches');
      setActivePage('home');
      setTimeout(() => {
        const el = document.getElementById('product-showcase-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    if (page === 'fragrances') {
      setSelectedCategory('Fragrance');
      setActivePage('home');
      setTimeout(() => {
        const el = document.getElementById('product-showcase-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return;
    }

    if (page === 'contact') {
      const el = document.getElementById('brand-footer-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    // Default pages
    setActivePage(page);
    if (window.location.hash) {
      window.location.hash = '';
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
        onOpenLogin={() => handleOpenLogin('profile')}
        onOpenAcquisitions={() => handleOpenLogin('orders')}
        onLogout={handleLogout}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        favoritesCount={favorites.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Exquisite VIP Access Banner Info */}
      {isLoggedIn && !isAdmin && (
        <div id="vip-gold-banner" className="bg-gold/10 border-b border-gold/25 text-gold text-xs py-3 px-4 text-center tracking-widest uppercase font-serif flex items-center justify-center gap-2 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-gold flex-shrink-0" />
          <span>
            {isRTL 
              ? `الملف الشخصي الفاخر نشط لـ (${userEmail}) • تم تفعيل خصم النخبة المضمون بنسبة ١٠٪`
              : `Welcome, ${userEmail}! You have an active VIP session with a member discount.`
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
            {searchQuery ? (
              <ProductShowcase 
                lang={lang} 
                products={products} 
                searchQuery={searchQuery} 
                onAddToCart={handleAddToCart} 
                onPlaceOrder={handlePlaceOrder} 
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                vatPercentage={vatPercentage}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            ) : (
              <>
                {/* Hero Carousel Banner Showcase */}
                <HeroCarousel 
                  lang={lang} 
                  onExplore={() => {
                    const el = document.getElementById('homepage-luxury-grids');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
                
                {/* Elegant Welcome Note Section */}
                <section className="bg-luxury-dark py-20 px-4 sm:px-6 lg:px-8 border-b border-gold/5 text-center">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <Sparkles className="h-6 w-6 text-gold mx-auto animate-pulse" />
                    <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-widest text-white uppercase leading-relaxed">
                      {isRTL ? 'إرث من الأصالة والفخامة المطلقة في دبي' : 'EXCLUSIVE TIMELESS CRAFTSMANSHIP & HERITAGE'}
                    </h2>
                    <div className="w-16 h-[1px] bg-gold mx-auto" />
                    <p className="text-luxury-cream/70 text-sm sm:text-base leading-relaxed tracking-wide font-light">
                      {isRTL 
                        ? 'نرحب بكم في عصر جديد للتسوق المترف والمجوهرات الراقية. إن ستايلز آند جريس هي بوابتكم لأرقى الفضة الإيطالية عيار ٩٢٥ الخالية من البهتان، عطور النخبة الفاخرة، الساعات الأنيقة، والمحافظ والنظارات الشمسية والأحزمة المصنوعة يدوياً.' 
                        : 'Welcome to Styles & Grace, your destination for authentic 925 Italian sterling silver and premium jewelry in Dubai. Explore our curated selection of boutique perfumes, luxury watches, handcrafted leather wallets, sunglasses, and elegant belts.'
                      }
                    </p>
                  </div>
                </section>

                {/* Major Section: Curated Sovereign Catalog */}
                <section className="bg-luxury-black pt-16 pb-6 px-4 sm:px-6 lg:px-8 text-center animate-fade-in" id="homepage-luxury-grids">
                   <div className="max-w-3xl mx-auto space-y-4">
                    <span className="text-[10px] tracking-[0.3em] font-mono text-gold uppercase font-bold">
                      {isRTL ? 'معرض المقتنيات الحصرية' : 'OUR COLLECTION'}
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-widest text-white uppercase leading-relaxed">
                      {isRTL ? 'كتالوج الفخامة الإيطالية في دبي' : 'EXCLUSIVE CATALOG SHOWCASE'}
                    </h2>
                    <div className="w-16 h-[1px] bg-gold mx-auto my-3" />
                    <p className="text-luxury-cream/70 text-sm sm:text-base leading-relaxed tracking-wide font-light">
                      {isRTL 
                        ? 'انغمس في تشكيلتنا الاستثنائية من الفضة الإيطالية الفاخرة والمجوهرات الراقية في دبي. صُنعت كل قطعة يدويًا لتجسيد الأناقة الخالدة والحرفية السويسرية الرفيعة.'
                        : 'Explore our curated masterworks of premium Italian silver jewelry in Dubai, meticulously paired with timeless craftsmanship. Each exclusive masterpiece represents a high-end heritage, designed for the discerning individual.'
                      }
                    </p>
                  </div>
                </section>

                {/* Categorized Luxury Grids */}
                <HomepageGrids 
                  lang={lang}
                  onAddToCart={handleAddToCart}
                  onPlaceOrder={handlePlaceOrder}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  vatPercentage={vatPercentage}
                />

                {/* Major Section: Luxury Purchase Estimator */}
                {(() => {
                  const currentZone = DUBAI_ZONES.find(z => z.id === selectedZone) || DUBAI_ZONES[0];
                  const appVatAmount = estimatePrice * 0.05;
                  const appDeliveryFee = currentZone.feeAED;
                  const appTotalPrice = estimatePrice + appVatAmount + appDeliveryFee;

                  return (
                    <section className="bg-luxury-dark py-20 px-4 sm:px-6 lg:px-8 border-t border-gold/15" id="luxury-estimator-section">
                      <div className="max-w-7xl mx-auto">
                        
                        {/* Section Header */}
                        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                          <div className="inline-flex items-center space-x-2 space-x-reverse text-gold">
                            <Sparkles className="h-4 w-4 animate-pulse" />
                            <span className="font-serif text-xs tracking-[0.25em] uppercase font-semibold">
                              {isRTL ? 'التخطيط الاستثماري الآمن' : 'SECURE INVESTMENT PLANNING'}
                            </span>
                          </div>
                          
                          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-widest uppercase leading-relaxed">
                            {isRTL ? 'حاسبة الشراء والتوصيل الفاخر' : 'LUXURY PURCHASE ESTIMATOR'}
                          </h2>
                          
                          <div className="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
                          
                          <p className="text-sm sm:text-base text-luxury-cream/70 leading-relaxed font-sans font-light">
                            {isRTL 
                              ? 'خطط لاستثمارك القادم بثقة واكتشف تكاليف التوصيل المؤمن وسرعة الطواقم في دبي.'
                              : 'Configure your bespoke UAE VAT rate, secure armored delivery fees, and priority dispatch schedules to premium Dubai districts.'
                            }
                          </p>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                          {/* Left Column: Copywriting & trust accords */}
                          <div className="lg:col-span-6 space-y-8 text-start">
                            <div className="space-y-4">
                              <span className="text-[10px] tracking-[0.3em] font-mono text-gold uppercase font-semibold">
                                {isRTL ? 'ضمانات السيادة المطلقة' : 'OUR TRUST GUARANTEE'}
                              </span>
                              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                                {isRTL ? 'صياغة فاخرة وتوصيل دبلوماسي محمي' : 'Quality Craftsmanship, Secure Delivery'}
                              </h3>
                              <p className="text-sm leading-relaxed text-luxury-cream/70 font-light">
                                {isRTL 
                                  ? 'كل قطعة فنية يتم نقلها تخضع لرقابة أمنية مشددة مع تتبع فوري مباشر. نلتزم بأعلى معايير الأمان الدبلوماسي لضمان تسليم مقتنياتكم النادرة بخصوصية مطلقة لقصوركم ومقراتكم في دبي.'
                                  : 'Our premium jewelry is delivered with secure courier protection. We ensure all your items are fully covered and delivered in perfect condition.'
                                }
                              </p>
                            </div>

                            {/* List of high-end trust markers */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gold/10 text-xs text-luxury-cream/80 uppercase tracking-widest font-serif">
                              <div className="flex items-start gap-3">
                                <div className="rounded-full bg-gold/10 p-2 border border-gold/20 text-gold mt-0.5 shrink-0">
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="font-bold text-white mb-1">{isRTL ? 'أصالة معتمدة ١٠٠٪' : '100% CERTIFIED GENUINE'}</p>
                                  <p className="text-[10px] lowercase text-luxury-cream/50 normal-case font-sans tracking-normal">{isRTL ? 'مرفق مع شهادة الفحص الإيطالية الرسمية.' : 'Supplied with formal Italian assay credentials.'}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <div className="rounded-full bg-gold/10 p-2 border border-gold/20 text-gold mt-0.5 shrink-0">
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                                <div>
                                  <p className="font-bold text-white mb-1">{isRTL ? 'توصيل مصفح سريع' : 'SECURE ARMORED DISPATCH'}</p>
                                  <p className="text-[10px] lowercase text-luxury-cream/50 normal-case font-sans tracking-normal">{isRTL ? 'توصيل مباشر إلى الجناح الخاص في غضون ساعات.' : 'Direct-to-suite concierge transit in Dubai.'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Calculator Card */}
                          <div className="lg:col-span-6">
                            <div className="rounded-xl border border-gold/20 bg-luxury-black/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
                              <div className="absolute top-0 right-0 h-16 w-16 bg-gold/5 rounded-tr-xl rounded-bl-full pointer-events-none" />
                              
                              <div className="mb-6 border-b border-gold/10 pb-4">
                                <h3 className="font-serif text-lg font-bold text-gold tracking-widest uppercase">
                                  {isRTL ? 'حاسبة الاستثمار المباشر' : 'ESTIMATE TRANSACTION TOTAL'}
                                </h3>
                                <p className="text-xs text-luxury-cream/60">
                                  {isRTL 
                                    ? 'عدل القيمة التقديرية للقطعة المقتناة لمعاينة الرسوم المجدولة بدقة'
                                    : 'Adjust target item value to preview instant UAE VAT rates and priority delivery schedules'
                                  }
                                </p>
                              </div>

                              {/* Slider for representative item value */}
                              <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-xs tracking-wider">
                                  <span className="text-luxury-cream/80 uppercase font-serif">{isRTL ? 'قيمة القطعة التقديرية' : 'Estimated Item Price'}</span>
                                  <span className="text-gold font-mono font-bold text-sm sm:text-base">{estimatePrice.toLocaleString()} AED</span>
                                </div>
                                <input
                                  id="price-range-slider-main"
                                  type="range"
                                  min="1000"
                                  max="50000"
                                  step="500"
                                  value={estimatePrice}
                                  onChange={(e) => setEstimatePrice(Number(e.target.value))}
                                  className="w-full accent-gold bg-luxury-dark h-1.5 rounded cursor-pointer"
                                />
                                <div className="flex justify-between text-[10px] text-luxury-cream/50 font-mono">
                                  <span>1,000 AED</span>
                                  <span>50,000 AED</span>
                                </div>
                              </div>

                              {/* District Area Selector */}
                              <div className="space-y-4 mb-6">
                                <label className="block text-xs uppercase font-serif tracking-widest text-luxury-cream/80">
                                  {isRTL ? 'اختر منطقة التسليم الفاخر في دبي' : 'Select Premium Dubai Delivery District'}
                                </label>
                                <div className="relative">
                                  <select
                                    id="delivery-zone-selector-main"
                                    value={selectedZone}
                                    onChange={(e) => setSelectedZone(e.target.value)}
                                    className="w-full bg-luxury-dark text-xs text-luxury-cream border border-gold/20 rounded p-3 focus:outline-none focus:border-gold cursor-pointer"
                                  >
                                    {DUBAI_ZONES.map((zone) => (
                                      <option key={zone.id} value={zone.id}>
                                        {isRTL ? zone.nameAr : zone.nameEn}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              {/* Financial Calculation breakdown */}
                              <div className="bg-luxury-dark/80 rounded-lg p-4 space-y-3.5 border border-gold/5 text-xs text-luxury-cream/70 font-sans">
                                <div className="flex justify-between">
                                  <span>{isRTL ? 'قيمة القطعة الأساسية' : 'Curated Value'}</span>
                                  <span className="font-mono text-white">{estimatePrice.toLocaleString()} AED</span>
                                </div>
                                
                                {/* VAT calculation based on active VAT rate state */}
                                <div className="flex justify-between items-center text-luxury-cream/60">
                                  <span className="flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5 text-gold" />
                                    {isRTL ? `ضريبة القيمة المضافة لدولة الإمارات (${vatPercentage}%)` : `UAE VAT Rate (${vatPercentage}%)`}
                                  </span>
                                  <span className="font-mono text-white">+{appVatAmount.toLocaleString()} AED</span>
                                </div>

                                <div className="flex justify-between items-center text-luxury-cream/60">
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5 text-gold" />
                                    {isRTL ? 'خدمة الشحن والتأمين المصفح' : 'Secured Armored Shipping'}
                                  </span>
                                  <span className="font-mono text-white">{appDeliveryFee === 0 ? 'Free' : `+${appDeliveryFee} AED`}</span>
                                </div>

                                {/* Estimate Speed */}
                                <div className="border-t border-gold/10 pt-3.5 mt-1 flex justify-between items-center">
                                  <span className="text-gold font-serif tracking-wider uppercase text-[11px]">{isRTL ? 'السرعة المتوقعة للتوصيل' : 'Delivery Lead Time'}</span>
                                  <span className="text-white font-serif font-bold text-[10px] sm:text-[11px] bg-gold/10 border border-gold/20 px-2.5 py-0.5 rounded">
                                    {isRTL ? currentZone.estimatedDaysAr : currentZone.estimatedDays}
                                  </span>
                                </div>

                                {/* Secure Total */}
                                <div className="border-t border-gold/20 pt-4 mt-2 flex justify-between items-center text-sm font-serif">
                                  <span className="text-white font-bold uppercase tracking-widest">{isRTL ? 'مجموع الاستثمار الكلي الكلي المجدول' : 'Secured Transaction Total'}</span>
                                  <span className="text-gold font-mono font-bold text-base filter drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
                                    {appTotalPrice.toLocaleString()} AED
                                  </span>
                                </div>
                              </div>

                              {/* Footer pledge warning */}
                              <div className="mt-4 text-[10px] text-center text-luxury-cream/40 italic">
                                {isRTL 
                                  ? '* متاح النقل مجاناً للطلبيات فوق ٢٠,٠٠٠ درهم شاملة الحماية الدبلوماسية.'
                                  : '* Complementary diplomatic courier for transactions exceeding 20,000 AED.'
                                }
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })()}
              </>
            )}
          </div>
        ) : activePage === 'shop' ? (
          <div className="py-6">
            <ProductShowcase 
              lang={lang} 
              products={products} 
              searchQuery={searchQuery} 
              onAddToCart={handleAddToCart} 
              onPlaceOrder={handlePlaceOrder} 
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              vatPercentage={vatPercentage}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        ) : activePage === 'admin-portal' ? (
          <AdminPortal
            lang={lang}
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onDeleteProduct={handleDeleteProduct}
            isAuthenticated={isLoggedIn && isAdmin}
            onLogout={handleLogout}
            onLogin={handleLoginRaw}
            onDispatchOrder={handleDispatchOrder}
            vatPercentage={vatPercentage}
            onUpdateVatPercentage={handleUpdateVatPercentage}
            onUpdateProduct={handleUpdateProduct}
            userEmail={userEmail}
          />
        ) : activePage === 'cart' ? (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-slide-up" dir={isRTL ? 'rtl' : 'ltr'}>
            
            {/* Header section with back button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-gold/10">
              <div>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="group flex items-center gap-2 text-xs uppercase tracking-widest text-gold hover:text-white transition-all mb-2 cursor-pointer bg-transparent border-none"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                  <span>{isRTL ? 'مواصلة تصفح المجموعة' : 'Continue Shopping'}</span>
                </button>
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-white uppercase flex items-center gap-2 mt-1">
                  <ShoppingBag className="h-6 w-6 text-gold animate-pulse" />
                  <span>{isRTL ? 'حقيبة الاقتناء الملوكية' : 'Royal Selection Bag'}</span>
                </h1>
              </div>
              
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-luxury-cream/40 font-mono">
                  {isRTL ? 'إثبات حيازة آمن' : 'Secured Shopping Vault Session'}
                </p>
                <p className="text-xs text-gold font-mono">{cart.reduce((sum, item) => sum + item.quantity, 0)} {isRTL ? 'تحفة فنية مختارة' : 'Masterpiece(s)'}</p>
              </div>
            </div>

            {cart.length === 0 ? (
              /* Empty state container styled as fine velvet jeweler box */
              <div className="text-center py-20 px-4 max-w-xl mx-auto rounded-xl border border-gold/10 bg-luxury-dark/40 shadow-2xl relative overflow-hidden">
                <span className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                <div className="rounded-full bg-gold/5 border border-gold/20 p-5 w-fit mx-auto mb-6">
                  <ShoppingBag className="h-8 w-8 text-gold/60" />
                </div>
                <h3 className="font-serif text-lg font-bold uppercase tracking-widest text-white mb-2">
                  {isRTL ? 'حقيبة الاقتناء فارغة حالياً' : 'Your Shopping Bag is Empty'}
                </h3>
                <p className="text-xs text-luxury-cream/60 leading-relaxed mb-8 max-w-md mx-auto">
                  {isRTL
                    ? 'اكتشف إبداعات حصرية لربيع وصيف ٢٠٢٦ المعززة بسبائك الذهب عيار ٢٤ قيراط لضمها لثرواتكم ومجموعتكم الفاخرة.'
                    : 'Establish your selection from our private catalog of solid gold watch designs and diamond-set works to enrich your estate portfolio.'
                  }
                </p>
                <button
                  onClick={() => handleNavigate('shop')}
                  className="bg-gold hover:bg-white text-luxury-black text-xs uppercase font-serif font-bold tracking-widest px-8 py-3.5 rounded-md transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  {isRTL ? 'تصفح المجموعة بالكامل' : 'Explore Curated Masterpieces'}
                </button>
              </div>
            ) : (
              /* Full-grid majestic e-commerce list */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left column - item cards */}
                <div className="lg:col-span-7 space-y-4">
                  {cart.map((item) => {
                    const itemTotal = item.product.priceAED * item.quantity;
                    
                    return (
                      <div 
                        key={item.product.id}
                        className="group relative rounded-xl border border-gold/10 bg-luxury-dark/30 p-4 flex gap-4 transition-all hover:border-gold/35 overflow-hidden"
                      >
                        {/* Decorative dynamic gold glow on card hover */}
                        <div className="absolute inset-0 bg-radial-gradient from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        {/* Image Frame */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-gold/15 bg-luxury-black/90 flex-shrink-0 relative">
                          <img 
                            src={item.product.image} 
                            alt={item.product.nameEn}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          />
                        </div>
                        
                        {/* Summary Details */}
                        <div className="flex-grow flex flex-col justify-between py-1">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[9px] font-mono uppercase tracking-widest text-gold bg-gold/5 border border-gold/15 px-1.5 py-0.5 rounded">
                                  {item.product.category}
                                </span>
                                <h3 className="font-serif text-sm sm:text-base font-medium text-white tracking-wide mt-1.5">
                                  {isRTL ? item.product.nameAr : item.product.nameEn}
                                </h3>
                              </div>
                              
                              <button 
                                onClick={() => handleRemoveFromCart(item.product.id)}
                                className="p-1 px-2 border border-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500/10 rounded transition-all cursor-pointer flex items-center justify-center bg-transparent"
                                title={isRTL ? 'إزالة من الحقيبة' : 'Remove masterpiece'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            
                            <p className="text-[11px] text-luxury-cream/50 mt-1 line-clamp-1">
                              {isRTL ? item.product.descriptionAr : item.product.descriptionEn}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap justify-between items-center gap-3 pt-3 mt-2 border-t border-gold/5">
                            {/* Quantity Controllers */}
                            <div className="flex items-center border border-gold/30 rounded bg-luxury-black/40 overflow-hidden divide-x divide-gold/15 divide-solid">
                              <button 
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                                className="px-2.5 py-1 text-gold hover:bg-gold/10 hover:text-white transition-all cursor-pointer font-serif text-xs font-bold"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3.5 py-1 text-xs font-mono text-white font-semibold bg-luxury-dark/40">{item.quantity}</span>
                              <button 
                                type="button"
                                onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                                className="px-2.5 py-1 text-gold hover:bg-gold/10 hover:text-white transition-all cursor-pointer font-serif text-xs font-bold"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Investment value output */}
                            <div className="text-right">
                              <p className="text-[10px] text-luxury-cream/40 uppercase font-mono">
                                {isRTL ? 'الاستثمار المجموع' : 'Total Value'}
                              </p>
                              <p className="text-xs sm:text-sm text-gold font-mono font-medium">
                                {itemTotal.toLocaleString()} AED
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Right Column - Receipt summary & secure order checkout form */}
                <div className="lg:col-span-5">
                  <div className="rounded-xl border border-gold/15 bg-luxury-dark/40 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
                    <span className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <h3 className="font-serif text-sm font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-2 pb-3 border-b border-gold/15 font-semibold">
                      <Sparkles className="h-4 w-4 text-gold animate-pulse" />
                      <span>{isRTL ? 'بوابة الحجز والمرافقة الملكيّة' : 'Royal Booking Concierge'}</span>
                    </h3>

                    {/* Member VIP Discount activation box status */}
                    {isLoggedIn && !isAdmin ? (
                      <div className="bg-gold/5 border border-gold/30 rounded-lg p-3 text-[10px] text-gold tracking-wider flex items-center gap-2 mb-6 font-serif uppercase">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse text-gold flex-shrink-0" />
                        <span>
                          {isRTL 
                            ? 'تم رصد وتفعيل خصم كبار الشخصيات بنسبة ١٠٪' 
                            : 'Verified VIP Member: 10% Discount Active'
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="bg-luxury-black/35 border border-gold/10 rounded-lg p-3 text-[10px] text-luxury-cream/60 flex items-center justify-between gap-1 mb-6 font-serif">
                        <span>
                          {isRTL 
                            ? 'سجل كعضو كبار الشخصيات لتطبيق خصم ١٠٪' 
                            : 'Sign in to get 10% off your order'
                          }
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleOpenLogin('profile')}
                          className="text-[9px] uppercase tracking-wider text-gold font-serif underline hover:text-white cursor-pointer font-bold bg-transparent border-none"
                        >
                          {isRTL ? 'تفويض الدخول' : 'Sign In'}
                        </button>
                      </div>
                    )}

                    {/* Sovereign Deed Invoice calculations breakdown */}
                    <div className="space-y-3 text-xs mb-6 pb-4 border-b border-gold/10 font-mono">
                      <div className="flex justify-between text-luxury-cream/75">
                        <span>{isRTL ? 'قيمة المجموعة الأساسية:' : 'Subtotal:'}</span>
                        <span>{cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0).toLocaleString()} AED</span>
                      </div>
                      
                      {isLoggedIn && !isAdmin && (
                        <div className="flex justify-between text-emerald-400">
                          <span>{isRTL ? 'خصم النخبة (١٠٪)-' : 'VIP Discount (-10%):'}</span>
                          <span>-{(cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) * 0.10).toLocaleString()} AED</span>
                        </div>
                      )}

                      <div className="flex justify-between text-luxury-cream/50">
                        <span>{isRTL ? `ضريبة القيمة المضافة للإمارات (${vatPercentage}٪):` : `UAE VAT (${vatPercentage}%):`}</span>
                        <span>
                          {((cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) - (isLoggedIn && !isAdmin ? cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) * 0.10 : 0)) * (vatPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                        </span>
                      </div>

                      <div className="flex justify-between text-white font-bold pt-2 border-t border-gold/10 font-serif text-sm">
                        <span className="text-gold tracking-widest font-semibold">{isRTL ? 'قيمة الاستثمار الإجمالي:' : 'GRAND TOTAL:'}</span>
                        <span className="text-gold font-mono font-semibold">
                          {(
                            (cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) - (isLoggedIn && !isAdmin ? cart.reduce((sum, item) => sum + (item.product.priceAED * item.quantity), 0) * 0.10 : 0)) * (1 + vatPercentage / 100)
                          ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                        </span>
                      </div>
                    </div>

                    {/* Elegant Client Input Form Fields */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'اسم العميل الموقّر *' : 'Client Full Name *'}
                        </label>
                        <input 
                          type="text"
                          value={checkoutName}
                          onChange={(e) => setCheckoutName(e.target.value)}
                          placeholder={isRTL ? 'مثال: سمو الشيخ أحمد بن راشد' : 'Example: His Highness, Ambassador Philip'}
                          className={`w-full bg-luxury-black/60 border rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans ${formErrors.name ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                        />
                        {formErrors.name && (
                          <p className="text-[10px] text-red-400 font-sans mt-1">
                            {isRTL ? 'يرجى إدخال الاسم لتنسيق سجل الاقتناء.' : 'Client identity registration required.'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'رقم الهاتف للاتصال الجارٍ *' : 'Direct Mobile Number *'}
                        </label>
                        <input 
                          type="tel"
                          value={checkoutPhone}
                          onChange={(e) => setCheckoutPhone(e.target.value)}
                          placeholder={isRTL ? 'مثال: 7510447887' : 'Example: 7510447887'}
                          className={`w-full bg-luxury-black/60 border rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-mono ${formErrors.phone ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                        />
                        {formErrors.phone && (
                          <p className="text-[10px] text-red-400 font-sans mt-1">
                            {isRTL ? 'يرجى تزويدنا برقم هاتف للتنسيق الفوري.' : 'Registered customer mobile number required.'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'عنوان التسليم الآمن أو المجلس *' : 'Armored Delivery Coordinates *'}
                        </label>
                        <textarea 
                          rows={2}
                          value={checkoutAddress}
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          placeholder={isRTL ? 'مجلس قصر زعبيل، نخلة الجميرا، فندق برج العرب...' : 'Zabeel Palace Majlis, Palm Jumeirah Estate, or Burj Al Arab Suite...'}
                          className={`w-full bg-luxury-black/60 border rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans resize-none ${formErrors.address ? 'border-red-500/80 bg-red-950/5' : 'border-gold/20'}`}
                        />
                        {formErrors.address && (
                          <p className="text-[10px] text-red-400 font-sans mt-1">
                            {isRTL ? 'يرجى تحديد إحداثيات التسجيل والتفريغ.' : 'Delivery coordinate points required.'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] uppercase font-mono tracking-widest text-luxury-cream/50">
                          {isRTL ? 'متطلبات وعلامات مرافقة خاصة (اختياري)' : 'Bespoke Guard Requirements (Optional)'}
                        </label>
                        <input 
                          type="text"
                          value={checkoutNotes}
                          onChange={(e) => setCheckoutNotes(e.target.value)}
                          placeholder={isRTL ? 'نقش أحرف العائلة بالذهب، سيارة دبلوماسية مرافقة...' : 'Double velvet layer box, customized secure armor transport...'}
                          className="w-full bg-luxury-black/60 border border-gold/20 rounded-md p-3 text-xs text-luxury-cream focus:outline-none focus:border-gold transition-colors font-sans"
                        />
                      </div>
                    </div>

                    {/* Checkout on WhatsApp button */}
                    <div className="mt-6">
                      <button 
                        id="whatsapp-checkout-btn"
                        onClick={handleWhatsAppCheckout}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-luxury-black font-serif text-xs font-bold tracking-widest uppercase py-4 rounded-md shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer border border-emerald-500/20"
                      >
                        <Send className="h-4 w-4" />
                        <span>{isRTL ? 'تأكيد وحجز الوتساب المباشر' : 'Secure Checkout on WhatsApp'}</span>
                      </button>
                      
                      <p className="text-[9px] text-luxury-cream/40 italic text-center mt-3">
                        {isRTL 
                          ? '* بمجرد النقر، سيتم توجيه مكالمتكم مباشرة للبدء في إجراء الفحص والصياغة.' 
                          : '* Requests are guarded securely under family-office bank level privacy.'
                        }
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          /* Elegant placeholder view layout for modularly built future steps */
          <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center space-y-6 animate-slide-up">
            <div className="rounded-full bg-gold/5 border border-gold/20 p-5 mb-2">
              <Sparkles className="h-8 w-8 text-gold animate-[spin_8s_linear_infinite]" />
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-widest text-white uppercase">
              {isRTL ? (
                <>قريباً | <span className="text-gold">ستايلز آند جريس</span></>
              ) : (
                <>Coming Soon | <span className="text-gold">Styles & Grace</span></>
              )}
            </h2>
            <div className="w-12 h-[1px] bg-gold" />
            <p className="text-luxury-cream/70 max-w-lg text-sm leading-relaxed">
              {isRTL 
                ? `جاري الآن تهيئة صفحة "${activePage.toUpperCase()}" بالتعاون مع دور الموضة والصياغة الفلورانسيّة والسويسرية.`
                : `We are hand-assembling the bespoke module for "${activePage.toUpperCase()}" to host your private viewing session.`
              }
            </p>
            <button
              onClick={() => handleNavigate('home')}
              className="mt-4 font-serif text-xs font-semibold tracking-widest uppercase text-gold hover:text-white border-b border-gold hover:border-white pb-1 transition-all duration-300 bg-transparent border-none"
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
            <h4 className="font-serif text-lg tracking-[0.2em] font-extrabold text-gold">Styles & Grace</h4>
            <p className="max-w-xs mx-auto md:mx-0">
              {isRTL 
                ? 'الوجهة الموثوقة الأولى لاقتناء أفخر الفضة الإيطالية، العطور الفاخرة، الساعات والإكسسوارات في الكرامة، دبي، الإمارات العربية المتحدة.'
                : 'The premier destination for 925 Italian silver, luxury perfumes, watches, and premium accessories in Karama - Dubai, UAE.'
              }
            </p>
          </div>

          {/* Quick Contact info */}
          <div className="space-y-2 flex flex-col items-center md:items-start text-luxury-cream/70">
            <span className="font-serif text-[11px] font-bold text-gold uppercase tracking-widest mb-1">{isRTL ? 'تواصل معنا' : 'Concierge Desk'}</span>
            <div className="flex items-center space-x-2 space-x-reverse justify-center md:justify-start">
              <Phone className="h-3.5 w-3.5 text-gold" />
              <span>+971 58 825 7372</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse justify-center md:justify-start">
              <Mail className="h-3.5 w-3.5 text-gold" />
              <span>info@stylesandgrace.ae</span>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-2 flex flex-col items-center md:items-start text-luxury-cream/70">
            <span className="font-serif text-[11px] font-bold text-gold uppercase tracking-widest mb-1">{isRTL ? 'موقعنا' : 'Bespoke Lounge'}</span>
            <div className="flex items-center space-x-2 space-x-reverse justify-center md:justify-start text-center md:text-start">
              <MapPin className="h-3.5 w-3.5 text-gold flex-shrink-0" />
              <span>{isRTL ? 'محل ٢٢، مجمع العطار للتسوق، الكرامة - دبي، الإمارات العربية المتحدة' : 'Shop 22, Al Attar Shopping Mall, Karama - Dubai, UAE'}</span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gold/10 mt-10 pt-6 text-center text-[10px] text-luxury-cream/35 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            © {new Date().getFullYear()} Styles & Grace. {isRTL ? 'جميع الحقوق محفوظة.' : 'All Rights Reserved.'}
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
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        isAdmin={isAdmin}
        orders={orders}
        onReopenInvoice={(order) => {
          setPlacedOrderInvoice(order);
          setInvoiceCartItems(order.items || []);
          setInvoiceDiscount(order.discount || 0);
          setInvoiceSubtotal(order.subtotal || order.priceAED);
        }}
        onCancelOrder={handleCancelOrder}
        onLogout={handleLogout}
        vatPercentage={vatPercentage}
        initialTab={loginModalInitialTab}
      />

      {/* Sovereign Wishlist Drawer */}
      <SovereignWishlist
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        lang={lang}
        favorites={favorites}
        products={products}
        onToggleFavorite={handleToggleFavorite}
        onMoveToCart={handleMoveToCart}
      />

      {/* Post-Purchase Success & Print Invoice Overlay */}
      <AnimatePresence>
        {placedOrderInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-luxury-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto invoice-print-overlay invoice-modal-container"
          >
            {/* Modal Body */}
            <motion.div
              id="invoice-capture-container"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl bg-luxury-dark border border-gold/25 rounded-2xl shadow-2xl p-6 sm:p-10 my-8 overflow-hidden text-start printable-invoice-wrapper"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Dynamic print-media style block */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  /* Force exact background and colors preservation on printing */
                  html, body, .invoice-modal-container, .invoice-print-overlay, .printable-invoice-wrapper {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                    background-color: #0d0d0d !important;
                    color: #F5E6D3 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    overflow: visible !important;
                  }

                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  
                  /* Ensure parent container does not crop or hide anything */
                  .invoice-print-overlay {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    background-color: #0d0d0d !important;
                    backdrop-filter: none !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    display: block !important;
                    z-index: 9999999 !important;
                  }

                  /* Hide standard application shell elements and all UI buttons */
                  #luxora-app-root, footer, header, nav, #brand-footer-section, #vip-gold-banner, .no-print, button, .non-printable, .print\\:hidden, #admin-toasts-portal {
                    display: none !important;
                    height: 0 !important;
                    overflow: hidden !important;
                    visibility: hidden !important;
                  }

                  /* Elevate printable area to absolute full page canvas optimized for A4 */
                  .printable-invoice-wrapper {
                    position: relative !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    height: auto !important;
                    margin: 0 !important;
                    padding: 20mm !important; /* Elegant 20mm margins for A4 paper */
                    background-color: #0d0d0d !important;
                    color: #F5E6D3 !important;
                    box-shadow: none !important;
                    border: none !important;
                    border-radius: 0 !important;
                    display: block !important;
                    overflow: visible !important;
                  }

                  /* Remove custom web scrollbars or container height restrictions during print */
                  .invoice-print-overlay, .printable-invoice-wrapper, .overflow-x-auto, .overflow-y-auto {
                    overflow: visible !important;
                    height: auto !important;
                    max-height: none !important;
                  }

                  /* Adjust borders and dividers to luxurious gold accents */
                  .printable-invoice-wrapper * {
                    border-color: rgba(212, 175, 55, 0.2) !important;
                    text-shadow: none !important;
                    box-shadow: none !important;
                  }

                  /* Custom luxury color helpers for printing */
                  .print-text-dark {
                    color: #ffffff !important;
                    font-weight: 700 !important;
                  }
                  .print-text-muted {
                    color: rgba(245, 230, 211, 0.6) !important; /* elegant muted cream */
                  }
                  .print-logo-gold {
                    color: #D4AF37 !important; /* gorgeous luxury gold */
                    font-weight: 800 !important;
                  }
                  
                  /* Ensure tables and elements expand without clipping or scrolling */
                  table {
                    page-break-inside: auto;
                    width: 100% !important;
                  }
                  tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                  }
                  thead {
                    display: table-header-group;
                  }
                  tfoot {
                    display: table-footer-group;
                  }
                }
              `}} />

              {/* Gold border decorative line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent no-print print:hidden" data-html2canvas-ignore="true" />
              
              {/* Close Button on-screen */}
              <button
                onClick={() => setPlacedOrderInvoice(null)}
                className="absolute top-5 right-5 text-luxury-cream/40 hover:text-gold transition-colors p-2 rounded-full hover:bg-gold/5 no-print print:hidden cursor-pointer"
                aria-label="Close"
                data-html2canvas-ignore="true"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Print-Only Letterhead (Hidden on web screen, visible on print) */}
              <div className="hidden print:flex flex-col pb-8 border-b-2 border-gold/25 mb-8 w-full text-luxury-cream" dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="flex justify-between items-start w-full">
                  <div className={`text-start flex items-center gap-3.5 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                    <Crown className="h-9 w-9 text-[#e5c158] print-logo-gold shrink-0" />
                    <div>
                      <h1 className="font-serif text-3xl font-black tracking-widest text-gold print-logo-gold leading-none uppercase">
                        Styles & Grace
                      </h1>
                      <p className="text-[11px] font-mono tracking-[0.25em] text-luxury-cream/80 uppercase mt-2 font-bold">
                        RETAIL FLAGSHIP
                      </p>
                      <p className="text-[10px] font-sans text-luxury-cream/60 mt-1">
                        Shop 22, Al Attar Shopping Mall, Karama - Dubai, UAE • info@stylesandgrace.ae
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="border-2 border-gold/30 px-3 py-1.5 rounded-md bg-luxury-black/60">
                      <p className="text-[9px] font-mono tracking-wider text-gold/60 font-bold uppercase leading-none">
                        {isRTL ? 'الرقم الضريبي الرسمي لدولة الإمارات' : 'OFFICIAL UAE TAX IDENTIFICATION'}
                      </p>
                      <p className="text-sm font-mono font-black text-white print-text-dark tracking-widest mt-1">
                        TRN: 100342981500003
                      </p>
                    </div>
                    <p className="text-[9px] font-mono text-luxury-cream/40 mt-2">
                      {isRTL ? 'مستند مالي معتمد ومعين قانونياً' : 'LEGALLY APPOINTED FINANCIAL LEDGER'}
                    </p>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-gold/15 mt-6" />
              </div>

              {/* Premium Corporate Letterhead (Web Screen Only) */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-gold/15 mb-8 print:hidden">
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                  {/* Company Logo Icon */}
                  <div className="h-14 w-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center print:border-neutral-300 print:bg-transparent">
                    <Crown className="h-9 w-9 text-[#e5c158] print-logo-gold shrink-0" />
                  </div>
                  <div className="text-start">
                    <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-widest text-white uppercase print-logo-gold leading-none">
                      Styles & Grace
                    </h1>
                    <p className="text-[10px] font-mono tracking-[0.2em] text-gold uppercase mt-1 print-logo-gold">
                      {isRTL ? 'ستايلز آند جريس ش.ذ.م.م' : 'Styles & Grace Trading L.L.C.'}
                    </p>
                    <p className="text-[9px] font-mono text-luxury-cream/40 mt-0.5 print-text-muted">
                      {isRTL ? 'ترخيص رقم: ١٠٤١٠٦٠ • دبي، الإمارات العربية المتحدة' : 'License No: 1041060 • Dubai, UAE'}
                    </p>
                  </div>
                </div>

                {/* Tax & Official Credentials Side */}
                <div className="text-start md:text-end font-mono text-[10px] space-y-1 text-luxury-cream/60 print-text-muted">
                  <div className="text-xs font-serif font-bold text-gold uppercase tracking-wider print-logo-gold">
                    {isRTL ? 'فاتورة ضريبية رسمية' : 'OFFICIAL TAX INVOICE'}
                  </div>
                  <div>
                    <span className="text-luxury-cream/40 print-text-muted">{isRTL ? 'الرقم الضريبي (TRN): ' : 'TRN: '}</span>
                    <span className="text-white font-bold print-text-dark">100452390800003</span>
                  </div>
                  <div>
                    <span className="text-luxury-cream/40 print-text-muted">{isRTL ? 'البريد الإلكتروني: ' : 'Email: '}</span>
                    <span className="text-white print-text-dark">info@stylesandgrace.ae</span>
                  </div>
                  <div>
                    <span className="text-luxury-cream/40 print-text-muted">{isRTL ? 'العنوان الرئيسي: ' : 'Address: '}</span>
                    <span className="text-white print-text-dark">{isRTL ? 'محل ٢٢، مجمع العطار للتسوق، الكرامة - دبي، الإمارات العربية المتحدة' : 'Shop 22, Al Attar Shopping Mall, Karama - Dubai, UAE'}</span>
                  </div>
                </div>
              </div>

              {/* Visual success pill */}
              {placedOrderInvoice.status === 'Cancelled' ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 mb-8 no-print print:hidden">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs text-red-500 tracking-wider uppercase font-serif font-bold">
                    {isRTL ? 'تم إلغاء الطلب وسحب مستند الاقتناء' : 'Order Revoked & Cancelled'}
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 flex items-center gap-2 mb-8 no-print print:hidden">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 tracking-wider uppercase font-serif font-bold">
                    {isRTL ? 'تم حجز الطلب وتأكيد مستند الاقتناء' : 'Order Confirmed & Secure Lock Secured'}
                  </span>
                </div>
              )}

              {/* Details Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gold/15 mb-8 text-xs">
                {/* Invoice Metadata */}
                <div className="space-y-3">
                  <h3 className="font-serif text-xs font-bold tracking-widest text-gold uppercase print-logo-gold">
                    {isRTL ? 'تفاصيل المذكرة المالية' : 'Invoice Specifications'}
                  </h3>
                  <div className="space-y-2 font-sans text-luxury-cream/80">
                    <div className="flex justify-between md:justify-start gap-4">
                      <span className="text-luxury-cream/40 uppercase tracking-wider w-32 print-text-muted">{isRTL ? 'رقم الفاتورة:' : 'Invoice ID:'}</span>
                      <span className="font-mono text-white font-bold tracking-wider print-text-dark">{placedOrderInvoice.id}</span>
                    </div>
                    <div className="flex justify-between md:justify-start gap-4">
                      <span className="text-luxury-cream/40 uppercase tracking-wider w-32 print-text-muted">{isRTL ? 'تاريخ المعاملة:' : 'Timestamp:'}</span>
                      <span className="text-white print-text-dark font-mono">{placedOrderInvoice.orderTime}</span>
                    </div>
                    <div className="flex justify-between md:justify-start gap-4">
                      <span className="text-luxury-cream/40 uppercase tracking-wider w-32 print-text-muted">{isRTL ? 'الاعتماد التنظيمي:' : 'Regulatory Seal:'}</span>
                      <span className="text-gold tracking-widest font-serif font-semibold print-logo-gold">STYLES & GRACE DIRECT</span>
                    </div>
                  </div>
                </div>

                {/* Client Delivery Details */}
                <div className="space-y-3">
                  <h3 className="font-serif text-xs font-bold tracking-widest text-gold uppercase print-logo-gold">
                    {isRTL ? 'بيانات العميل الكريم والتسليم' : 'VIP Patron & Delivery Coordinates'}
                  </h3>
                  <div className="space-y-2 font-sans text-luxury-cream/80">
                    <div className="flex justify-between md:justify-start gap-4">
                      <span className="text-luxury-cream/40 uppercase tracking-wider w-32 print-text-muted">{isRTL ? 'العميل الكريم:' : 'VIP Client Name:'}</span>
                      <span className="text-white font-medium print-text-dark">{placedOrderInvoice.clientName || (isRTL ? 'عميل كبار الشخصيات' : 'VIP Patron')}</span>
                    </div>
                    <div className="flex justify-between md:justify-start gap-4">
                      <span className="text-luxury-cream/40 uppercase tracking-wider w-32 print-text-muted">{isRTL ? 'رقم الاتصال:' : 'Contact Phone:'}</span>
                      <span className="font-mono text-white print-text-dark">{placedOrderInvoice.customerPhone}</span>
                    </div>
                    <div className="flex justify-between md:justify-start gap-4">
                      <span className="text-luxury-cream/40 uppercase tracking-wider w-32 print-text-muted">{isRTL ? 'إحداثيات التوصيل:' : 'Coordinates:'}</span>
                      <span className="text-white print-text-dark">{placedOrderInvoice.deliveryCoordinates}</span>
                    </div>
                    {placedOrderInvoice.bespokeNotes && (
                      <div className="flex justify-between md:justify-start gap-4">
                        <span className="text-luxury-cream/40 uppercase tracking-wider w-32 print-text-muted">{isRTL ? 'مرافقة خاصة:' : 'Bespoke Escort:'}</span>
                        <span className="text-gold font-medium italic print-logo-gold">{placedOrderInvoice.bespokeNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-4 mb-8">
                <h3 className="font-serif text-xs font-bold tracking-widest text-gold uppercase print-logo-gold">
                  {isRTL ? 'مستند وجدول التحف الفنية والمقتنيات' : 'Curated Masterpieces Ledger'}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-gold/20 text-gold uppercase font-serif tracking-widest print-logo-gold">
                        <th className="py-3 px-1 text-start">{isRTL ? 'البيان والتحفة' : 'Masterpiece Description'}</th>
                        <th className="py-3 px-4 text-center">{isRTL ? 'الكمية' : 'Qty'}</th>
                        <th className="py-3 px-4 text-right">{isRTL ? 'سعر الوحدة' : 'Unit Price'}</th>
                        <th className="py-3 px-4 text-right">{isRTL ? 'القيمة الإجمالية' : 'Total Value'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/10">
                      {invoiceCartItems.map((item, index) => {
                        const itemSubtotal = item.product.priceAED * item.quantity;
                        return (
                          <tr key={index} className="text-luxury-cream/90 hover:bg-gold/5 transition-colors">
                            <td className="py-4 px-1 flex items-center gap-3">
                              <div className="w-10 h-10 rounded border border-gold/10 overflow-hidden bg-luxury-black flex-shrink-0 no-print">
                                <img src={item.product.image} alt={item.product.nameEn} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-serif text-sm font-semibold text-white print-text-dark">
                                  {isRTL ? item.product.nameAr : item.product.nameEn}
                                </p>
                                <p className="text-[10px] text-luxury-cream/40 uppercase font-mono tracking-wider print-text-muted mt-0.5">
                                  {item.product.category}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-white print-text-dark">
                              {item.quantity}
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-luxury-cream/70 print-text-muted">
                              {item.product.priceAED.toLocaleString()} AED
                            </td>
                            <td className="py-4 px-4 text-right font-mono text-white font-bold print-text-dark">
                              {itemSubtotal.toLocaleString()} AED
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sovereign Summary Panel */}
              <div className="bg-luxury-black/40 border border-gold/10 p-6 rounded-xl ml-auto max-w-md space-y-3 font-sans text-xs">
                <div className="flex justify-between text-luxury-cream/50">
                  <span className="uppercase tracking-wider print-text-muted">{isRTL ? 'المجموع قبل الضريبة:' : 'Bespoke Subtotal:'}</span>
                  <span className="font-mono text-white print-text-dark">{invoiceSubtotal.toLocaleString()} AED</span>
                </div>
                
                {invoiceDiscount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span className="uppercase tracking-wider print-logo-gold">{isRTL ? 'خصم عضوية كبار الشخصيات (١٠٪):' : 'VIP Member Discount:'}</span>
                    <span className="font-mono font-bold">-{invoiceDiscount.toLocaleString()} AED</span>
                  </div>
                )}
                
                {/* Dynamic VAT based on system config */}
                <div className="flex justify-between text-luxury-cream/50 border-t border-gold/5 pt-2.5">
                  <span className="uppercase tracking-wider print-text-muted">{isRTL ? `ضريبة القيمة المضافة لدولة الإمارات (${vatPercentage}٪):` : `UAE VAT (${vatPercentage}%):`}</span>
                  <span className="font-mono text-white print-text-dark">
                    {((invoiceSubtotal - invoiceDiscount) * (vatPercentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                  </span>
                </div>

                <div className="flex justify-between text-gold font-serif text-sm font-bold border-t border-gold/20 pt-3">
                  <span className="uppercase tracking-widest print-logo-gold">{isRTL ? 'قيمة الاستثمار الملوكي الإجمالي:' : 'Grand Total:'}</span>
                  <span className="font-mono text-base text-gold print-logo-gold">
                    {placedOrderInvoice.priceAED.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} AED
                  </span>
                </div>
              </div>

              {/* Screen action controls */}
              <div 
                className={`flex flex-col sm:flex-row justify-end gap-4 mt-10 pt-6 border-t border-gold/15 no-print print:hidden ${isPdfExporting ? 'hidden' : ''}`}
                data-html2canvas-ignore="true"
              >
                <button
                  onClick={() => setPlacedOrderInvoice(null)}
                  className="px-6 py-3.5 border border-gold/25 text-gold hover:bg-gold/5 text-xs font-serif uppercase tracking-widest rounded-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 bg-transparent print:hidden"
                  data-html2canvas-ignore="true"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{isRTL ? 'مواصلة الاقتناء وتصفح المجموعة' : 'Continue Shopping'}</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSharing && !isPdfExporting) {
                      handleShareInvoice();
                    }
                  }}
                  disabled={isSharing || isPdfExporting}
                  className="px-6 py-3.5 border border-gold/25 text-gold hover:bg-gold/5 text-xs font-serif uppercase tracking-widest rounded-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 bg-transparent print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  data-html2canvas-ignore="true"
                >
                  <Share2 className={`h-4 w-4 ${isSharing ? 'animate-spin' : ''}`} />
                  <span>
                    {isSharing 
                      ? (isRTL ? 'جاري تحضير الفاتورة ومشاركتها...' : 'Sharing PDF...') 
                      : (isRTL ? 'مشاركة الفاتورة الفورية' : 'Share Invoice')}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSharing && !isPdfExporting) {
                      handleDownloadPDF();
                    }
                  }}
                  disabled={isSharing || isPdfExporting}
                  className="relative z-50 px-6 py-3.5 bg-gradient-to-r from-gold to-gold-light text-luxury-black hover:brightness-110 text-xs font-serif uppercase tracking-widest font-bold rounded-md transition-all active:scale-95 shadow-lg shadow-gold/10 cursor-pointer flex items-center justify-center gap-2 print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  data-html2canvas-ignore="true"
                >
                  <Printer className={`h-4 w-4 ${isPdfExporting ? 'animate-spin' : ''}`} />
                  <span>
                    {isPdfExporting 
                      ? (isRTL ? 'جاري تحضير الفاتورة...' : 'Generating PDF...') 
                      : (isRTL ? 'طباعة الفاتورة الفورية' : 'Print Invoice')}
                  </span>
                </button>
              </div>

              {/* Print Footer Signature */}
              <div className="text-center text-[9px] text-luxury-cream/35 italic mt-8 pt-4 border-t border-gold/5 uppercase tracking-widest font-serif">
                {isRTL 
                  ? 'طلب معتمد إلكترونياً وصادر بموجب لوائح الصياغة والحماية بدبي • رقم الهاتف للتواصل المباشر: +971 58 825 7372' 
                  : 'Digitally Certified Order issued under Emirati Fine-Art Guidelines • Phone: +971 58 825 7372'
                }
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
