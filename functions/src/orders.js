const admin = require('firebase-admin');

/**
 * Validates cart items, verifies prices against current Firestore data,
 * generates a unique order reference, and creates an order record in Firestore.
 */
async function handleCreateSecureOrder(data, context) {
  const { shopId, customerName, customerMobile, orderType, notes, address, items } = data;

  if (!shopId || !customerName || !customerMobile || !Array.isArray(items) || items.length === 0) {
    throw new Error('Invalid order payload: Missing required shop or customer details.');
  }

  const db = admin.firestore();
  const shopRef = db.collection('shops').doc(shopId);
  const shopSnap = await shopRef.get();

  if (!shopSnap.exists) {
    throw new Error('Shop not found.');
  }

  const shopData = shopSnap.data();
  if (!shopData.isActive) {
    throw new Error('This shop is currently inactive.');
  }
  if (shopData.acceptsOrders === false) {
    throw new Error('This shop is currently not accepting new orders.');
  }

  // Validate items against database
  let calculatedSubtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      throw new Error('Invalid item entry in cart.');
    }

    const productRef = shopRef.collection('products').doc(item.productId);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new Error(`Product "${item.name || item.productId}" is no longer available.`);
    }

    const product = productSnap.data();
    if (product.isAvailable === false) {
      throw new Error(`Product "${product.name}" is currently out of stock.`);
    }

    const itemPrice = Number(product.price);
    const quantity = parseInt(item.quantity, 10);
    const lineTotal = itemPrice * quantity;
    calculatedSubtotal += lineTotal;

    verifiedItems.push({
      productId: item.productId,
      name: product.name,
      price: itemPrice,
      quantity: quantity,
      subtotal: lineTotal,
      imageUrl: product.imageUrl || ''
    });
  }

  // Check minimum order value if configured
  if (shopData.minimumOrderValue && calculatedSubtotal < shopData.minimumOrderValue) {
    throw new Error(`Minimum order amount for this shop is ₹${shopData.minimumOrderValue}. Current cart is ₹${calculatedSubtotal}.`);
  }

  // Generate unique order reference: ORD-YYYY-XXXXX
  const currentYear = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderReference = `ORD-${currentYear}-${randomSuffix}`;

  const orderData = {
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
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const newOrderDoc = await shopRef.collection('orders').add(orderData);

  return {
    orderId: newOrderDoc.id,
    orderReference,
    subtotal: calculatedSubtotal,
    total: calculatedSubtotal,
    items: verifiedItems,
    shopName: shopData.name,
    shopWhatsApp: shopData.whatsappNumber
  };
}

module.exports = {
  handleCreateSecureOrder
};
