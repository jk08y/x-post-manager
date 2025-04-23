// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChange, 
  getCurrentUser,
  loginWithEmailPassword,
  loginWithGoogle,
  logout
} from "../firebase";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Login with email/password
  const login = async (email, password) => {
    try {
      setAuthError(null);
      const user = await loginWithEmailPassword(email, password);
      return user;
    } catch (error) {
      // Set auth error to be used by the unauthorized page
      if (error.message.includes("Unauthorized")) {
        setAuthError("unauthorized");
      }
      throw error;
    }
  };

  // Login with Google
  const loginGoogle = async () => {
    try {
      setAuthError(null);
      const user = await loginWithGoogle();
      return user;
    } catch (error) {
      // Set auth error to be used by the unauthorized page
      if (error.message.includes("Unauthorized")) {
        setAuthError("unauthorized");
      }
      throw error;
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      setAuthError(null);
      await logout();
    } catch (error) {
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Get user profile data
  const getUserProfile = () => {
    const user = getCurrentUser();
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    };
  };

  const value = {
    currentUser,
    login,
    loginGoogle,
    logout: logoutUser,
    getUserProfile,
    isAuthenticated: !!currentUser,
    authError,
    setAuthError,
    clearAuthError: () => setAuthError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};