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
    const error = await res.json().catch(() => ({ message: "Sorğu uğursuz oldu" }));
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

// VIN History Reports
export interface MileageRecord {
  date: string;
  mileage: number;
  source: string;
}

export interface AccidentRecord {
  date: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe';
}

export interface RiskFactors {
  mileageFraud: boolean;
  accidentDamage: boolean;
  stolen: boolean;
  importIssues: boolean;
}

export interface VINReport {
  vin: string;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    engineType: string;
    transmission: string;
  };
  history: {
    mileageRecords: MileageRecord[];
    accidents: AccidentRecord[];
  };
  risks: RiskFactors;
  score: number;
}

export interface VINCheckRequest {
  vin: string;
  brand?: string;
  model?: string;
}

export interface VINCheckResponse {
  available: boolean;
  price: number;
  report?: VINReport;
  error?: string;
}

export async function checkVIN(data: VINCheckRequest): Promise<VINCheckResponse> {
  // Mock implementation for frontend development
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        available: true,
        price: 25,
      });
    }, 1000);
  });
}

export async function purchaseVINReport(vin: string, paymentToken: string): Promise<VINReport> {
  // Mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        vin,
        vehicleInfo: {
          brand: "Toyota",
          model: "Camry",
          year: 2018,
          engineType: "petrol",
          transmission: "automatic"
        },
        history: {
          mileageRecords: [
            { date: "2020-05-12", mileage: 45000, source: "Service Center" },
            { date: "2022-08-20", mileage: 82000, source: "Technical Inspection" }
          ],
          accidents: [
            { date: "2021-03-15", description: "Rear bumper damage", severity: "minor" }
          ]
        },
        risks: {
          mileageFraud: false,
          accidentDamage: true,
          stolen: false,
          importIssues: false
        },
        score: 85
      });
    }, 1500);
  });
}
