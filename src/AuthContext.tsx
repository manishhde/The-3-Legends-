import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User,
  signInAnonymously
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setError(null);
        // Fetch theme preference
        try {
          const { doc, getDoc } = await import('firebase/firestore');
          const { db } = await import('./firebase');
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists() && docSnap.data().theme) {
            setThemeState(docSnap.data().theme);
          }
        } catch (error) {
          console.error("Error fetching theme:", error);
        }
        setLoading(false);
      } else {
        // Auto-login anonymously if no user
        try {
          await signInAnonymously(auth);
        } catch (err: any) {
          console.error("Anonymous sign-in error:", err);
          // If restricted, we just stop loading and let the app use 'guest_user' logic
          setLoading(false);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, theme, setTheme, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
