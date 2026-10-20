const admin = require('firebase-admin');

/**
 * Creates a new shop and provisions the owner user in Firebase Auth & Firestore.
 * Restricted to caller with developer custom claim or role.
 */
async function handleProvisionShopWithOwner(data, context) {
  // Verify developer privilege
  if (!context.auth) {
    throw new Error('Authentication required.');
  }

  const callerUid = context.auth.uid;
  const db = admin.firestore();
  const callerSnap = await db.collection('users').doc(callerUid).get();

  if (!callerSnap.exists || callerSnap.data().role !== 'developer') {
    throw new Error('Permission denied: Only developer accounts can provision shops.');
  }

  const {
    name,
    slug,
    ownerEmail,
    ownerPassword,
    ownerName,
    whatsappNumber,
    logoUrl,
    address
  } = data;

  if (!name || !slug || !ownerEmail || !whatsappNumber) {
    throw new Error('Missing required fields for shop provisioning.');
  }

  // Check if slug is unique
  const existingShop = await db.collection('shops').where('slug', '==', slug.trim().toLowerCase()).get();
  if (!existingShop.empty) {
    throw new Error('A shop with this slug already exists. Please pick a unique slug.');
  }

  // Create Firebase Auth user for owner if not exists
  let ownerUid;
  try {
    const existingUser = await admin.auth().getUserByEmail(ownerEmail.trim());
    ownerUid = existingUser.uid;
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      const newUser = await admin.auth().createUser({
        email: ownerEmail.trim(),
        password: ownerPassword || 'Crackers@123',
        displayName: ownerName || name
      });
      ownerUid = newUser.uid;
    } else {
      throw err;
    }
  }

  // Create Shop Document
  const shopRef = db.collection('shops').doc();
  const shopId = shopRef.id;

  const shopDoc = {
    shopId,
    name: name.trim(),
    slug: slug.trim().toLowerCase(),
    ownerUid,
    ownerName: ownerName || 'Shop Owner',
    ownerEmail: ownerEmail.trim(),
    whatsappNumber: whatsappNumber.replace(/[^0-9]/g, ''),
    logoUrl: logoUrl || '',
    address: address || '',
    isActive: true,
    acceptsOrders: true,
    minimumOrderValue: 0,
    welcomeMessage: `Welcome to ${name}! Explore our sparkling collection.`,
    safetyTips: 'Always maintain safe distance. Keep water bucket handy. Never burst crackers inside closed rooms.',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await shopRef.set(shopDoc);

  // Update user profile in Firestore
  await db.collection('users').doc(ownerUid).set({
    uid: ownerUid,
    role: 'owner',
    shopId: shopId,
    displayName: ownerName || 'Shop Owner',
    email: ownerEmail.trim(),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Add default categories
  const defaultCategories = [
    { name: 'Sparklers', displayOrder: 1 },
    { name: 'Flower Pots', displayOrder: 2 },
    { name: 'Chakras', displayOrder: 3 },
    { name: 'Rockets', displayOrder: 4 },
    { name: 'Fountains', displayOrder: 5 },
    { name: 'Gift Boxes', displayOrder: 6 },
    { name: 'Family Packs', displayOrder: 7 },
    { name: 'Kids Special', displayOrder: 8 },
  ];

  const batch = db.batch();
  for (const cat of defaultCategories) {
    const catRef = shopRef.collection('categories').doc();
    batch.set(catRef, {
      ...cat,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  await batch.commit();

  return {
    success: true,
    shopId,
    slug: shopDoc.slug,
    ownerUid
  };
}

/**
 * Assigns developer role to a user.
 */
async function handleAssignDeveloperRole(data, context) {
  // If no developers exist yet or caller is developer
  const db = admin.firestore();
  const { targetEmail } = data;

  const user = await admin.auth().getUserByEmail(targetEmail);
  await admin.auth().setCustomUserClaims(user.uid, { role: 'developer' });

  await db.collection('users').doc(user.uid).set({
    uid: user.uid,
    role: 'developer',
    email: targetEmail,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return { success: true, uid: user.uid };
}

module.exports = {
  handleProvisionShopWithOwner,
  handleAssignDeveloperRole
};
