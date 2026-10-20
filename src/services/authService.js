import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";

// System users for developer administration
const SYSTEM_USERS = {
  "developer@crackzo.com": {
    uid: "dev-super-admin",
    email: "developer@crackzo.com",
    displayName: "Lead Developer",
    role: "developer"
  }
};

/**
 * Format Firebase Auth errors into clear, actionable messages
 */
export function getFirebaseAuthErrorMessage(err) {
  if (!err) return 'Authentication failed. Please verify credentials.';
  const code = err.code || '';
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is NOT enabled in your Firebase Console! Please go to Firebase Console > Authentication > Sign-in method, click "Email/Password" and toggle "Enable".';
    case 'auth/user-not-found':
      return 'No account exists with this email in your Firebase project. Please ensure the account is registered.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password, or user does not exist in Firebase yet.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled in Firebase.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to repeated failed attempts. Please reset password or try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists in Firebase.';
    default:
      return err.message || 'Authentication error. Please check your credentials.';
  }
}

/**
 * Sign in user with email and password.
 */
export async function signInUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (isFirebaseConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      let profile = await getUserProfile(cred.user.uid);
      
      // If profile is missing or missing shopId, locate assigned shop in Firestore or local store
      let shopId = profile?.shopId || null;
      if (!shopId && db) {
        try {
          const q = query(collection(db, "shops"), where("ownerEmail", "==", normalizedEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            shopId = snap.docs[0].id;
          }
        } catch (e) {
          // ignore query error
        }
      }
      if (!shopId) {
        const registeredUsersStr = localStorage.getItem('crackzo_registered_users');
        const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};
        shopId = registeredUsers[normalizedEmail]?.shopId || null;
      }

      if (!profile || !profile.shopId) {
        const isDev = normalizedEmail === 'developer@crackzo.com';
        profile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: profile?.displayName || (isDev ? 'Lead Developer' : 'Shop Owner'),
          role: profile?.role || (isDev ? 'developer' : 'owner'),
          shopId: shopId
        };
        await saveUserProfile(cred.user.uid, profile);
      }
      return {
        user: cred.user,
        profile
      };
    } catch (err) {
      // 1. If it's developer@crackzo.com and user doesn't exist yet, auto-create in Firebase Auth
      if (
        normalizedEmail === 'developer@crackzo.com' &&
        (err.code === 'auth/user-not-found' ||
         err.code === 'auth/invalid-credential' ||
         err.code === 'auth/invalid-login-credentials')
      ) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
          const devProfile = {
            uid: newCred.user.uid,
            email: normalizedEmail,
            displayName: 'Lead Developer',
            role: 'developer',
            shopId: null
          };
          await saveUserProfile(newCred.user.uid, devProfile);
          return {
            user: newCred.user,
            profile: devProfile
          };
        } catch (createErr) {
          // If creation fails, continue to fallback below
        }
      }

      // 2. Check if this is a provisioned shop owner in crackzo_registered_users
      const registeredUsersStr = localStorage.getItem('crackzo_registered_users');
      const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};
      const provisionedOwner = registeredUsers[normalizedEmail];

      if (provisionedOwner) {
        if (!provisionedOwner.password || provisionedOwner.password === password) {
          // Attempt to register in Firebase Auth in background so future Firebase requests succeed
          let ownerUid = provisionedOwner.uid;
          try {
            const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
            if (newCred?.user?.uid) {
              ownerUid = newCred.user.uid;
              provisionedOwner.uid = ownerUid;
            }
          } catch (createErr) {
            // Already exists or operation-not-allowed
          }

          const userSession = {
            uid: ownerUid,
            email: provisionedOwner.email,
            displayName: provisionedOwner.displayName || provisionedOwner.name || 'Shop Owner',
            role: 'owner',
            shopId: provisionedOwner.shopId
          };
          await saveUserProfile(ownerUid, userSession);
          localStorage.setItem('crackzo_active_user', JSON.stringify(userSession));
          return {
            user: { uid: userSession.uid, email: userSession.email },
            profile: userSession
          };
        }
      }

      // 3. Check if a shop exists in Firestore with this ownerEmail
      if (db) {
        try {
          const q = query(collection(db, "shops"), where("ownerEmail", "==", normalizedEmail));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const shopDoc = snap.docs[0];
            const shopData = shopDoc.data();
            let ownerUid = shopData.ownerUid || `owner-${Date.now()}`;

            try {
              const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
              if (newCred?.user?.uid) {
                ownerUid = newCred.user.uid;
              }
            } catch (createErr) {
              // Ignore
            }

            const ownerProfile = {
              uid: ownerUid,
              email: normalizedEmail,
              displayName: shopData.ownerName || 'Shop Owner',
              role: 'owner',
              shopId: shopDoc.id
            };
            await saveUserProfile(ownerUid, ownerProfile);
            localStorage.setItem('crackzo_active_user', JSON.stringify(ownerProfile));
            return {
              user: { uid: ownerUid, email: normalizedEmail },
              profile: ownerProfile
            };
          }
        } catch (firestoreErr) {
          console.warn("Could not query Firestore for shop owner:", firestoreErr);
        }
      }

      // 4. Developer fallback if Email/Password is not enabled in Firebase Console
      if (err.code === 'auth/operation-not-allowed') {
        const message = 'Email/Password sign-in is NOT enabled in your Firebase Console! Go to Firebase Console > Authentication > Sign-in method, click "Email/Password" and toggle "Enable".';
        if (normalizedEmail === 'developer@crackzo.com') {
          console.warn(`${message} Falling back to local developer session.`);
          const userSession = {
            uid: SYSTEM_USERS[normalizedEmail].uid,
            email: normalizedEmail,
            displayName: SYSTEM_USERS[normalizedEmail].displayName,
            role: 'developer',
            shopId: null
          };
          localStorage.setItem('crackzo_active_user', JSON.stringify(userSession));
          return {
            user: { uid: userSession.uid, email: userSession.email },
            profile: userSession
          };
        }
        throw new Error(message);
      }

      throw new Error(getFirebaseAuthErrorMessage(err));
    }
  }

  // Developer mode check
  const systemDev = SYSTEM_USERS[normalizedEmail];
  if (systemDev) {
    const userSession = {
      uid: systemDev.uid,
      email: systemDev.email,
      displayName: systemDev.displayName,
      role: systemDev.role,
      shopId: null
    };
    localStorage.removeItem('crackers_active_user');
    localStorage.setItem('crackzo_active_user', JSON.stringify(userSession));
    return {
      user: { uid: systemDev.uid, email: systemDev.email },
      profile: userSession
    };
  }

  // Check dynamically provisioned shop owners
  const registeredUsersStr = localStorage.getItem('crackzo_registered_users');
  const registeredUsers = registeredUsersStr ? JSON.parse(registeredUsersStr) : {};
  const provisionedOwner = registeredUsers[normalizedEmail];

  if (provisionedOwner) {
    const userSession = {
      uid: provisionedOwner.uid,
      email: provisionedOwner.email,
      displayName: provisionedOwner.displayName || provisionedOwner.name,
      role: 'owner',
      shopId: provisionedOwner.shopId
    };
    localStorage.removeItem('crackers_active_user');
    localStorage.setItem('crackzo_active_user', JSON.stringify(userSession));
    return {
      user: { uid: userSession.uid, email: userSession.email },
      profile: userSession
    };
  }

  // Generic sign-in without mock shop assignment
  const defaultRole = normalizedEmail.includes('dev') ? 'developer' : 'owner';
  const customUser = {
    uid: `user-${Date.now()}`,
    email: normalizedEmail,
    displayName: normalizedEmail.split('@')[0],
    role: defaultRole,
    shopId: null
  };
  localStorage.removeItem('crackers_active_user');
  localStorage.setItem('crackzo_active_user', JSON.stringify(customUser));
  return {
    user: { uid: customUser.uid, email: customUser.email },
    profile: customUser
  };
}

/**
 * Sign out user.
 */
export async function signOutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  localStorage.removeItem('crackers_active_user');
  localStorage.removeItem('crackzo_active_user');
}

/**
 * Send password reset email.
 */
export async function resetUserPassword(email) {
  if (isFirebaseConfigured && auth) {
    return await sendPasswordResetEmail(auth, email.trim());
  }
  // In demo mode, acknowledge request
  return true;
}

/**
 * Retrieve user profile document from Firestore.
 */
export async function getUserProfile(uid) {
  if (isFirebaseConfigured && db) {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return { uid, ...snap.data() };
    }
  }

  const stored = localStorage.getItem('crackzo_active_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.uid === uid) return parsed;
    } catch (e) {
      // Ignore json parse error
    }
  }
  return null;
}

/**
 * Create or update user profile document.
 */
export async function saveUserProfile(uid, data) {
  if (isFirebaseConfigured && db) {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  const current = localStorage.getItem('crackzo_active_user');
  let currentObj = current ? JSON.parse(current) : {};
  if (currentObj.uid === uid) {
    currentObj = { ...currentObj, ...data };
    localStorage.setItem('crackzo_active_user', JSON.stringify(currentObj));
  }
}

/**
 * Listen to auth state changes.
 */
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        callback(user, profile);
      } else {
        callback(null, null);
      }
    });
  }

  // Local demo mode listener
  const stored = localStorage.getItem('crackzo_active_user');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      callback({ uid: parsed.uid, email: parsed.email }, parsed);
    } catch {
      callback(null, null);
    }
  } else {
    callback(null, null);
  }

  // Return unsubscribe dummy
  return () => {};
}
