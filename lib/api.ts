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
    const err = new Error(error.message || `HTTP ${res.status}`);
    (err as Error & { status: number }).status = res.status;
    throw err;
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
  bodyType: string;
  color: string;
  engine: string;
  mileage: number;
  transmission: string;
  drive: string;
  isNew: boolean;
  numberOfSeats: number;
  condition: string;
  market: string;
  city: string;
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
  } catch (e) {
    if ((e as Error & { status?: number }).status === 409) {
      return; // Profile already exists, ignore
    }
    throw e;
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
