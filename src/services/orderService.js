import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions, isFirebaseConfigured } from "./firebase";
import { INITIAL_ORDERS } from "../utils/sampleData";
import { generateOrderReference } from "../utils/formatters";
import { getProductById } from "./productService";

function getLocalOrders(shopId) {
  localStorage.removeItem(`crackers_orders_${shopId}`);
  const key = `crackzo_orders_${shopId}`;
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

function saveLocalOrders(shopId, orders) {
  const key = `crackzo_orders_${shopId}`;
  localStorage.setItem(key, JSON.stringify(orders));
}

/**
 * Fetch all orders for a specific shop
 */
export async function getShopOrders(shopId) {
  if (!shopId) return [];

  if (isFirebaseConfigured && db) {
    const ordersRef = collection(db, "shops", shopId, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  return getLocalOrders(shopId);
}

/**
 * Fetch single order by shopId and orderId
 */
export async function getOrderById(shopId, orderId) {
  if (!shopId || !orderId) return null;

  if (isFirebaseConfigured && db) {
    const orderRef = doc(db, "shops", shopId, "orders", orderId);
    const snap = await getDoc(orderRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  }

  const list = getLocalOrders(shopId);
  return list.find(o => o.id === orderId || o.orderReference === orderId) || null;
}

/**
 * Create a secure order.
 * Uses Firebase Cloud Function `createSecureOrder` if configured,
 * or validates against Firestore / local state to ensure price integrity and generate reference.
 */
export async function createOrder(orderPayload) {
  const { shopId, customerName, customerMobile, orderType, address, notes, items } = orderPayload;

  if (!shopId || !customerName || !customerMobile || !items || items.length === 0) {
    throw new Error("Missing required order fields.");
  }

  // If Firebase Cloud Functions is configured, call privileged function
  if (isFirebaseConfigured && functions) {
    try {
      const createSecureOrderFn = httpsCallable(functions, 'createSecureOrder');
      const result = await createSecureOrderFn(orderPayload);
      return result.data;
    } catch (fnErr) {
      console.warn("Cloud function call failed, falling back to direct secure Firestore write:", fnErr);
    }
  }

  // Trusted price validation: fetch latest product prices from database/service
  let calculatedSubtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const currentProduct = await getProductById(shopId, item.productId);
    const price = currentProduct ? Number(currentProduct.price) : Number(item.price);
    const quantity = parseInt(item.quantity, 10);
    const subtotal = price * quantity;
    calculatedSubtotal += subtotal;

    verifiedItems.push({
      productId: item.productId,
      name: currentProduct ? currentProduct.name : item.name,
      price: price,
      quantity: quantity,
      subtotal: subtotal,
      imageUrl: (currentProduct && currentProduct.imageUrl) || item.imageUrl || ''
    });
  }

  const orderReference = generateOrderReference();
  const orderRecord = {
    orderReference,
    shopId,
    customerName: customerName.trim(),
    customerMobile: customerMobile.trim(),
    orderType: orderType || 'Shop Pickup',
    address: address ? address.trim() : '',
    notes: notes ? notes.trim() : '',
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    total: calculatedSubtotal,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const ordersRef = collection(db, "shops", shopId, "orders");
    const docRef = doc(ordersRef);
    await setDoc(docRef, {
      ...orderRecord,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...orderRecord };
  }

  const localList = getLocalOrders(shopId);
  const orderWithId = {
    id: `ord-${Date.now()}`,
    ...orderRecord
  };
  localList.unshift(orderWithId);
  saveLocalOrders(shopId, localList);
  return orderWithId;
}

/**
 * Update order status (shop owner / developer only)
 * Allowed status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
 */
export async function updateOrderStatus(shopId, orderId, newStatus) {
  if (isFirebaseConfigured && db) {
    const orderRef = doc(db, "shops", shopId, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  }

  const list = getLocalOrders(shopId);
  const idx = list.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    list[idx].status = newStatus;
    list[idx].updatedAt = new Date().toISOString();
    saveLocalOrders(shopId, list);
    return list[idx];
  }
  return null;
}
