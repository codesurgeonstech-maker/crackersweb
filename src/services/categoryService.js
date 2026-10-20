import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { INITIAL_CATEGORIES } from "../utils/sampleData";

function getLocalCategories(shopId) {
  localStorage.removeItem(`crackers_categories_${shopId}`);
  const key = `crackzo_categories_${shopId}`;
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

function saveLocalCategories(shopId, categories) {
  const key = `crackzo_categories_${shopId}`;
  localStorage.setItem(key, JSON.stringify(categories));
}

/**
 * Get categories for a specific shop
 */
export async function getShopCategories(shopId) {
  if (!shopId) return [];

  if (isFirebaseConfigured && db) {
    const catsRef = collection(db, "shops", shopId, "categories");
    const q = query(catsRef, orderBy("displayOrder", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  return getLocalCategories(shopId);
}

/**
 * Add category to shop
 */
export async function addCategory(shopId, categoryData) {
  const newCat = {
    name: categoryData.name.trim(),
    displayOrder: Number(categoryData.displayOrder) || 1,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const catsRef = collection(db, "shops", shopId, "categories");
    const docRef = doc(catsRef);
    await setDoc(docRef, {
      ...newCat,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...newCat };
  }

  const list = getLocalCategories(shopId);
  const catWithId = {
    id: `cat-${Date.now()}`,
    ...newCat
  };
  list.push(catWithId);
  list.sort((a, b) => a.displayOrder - b.displayOrder);
  saveLocalCategories(shopId, list);
  return catWithId;
}

/**
 * Update category
 */
export async function updateCategory(shopId, categoryId, updates) {
  if (isFirebaseConfigured && db) {
    const catRef = doc(db, "shops", shopId, "categories", categoryId);
    await updateDoc(catRef, updates);
  }

  const list = getLocalCategories(shopId);
  const idx = list.findIndex(c => c.id === categoryId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    list.sort((a, b) => a.displayOrder - b.displayOrder);
    saveLocalCategories(shopId, list);
    return list[idx];
  }
  return null;
}

/**
 * Delete category
 */
export async function deleteCategory(shopId, categoryId) {
  if (isFirebaseConfigured && db) {
    const catRef = doc(db, "shops", shopId, "categories", categoryId);
    await deleteDoc(catRef);
  }

  const list = getLocalCategories(shopId);
  const updated = list.filter(c => c.id !== categoryId);
  saveLocalCategories(shopId, updated);
  return true;
}
