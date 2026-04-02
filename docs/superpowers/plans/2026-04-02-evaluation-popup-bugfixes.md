# Evaluation Popup Bugfixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four bugs: dismiss popup permanently per session, add phone auth to popup, save evaluation after sign-up, fix RecaptchaVerifier crash.

**Architecture:** Bug 4 (RecaptchaVerifier) is fixed first since bugs 2 and 3 depend on working phone auth. Bug 2 (PhoneAuthForm extraction) comes next, then bug 1 and 3 together since they both modify the wizard ↔ AccountPrompt interface.

**Tech Stack:** Next.js, React, Firebase Auth, TypeScript

---

### Task 1: Fix RecaptchaVerifier singleton

**Files:**
- Modify: `components/auth-provider.tsx:71-78`

- [ ] **Step 1: Refactor signInWithPhone to use a cached RecaptchaVerifier**

Replace the `signInWithPhone` function in `components/auth-provider.tsx`. Add a module-level variable above the component to cache the verifier.

Add this above the `AuthProvider` component (after imports, around line 20):

```tsx
let cachedRecaptchaVerifier: RecaptchaVerifier | null = null;
```

Then replace lines 71-78 (the `signInWithPhone` function) with:

```tsx
  const signInWithPhone = async (
    phoneNumber: string
  ): Promise<ConfirmationResult> => {
    if (cachedRecaptchaVerifier) {
      try {
        cachedRecaptchaVerifier.clear();
      } catch {
        // ignore clear errors
      }
    }
    cachedRecaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
    return signInWithPhoneNumber(auth, phoneNumber, cachedRecaptchaVerifier);
  };
```

- [ ] **Step 2: Verify the build compiles**

Run: `npx next build`
Expected: Build succeeds with no type errors related to auth-provider.

- [ ] **Step 3: Commit**

```bash
git add components/auth-provider.tsx
git commit -m "fix: use cleared RecaptchaVerifier per phone sign-in attempt"
```

---

### Task 2: Extract PhoneAuthForm component

**Files:**
- Create: `components/phone-auth-form.tsx`
- Modify: `components/auth-modal.tsx:60-226`

- [ ] **Step 1: Create the PhoneAuthForm component**

Create `components/phone-auth-form.tsx` with the phone/OTP logic extracted from `AuthModal`:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import type { ConfirmationResult } from "firebase/auth";

interface PhoneAuthFormProps {
  onSuccess: () => void;
  disabled?: boolean;
}

export function PhoneAuthForm({ onSuccess, disabled = false }: PhoneAuthFormProps) {
  const { signInWithPhone, confirmPhoneCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");

  const handleSendCode = async () => {
    if (!phoneNumber) return;
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPhone(phoneNumber);
      setConfirmationResult(result);
      setShowOtp(true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Kod göndərilə bilmədi";
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
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Yanlış kod";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {!showOtp ? (
        <div className="flex gap-2">
          <Input
            type="tel"
            placeholder="+994 XX XXX XX XX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-12 rounded-xl flex-1"
            disabled={isDisabled}
          />
          <Button
            onClick={handleSendCode}
            disabled={isDisabled || !phoneNumber}
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
            {phoneNumber} nömrəsinə göndərilən kodu daxil edin
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="6 rəqəmli kodu daxil edin"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="h-12 rounded-xl flex-1 text-center text-lg tracking-widest"
              maxLength={6}
              disabled={isDisabled}
            />
            <Button
              onClick={handleVerifyCode}
              disabled={isDisabled || otpCode.length < 6}
              className="h-12 rounded-xl px-6"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Təsdiqlə"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Replace inline phone UI in AuthModal with PhoneAuthForm**

In `components/auth-modal.tsx`:

1. Remove the phone-related state variables (lines 25-29): `phoneNumber`, `showOtp`, `otpCode`, `confirmationResult`.
2. Remove the `handleSendCode` and `handleVerifyCode` functions (lines 60-89).
3. Remove the `resetState` function (lines 91-98) and replace it inline in `onOpenChange`:

```tsx
  const resetState = () => {
    setError("");
    setLoading(false);
  };
```

4. Remove the `Phone` import from lucide-react (line 13), and the `ConfirmationResult` import (line 14), and the `Input` import (line 5).
5. Add the `PhoneAuthForm` import:

```tsx
import { PhoneAuthForm } from "./phone-auth-form";
```

6. Replace lines 176-226 (the phone input / OTP section inside the dialog, from the `<div className="relative py-2">` divider through the end of the OTP block) with:

```tsx
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                və ya
              </span>
            </div>
          </div>

          <PhoneAuthForm
            onSuccess={() => onOpenChange(false)}
            disabled={loading}
          />
```

The full resulting `AuthModal` component should look like:

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "./auth-provider";
import { Loader2 } from "lucide-react";
import { PhoneAuthForm } from "./phone-auth-form";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onOpenChange(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Daxil olmaq mümkün olmadı";
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
      const message = e instanceof Error ? e.message : "Daxil olmaq mümkün olmadı";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
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
          <DialogTitle className="text-center text-xl">Daxil ol</DialogTitle>
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
            Google ilə davam et
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
            Apple ilə davam et
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                və ya
              </span>
            </div>
          </div>

          <PhoneAuthForm
            onSuccess={() => onOpenChange(false)}
            disabled={loading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npx next build`
Expected: Build succeeds. AuthModal renders identically to before.

- [ ] **Step 4: Commit**

```bash
git add components/phone-auth-form.tsx components/auth-modal.tsx
git commit -m "refactor: extract PhoneAuthForm from AuthModal"
```

---

### Task 3: Add phone auth to AccountPrompt, dismiss flag, and save evaluation

**Files:**
- Modify: `components/steps/account-prompt.tsx`
- Modify: `components/car-evaluation-wizard.tsx:1-257`

- [ ] **Step 1: Update AccountPrompt props and add phone auth + save evaluation**

Replace the full content of `components/steps/account-prompt.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Bookmark, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { PhoneAuthForm } from "@/components/phone-auth-form";
import { evaluate, type EvaluateRequest } from "@/lib/api";

interface AccountPromptProps {
  onClose: () => void;
  evaluationRequest: EvaluateRequest | null;
}

export function AccountPrompt({ onClose, evaluationRequest }: AccountPromptProps) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveEvaluation = async () => {
    if (!evaluationRequest) return;
    try {
      await evaluate(evaluationRequest);
    } catch {
      // Best-effort save — don't block sign-in flow
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      await saveEvaluation();
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Daxil olmaq mümkün olmadı";
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
      await saveEvaluation();
      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Daxil olmaq mümkün olmadı";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSuccess = async () => {
    await saveEvaluation();
    onClose();
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
          <h3 className="text-xl font-bold">Qiymətləndirmənizi yadda saxlayın</h3>
          <p className="text-muted-foreground">
            Qiymətləndirməni yadda saxlamaq və tarixçənizi görmək üçün daxil olun.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Bütün qiymətləndirmələrinizi izləyin</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
            <Bookmark className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">Maşınları yan-yana müqayisə edin</span>
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
            Google ilə davam et
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
            Apple ilə davam et
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                və ya
              </span>
            </div>
          </div>

          <PhoneAuthForm
            onSuccess={handlePhoneSuccess}
            disabled={loading}
          />

          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full h-12 rounded-xl text-base text-muted-foreground"
          >
            Xeyr, sağ ol
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Update CarEvaluationWizard — add dismiss ref, build evaluationRequest, pass to AccountPrompt**

In `components/car-evaluation-wizard.tsx`, make these changes:

1. Add `useRef` to the React import (line 1):

```tsx
import { useState, useRef } from "react";
```

2. Add `type EvaluateRequest` to the api import (line 14):

```tsx
import { evaluate, type EvaluationResult, type EvaluateRequest } from "@/lib/api";
```

3. Inside `CarEvaluationWizard`, after line 60 (`const [evaluationError, ...`), add:

```tsx
  const accountPromptDismissed = useRef(false);
  const [lastEvaluationRequest, setLastEvaluationRequest] = useState<EvaluateRequest | null>(null);
```

4. In `handleEvaluate` (lines 89-121), save the request before calling evaluate. Replace the function with:

```tsx
  const handleEvaluate = async () => {
    setEvaluating(true);
    setEvaluationError(null);

    const request: EvaluateRequest = {
      brand: formData.brand,
      model: formData.model,
      year: formData.year!,
      bodyType: formData.bodyType as string,
      color: formData.color as string,
      engine: formData.engineType as string,
      mileage: formData.isBrandNew ? 0 : formData.mileage!,
      transmission: formData.transmission as string,
      drive: (formData.driveType as string).toUpperCase(),
      isNew: formData.isBrandNew,
      numberOfSeats: formData.numberOfSeats!,
      condition: formData.condition as string,
      market: "turbo.az",
      city: formData.city as string,
      price: formData.askingPrice!,
    };

    setLastEvaluationRequest(request);

    try {
      const result = await evaluate(request);
      setEvaluationResult(result);
      setDirection(1);
      setCurrentStep(7);
    } catch {
      setEvaluationError("Qiymətləndirmə mümkün olmadı. Yenidən cəhd edin.");
    } finally {
      setEvaluating(false);
    }
  };
```

5. Replace `handleResultsViewed` (lines 123-129) with:

```tsx
  const handleResultsViewed = () => {
    if (!user && !accountPromptDismissed.current) {
      setTimeout(() => {
        setShowAccountPrompt(true);
      }, 3000);
    }
  };
```

6. Replace the `handleAccountPromptClose` handler. Add a new function after `handleResultsViewed`:

```tsx
  const handleAccountPromptClose = () => {
    accountPromptDismissed.current = true;
    setShowAccountPrompt(false);
  };
```

7. Update the `AccountPrompt` usage at the bottom (around line 250). Replace:

```tsx
          <AccountPrompt onClose={() => setShowAccountPrompt(false)} />
```

with:

```tsx
          <AccountPrompt
            onClose={handleAccountPromptClose}
            evaluationRequest={lastEvaluationRequest}
          />
```

- [ ] **Step 3: Verify the build compiles**

Run: `npx next build`
Expected: Build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add components/steps/account-prompt.tsx components/car-evaluation-wizard.tsx
git commit -m "feat: add phone auth to popup, save evaluation on sign-up, dismiss permanently"
```
