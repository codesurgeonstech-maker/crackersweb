import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured, firebaseConfig } from "./firebase";
import { INITIAL_SHOPS } from "../utils/sampleData";

const SHOPS_KEY = "crackzo_shops";

function getLocalShops() {
  localStorage.removeItem("crackers_shops"); // Remove old mock shops key
  const data = localStorage.getItem(SHOPS_KEY);
  if (!data) {
    return [];
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map(shop => ({
      ...shop,
      whatsappNumber: shop.whatsappNumber ? String(shop.whatsappNumber).replace(/\D/g, '') : ''
    })) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalShops(shops) {
  localStorage.setItem(SHOPS_KEY, JSON.stringify(shops));
}

/**
 * Fetch all shops (for Developer Dashboard)
 */
export async function getAllShops() {
  if (isFirebaseConfigured && db) {
    const shopsRef = collection(db, "shops");
    const snap = await getDocs(shopsRef);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  return getLocalShops();
}

/**
 * Fetch shop by unique slug (for public Customer Catalogue: /shop/:slug)
 */
export async function getShopBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  if (isFirebaseConfigured && db) {
    const shopsRef = collection(db, "shops");
    const q = query(shopsRef, where("slug", "==", cleanSlug));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const shopDoc = snap.docs[0];
      return { id: shopDoc.id, ...shopDoc.data() };
    }
  }

  const localShops = getLocalShops();
  return localShops.find(s => s.slug.toLowerCase() === cleanSlug) || null;
}

/**
 * Fetch shop by shopId
 */
export async function getShopById(shopId) {
  if (!shopId) return null;

  if (isFirebaseConfigured && db) {
    const shopRef = doc(db, "shops", shopId);
    const snap = await getDoc(shopRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  }

  const localShops = getLocalShops();
  return localShops.find(s => s.id === shopId || s.shopId === shopId) || null;
}

/**
 * Create a new shop (Developer admin panel)
 */
export async function createShop(shopData) {
  const slug = (shopData.slug || shopData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
  const normalizedEmail = (shopData.ownerEmail || '').trim().toLowerCase();
  const rawPassword = shopData.ownerPassword || 'password123';

  let ownerUid = shopData.ownerUid || `owner-${Date.now()}`;

  // Try to create Firebase Auth user for owner using secondary app (avoids logging out current developer)
  if (isFirebaseConfigured && normalizedEmail && rawPassword) {
    try {
      const secondaryApp = initializeApp(firebaseConfig, `SecondaryAuth_${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        normalizedEmail,
        rawPassword
      );
      if (userCred?.user?.uid) {
        ownerUid = userCred.user.uid;
      }
      await deleteApp(secondaryApp);
    } catch (authErr) {
      console.warn("Could not create Firebase Auth user via secondary app:", authErr?.message || authErr);
    }
  }

  const newShop = {
    name: shopData.name.trim(),
    slug: slug,
    ownerUid: ownerUid,
    ownerName: shopData.ownerName || 'Shop Owner',
    ownerEmail: normalizedEmail,
    whatsappNumber: shopData.whatsappNumber ? shopData.whatsappNumber.replace(/\D/g, '') : '',
    logoUrl: shopData.logoUrl || '/CrackzoLogo.png',
    address: shopData.address || '',
    isActive: shopData.isActive !== false,
    acceptsOrders: true,
    minimumOrderValue: Number(shopData.minimumOrderValue) || 0,
    welcomeMessage: shopData.welcomeMessage || `Welcome to ${shopData.name}! Festive crackers and fireworks collection.`,
    safetyTips: shopData.safetyTips || "Keep water bucket handy. Always burst crackers in open areas under adult supervision.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  let assignedShopId = null;

  if (isFirebaseConfigured && db) {
    const shopsRef = collection(db, "shops");
    const newDocRef = doc(shopsRef);
    assignedShopId = newDocRef.id;

    await setDoc(newDocRef, {
      ...newShop,
      shopId: newDocRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Save owner profile to Firestore users collection
    if (normalizedEmail) {
      try {
        await setDoc(doc(db, "users", ownerUid), {
          uid: ownerUid,
          email: normalizedEmail,
          displayName: shopData.ownerName || 'Shop Owner',
          role: 'owner',
          shopId: newDocRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (userErr) {
        console.warn("Could not save owner profile to Firestore users:", userErr);
      }
    }
  } else {
    assignedShopId = `shop-${Date.now()}`;
  }

  const shopWithId = {
    id: assignedShopId,
    shopId: assignedShopId,
    ...newShop
  };

  // Always store owner in crackzo_registered_users for instant reliable authentication
  if (normalizedEmail) {
    const registeredUsersStr = localStorage.getItem('crackzo_registered_users');
    const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};
    registeredUsers[normalizedEmail] = {
      uid: ownerUid,
      email: normalizedEmail,
      name: shopData.ownerName || 'Shop Owner',
      displayName: shopData.ownerName || 'Shop Owner',
      password: rawPassword,
      role: 'owner',
      shopId: assignedShopId
    };
    localStorage.setItem('crackzo_registered_users', JSON.stringify(registeredUsers));
  }

  const localShops = getLocalShops();
  localShops.unshift(shopWithId);
  saveLocalShops(localShops);

  return shopWithId;
}

/**
 * Update shop details or settings
 */
export async function updateShop(shopId, updates) {
  const cleanUpdates = {
    ...updates,
    ...(updates.whatsappNumber !== undefined ? { whatsappNumber: String(updates.whatsappNumber).replace(/\D/g, '') } : {}),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const shopRef = doc(db, "shops", shopId);
    await updateDoc(shopRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  }

  const localShops = getLocalShops();
  const index = localShops.findIndex(s => s.id === shopId || s.shopId === shopId);
  if (index !== -1) {
    localShops[index] = { ...localShops[index], ...cleanUpdates };
    saveLocalShops(localShops);
    return localShops[index];
  }
  return null;
}

/**
 * Toggle shop active / suspended status
 */
export async function toggleShopStatus(shopId, isActive) {
  return updateShop(shopId, { isActive });
}
