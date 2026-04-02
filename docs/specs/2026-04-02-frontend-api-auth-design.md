# Frontend API Integration & Firebase Auth Design Spec

## Goal

Wire the car-frontend (Next.js) to the deployed car-point-api, replacing client-side scoring with real API calls, and add Firebase authentication with Google, Apple, and phone number sign-in. Include an evaluation history page for logged-in users.

## API Base URL

`https://car-point-api-625412356368.europe-west3.run.app`

## Firebase Config

```javascript
{
  apiKey: "AIzaSyB_-YOT5OTNSZNQ_SP7NDd6oes9WhXt8Pw",
  authDomain: "kapot-e3715.firebaseapp.com",
  projectId: "kapot-e3715",
  storageBucket: "kapot-e3715.firebasestorage.app",
  messagingSenderId: "529474359415",
  appId: "1:529474359415:web:3ba90660e0f2e0332f3672",
  measurementId: "G-HY9EWX8BTW"
}
```

Auth providers enabled: Google, Apple, Phone number.

---

## 1. API Integration

### API Client (`lib/api.ts`)

A single module wrapping all calls to car-point-api. If a Firebase user is signed in, automatically attaches the ID token as `Authorization: Bearer <token>` on all requests.

Methods:
- `getBrands(): Promise<string[]>` — `GET /brands`
- `getModels(brand: string): Promise<string[]>` — `GET /brands/:brand/models`
- `evaluate(data): Promise<EvaluationResult>` — `POST /evaluate`
- `getProfile(): Promise<UserProfile>` — `GET /me`
- `createProfile(): Promise<UserProfile>` — `POST /me`
- `getEvaluations(page, limit): Promise<{ data, meta }>` — `GET /me/evaluations`
- `getEvaluation(id): Promise<Evaluation>` — `GET /me/evaluations/:id`

### Brand/Model Step Changes

- On mount, fetch brands from `GET /brands`. Show a loading state while fetching.
- When a brand is selected, fetch models from `GET /brands/:brand/models`.
- Replace the hardcoded brand/model lists in `car-data.ts`.

### Results Step Changes

- The wizard calls `POST /evaluate` when the user submits the price step (last input step).
- Show a loading spinner while waiting for the API response.
- Display the real `qualityScore`, `qualityStatus`, `price` (listed, average, deviation, priceStatus), and `scoreBreakdown` from the API.
- If the API fails, show a toast error with a retry button.

### Cleanup

- Remove `calculateScore()` and hardcoded market estimation from `lib/car-data.ts`.
- Keep the condition, engine, transmission, and drive constants (used for UI selection options).

---

## 2. Firebase Authentication

### Firebase Setup (`lib/firebase.ts`)

- Install `firebase` npm package.
- Initialize Firebase app and Auth with the config above.
- Export `auth`, `googleProvider`, `appleProvider`.

### Auth Context (`components/auth-provider.tsx`)

React context providing:
- `user: User | null` — current Firebase user
- `loading: boolean` — true while checking auth state on mount
- `signInWithGoogle(): Promise<void>`
- `signInWithApple(): Promise<void>`
- `signInWithPhone(phoneNumber): Promise<ConfirmationResult>` — sends OTP
- `confirmPhoneCode(confirmationResult, code): Promise<void>` — verifies OTP
- `signOut(): Promise<void>`

Uses `onAuthStateChanged` to track auth state. Wraps the entire app in `app/layout.tsx`.

### Header (`components/header.tsx`)

A top bar visible on all pages:
- Left: App name/logo, links to home
- Right (not signed in): "Sign In" button → opens auth modal
- Right (signed in): "History" link, user display name or email, "Sign Out" button

### Auth Modal (`components/auth-modal.tsx`)

A dialog with sign-in options:
- "Continue with Google" button
- "Continue with Apple" button
- Phone number input + "Send Code" button → OTP input + "Verify" button
- On successful sign-in, calls `POST /me` to create the user profile (ignores 409 if already exists).
- Closes the modal on success.

### Account Prompt Changes (`components/steps/account-prompt.tsx`)

The existing post-results modal is updated:
- If user is already signed in, don't show it.
- If not signed in, show the modal 3 seconds after results (current behavior) with the same sign-in buttons as the auth modal.
- On successful sign-in, the most recent evaluation is already saved (because the evaluate call will be retried with the token, or the next evaluation will save automatically).

---

## 3. Evaluation History Page

### `/history` page (`app/history/page.tsx`)

- Protected: if not signed in, redirect to `/`.
- Fetches `GET /me/evaluations?page=1&limit=20` on mount.
- Displays a list of evaluation cards, each showing:
  - Brand + Model + Year
  - Quality score with color-coded badge (green EXCELLENT, yellow GOOD, red POOR)
  - Price status badge (GREAT_DEAL / FAIR_PRICE / OVERPRICED)
  - Date (formatted relative or absolute)
- Click a card to expand and show full score breakdown and price details.
- Pagination: "Load More" button at the bottom if there are more results.

---

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `lib/firebase.ts` | Firebase app + auth initialization |
| `lib/api.ts` | API client with auto-auth headers |
| `components/auth-provider.tsx` | React context for auth state |
| `components/auth-modal.tsx` | Sign-in modal (Google, Apple, Phone) |
| `components/header.tsx` | Top bar with nav + auth |
| `app/history/page.tsx` | Evaluation history page |

### Modified Files

| File | Change |
|------|--------|
| `app/layout.tsx` | Wrap with AuthProvider, add Header |
| `app/page.tsx` | Adjust layout for header |
| `components/steps/brand-model-step.tsx` | Fetch brands/models from API |
| `components/steps/results-step.tsx` | Display API response |
| `components/car-evaluation-wizard.tsx` | Call POST /evaluate, pass response to results |
| `components/steps/account-prompt.tsx` | Wire sign-in buttons to Firebase |
| `lib/car-data.ts` | Remove calculateScore() and hardcoded brand/model data |

### Dependencies to Install

- `firebase` — Firebase client SDK

---

## Out of Scope

- Server-side rendering for auth-protected pages (client-side auth is sufficient)
- Password/email sign-in (Firebase handles Google, Apple, Phone only)
- Edit/delete evaluations
- Push notifications
- Offline support
