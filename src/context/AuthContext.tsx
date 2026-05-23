import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';

interface UserData {
  email: string;
  role: string;
  displayName?: string;
  isApproved?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'admin_users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
            
            if (data.role === 'admin' && data.isApproved === true) {
              setUser(firebaseUser);
              setIsAdmin(true);
            } else {
              setUser(null);
              setIsAdmin(false);
              await signOut(auth); // Sign out if not approved
            }
          } else {
            // Document doesn't exist, log them out
            setUser(null);
            setIsAdmin(false);
            setUserData(null);
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setUserData(null);
          setIsAdmin(false);
          await signOut(auth);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'admin_users', userCredential.user.uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data() as UserData;
      if (data.role !== 'admin' || data.isApproved !== true) {
        await signOut(auth);
        throw new Error('not-approved');
      }
    } else {
      await signOut(auth);
      throw new Error('not-approved');
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    await setDoc(doc(db, 'admin_users', uid), {
      email,
      displayName: name,
      role: 'admin',
      isApproved: false,
      createdAt: serverTimestamp()
    });
    
    // Sign out immediately so they don't have access until approved
    await signOut(auth);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
