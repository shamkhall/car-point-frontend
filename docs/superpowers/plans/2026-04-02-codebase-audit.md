# Codebase Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 17 code quality and UX reliability issues across 5 themes identified in the codebase audit.

**Architecture:** Fixes are grouped by theme. Each task is self-contained and produces a working commit. Tasks within a theme may depend on each other, but themes are mostly independent. Theme 1 (shared constants) should go first since Themes 2-3 reference those files.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.7, Firebase Auth, Tailwind CSS

**Note:** No test framework is installed. Verification is via `npx next build` (after Task 10 removes `ignoreBuildErrors`) and manual checks.

---

## Theme 1: Duplicated Code

### Task 1: Extract shared evaluation labels and constants

**Files:**
- Create: `lib/evaluation-labels.ts`
- Modify: `components/steps/results-step.tsx`
- Modify: `app/history/page.tsx`

- [ ] **Step 1: Create `lib/evaluation-labels.ts`**

```ts
export const qualityLabels: Record<number, string> = {
  0: "Good",
  1: "Poor",
  2: "Excellent",
};

export const qualityBadgeColors: Record<number, string> = {
  0: "bg-warning/20 text-warning-foreground",
  1: "bg-destructive/20 text-destructive",
  2: "bg-success/20 text-success",
};

export const qualityFullColors: Record<number, string> = {
  0: "bg-warning text-warning-foreground",
  1: "bg-destructive text-destructive-foreground",
  2: "bg-success text-success-foreground",
};

export const priceLabels: Record<number, string> = {
  0: "Fair Price",
  1: "Great Deal",
  2: "Overpriced",
};

export const priceBadgeColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-success/20 text-success",
  2: "bg-destructive/20 text-destructive",
};

export const priceTextColors: Record<number, string> = {
  0: "text-foreground",
  1: "text-success",
  2: "text-destructive",
};

export const scoreBreakdownConfig = [
  { key: "mileageScore", label: "Mileage", max: 25 },
  { key: "reliabilityScore", label: "Reliability", max: 20 },
  { key: "ageScore", label: "Age", max: 15 },
  { key: "conditionScore", label: "Condition", max: 15 },
  { key: "depreciationScore", label: "Depreciation", max: 10 },
  { key: "transmissionScore", label: "Transmission", max: 5 },
  { key: "driveScore", label: "Drive", max: 5 },
  { key: "engineScore", label: "Engine", max: 5 },
] as const;
```

- [ ] **Step 2: Update `app/history/page.tsx` to use shared constants**

Remove the local definitions of `qualityLabels`, `qualityBadgeColors`, `priceLabels`, `priceBadgeColors` (lines 12-24). Replace with imports:

```ts
import {
  qualityLabels,
  qualityBadgeColors,
  priceLabels,
  priceBadgeColors,
  scoreBreakdownConfig,
} from "@/lib/evaluation-labels";
```

Replace the local `breakdownLabels` (lines 61-70) with `scoreBreakdownConfig`. Update the usage in the JSX — the field names are the same (`key`, `label`, `max`), so the template code stays identical.

- [ ] **Step 3: Update `components/steps/results-step.tsx` to use shared constants**

Remove the local definitions of `qualityLabels`, `qualityColors`, `priceLabels`, `priceColors` (lines 51-60). Replace with imports:

```ts
import {
  qualityLabels,
  qualityFullColors,
  priceLabels,
  priceTextColors,
  scoreBreakdownConfig,
} from "@/lib/evaluation-labels";
```

Replace `qualityColors` usage (line 123) with `qualityFullColors`. Replace `priceColors` usage (lines 132, 139) with `priceTextColors`.

Replace the local `breakdownItems` (lines 80-89) with:

```ts
const breakdownItems = scoreBreakdownConfig.map((item) => ({
  category: item.label,
  score: scoreBreakdown[item.key],
  maxScore: item.max,
}));
```

- [ ] **Step 4: Verify and commit**

Run: `npx next lint`
Expected: No new errors

```bash
git add lib/evaluation-labels.ts components/steps/results-step.tsx app/history/page.tsx
git commit -m "refactor: extract shared evaluation labels and score breakdown config"
```

---

### Task 2: Extract shared auth icons

**Files:**
- Create: `components/icons/google-icon.tsx`
- Create: `components/icons/apple-icon.tsx`
- Modify: `components/auth-modal.tsx`
- Modify: `components/steps/account-prompt.tsx`

- [ ] **Step 1: Create `components/icons/google-icon.tsx`**

```tsx
export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
  );
}
```

- [ ] **Step 2: Create `components/icons/apple-icon.tsx`**

```tsx
export function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
```

- [ ] **Step 3: Update `components/auth-modal.tsx`**

Add imports at top:

```ts
import { GoogleIcon } from "./icons/google-icon";
import { AppleIcon } from "./icons/apple-icon";
```

Replace the inline Google SVG (lines 127-144) with `<GoogleIcon className="w-5 h-5 mr-2" />`.
Replace the inline Apple SVG (lines 155-162) with `<AppleIcon className="w-5 h-5 mr-2" />`.

- [ ] **Step 4: Update `components/steps/account-prompt.tsx`**

Add imports at top:

```ts
import { GoogleIcon } from "@/components/icons/google-icon";
import { AppleIcon } from "@/components/icons/apple-icon";
```

Replace the inline Google SVG (lines 104-109) with `<GoogleIcon className="w-5 h-5 mr-2" />`.
Replace the inline Apple SVG (lines 119-121) with `<AppleIcon className="w-5 h-5 mr-2" />`.

- [ ] **Step 5: Verify and commit**

Run: `npx next lint`

```bash
git add components/icons/ components/auth-modal.tsx components/steps/account-prompt.tsx
git commit -m "refactor: extract Google and Apple icon components"
```

---

### Task 3: Extract shared sign-in hook

**Files:**
- Create: `hooks/use-sign-in.ts`
- Modify: `components/auth-modal.tsx`
- Modify: `components/steps/account-prompt.tsx`

- [ ] **Step 1: Create `hooks/use-sign-in.ts`**

```ts
"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function useSignIn(onSuccess: () => void) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onSuccess();
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
      onSuccess();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to sign in";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogle, handleApple, loading, error };
}
```

- [ ] **Step 2: Update `components/auth-modal.tsx`**

Remove the local `loading`, `error` state, and `handleGoogle`/`handleApple` functions (lines 24, 30, 32-58). Replace with:

```ts
import { useSignIn } from "@/hooks/use-sign-in";

// Inside the component:
const { handleGoogle, handleApple, loading: signInLoading, error: signInError } = useSignIn(() => onOpenChange(false));
```

Keep the phone-specific `loading` state as a separate `phoneLoading` state since phone sign-in has its own multi-step flow. The `loading` prop on the Google/Apple buttons becomes `signInLoading`. The phone-related buttons use `phoneLoading`. The error display uses `signInError || phoneError`.

Rename the existing `loading`/`error` state to `phoneLoading`/`phoneError` and keep them only for the phone flow. Remove `handleGoogle` and `handleApple` function bodies.

- [ ] **Step 3: Update `components/steps/account-prompt.tsx`**

Remove the local `loading`, `error` state, and `handleGoogle`/`handleApple` functions (lines 15-44). Replace with:

```ts
import { useSignIn } from "@/hooks/use-sign-in";

// Inside the component:
const { handleGoogle, handleApple, loading, error } = useSignIn(onClose);
```

Remove the `useAuth` import since it's no longer needed directly.

- [ ] **Step 4: Verify and commit**

Run: `npx next lint`

```bash
git add hooks/use-sign-in.ts components/auth-modal.tsx components/steps/account-prompt.tsx
git commit -m "refactor: extract useSignIn hook to deduplicate auth flows"
```

---

## Theme 2: Wizard State Bugs & Fragility

### Task 4: Replace hardcoded step numbers with named constants

**Files:**
- Modify: `components/car-evaluation-wizard.tsx`

- [ ] **Step 1: Add step constants at the top of the file (after imports, before the interface)**

```ts
const STEPS = {
  LANDING: 0,
  BRAND_MODEL: 1,
  YEAR_MILEAGE: 2,
  CONDITION_ENGINE: 3,
  TRANSMISSION_DRIVE: 4,
  DETAILS: 5,
  PRICE: 6,
  RESULTS: 7,
} as const;

const LAST_STEP = STEPS.RESULTS;
const PROGRESS_STEPS = 7; // Steps shown in progress bar (excludes landing)
```

- [ ] **Step 2: Replace all magic numbers**

In `goToNext`:
```ts
const goToNext = () => {
  setDirection(1);
  setCurrentStep((prev) => Math.min(prev + 1, LAST_STEP));
};
```

In `handleEvaluate`, replace `setCurrentStep(7)`:
```ts
setCurrentStep(STEPS.RESULTS);
```

In the JSX, replace `currentStep === 7`:
```ts
{showAccountPrompt && currentStep === STEPS.RESULTS && (
```

In `renderStep`, replace the case numbers with constants:
```ts
case STEPS.LANDING:
  return <LandingStep onNext={goToNext} />;
case STEPS.BRAND_MODEL:
  return (
    <BrandModelStep
      formData={formData}
      onUpdate={updateFormData}
      onNext={goToNext}
      onBack={goToPrevious}
      currentStep={1}
      totalSteps={PROGRESS_STEPS}
    />
  );
// ... same pattern for all cases
case STEPS.RESULTS:
  return evaluationResult ? (
    <ResultsStep ... />
  ) : null;
```

Replace `totalSteps={totalSteps}` with `totalSteps={PROGRESS_STEPS}` in each step component. Remove the `const totalSteps = 7;` line.

- [ ] **Step 3: Verify and commit**

Run: `npx next lint`

```bash
git add components/car-evaluation-wizard.tsx
git commit -m "refactor: replace hardcoded step numbers with named constants"
```

---

### Task 5: Add validation guard and fix non-null assertions in handleEvaluate

**Files:**
- Modify: `components/car-evaluation-wizard.tsx`

- [ ] **Step 1: Replace `handleEvaluate` with a validated version**

Replace the current `handleEvaluate` function (lines 89-121) with:

```ts
const handleEvaluate = async () => {
  if (
    !formData.year ||
    (!formData.isBrandNew && formData.mileage === null) ||
    !formData.condition ||
    !formData.engineType ||
    !formData.transmission ||
    !formData.driveType ||
    !formData.bodyType ||
    !formData.color ||
    formData.numberOfSeats === null ||
    !formData.city ||
    formData.askingPrice === null
  ) {
    setEvaluationError("Please complete all fields before evaluating.");
    return;
  }

  setEvaluating(true);
  setEvaluationError(null);

  const request: EvaluateRequest = {
    brand: formData.brand,
    model: formData.model,
    year: formData.year,
    bodyType: formData.bodyType,
    color: formData.color,
    engine: formData.engineType,
    mileage: formData.isBrandNew ? 0 : formData.mileage,
    transmission: formData.transmission,
    drive: formData.driveType,
    isNew: formData.isBrandNew,
    numberOfSeats: formData.numberOfSeats,
    condition: formData.condition,
    market: "turbo.az",
    city: formData.city,
    price: formData.askingPrice,
  };

  try {
    const result = await evaluate(request);
    setEvaluationResult(result);
    setDirection(1);
    setCurrentStep(STEPS.RESULTS);
  } catch {
    setEvaluationError("Unable to evaluate. Please try again.");
  } finally {
    setEvaluating(false);
  }
};
```

This removes all `!` non-null assertions and `as string` casts (also fixes spec issues 5.2 and 5.3). The early return guard ensures all fields are populated. The `.toUpperCase()` on driveType is also removed since drive types are already uppercase.

- [ ] **Step 2: Verify and commit**

Run: `npx next lint`

```bash
git add components/car-evaluation-wizard.tsx
git commit -m "fix: add validation guard and remove unsafe non-null assertions in handleEvaluate"
```

---

### Task 6: Fix timer leak and memoize onResultsViewed

**Files:**
- Modify: `components/car-evaluation-wizard.tsx`
- Modify: `components/steps/results-step.tsx`

- [ ] **Step 1: Fix the timer leak in `car-evaluation-wizard.tsx`**

Add `useCallback` and `useRef` to the React import:

```ts
import { useState, useCallback, useRef } from "react";
```

Add a timer ref after the state declarations:

```ts
const accountPromptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

Replace `handleResultsViewed` with a memoized version:

```ts
const handleResultsViewed = useCallback(() => {
  if (!user) {
    accountPromptTimerRef.current = setTimeout(() => {
      setShowAccountPrompt(true);
    }, 3000);
  }
}, [user]);
```

In the `restart` function, clear the timer before resetting state:

```ts
const restart = () => {
  if (accountPromptTimerRef.current) {
    clearTimeout(accountPromptTimerRef.current);
    accountPromptTimerRef.current = null;
  }
  setDirection(-1);
  setFormData(initialFormData);
  setEvaluationResult(null);
  setEvaluationError(null);
  setCurrentStep(0);
  setShowAccountPrompt(false);
};
```

- [ ] **Step 2: Make `onResultsViewed` fire only once in `results-step.tsx`**

Replace the `useEffect` at line 65-68 with a ref-guarded version:

```ts
const hasNotified = useRef(false);

useEffect(() => {
  if (!hasNotified.current) {
    hasNotified.current = true;
    onResultsViewed();
  }
  const timer = setTimeout(() => setShowBreakdown(true), 2500);
  return () => clearTimeout(timer);
}, [onResultsViewed]);
```

Add `useRef` to the React import:

```ts
import { useEffect, useState, useRef } from "react";
```

- [ ] **Step 3: Verify and commit**

Run: `npx next lint`

```bash
git add components/car-evaluation-wizard.tsx components/steps/results-step.tsx
git commit -m "fix: clean up timer leak and prevent duplicate onResultsViewed calls"
```

---

## Theme 3: Missing Error UX

### Task 7: Add error handling and retry to history page

**Files:**
- Modify: `app/history/page.tsx`

- [ ] **Step 1: Add error state and update the fetch effect**

Add an `error` state after the existing state declarations:

```ts
const [error, setError] = useState<string | null>(null);
```

Replace the fetch `useEffect` (lines 41-51) with:

```ts
useEffect(() => {
  if (!user) return;
  setLoading(true);
  setError(null);
  getEvaluations(page)
    .then((res) => {
      setEvaluations((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
      setTotal(res.meta.total);
    })
    .catch(() => {
      setError("Failed to load evaluations. Please try again.");
    })
    .finally(() => setLoading(false));
}, [user, page]);
```

- [ ] **Step 2: Add retry function and error UI**

Add a retry function:

```ts
const retry = () => {
  setError(null);
  setPage(1);
  setEvaluations([]);
};
```

In the JSX, add an error state between the loading and empty checks. Replace the ternary block (lines 88-92) with:

```tsx
{loading && evaluations.length === 0 ? (
  <div className="flex justify-center py-16">
    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
  </div>
) : error && evaluations.length === 0 ? (
  <div className="text-center py-16 text-muted-foreground">
    <p className="text-lg mb-2">Something went wrong</p>
    <p className="text-sm mb-4">{error}</p>
    <Button variant="outline" onClick={retry} className="rounded-xl">
      Try Again
    </Button>
  </div>
) : evaluations.length === 0 ? (
  ...existing empty state...
```

- [ ] **Step 3: Verify and commit**

Run: `npx next lint`

```bash
git add app/history/page.tsx
git commit -m "fix: add error handling and retry to evaluation history page"
```

---

### Task 8: Add error handling and retry to brand/model fetching

**Files:**
- Modify: `components/steps/brand-model-step.tsx`

- [ ] **Step 1: Add error state and retry logic**

Add error states after the existing loading states:

```ts
const [brandsError, setBrandsError] = useState(false);
const [modelsError, setModelsError] = useState(false);
const [brandsFetchKey, setBrandsFetchKey] = useState(0);
```

Replace the brands `useEffect` (lines 42-47) with:

```ts
useEffect(() => {
  setLoadingBrands(true);
  setBrandsError(false);
  getBrands()
    .then(setBrands)
    .catch(() => {
      setBrands([]);
      setBrandsError(true);
    })
    .finally(() => setLoadingBrands(false));
}, [brandsFetchKey]);
```

Replace the models `useEffect` (lines 49-59) with:

```ts
useEffect(() => {
  if (!formData.brand) {
    setModels([]);
    return;
  }
  setLoadingModels(true);
  setModelsError(false);
  getModels(formData.brand)
    .then(setModels)
    .catch(() => {
      setModels([]);
      setModelsError(true);
    })
    .finally(() => setLoadingModels(false));
}, [formData.brand]);
```

- [ ] **Step 2: Add error UI for brands**

Replace the brand `Select` section (lines 87-107). After the loading spinner check, add an error state:

```tsx
{loadingBrands ? (
  <div className="h-14 flex items-center justify-center">
    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
) : brandsError ? (
  <div className="h-14 flex items-center justify-center gap-2">
    <span className="text-sm text-destructive">Failed to load brands</span>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setBrandsFetchKey((k) => k + 1)}
      className="text-sm"
    >
      Retry
    </Button>
  </div>
) : (
  <Select ...>
    ...existing select...
  </Select>
)}
```

- [ ] **Step 3: Add error UI for models**

Same pattern for models. After the models loading spinner, add:

```tsx
{loadingModels ? (
  <div className="h-14 flex items-center justify-center">
    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
) : modelsError ? (
  <div className="h-14 flex items-center justify-center gap-2">
    <span className="text-sm text-destructive">Failed to load models</span>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onUpdate({ brand: formData.brand })}
      className="text-sm"
    >
      Retry
    </Button>
  </div>
) : (
  <Select ...>
    ...existing select...
  </Select>
)}
```

Note: The models retry re-triggers the effect by calling `onUpdate` with the same brand. However, this won't re-trigger the `useEffect` since `formData.brand` doesn't change. Instead, add a `modelsFetchKey` state:

```ts
const [modelsFetchKey, setModelsFetchKey] = useState(0);
```

Add `modelsFetchKey` to the models `useEffect` dependency array. The retry button becomes:

```tsx
<Button variant="ghost" size="sm" onClick={() => setModelsFetchKey((k) => k + 1)} className="text-sm">
  Retry
</Button>
```

- [ ] **Step 4: Verify and commit**

Run: `npx next lint`

```bash
git add components/steps/brand-model-step.tsx
git commit -m "fix: add error handling and retry to brand/model fetching"
```

---

### Task 9: Fix createProfile to only ignore 409 errors

**Files:**
- Modify: `lib/api.ts`

- [ ] **Step 1: Update `apiFetch` to include status in thrown errors**

Replace the error handling in `apiFetch` (lines 26-29) with:

```ts
if (!res.ok) {
  const error = await res.json().catch(() => ({ message: "Request failed" }));
  const err = new Error(error.message || `HTTP ${res.status}`);
  (err as Error & { status: number }).status = res.status;
  throw err;
}
```

- [ ] **Step 2: Update `createProfile` to only catch 409**

Replace the `createProfile` function (lines 102-108) with:

```ts
export async function createProfile(): Promise<void> {
  try {
    await apiFetch("/me", { method: "POST" });
  } catch (e) {
    if ((e as Error & { status?: number }).status === 409) {
      return; // Profile already exists, ignore
    }
    throw e;
  }
}
```

- [ ] **Step 3: Add error handling in `auth-provider.tsx` for createProfile**

In `auth-provider.tsx`, update `handlePostSignIn` to not crash the sign-in flow:

```ts
async function handlePostSignIn() {
  try {
    await createProfile();
  } catch {
    // Profile creation failed, but don't block sign-in
    console.warn("Failed to create user profile");
  }
}
```

- [ ] **Step 4: Verify and commit**

Run: `npx next lint`

```bash
git add lib/api.ts components/auth-provider.tsx
git commit -m "fix: only ignore 409 in createProfile, surface other API errors"
```

---

## Theme 4: Input Validation Gaps

### Task 10: Fix input validation for mileage, price, seats, and year range

**Files:**
- Modify: `components/steps/year-mileage-step.tsx`
- Modify: `components/steps/price-step.tsx`
- Modify: `components/steps/details-step.tsx`

- [ ] **Step 1: Fix mileage input in `year-mileage-step.tsx`**

Replace the mileage `Input` (lines 104-110) — add `min={0}` and clamp the value:

```tsx
<Input
  id="mileage"
  type="number"
  placeholder="Enter mileage"
  value={formData.mileage ?? ""}
  onChange={(e) =>
    onUpdate({
      mileage: e.target.value
        ? Math.max(0, parseInt(e.target.value))
        : null,
    })
  }
  className="h-14 text-base rounded-xl pr-16"
  min={0}
/>
```

- [ ] **Step 2: Extend year range to 50 years**

In `year-mileage-step.tsx`, replace line 36:

```ts
const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
```

- [ ] **Step 3: Fix price input in `price-step.tsx`**

Replace the price `Input` (lines 55-61) — add `min={1}` and clamp:

```tsx
<Input
  id="price"
  type="number"
  placeholder="Enter asking price"
  value={formData.askingPrice ?? ""}
  onChange={(e) =>
    onUpdate({
      askingPrice: e.target.value
        ? Math.max(1, parseInt(e.target.value))
        : null,
    })
  }
  className="h-16 text-xl font-semibold rounded-xl pr-20 pl-4"
  min={1}
/>
```

- [ ] **Step 4: Fix seats input in `details-step.tsx`**

Replace the seats `Input` onChange (lines 105-108) — clamp to 1-50:

```tsx
<Input
  type="number"
  placeholder="5"
  value={formData.numberOfSeats ?? ""}
  onChange={(e) =>
    onUpdate({
      numberOfSeats: e.target.value
        ? Math.min(50, Math.max(1, parseInt(e.target.value)))
        : null,
    })
  }
  className="h-14 text-base rounded-xl"
  min={1}
  max={50}
/>
```

- [ ] **Step 5: Verify and commit**

Run: `npx next lint`

```bash
git add components/steps/year-mileage-step.tsx components/steps/price-step.tsx components/steps/details-step.tsx
git commit -m "fix: add input validation for mileage, price, seats, and extend year range"
```

---

## Theme 5: Miscellaneous Code Quality

### Task 11: Fix fonts — apply or remove

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Apply the Geist font to the body**

Replace the font declarations and body className. Change:

```ts
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
```

To:

```ts
const geist = Geist({ subsets: ["latin"] });
```

Remove the `Geist_Mono` import and declaration entirely (it's unused anywhere).

Update the body tag from:

```tsx
<body className="font-sans antialiased">
```

To:

```tsx
<body className={`${geist.className} antialiased`}>
```

- [ ] **Step 2: Verify and commit**

Run: `npx next lint`

```bash
git add app/layout.tsx
git commit -m "fix: apply Geist font to body and remove unused Geist_Mono import"
```

---

### Task 12: Fix RecaptchaVerifier recreation on retry

**Files:**
- Modify: `components/auth-provider.tsx`

- [ ] **Step 1: Store RecaptchaVerifier in a ref**

Add `useRef` to the React import:

```ts
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
```

Inside `AuthProvider`, add a ref before the sign-in functions:

```ts
const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
```

Replace the `signInWithPhone` function:

```ts
const signInWithPhone = async (
  phoneNumber: string
): Promise<ConfirmationResult> => {
  if (!recaptchaVerifierRef.current) {
    recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    });
  }
  return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
};
```

- [ ] **Step 2: Verify and commit**

Run: `npx next lint`

```bash
git add components/auth-provider.tsx
git commit -m "fix: reuse RecaptchaVerifier instance across phone sign-in attempts"
```

---

### Task 13: Remove ignoreBuildErrors and verify build

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Remove the typescript config**

Replace the entire `next.config.mjs` content:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

- [ ] **Step 2: Run the build to find type errors**

Run: `npx next build`

If any type errors surface, fix them. Common ones to expect:
- The `scoreBreakdown[item.key]` access in `results-step.tsx` may need a type assertion since `item.key` comes from the `as const` array. If so, use `scoreBreakdown[item.key as keyof typeof scoreBreakdown]`.

- [ ] **Step 3: Verify and commit**

```bash
git add next.config.mjs
# If any files were fixed for type errors, add those too
git commit -m "fix: remove ignoreBuildErrors flag and fix any surfaced type errors"
```

---

## Final Verification

### Task 14: Full build verification

- [ ] **Step 1: Run full build**

Run: `npx next build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

Run: `npx next lint`
Expected: No errors.

- [ ] **Step 3: Manual smoke test (optional)**

Run `npm run dev` and manually verify:
1. Wizard flow works end-to-end (landing -> brand/model -> ... -> results)
2. Sign-in modal works (Google button renders correctly with extracted icon)
3. History page shows error state if API is unreachable
4. Negative numbers can't be entered in mileage/price/seats
5. Year dropdown shows 50 years
6. Account prompt appears after results if not signed in
