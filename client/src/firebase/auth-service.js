// client/src/firebase/auth-service.js
import { 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut,
    onAuthStateChanged
  } from "firebase/auth";
  import { auth, db } from "./config.js";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  
  // Create Google auth provider
  const googleProvider = new GoogleAuthProvider();
  
  // Set of authorized emails that can access the app
  // This will be checked against in Firebase rules as well for double security
  async function isAuthorizedUser(email) {
    try {
      // Check against a list of authorized emails stored in Firestore
      // This approach avoids hardcoding the email in client code
      const authListRef = doc(db, "access", "authorizedUsers");
      const authListSnap = await getDoc(authListRef);
      
      if (authListSnap.exists()) {
        const authList = authListSnap.data();
        return authList.emails.includes(email);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is authorized
      const isAuthorized = await isAuthorizedUser(userCredential.user.email);
      
      if (!isAuthorized) {
        await signOut(auth);
        throw new Error("Unauthorized user. Access denied.");
      }
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // Sign in with Google
  export const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Check if user is authorized
      const isAuthorized = await isAuthorizedUser(result.user.email);
      
      if (!isAuthorized) {
        await signOut(auth);
        throw new Error("Unauthorized user. Access denied.");
      }
      
      // If this is the first login, create a user profile
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
  
  // Auth state observer
  export const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
  };