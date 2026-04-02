# Evaluation Popup Bugfixes — Design Spec

**Date:** 2026-04-02
**Scope:** Four bugs related to the "Save Your Evaluation" popup, phone auth, and evaluation persistence.

---

## Bug 1: "No thanks" dismiss — session-only

**Problem:** Clicking "No thanks" (or X / backdrop) on the AccountPrompt sets `showAccountPrompt = false`, but nothing prevents `handleResultsViewed` from re-triggering the popup (e.g., on re-render or subsequent evaluations).

**Solution:**
- Add a `useRef<boolean>` called `accountPromptDismissed` in `CarEvaluationWizard`.
- When `onClose` fires, set the ref to `true`.
- In `handleResultsViewed`, check this ref before scheduling the timeout. If dismissed, do nothing.
- `restart()` does NOT reset the ref — once dismissed, it stays dismissed for the component's lifetime (session).

**Files changed:** `components/car-evaluation-wizard.tsx`

---

## Bug 2: Phone auth in AccountPrompt

**Problem:** `AccountPrompt` only offers Google and Apple sign-in. `AuthModal` has phone/OTP support but the code is duplicated inline.

**Solution:**
- Extract a `PhoneAuthForm` component from the phone/OTP logic in `AuthModal`.
  - Props: `onSuccess: () => void`, `disabled?: boolean`
  - Uses `useAuth()` internally for `signInWithPhone` / `confirmPhoneCode`
  - Contains: phone input, send code button, OTP input, verify button
- Use `PhoneAuthForm` in both `AuthModal` and `AccountPrompt`.
- In `AccountPrompt`, placed between Apple button and "Xeyr, sag ol" button, with "va ya" divider.

**New file:** `components/phone-auth-form.tsx`
**Files changed:** `components/auth-modal.tsx`, `components/steps/account-prompt.tsx`

---

## Bug 3: Save evaluation after sign-up via popup

**Problem:** Unauthenticated users receive evaluation results, but if they sign up through the popup, the evaluation is never saved to their history.

### Frontend

- Pass `evaluationRequest: EvaluateRequest` and `evaluationResult: EvaluationResult` from `CarEvaluationWizard` into `AccountPrompt` as props.
- On successful sign-in (Google, Apple, or phone) inside `AccountPrompt`, call `saveEvaluation(request, result)` before calling `onClose`.
- Add `saveEvaluation` function to `lib/api.ts`:
  ```ts
  export async function saveEvaluation(
    request: EvaluateRequest,
    result: EvaluationResult
  ): Promise<void> {
    await apiFetch("/me/evaluations", {
      method: "POST",
      body: JSON.stringify({ request, result }),
    });
  }
  ```

### API Side (spec for backend team)

- **New endpoint:** `POST /me/evaluations`
- **Auth:** Required (Bearer token)
- **Request body:**
  ```json
  {
    "request": {
      "brand": "string",
      "model": "string",
      "year": "number",
      "bodyType": "string",
      "color": "string",
      "engine": "string",
      "mileage": "number",
      "transmission": "string",
      "drive": "string",
      "isNew": "boolean",
      "numberOfSeats": "number",
      "condition": "string",
      "market": "string",
      "city": "string",
      "price": "number"
    },
    "result": {
      "qualityScore": "number",
      "qualityStatus": "number",
      "price": {
        "listed": "number",
        "average": "number | null",
        "deviation": "number",
        "priceStatus": "number"
      },
      "scoreBreakdown": {
        "mileageScore": "number",
        "ageScore": "number",
        "reliabilityScore": "number",
        "conditionScore": "number",
        "depreciationScore": "number",
        "transmissionScore": "number",
        "driveScore": "number",
        "engineScore": "number"
      }
    }
  }
  ```
- **Behavior:** Saves the evaluation to the authenticated user's history. Uses the same schema as entries returned by `GET /me/evaluations`. Fields `_id` and `createdAt` are generated server-side.
- **Response:** `201 Created` with `{ data: { _id, request, result, createdAt } }`
- **Duplicate handling:** Allow duplicates — user may evaluate the same car multiple times.
- **Validation:** Validate that request body contains all required fields with correct types. Return `400` for malformed requests.

**Files changed:** `components/car-evaluation-wizard.tsx`, `components/steps/account-prompt.tsx`, `lib/api.ts`

---

## Bug 4: Fix phone auth (RecaptchaVerifier singleton)

**Problem:** `signInWithPhone` in `auth-provider.tsx` creates a new `RecaptchaVerifier` on every call. Firebase requires a single verifier instance per container — creating multiples causes silent failures.

**Solution:**
- Store the `RecaptchaVerifier` as a module-level variable outside the component.
- On first `signInWithPhone` call, create the verifier and cache it.
- On subsequent calls, reuse the cached instance. If it's in a bad state (after a failed attempt), call `.clear()` and create a fresh one.
- The `recaptcha-container` div already exists at the bottom of `AuthProvider`.

**Files changed:** `components/auth-provider.tsx`

---

## Summary of all changes

| File | Changes |
|---|---|
| `components/car-evaluation-wizard.tsx` | Add dismissed ref (bug 1), pass evaluation data to AccountPrompt (bug 3) |
| `components/steps/account-prompt.tsx` | Add phone auth form (bug 2), save evaluation on sign-in (bug 3) |
| `components/phone-auth-form.tsx` | **New** — shared phone/OTP form component (bug 2) |
| `components/auth-modal.tsx` | Replace inline phone UI with PhoneAuthForm (bug 2) |
| `components/auth-provider.tsx` | RecaptchaVerifier singleton (bug 4) |
| `lib/api.ts` | Add `saveEvaluation()` function (bug 3) |
