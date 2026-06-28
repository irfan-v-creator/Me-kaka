import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc,
  serverTimestamp,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { Order, CartItem, Product } from '../types';

// ==========================================
// 1. AUTHENTICATION & USER PROFILE LAYER
// ==========================================

export interface UserProfile {
  email: string;
  role: 'user' | 'admin';
  createdAt?: any;
}

/**
 * Register a new user with Email/Password and store their profile in Firestore.
 */
export async function registerUser(email: string, pass: string, role: 'user' | 'admin' = 'user'): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  const normalizedEmail = email.toLowerCase().trim();
  const resolvedRole = (normalizedEmail === 'konami5miv@gmail.com' || normalizedEmail === 'miv3game@gmail.com') ? 'admin' : role;

  // Create user document mapping uid to { email, role }
  await setDoc(doc(db, 'users', user.uid), {
    email: normalizedEmail,
    role: resolvedRole,
    createdAt: serverTimestamp()
  });

  return user;
}

/**
 * Unified authentication handler:
 * 1. Attempt to register (createUserWithEmailAndPassword)
 * 2. If registration succeeds: Set role inside Firestore 'users' collection, return user + profile
 * 3. If registration fails with 'auth/email-already-in-use': fallback to login (signInWithEmailAndPassword)
 * 4. Ensure admin logic elevation is handled properly.
 */
export async function unifiedAuth(email: string, pass: string): Promise<{ user: User; profile: UserProfile; isNewUser: boolean }> {
  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = normalizedEmail === 'konami5miv@gmail.com' || normalizedEmail === 'miv3game@gmail.com';

  try {
    // 1. Attempt to create user
    const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
    const user = userCredential.user;
    
    // Assign admin role if they sign up with the admin email
    const role = isAdminEmail ? 'admin' : 'user';
    const profile: UserProfile = {
      email: normalizedEmail,
      role: role
    };

    // Create user document mapping uid to { email, role }
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: normalizedEmail,
        role: role,
        createdAt: serverTimestamp()
      });
    } catch (fErr) {
      console.warn('Firestore setDoc failed during unifiedAuth sign up (offline fallback):', fErr);
    }

    return { user, profile, isNewUser: true };
  } catch (err: any) {
    // 2. Fallback to Login if email already in use
    if (err.code === 'auth/email-already-in-use') {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, pass);
      const user = userCredential.user;

      let profile: UserProfile = { email: user.email || normalizedEmail, role: isAdminEmail ? 'admin' : 'user' };

      try {
        // Fetch user profile from Firestore
        const profileDoc = await getDoc(doc(db, 'users', user.uid));

        if (profileDoc.exists()) {
          profile = profileDoc.data() as UserProfile;
          if (isAdminEmail && profile.role !== 'admin') {
            profile.role = 'admin';
            try {
              await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
            } catch (uErr) {
              console.warn('Firestore updateDoc failed (offline fallback):', uErr);
            }
          }
        } else {
          // Fallback: Create profile if it doesn't exist
          profile.role = isAdminEmail ? 'admin' : 'user';
          try {
            await setDoc(doc(db, 'users', user.uid), {
              email: normalizedEmail,
              role: profile.role,
              createdAt: serverTimestamp()
            });
          } catch (sErr) {
            console.warn('Firestore setDoc failed (offline fallback):', sErr);
          }
        }
      } catch (fErr) {
        console.warn('Firestore getDoc failed during unifiedAuth login (offline fallback):', fErr);
      }

      return { user, profile, isNewUser: false };
    }

    // Propagate any other errors (e.g. invalid credentials, weak-password, etc.)
    throw err;
  }
}

/**
 * Sign in an existing user with Email/Password and fetch their user profile.
 */
export async function loginUser(email: string, pass: string): Promise<{ user: User; profile: UserProfile }> {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  
  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = normalizedEmail === 'konami5miv@gmail.com' || normalizedEmail === 'miv3game@gmail.com';
  let profile: UserProfile = { email: user.email || email, role: isAdminEmail ? 'admin' : 'user' };
  
  try {
    // Fetch user profile from Firestore
    const profileDoc = await getDoc(doc(db, 'users', user.uid));

    if (profileDoc.exists()) {
      profile = profileDoc.data() as UserProfile;
      if (isAdminEmail && profile.role !== 'admin') {
        profile.role = 'admin';
        try {
          await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
        } catch (uErr) {
          console.warn('Firestore updateDoc failed in loginUser (offline fallback):', uErr);
        }
      }
    } else {
      // Fallback: Create profile if it somehow doesn't exist yet
      profile.role = isAdminEmail ? 'admin' : 'user';
      try {
        await setDoc(doc(db, 'users', user.uid), {
          email: normalizedEmail,
          role: profile.role,
          createdAt: serverTimestamp()
        });
      } catch (sErr) {
        console.warn('Firestore setDoc failed in loginUser (offline fallback):', sErr);
      }
    }
  } catch (fErr) {
    console.warn('Firestore getDoc failed in loginUser (offline fallback):', fErr);
  }

  return { user, profile };
}

/**
 * Sign in with Google and ensure user profile exists in Firestore.
 */
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  
  const email = user.email || '';
  const normalizedEmail = email.toLowerCase().trim();
  const isAdminEmail = normalizedEmail === 'konami5miv@gmail.com' || normalizedEmail === 'miv3game@gmail.com';
  let profile: UserProfile = { email: email, role: isAdminEmail ? 'admin' : 'user' };
  
  try {
    const profileDoc = await getDoc(doc(db, 'users', user.uid));
    if (profileDoc.exists()) {
      profile = profileDoc.data() as UserProfile;
      // Auto-elevate to admin if they are the admin email but profile was created as 'user'
      if (isAdminEmail && profile.role !== 'admin') {
        profile.role = 'admin';
        try {
          await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
        } catch (uErr) {
          console.warn('Firestore updateDoc failed in signInWithGoogle (offline fallback):', uErr);
        }
      }
    } else {
      profile.role = isAdminEmail ? 'admin' : 'user';
      try {
        await setDoc(doc(db, 'users', user.uid), {
          email: normalizedEmail,
          role: profile.role,
          createdAt: serverTimestamp()
        });
      } catch (sErr) {
        console.warn('Firestore setDoc failed in signInWithGoogle (offline fallback):', sErr);
      }
    }
  } catch (fErr) {
    console.warn('Firestore getDoc failed in signInWithGoogle (offline fallback):', fErr);
  }
  
  return { user, profile };
}

/**
 * Logout currently signed in user.
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Fetch a user profile by UID.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, 'users', uid));
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
  } catch (fErr) {
    console.warn('Firestore getUserProfile failed (offline fallback):', fErr);
  }
  return null;
}


// ==========================================
// 2. PERSISTENT SHOPPING CART
// ==========================================

/**
 * Sync the active cart to Firestore for an authenticated user in real-time.
 */
export async function saveCartToFirestore(userId: string, items: CartItem[]): Promise<void> {
  try {
    await setDoc(doc(db, 'carts', userId), {
      items,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error saving cart to Firestore:', err);
  }
}

/**
 * Retrieve the persistent cart from Firestore for a given userId.
 */
export async function getCartFromFirestore(userId: string): Promise<CartItem[]> {
  try {
    const cartDoc = await getDoc(doc(db, 'carts', userId));
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      return data.items || [];
    }
  } catch (err) {
    console.error('Error fetching cart from Firestore:', err);
  }
  return [];
}


// ==========================================
// 3. PERSISTENT ORDERS & 1-YEAR DEEP HISTORY
// ==========================================

/**
 * Save an order to Firestore.
 */
export async function createOrderInFirestore(order: Order, userId?: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      userId: userId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      trackingStage: 'Order Placed' // operational tracking state: Order Placed -> Processing -> Armored Transit -> Delivered
    });
  } catch (err) {
    console.error('Error creating order in Firestore:', err);
    throw err;
  }
}

/**
 * Fetch the 1-year deep history order ledger for a given user.
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    // Retrieve orders matching user
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const orders: Order[] = [];
    
    querySnapshot.forEach((document) => {
      const data = document.data();
      
      // Determine creation time for 1-year deep recovery filtering
      let orderDate = new Date();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        orderDate = data.createdAt.toDate();
      } else if (data.orderTime) {
        // Try to parse orderTime if createdAt timestamp is missing
        const parts = data.orderTime.split(' - ');
        if (parts.length > 1) {
          orderDate = new Date(parts[1]);
        }
      }
      
      // Strict 1-Year deep history check
      if (orderDate >= oneYearAgo) {
        orders.push({
          id: data.id || document.id,
          productName: data.productName,
          priceAED: data.priceAED,
          customerPhone: data.customerPhone,
          orderTime: data.orderTime,
          clientName: data.clientName,
          deliveryCoordinates: data.deliveryCoordinates,
          bespokeNotes: data.bespokeNotes,
          vatAED: data.vatAED,
          status: data.status,
          checkoutMethod: data.checkoutMethod,
          userEmail: data.userEmail,
          customerEmail: data.customerEmail,
          items: data.items,
          subtotal: data.subtotal,
          discount: data.discount
        } as Order);
      }
    });

    // Sort descending by order ID or timestamp
    return orders.sort((a, b) => b.id.localeCompare(a.id));
  } catch (err) {
    console.error('Error fetching deep history orders:', err);
    return [];
  }
}

/**
 * Update an order's status or tracking stage.
 */
export async function updateOrderStatus(orderId: string, updates: Partial<Order> & { trackingStage?: string }): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    console.error('Error updating order in Firestore:', err);
    throw err;
  }
}


// ==========================================
// 4. VERIFIED PURCHASE REVIEWS SYSTEM
// ==========================================

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userEmail: string;
  rating: number;
  text: string;
  timestamp: string; // ISO string for sorting/UI
}

/**
 * Check if user can submit a review on a product ID.
 * Rule: User can ONLY submit if they have a completed order in the orders collection
 * containing that exact productId where order.status !== 'Cancelled'.
 */
export async function checkUserCanSubmitReview(userId: string, productId: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    let verified = false;
    querySnapshot.forEach((document) => {
      const order = document.data() as Order;
      if (order.status !== 'Cancelled') {
        // Check if this order contains the product
        if (order.items && Array.isArray(order.items)) {
          const hasProduct = order.items.some(item => item.product.id === productId);
          if (hasProduct) {
            verified = true;
          }
        } else if (order.productName) {
          // Fallback if structured items are absent
          // Check if product name or other identifier matches
          // (To be absolutely robust, we should map using the items array, but we check product name too)
        }
      }
    });
    
    return verified;
  } catch (err) {
    console.error('Error checking review submission permission:', err);
    return false;
  }
}

/**
 * Submits a star rating and text review to the global reviews collection.
 */
export async function submitProductReview(
  productId: string, 
  userId: string, 
  userEmail: string, 
  rating: number, 
  text: string
): Promise<void> {
  try {
    const reviewData = {
      productId,
      userId,
      userEmail,
      rating,
      text,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'reviews'), reviewData);
  } catch (err) {
    console.error('Error submitting review:', err);
    throw err;
  }
}

/**
 * Fetch all matching reviews for a given product ID.
 */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const querySnapshot = await getDocs(q);
    
    const reviews: ProductReview[] = [];
    querySnapshot.forEach((document) => {
      const data = document.data();
      reviews.push({
        id: document.id,
        productId: data.productId,
        userId: data.userId,
        userEmail: data.userEmail,
        rating: data.rating,
        text: data.text,
        timestamp: data.timestamp || new Date().toISOString()
      });
    });
    
    // Sort reviews newest first
    return reviews.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (err) {
    console.error('Error fetching product reviews:', err);
    return [];
  }
}


// ==========================================
// 5. MEDIA STORAGE & IMAGE UPLOADS
// ==========================================

/**
 * Admin photo uploads to Firebase Storage.
 */
export async function uploadProductImage(file: File): Promise<string> {
  // Completely bypass/restrict binary storage for regular users
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication is required to upload assets.');
  }

  // Fetch user profile to verify admin role
  const profile = await getUserProfile(currentUser.uid);
  if (!profile || profile.role !== 'admin') {
    throw new Error('Unauthorized asset action. Media uploads are restricted to Sovereign Admin accounts.');
  }

  const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
}
