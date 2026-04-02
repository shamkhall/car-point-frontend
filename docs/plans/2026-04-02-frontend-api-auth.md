# Frontend API Integration & Firebase Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the car-frontend to the deployed car-point-api, replacing client-side scoring with real API calls, and add Firebase authentication with evaluation history.

**Architecture:** Create an API client module and Firebase auth context that integrate into the existing wizard flow. The brand/model step fetches from the API, the wizard calls POST /evaluate for scoring, and a new /history page shows past evaluations for signed-in users.

**Tech Stack:** Next.js 16, React 19, Firebase Auth (Google, Apple, Phone), shadcn/ui, Tailwind CSS, Framer Motion

**Spec:** `docs/specs/2026-04-02-frontend-api-auth-design.md`

---

## File Structure

```
car-frontend/
├── lib/
│   ├── firebase.ts          (CREATE) Firebase app + auth init
│   ├── api.ts               (CREATE) API client with auto-auth
│   └── car-data.ts          (MODIFY) Remove calculateScore, keep UI constants
├── components/
│   ├── auth-provider.tsx    (CREATE) Auth context + provider
│   ├── auth-modal.tsx       (CREATE) Sign-in dialog
│   ├── header.tsx           (CREATE) Top bar with nav + auth
│   ├── car-evaluation-wizard.tsx (MODIFY) Add API call + loading state
│   └── steps/
│       ├── brand-model-step.tsx  (MODIFY) Fetch from API
│       ├── results-step.tsx      (MODIFY) Show API response
│       └── account-prompt.tsx    (MODIFY) Wire Firebase sign-in
├── app/
│   ├── layout.tsx           (MODIFY) Add AuthProvider + Header
│   ├── page.tsx             (MODIFY) Adjust for header
│   └── history/
│       └── page.tsx         (CREATE) Evaluation history
```

---

### Task 1: Install Firebase & Create lib/firebase.ts

**Files:**
- Create: `lib/firebase.ts`

- [ ] **Step 1: Install Firebase**

```bash
cd C:\repos\car\car-frontend
npm install firebase
```

- [ ] **Step 2: Create Firebase initialization module**

Write to `lib/firebase.ts`:

```typescript
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_-YOT5OTNSZNQ_SP7NDd6oes9WhXt8Pw",
  authDomain: "kapot-e3715.firebaseapp.com",
  projectId: "kapot-e3715",
  storageBucket: "kapot-e3715.firebasestorage.app",
  messagingSenderId: "529474359415",
  appId: "1:529474359415:web:3ba90660e0f2e0332f3672",
  measurementId: "G-HY9EWX8BTW",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");
```

- [ ] **Step 3: Verify build**

```bash
cd C:\repos\car\car-frontend
npm run build
```

Expected: Build succeeds (firebase is tree-shaken, no issues).

- [ ] **Step 4: Commit**

```bash
git add lib/firebase.ts package.json package-lock.json
git commit -m "feat: add Firebase initialization module"
```

---

### Task 2: Create lib/api.ts

**Files:**
- Create: `lib/api.ts`

- [ ] **Step 1: Write the API client**

Write to `lib/api.ts`:

```typescript
import { auth } from "./firebase";

const API_BASE = "https://car-point-api-625412356368.europe-west3.run.app";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Brands
export async function getBrands(): Promise<string[]> {
  const res = await apiFetch<{ data: string[] }>("/brands");
  return res.data;
}

export async function getModels(brand: string): Promise<string[]> {
  const res = await apiFetch<{ data: string[] }>(
    `/brands/${encodeURIComponent(brand)}/models`
  );
  return res.data;
}

// Evaluate
export interface EvaluateRequest {
  brand: string;
  model: string;
  year: number;
  bodyType?: string;
  color?: string;
  engine: string;
  mileage: number;
  transmission: string;
  drive: string;
  isNew: boolean;
  numberOfSeats?: number;
  condition: string;
  market?: string;
  city?: string;
  price: number;
}

export interface ScoreBreakdown {
  mileageScore: number;
  ageScore: number;
  reliabilityScore: number;
  conditionScore: number;
  depreciationScore: number;
  transmissionScore: number;
  driveScore: number;
  engineScore: number;
}

export interface PriceInfo {
  listed: number;
  average: number | null;
  deviation: number;
  priceStatus: number; // 0=FAIR_PRICE, 1=GREAT_DEAL, 2=OVERPRICED
}

export interface EvaluationResult {
  qualityScore: number;
  qualityStatus: number; // 0=GOOD, 1=POOR, 2=EXCELLENT
  price: PriceInfo;
  scoreBreakdown: ScoreBreakdown;
}

export async function evaluate(
  data: EvaluateRequest
): Promise<EvaluationResult> {
  const res = await apiFetch<{ data: EvaluationResult }>("/evaluate", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

// User profile
export async function createProfile(): Promise<void> {
  try {
    await apiFetch("/me", { method: "POST" });
  } catch {
    // 409 = profile already exists, ignore
  }
}

// Evaluations history
export interface EvaluationHistoryItem {
  _id: string;
  request: EvaluateRequest;
  result: EvaluationResult;
  createdAt: string;
}

export interface EvaluationsResponse {
  data: EvaluationHistoryItem[];
  meta: { page: number; limit: number; total: number };
}

export async function getEvaluations(
  page: number = 1,
  limit: number = 20
): Promise<EvaluationsResponse> {
  return apiFetch<EvaluationsResponse>(
    `/me/evaluations?page=${page}&limit=${limit}`
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/api.ts
git commit -m "feat: add API client module with auto-auth headers"
```

---

### Task 3: Create Auth Provider

**Files:**
- Create: `components/auth-provider.tsx`

- [ ] **Step 1: Write the auth context and provider**

Write to `components/auth-provider.tsx`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add components/auth-provider.tsx
git commit -m "feat: add Firebase auth context provider"
```

---

### Task 4: Create Auth Modal

**Files:**
- Create: `components/auth-modal.tsx`

- [ ] **Step 1: Write the auth modal component**

Write to `components/auth-modal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "./auth-provider";
import { Phone, Loader2 } from "lucide-react";
import type { ConfirmationResult } from "firebase/auth";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signInWithGoogle, signInWithApple, signInWithPhone, confirmPhoneCode } =
    useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithApple();
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPhone(phoneNumber);
      setConfirmationResult(result);
      setShowOtp(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to send code";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!confirmationResult || !otpCode) return;
    setLoading(true);
    setError("");
    try {
      await confirmPhoneCode(confirmationResult, otpCode);
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Invalid code";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setPhoneNumber("");
    setShowOtp(false);
    setOtpCode("");
    setConfirmationResult(null);
    setError("");
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetState();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Sign In</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base"
            onClick={handleApple}
            disabled={loading}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {!showOtp ? (
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+994 XX XXX XX XX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 rounded-xl flex-1"
                disabled={loading}
              />
              <Button
                onClick={handleSendCode}
                disabled={loading || !phoneNumber}
                className="h-12 rounded-xl px-4"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Enter the code sent to {phoneNumber}
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="h-12 rounded-xl flex-1 text-center text-lg tracking-widest"
                  maxLength={6}
                  disabled={loading}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={loading || otpCode.length < 6}
                  className="h-12 rounded-xl px-6"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/auth-modal.tsx
git commit -m "feat: add auth modal with Google, Apple, and phone sign-in"
```

---

### Task 5: Create Header

**Files:**
- Create: `components/header.tsx`

- [ ] **Step 1: Write the header component**

Write to `components/header.tsx`:

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "./auth-provider";
import { AuthModal } from "./auth-modal";
import { History, LogOut, LogIn } from "lucide-react";

export function Header() {
  const { user, loading, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            CarCheck
          </Link>

          <div className="flex items-center gap-2">
            {loading ? null : user ? (
              <>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="rounded-xl">
                    <History className="w-4 h-4 mr-2" />
                    History
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.displayName || user.email || user.phoneNumber}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="rounded-xl"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/header.tsx
git commit -m "feat: add header with auth and navigation"
```

---

### Task 6: Update app/layout.tsx

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Wrap app with AuthProvider and add Header**

Replace the contents of `app/layout.tsx` with:

```typescript
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import { Header } from '@/components/header'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CarCheck - How Good Is Your Car Deal?',
  description: 'Get an instant evaluation of any car deal in under 2 minutes. Check if the price is fair, compare to market averages, and make smarter buying decisions.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: integrate AuthProvider and Header into root layout"
```

---

### Task 7: Update Brand/Model Step to Fetch from API

**Files:**
- Modify: `components/steps/brand-model-step.tsx`

- [ ] **Step 1: Replace hardcoded data with API fetching**

Replace the contents of `components/steps/brand-model-step.tsx` with:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import { getBrands, getModels } from "@/lib/api";
import type { CarFormData } from "../car-evaluation-wizard";

interface BrandModelStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export function BrandModelStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: BrandModelStepProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);

  const canContinue = formData.brand && formData.model;

  useEffect(() => {
    getBrands()
      .then(setBrands)
      .catch(() => setBrands([]))
      .finally(() => setLoadingBrands(false));
  }, []);

  useEffect(() => {
    if (!formData.brand) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    getModels(formData.brand)
      .then(setModels)
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [formData.brand]);

  const handleBrandChange = (brand: string) => {
    onUpdate({ brand, model: "" });
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              What car are you looking at?
            </h2>
            <p className="text-muted-foreground">
              Select the brand and model
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-base font-medium">
                Brand
              </Label>
              {loadingBrands ? (
                <div className="h-14 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select
                  value={formData.brand}
                  onValueChange={handleBrandChange}
                >
                  <SelectTrigger id="brand" className="h-14 text-base rounded-xl">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand} className="text-base py-3 capitalize">
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model" className="text-base font-medium">
                Model
              </Label>
              {loadingModels ? (
                <div className="h-14 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select
                  value={formData.model}
                  onValueChange={(model) => onUpdate({ model })}
                  disabled={!formData.brand}
                >
                  <SelectTrigger id="model" className="h-14 text-base rounded-xl">
                    <SelectValue placeholder={formData.brand ? "Select a model" : "Select brand first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model} value={model} className="text-base py-3 capitalize">
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 max-w-md mx-auto w-full">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-12 px-4 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="h-12 px-6 rounded-xl"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/steps/brand-model-step.tsx
git commit -m "feat: fetch brands and models from API instead of hardcoded data"
```

---

### Task 8: Update Wizard to Call POST /evaluate

**Files:**
- Modify: `components/car-evaluation-wizard.tsx`

- [ ] **Step 1: Add API call and loading/error state to wizard**

Replace the contents of `components/car-evaluation-wizard.tsx` with:

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LandingStep } from "./steps/landing-step";
import { BrandModelStep } from "./steps/brand-model-step";
import { YearMileageStep } from "./steps/year-mileage-step";
import { ConditionEngineStep } from "./steps/condition-engine-step";
import { TransmissionDriveStep } from "./steps/transmission-drive-step";
import { PriceStep } from "./steps/price-step";
import { ResultsStep } from "./steps/results-step";
import { AccountPrompt } from "./steps/account-prompt";
import { evaluate, type EvaluationResult, type EvaluateRequest } from "@/lib/api";
import { useAuth } from "./auth-provider";
import type { Condition, EngineType, Transmission, DriveType } from "@/lib/car-data";

export interface CarFormData {
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
  isBrandNew: boolean;
  condition: Condition | "";
  engineType: EngineType | "";
  transmission: Transmission | "";
  driveType: DriveType | "";
  askingPrice: number | null;
}

const initialFormData: CarFormData = {
  brand: "",
  model: "",
  year: null,
  mileage: null,
  isBrandNew: false,
  condition: "",
  engineType: "",
  transmission: "",
  driveType: "",
  askingPrice: null,
};

export function CarEvaluationWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CarFormData>(initialFormData);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const [direction, setDirection] = useState(1);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  const totalSteps = 6;

  const updateFormData = (updates: Partial<CarFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const goToPrevious = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const restart = () => {
    setDirection(-1);
    setFormData(initialFormData);
    setEvaluationResult(null);
    setEvaluationError(null);
    setCurrentStep(0);
    setShowAccountPrompt(false);
  };

  const handleEvaluate = async () => {
    setEvaluating(true);
    setEvaluationError(null);

    const request: EvaluateRequest = {
      brand: formData.brand,
      model: formData.model,
      year: formData.year!,
      engine: formData.engineType as string,
      mileage: formData.isBrandNew ? 0 : formData.mileage!,
      transmission: formData.transmission as string,
      drive: (formData.driveType as string).toUpperCase(),
      isNew: formData.isBrandNew,
      condition: formData.condition as string,
      price: formData.askingPrice!,
    };

    try {
      const result = await evaluate(request);
      setEvaluationResult(result);
      setDirection(1);
      setCurrentStep(6);
    } catch {
      setEvaluationError("Unable to evaluate. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleResultsViewed = () => {
    if (!user) {
      setTimeout(() => {
        setShowAccountPrompt(true);
      }, 3000);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LandingStep onNext={goToNext} />;
      case 1:
        return (
          <BrandModelStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={1}
            totalSteps={totalSteps}
          />
        );
      case 2:
        return (
          <YearMileageStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={2}
            totalSteps={totalSteps}
          />
        );
      case 3:
        return (
          <ConditionEngineStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={3}
            totalSteps={totalSteps}
          />
        );
      case 4:
        return (
          <TransmissionDriveStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={goToNext}
            onBack={goToPrevious}
            currentStep={4}
            totalSteps={totalSteps}
          />
        );
      case 5:
        return (
          <PriceStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleEvaluate}
            onBack={goToPrevious}
            currentStep={5}
            totalSteps={totalSteps}
            loading={evaluating}
            error={evaluationError}
          />
        );
      case 6:
        return evaluationResult ? (
          <ResultsStep
            formData={formData}
            result={evaluationResult}
            onResultsViewed={handleResultsViewed}
            onRestart={restart}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex flex-col">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showAccountPrompt && currentStep === 6 && (
          <AccountPrompt onClose={() => setShowAccountPrompt(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Update PriceStep to accept loading and error props**

In `components/steps/price-step.tsx`, update the interface and the component. Replace the full file:

```typescript
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { ProgressBar } from "./progress-bar";
import type { CarFormData } from "../car-evaluation-wizard";

interface PriceStepProps {
  formData: CarFormData;
  onUpdate: (updates: Partial<CarFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
  loading?: boolean;
  error?: string | null;
}

export function PriceStep({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps,
  loading,
  error,
}: PriceStepProps) {
  const canContinue = formData.askingPrice !== null && formData.askingPrice > 0 && !loading;

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              What&apos;s the asking price?
            </h2>
            <p className="text-muted-foreground">
              Enter the price to see if it&apos;s a good deal
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="price" className="text-base font-medium">
              Price
            </Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                placeholder="Enter asking price"
                value={formData.askingPrice ?? ""}
                onChange={(e) => onUpdate({ askingPrice: e.target.value ? parseInt(e.target.value) : null })}
                className="h-16 text-xl font-semibold rounded-xl pr-20 pl-4"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                AZN
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={onNext}
            disabled={!canContinue}
            size="lg"
            className="w-full h-14 text-lg font-medium rounded-xl"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {loading ? "Evaluating..." : "Get Results"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-start pt-8 max-w-md mx-auto w-full">
        <Button
          variant="ghost"
          onClick={onBack}
          className="h-12 px-4 rounded-xl"
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/car-evaluation-wizard.tsx components/steps/price-step.tsx
git commit -m "feat: call POST /evaluate API from wizard with loading state"
```

---

### Task 9: Update Results Step to Show API Response

**Files:**
- Modify: `components/steps/results-step.tsx`

- [ ] **Step 1: Replace client-side scoring with API result display**

Replace the contents of `components/steps/results-step.tsx` with:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { EvaluationResult } from "@/lib/api";
import type { CarFormData } from "../car-evaluation-wizard";
import { cn } from "@/lib/utils";

interface ResultsStepProps {
  formData: CarFormData;
  result: EvaluationResult;
  onResultsViewed: () => void;
  onRestart: () => void;
}

function AnimatedNumber({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(easeOutQuart * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

// qualityStatus: 0=GOOD, 1=POOR, 2=EXCELLENT
const qualityLabels: Record<number, string> = { 0: "Good", 1: "Poor", 2: "Excellent" };
const qualityColors: Record<number, string> = {
  0: "bg-warning text-warning-foreground",
  1: "bg-destructive text-destructive-foreground",
  2: "bg-success text-success-foreground",
};

// priceStatus: 0=FAIR_PRICE, 1=GREAT_DEAL, 2=OVERPRICED
const priceLabels: Record<number, string> = { 0: "Fair Price", 1: "Great Deal", 2: "Overpriced" };
const priceColors: Record<number, string> = { 0: "text-foreground", 1: "text-success", 2: "text-destructive" };

export function ResultsStep({ formData, result, onResultsViewed, onRestart }: ResultsStepProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    onResultsViewed();
    const timer = setTimeout(() => setShowBreakdown(true), 2500);
    return () => clearTimeout(timer);
  }, [onResultsViewed]);

  const { qualityScore, qualityStatus, price, scoreBreakdown } = result;

  const scoreColor =
    qualityScore >= 71 ? "text-success" :
    qualityScore >= 41 ? "text-warning" :
    "text-destructive";

  const PriceIcon = price.deviation < 0 ? TrendingDown : price.deviation > 0 ? TrendingUp : Minus;

  const breakdownItems = [
    { category: "Mileage", score: scoreBreakdown.mileageScore, maxScore: 25 },
    { category: "Reliability", score: scoreBreakdown.reliabilityScore, maxScore: 20 },
    { category: "Age", score: scoreBreakdown.ageScore, maxScore: 15 },
    { category: "Condition", score: scoreBreakdown.conditionScore, maxScore: 15 },
    { category: "Depreciation", score: scoreBreakdown.depreciationScore, maxScore: 10 },
    { category: "Transmission", score: scoreBreakdown.transmissionScore, maxScore: 5 },
    { category: "Drive", score: scoreBreakdown.driveScore, maxScore: 5 },
    { category: "Engine", score: scoreBreakdown.engineScore, maxScore: 5 },
  ];

  return (
    <div className="flex-1 flex flex-col px-6 py-8 overflow-y-auto">
      <div className="max-w-lg mx-auto w-full space-y-8">
        {/* Car Info Header */}
        <div className="text-center space-y-1">
          <h2 className="text-lg text-muted-foreground capitalize">
            {formData.brand} {formData.model}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formData.year} · {formData.isBrandNew ? "Brand New" : `${formData.mileage?.toLocaleString()} km`}
          </p>
        </div>

        {/* Score Circle */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" className="text-secondary" />
              <circle
                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={553} strokeDashoffset={553 - (553 * qualityScore) / 100}
                className={cn("transition-all duration-[2000ms] ease-out", scoreColor)}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold">
                <AnimatedNumber value={qualityScore} />
              </span>
              <span className="text-muted-foreground">/100</span>
            </div>
          </div>

          <div className={cn("px-4 py-2 rounded-full font-medium uppercase text-sm", qualityColors[qualityStatus])}>
            {qualityLabels[qualityStatus]}
          </div>
        </div>

        {/* Price Verdict */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Price Verdict</span>
            <div className={cn("flex items-center gap-2 font-semibold text-lg", priceColors[price.priceStatus])}>
              <PriceIcon className="w-5 h-5" />
              {priceLabels[price.priceStatus]}
            </div>
          </div>

          <div className="text-center py-2">
            <span className={cn("text-2xl font-bold", priceColors[price.priceStatus])}>
              {price.average !== null
                ? `${Math.abs(price.deviation).toFixed(1)}% ${price.deviation <= 0 ? "below" : "above"} market`
                : "No market data available"}
            </span>
          </div>

          {price.average !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Your Price</span>
                <span>Market Average</span>
              </div>
              <div className="relative h-3 bg-secondary rounded-full">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow-sm"
                  style={{ left: `${Math.min(Math.max((price.listed / (price.average * 1.5)) * 100, 5), 95)}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted-foreground border-2 border-background shadow-sm"
                  style={{ left: `${Math.min(Math.max((price.average / (price.average * 1.5)) * 100, 5), 95)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>{price.listed.toLocaleString()} AZN</span>
                <span>{price.average.toLocaleString()} AZN</span>
              </div>
            </div>
          )}
        </div>

        {/* Score Breakdown */}
        {showBreakdown && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-semibold text-lg">Score Breakdown</h3>
            <div className="space-y-3">
              {breakdownItems.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-medium">{item.score}/{item.maxScore}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                      style={{ width: `${(item.score / item.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Restart Button */}
        <div className="pt-4">
          <Button variant="outline" onClick={onRestart} className="w-full h-12 rounded-xl">
            <RotateCcw className="w-4 h-4 mr-2" />
            Evaluate Another Car
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/steps/results-step.tsx
git commit -m "feat: display API evaluation results instead of client-side scoring"
```

---

### Task 10: Update Account Prompt with Firebase Sign-In

**Files:**
- Modify: `components/steps/account-prompt.tsx`

- [ ] **Step 1: Wire account prompt to Firebase auth**

Replace the contents of `components/steps/account-prompt.tsx` with:

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Bookmark, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

interface AccountPromptProps {
  onClose: () => void;
}

export function AccountPrompt({ onClose }: AccountPromptProps) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithApple();
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="text-center space-y-4 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold">Save Your Evaluation</h3>
          <p className="text-muted-foreground">
            Sign in to save this evaluation and view your history.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Track all your evaluations</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <Bookmark className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Compare cars side by side</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive text-center mb-4">{error}</p>
        )}

        <div className="space-y-3">
          <Button
            className="w-full h-12 rounded-xl text-base"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl text-base"
            onClick={handleApple}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full h-12 rounded-xl text-base text-muted-foreground"
          >
            No thanks
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/steps/account-prompt.tsx
git commit -m "feat: wire account prompt to Firebase auth"
```

---

### Task 11: Clean Up car-data.ts

**Files:**
- Modify: `lib/car-data.ts`

- [ ] **Step 1: Remove calculateScore and hardcoded brand/model data**

Replace the contents of `lib/car-data.ts` with:

```typescript
export const conditions = [
  { value: "excellent", label: "Excellent", description: "Like new, no visible wear" },
  { value: "good", label: "Good", description: "Minor wear, well maintained" },
  { value: "fair", label: "Fair", description: "Some wear and small issues" },
  { value: "poor", label: "Poor", description: "Significant wear or damage" },
] as const;

export const engineTypes = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "LPG", label: "LPG" },
] as const;

export const transmissions = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "semi-automatic", label: "Semi-Auto" },
] as const;

export const driveTypes = [
  { value: "FWD", label: "FWD", description: "Front-Wheel Drive" },
  { value: "RWD", label: "RWD", description: "Rear-Wheel Drive" },
  { value: "AWD", label: "AWD", description: "All-Wheel Drive" },
] as const;

export type Condition = (typeof conditions)[number]["value"];
export type EngineType = (typeof engineTypes)[number]["value"];
export type Transmission = (typeof transmissions)[number]["value"];
export type DriveType = (typeof driveTypes)[number]["value"];
```

Note: The `value` fields for `engineTypes` and `driveTypes` are updated to match the API's expected values (`LPG` not `lpg`, `FWD`/`RWD`/`AWD` uppercase).

- [ ] **Step 2: Commit**

```bash
git add lib/car-data.ts
git commit -m "refactor: remove client-side scoring, keep UI constants aligned with API"
```

---

### Task 12: Create /history Page

**Files:**
- Create: `app/history/page.tsx`

- [ ] **Step 1: Write the evaluation history page**

Write to `app/history/page.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getEvaluations, type EvaluationHistoryItem } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

const qualityLabels: Record<number, string> = { 0: "Good", 1: "Poor", 2: "Excellent" };
const qualityBadgeColors: Record<number, string> = {
  0: "bg-warning/20 text-warning-foreground",
  1: "bg-destructive/20 text-destructive",
  2: "bg-success/20 text-success",
};

const priceLabels: Record<number, string> = { 0: "Fair Price", 1: "Great Deal", 2: "Overpriced" };
const priceBadgeColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-success/20 text-success",
  2: "bg-destructive/20 text-destructive",
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<EvaluationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getEvaluations(page)
      .then((res) => {
        setEvaluations((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.meta.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, page]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const breakdownLabels = [
    { key: "mileageScore", label: "Mileage", max: 25 },
    { key: "reliabilityScore", label: "Reliability", max: 20 },
    { key: "ageScore", label: "Age", max: 15 },
    { key: "conditionScore", label: "Condition", max: 15 },
    { key: "depreciationScore", label: "Depreciation", max: 10 },
    { key: "transmissionScore", label: "Transmission", max: 5 },
    { key: "driveScore", label: "Drive", max: 5 },
    { key: "engineScore", label: "Engine", max: 5 },
  ] as const;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Evaluation History</h1>
            <p className="text-sm text-muted-foreground">{total} evaluation{total !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {loading && evaluations.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : evaluations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">No evaluations yet</p>
            <p className="text-sm">Go evaluate a car to see it here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((item) => {
              const isExpanded = expandedId === item._id;
              const { result, request } = item;

              return (
                <div
                  key={item._id}
                  className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer transition-colors hover:border-primary/30"
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold capitalize">
                        {request.brand} {request.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request.year} · {request.price.toLocaleString()} AZN ·{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", qualityBadgeColors[result.qualityStatus])}>
                        {result.qualityScore}/100 {qualityLabels[result.qualityStatus]}
                      </span>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", priceBadgeColors[result.price.priceStatus])}>
                        {priceLabels[result.price.priceStatus]}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border pt-4 space-y-3">
                      {result.price.average !== null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Market Average</span>
                          <span className="font-medium">{result.price.average.toLocaleString()} AZN ({result.price.deviation > 0 ? "+" : ""}{result.price.deviation.toFixed(1)}%)</span>
                        </div>
                      )}
                      <div className="space-y-2">
                        {breakdownLabels.map(({ key, label, max }) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{label}</span>
                              <span>{(result.scoreBreakdown as Record<string, number>)[key]}/{max}</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${((result.scoreBreakdown as Record<string, number>)[key] / max) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {evaluations.length < total && (
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
                onClick={(e) => { e.stopPropagation(); setPage((p) => p + 1); }}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/history/page.tsx
git commit -m "feat: add evaluation history page"
```

---

### Task 13: Verify Build and Test

- [ ] **Step 1: Build the project**

```bash
cd C:\repos\car\car-frontend
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server and manually test**

```bash
npm run dev
```

Manual verification checklist:
1. Landing page loads with header showing "Sign In" button
2. Brand dropdown loads 150+ brands from API
3. Selecting a brand loads models from API
4. Completing wizard hits POST /evaluate and shows real API results
5. Score breakdown shows 8 components with correct max scores
6. Price comparison shows real market data
7. Account prompt appears 3 seconds after results (if not signed in)
8. Google sign-in works from both header and account prompt
9. After sign-in, header shows user name, "History" link, sign out
10. /history page shows past evaluations
11. Clicking an evaluation card expands to show breakdown
12. Sign out works and redirects from /history

- [ ] **Step 3: Commit any remaining fixes and push**

```bash
git add -A
git commit -m "chore: final build verification"
```
