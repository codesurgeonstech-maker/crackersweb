const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');

admin.initializeApp();

const { handleCreateSecureOrder } = require('./orders');
const { handleProvisionShopWithOwner, handleAssignDeveloperRole } = require('./shops');

exports.createSecureOrder = onCall({ cors: true }, async (request) => {
  try {
    return await handleCreateSecureOrder(request.data, request.auth);
  } catch (error) {
    throw new HttpsError('invalid-argument', error.message);
  }
});

exports.provisionShopWithOwner = onCall({ cors: true }, async (request) => {
  try {
    return await handleProvisionShopWithOwner(request.data, request.auth);
  } catch (error) {
    throw new HttpsError('permission-denied', error.message);
  }
});

exports.assignDeveloperRole = onCall({ cors: true }, async (request) => {
  try {
    return await handleAssignDeveloperRole(request.data, request.auth);
  } catch (error) {
    throw new HttpsError('permission-denied', error.message);
  }
});
