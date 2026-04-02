# CarCheck Frontend Codebase Audit

**Date:** 2026-04-02
**Scope:** Code quality, architecture, UX reliability
**Approach:** Fix by theme — group problems into coherent themes, address each as a unit

---

## Theme 1: Duplicated Code

### 1.1 — Sign-in handlers duplicated across AuthModal and AccountPrompt

**Files:** `components/auth-modal.tsx` (lines 32-58), `components/steps/account-prompt.tsx` (lines 18-44)

Both components implement identical Google/Apple sign-in flows with the same try/catch/loading/error pattern. If sign-in logic changes (e.g., adding analytics), both must be updated.

**Fix:** Extract a `useSignIn()` hook that returns `{ handleGoogle, handleApple, loading, error }` and an `onSuccess` callback. Both components consume the hook.

### 1.2 — Google and Apple SVG icons copy-pasted

**Files:** `components/auth-modal.tsx` (lines 127-144), `components/steps/account-prompt.tsx` (lines 104-109)

The full Google logo SVG paths appear verbatim in both files. Same for the Apple SVG.

**Fix:** Extract `GoogleIcon` and `AppleIcon` components into `components/icons/`.

### 1.3 — Score breakdown labels defined twice

**Files:** `components/steps/results-step.tsx` (lines 80-89), `app/history/page.tsx` (lines 61-70)

Both define category-to-maxScore mappings independently. If the API adds a score category, both must be updated.

**Fix:** Extract `scoreBreakdownConfig` into `lib/evaluation-labels.ts`.

### 1.4 — Quality/price label and color mappings duplicated

**Files:** `components/steps/results-step.tsx` (lines 51-60), `app/history/page.tsx` (lines 12-24)

Both independently define `qualityLabels`, `priceLabels`, and their associated badge/text colors.

**Fix:** Move all label and color mappings into `lib/evaluation-labels.ts` alongside the breakdown config.

---

## Theme 2: Wizard State Bugs & Fragility

### 2.1 — Hardcoded step numbers are a maintenance trap

**File:** `components/car-evaluation-wizard.tsx` (lines 62, 70, 114, 250)

`handleEvaluate` does `setCurrentStep(7)`, `goToNext` caps at `Math.min(prev + 1, 8)`, and the template checks `currentStep === 7`. The constant `totalSteps = 7` is used for the progress bar but there are 8 steps (0-7). If steps are added or reordered, these magic numbers break silently.

**Fix:** Define named step constants (e.g., `const STEPS = { LANDING: 0, BRAND_MODEL: 1, ..., RESULTS: 7 } as const`) and derive `totalSteps` from them.

### 2.2 — Non-null assertions in handleEvaluate will crash on inconsistent state

**File:** `components/car-evaluation-wizard.tsx` (lines 96-108)

`formData.year!`, `formData.mileage!`, `formData.numberOfSeats!`, `formData.askingPrice!` assume the wizard flow has filled these in. No runtime validation exists — if state is inconsistent, this throws a runtime error.

**Fix:** Add a validation guard before the API call. If any required field is missing, set an error message and return early instead of crashing.

### 2.3 — Timer leak in account prompt trigger

**File:** `components/car-evaluation-wizard.tsx` (lines 123-129)

`setTimeout(() => setShowAccountPrompt(true), 3000)` is never cleaned up. If the user restarts the wizard before the 3 seconds elapse, the callback fires on stale state. This can cause a React "setState on unmounted component" warning or show the account prompt unexpectedly.

**Fix:** Store the timer ID in a ref and clear it in the `restart` function and on unmount.

### 2.4 — onResultsViewed fires on re-renders

**File:** `components/steps/results-step.tsx` (line 66)

`onResultsViewed()` is called in a `useEffect` with `[onResultsViewed]` as dependency. The parent defines `handleResultsViewed` inline without `useCallback`, so it gets a new reference on every render, potentially triggering multiple 3-second timers.

**Fix:** Wrap `handleResultsViewed` in `useCallback` in the parent, or use a ref-based approach in the child to ensure it only fires once.

---

## Theme 3: Missing Error UX

### 3.1 — History page silently swallows fetch errors

**File:** `app/history/page.tsx` (line 49)

`.catch(() => {})` discards all errors. If the API fails, the user sees either "No evaluations yet" (misleading) or stale data. No error message, no retry.

**Fix:** Add an `error` state. On catch, set an error message. Render an error banner with a "Retry" button.

### 3.2 — Brand/model fetch failure shows empty dropdowns with no recovery

**File:** `components/steps/brand-model-step.tsx` (lines 43-46, 55-58)

If `getBrands()` or `getModels()` fails, empty arrays are set. The user sees empty Select dropdowns with no indication of failure and no way to retry.

**Fix:** Add error state and a retry mechanism. Show an inline error message with a "Try again" button when the fetch fails.

### 3.3 — createProfile swallows ALL errors, not just 409

**File:** `lib/api.ts` (lines 102-108)

The comment says "409 = profile already exists, ignore" but the empty catch block catches everything — network errors, 500s, auth errors. The user believes they're fully set up, but their profile may not exist on the server.

**Fix:** Catch specifically and only ignore 409. Re-throw or log other errors. Since this runs during sign-in, consider showing a non-blocking warning toast if profile creation fails for non-409 reasons.

---

## Theme 4: Input Validation Gaps

### 4.1 — Mileage accepts negative numbers

**File:** `components/steps/year-mileage-step.tsx` (lines 104-110)

The number input has no `min` attribute. Users can type negative values.

**Fix:** Add `min={0}` to the input. Clamp the parsed value: `Math.max(0, parseInt(e.target.value))`.

### 4.2 — Price accepts negative numbers

**File:** `components/steps/price-step.tsx` (lines 55-61)

Same issue as mileage. The `canContinue` guard catches `askingPrice > 0`, but the input itself allows typing negatives.

**Fix:** Add `min={1}` to the input. Clamp the parsed value.

### 4.3 — Seats has no reasonable bounds enforced

**File:** `components/steps/details-step.tsx` (lines 101-112)

Has `min={1} max={50}` HTML attributes, but these are soft hints. Users can type `999` or `0`. The `canContinue` check only verifies `> 0`.

**Fix:** Clamp the parsed value to the 1-50 range in the `onChange` handler.

### 4.4 — Year range limited to 30 years

**File:** `components/steps/year-mileage-step.tsx` (line 36)

`Array.from({ length: 30 })` only goes back to ~1996. Cars older than 30 years can't be evaluated.

**Fix:** Extend to 50 years, which covers vehicles back to ~1976 and accommodates most used car markets.

---

## Theme 5: Miscellaneous Code Quality

### 5.1 — Fonts loaded but never applied

**File:** `app/layout.tsx` (lines 8-9)

`Geist` and `Geist_Mono` are loaded from Google Fonts and assigned to `_geist` and `_geistMono`, but neither className is applied to the body or any element. This is wasted bandwidth on every page load.

**Fix:** Either apply the font classes to the body element, or remove the font imports.

### 5.2 — `as string` type casts bypass type safety

**File:** `components/car-evaluation-wizard.tsx` (lines 97-107)

Multiple `as string` casts on form data fields that are typed as union types (e.g., `BodyType | ""`). These bypass TypeScript's type checking.

**Fix:** The `EvaluateRequest` interface uses `string` for these fields. Since the validation guard (Theme 2.2 fix) will ensure values are non-empty, the casts can be removed — the union types are assignable to `string`.

### 5.3 — Redundant .toUpperCase() on driveType

**File:** `components/car-evaluation-wizard.tsx` (line 102)

`(formData.driveType as string).toUpperCase()` is unnecessary because drive types in `car-data.ts` are already uppercase ("FWD", "RWD", "AWD").

**Fix:** Remove the `.toUpperCase()` call.

### 5.4 — RecaptchaVerifier recreated on every phone sign-in attempt

**File:** `components/auth-provider.tsx` (line 74)

A new `RecaptchaVerifier` is created each time `signInWithPhone` is called. On retry after error, this can cause "reCAPTCHA has already been rendered" errors.

**Fix:** Create the `RecaptchaVerifier` once (store in a ref) and reuse it. Clear it only when the component unmounts.

### 5.5 — Build suppresses TypeScript errors

**File:** `next.config.mjs`

`typescript: { ignoreBuildErrors: true }` lets real type errors ship to production.

**Fix:** Remove the flag. Fix any build-time type errors that surface.

---

## Out of Scope

The following were noted but excluded from this audit:

- **Security:** Firebase API key in source, hardcoded API base URL, no CSP headers. These are valid concerns but outside the requested scope (code quality + UX).
- **Performance:** No code splitting, image optimization disabled, no API response caching.
- **Testing:** No test framework installed. Adding tests is a separate initiative.
