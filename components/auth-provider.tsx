"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  type User,
  type ConfirmationResult,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";
import { createProfile } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<ConfirmationResult>;
  confirmPhoneCode: (
    confirmationResult: ConfirmationResult,
    code: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

async function handlePostSignIn() {
  await createProfile();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    await handlePostSignIn();
  };

  const signInWithApple = async () => {
    await signInWithPopup(auth, appleProvider);
    await handlePostSignIn();
  };

  const signInWithPhone = async (
    phoneNumber: string
  ): Promise<ConfirmationResult> => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
  };

  const confirmPhoneCode = async (
    confirmationResult: ConfirmationResult,
    code: string
  ) => {
    await confirmationResult.confirm(code);
    await handlePostSignIn();
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithApple,
        signInWithPhone,
        confirmPhoneCode,
        signOut,
      }}
    >
      {children}
      <div id="recaptcha-container" />
    </AuthContext.Provider>
  );
}
