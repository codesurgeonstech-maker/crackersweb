import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { INITIAL_PRODUCTS } from "../utils/sampleData";

function getLocalProducts(shopId) {
  localStorage.removeItem(`crackers_products_${shopId}`);
  const key = `crackzo_products_${shopId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    return [];
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveLocalProducts(shopId, products) {
  const key = `crackzo_products_${shopId}`;
  localStorage.setItem(key, JSON.stringify(products));
}

/**
 * Get all products for a specific shop
 */
export async function getShopProducts(shopId, filterCategoryId = null) {
  if (!shopId) return [];

  if (isFirebaseConfigured && db) {
    const prodsRef = collection(db, "shops", shopId, "products");
    let q = query(prodsRef, orderBy("displayOrder", "asc"));
    if (filterCategoryId && filterCategoryId !== "all") {
      q = query(prodsRef, where("categoryId", "==", filterCategoryId), orderBy("displayOrder", "asc"));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  const list = getLocalProducts(shopId);
  if (filterCategoryId && filterCategoryId !== "all") {
    return list.filter(p => p.categoryId === filterCategoryId);
  }
  return list;
}

/**
 * Get single product by ID
 */
export async function getProductById(shopId, productId) {
  if (!shopId || !productId) return null;

  if (isFirebaseConfigured && db) {
    const prodRef = doc(db, "shops", shopId, "products", productId);
    const snap = await getDoc(prodRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  }

  const list = getLocalProducts(shopId);
  return list.find(p => p.id === productId) || null;
}

/**
 * Add a new product to shop
 */
export async function addProduct(shopId, productData) {
  if (!shopId) throw new Error("Shop ID is required.");
  if (!productData.name || !productData.price) {
    throw new Error("Product name and selling price are required.");
  }

  const newProd = {
    shopId,
    name: productData.name.trim(),
    categoryId: productData.categoryId || '',
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : null,
    description: productData.description || '',
    imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=500&auto=format&fit=crop&q=80',
    additionalImages: productData.additionalImages || [],
    isAvailable: productData.isAvailable !== false,
    stockQuantity: productData.stockQuantity !== undefined ? Number(productData.stockQuantity) : 100,
    displayOrder: Number(productData.displayOrder) || 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const prodsRef = collection(db, "shops", shopId, "products");
    const docRef = doc(prodsRef);
    await setDoc(docRef, {
      ...newProd,
      id: docRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...newProd };
  }

  const list = getLocalProducts(shopId);
  const prodWithId = {
    id: `prod-${Date.now()}`,
    ...newProd
  };
  list.unshift(prodWithId);
  saveLocalProducts(shopId, list);
  return prodWithId;
}

/**
 * Update an existing product
 */
export async function updateProduct(shopId, productId, updates) {
  const cleanUpdates = {
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : undefined,
    originalPrice: updates.originalPrice !== undefined ? (updates.originalPrice ? Number(updates.originalPrice) : null) : undefined,
    stockQuantity: updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : undefined,
    displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : undefined,
    updatedAt: new Date().toISOString()
  };

  // Remove undefined keys
  Object.keys(cleanUpdates).forEach(key => cleanUpdates[key] === undefined && delete cleanUpdates[key]);

  if (isFirebaseConfigured && db) {
    const prodRef = doc(db, "shops", shopId, "products", productId);
    await updateDoc(prodRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
  }

  const list = getLocalProducts(shopId);
  const idx = list.findIndex(p => p.id === productId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...cleanUpdates };
    saveLocalProducts(shopId, list);
    return list[idx];
  }
  return null;
}

/**
 * Toggle product availability status
 */
export async function toggleProductAvailability(shopId, productId, isAvailable) {
  return updateProduct(shopId, productId, { isAvailable });
}

/**
 * Delete a product
 */
export async function deleteProduct(shopId, productId) {
  if (isFirebaseConfigured && db) {
    const prodRef = doc(db, "shops", shopId, "products", productId);
    await deleteDoc(prodRef);
  }

  const list = getLocalProducts(shopId);
  const updated = list.filter(p => p.id !== productId);
  saveLocalProducts(shopId, updated);
  return true;
}

/**
 * Bulk import products from CSV data
 */
export async function bulkImportProducts(shopId, productsArray) {
  const imported = [];
  for (const item of productsArray) {
    if (item.name && item.price) {
      const added = await addProduct(shopId, item);
      imported.push(added);
    }
  }
  return imported;
}
