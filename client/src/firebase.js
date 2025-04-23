// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// List of authorized emails
let authorizedUsers = null;

// Check if user is authorized
async function isAuthorizedUser(email) {
  try {
    // First check if we've already loaded the authorized users list
    if (authorizedUsers) {
      return authorizedUsers.includes(email);
    }
    
    // If not loaded yet, get it from Firestore
    const authListRef = doc(db, "access", "authorizedUsers");
    const authListSnap = await getDoc(authListRef);
    
    if (authListSnap.exists()) {
      const authList = authListSnap.data();
      // Cache the list for future checks
      authorizedUsers = authList.emails;
      return authorizedUsers.includes(email);
    }
    
    return false;
  } catch (error) {
    console.error("Error checking authorization:", error);
    return false;
  }
}

// Sign in with email and password
export const loginWithEmailPassword = async (email, password) => {
  try {
    // Perform a pre-check before even attempting to sign in
    // This prevents flashes of authorized content
    const preAuthorized = await isAuthorizedUser(email);
    
    if (!preAuthorized) {
      throw new Error("Unauthorized email. Access denied.");
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Double-check authorization after sign-in
    const isAuthorized = await isAuthorizedUser(userCredential.user.email);
    
    if (!isAuthorized) {
      await signOut(auth);
      throw new Error("Unauthorized user. Access denied.");
    }
    
    return userCredential.user;
  } catch (error) {
    // Sign out the user if they somehow got authenticated
    if (auth.currentUser) {
      await signOut(auth);
    }
    throw error;
  }
};

// Sign in with Google
export const loginWithGoogle = async () => {
  try {
    // We can't pre-check Google sign-in because we don't know the email
    // until after the popup is shown
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user is authorized immediately after the popup
    const isAuthorized = await isAuthorizedUser(result.user.email);
    
    if (!isAuthorized) {
      await signOut(auth);
      throw new Error("Unauthorized email. Access denied.");
    }
    
    // If authorized, create/update user profile
    const userRef = doc(db, "users", result.user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: result.user.email,
        displayName: result.user.displayName || "",
        photoURL: result.user.photoURL || "",
        createdAt: new Date().toISOString()
      });
    }
    
    return result.user;
  } catch (error) {
    // Sign out the user if they somehow got authenticated
    if (auth.currentUser) {
      await signOut(auth);
    }
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Auth state observer with authorization check
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Verify the user is authorized
      const isAuthorized = await isAuthorizedUser(user.email);
      
      if (!isAuthorized) {
        // If not authorized, sign them out immediately
        await signOut(auth);
        callback(null); // Pass null to indicate no authenticated user
        return;
      }
    }
    
    // If user is null (signed out) or is authorized, pass the user object
    callback(user);
  });
};

export { auth, db, storage };